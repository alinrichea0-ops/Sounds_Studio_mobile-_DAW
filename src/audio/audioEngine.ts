import { Project, Track, EffectConfig } from '../types/audio';
import { EffectChainNode } from './effectsDsp';
import { SoundEngine } from './synths';

export interface TrackAudioNodes {
  gainNode: GainNode;
  panNode: StereoPannerNode;
  effectChain: EffectChainNode;
  analyser: AnalyserNode;
}

export class DawAudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  masterAnalyser: AnalyserNode | null = null;
  masterEffectChain: EffectChainNode | null = null;
  soundEngine: SoundEngine | null = null;
  stereoGain: GainNode | null = null;
  monoGain: GainNode | null = null;

  trackNodes: Map<string, TrackAudioNodes> = new Map();

  isPlaying: boolean = false;
  isPaused: boolean = false;
  currentBar: number = 1.0;
  bpm: number = 140;
  metronomeEnabled: boolean = false;
  loopEnabled: boolean = true;
  loopStartBar: number = 1;
  loopEndBar: number = 9;

  // Timing
  startTime: number = 0;
  startBarOffset: number = 1.0;
  animFrameId: number | null = null;
  lastScheduleTime: number = 0;
  scheduleAheadTime: number = 0.15; // 150ms lookahead
  nextStepToSchedule: number = 0;

  // Recording
  mediaStream: MediaStream | null = null;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  isRecording: boolean = false;
  onRecordFinished?: (buffer: AudioBuffer, waveform: number[]) => void;

  // Listeners
  onTimeUpdate?: (bar: number, timeString: string) => void;
  onPeakMeterUpdate?: (trackPeaks: Map<string, number>, masterPeak: number) => void;

  constructor() {}

  async initAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.9;

      this.masterAnalyser = this.ctx.createAnalyser();
      this.masterAnalyser.fftSize = 512;
      this.masterAnalyser.smoothingTimeConstant = 0.7;

      this.masterEffectChain = new EffectChainNode(this.ctx);

      // Stereo & Mono Summing Matrix
      this.stereoGain = this.ctx.createGain();
      this.monoGain = this.ctx.createGain();
      this.monoGain.gain.value = 0; // default stereo
      const splitter = this.ctx.createChannelSplitter(2);
      const merger = this.ctx.createChannelMerger(2);

      // Stereo path: Effects -> stereoGain -> masterGain
      this.masterEffectChain.output.connect(this.stereoGain);
      this.stereoGain.connect(this.masterGain);

      // Mono path: Effects -> splitter -> sum -> merger -> monoGain -> masterGain
      this.masterEffectChain.output.connect(splitter);
      const sumGain = this.ctx.createGain();
      sumGain.gain.value = 0.707;
      splitter.connect(sumGain, 0);
      splitter.connect(sumGain, 1);
      sumGain.connect(merger, 0, 0);
      sumGain.connect(merger, 0, 1);
      merger.connect(this.monoGain);
      this.monoGain.connect(this.masterGain);

      this.masterGain.connect(this.masterAnalyser);
      this.masterAnalyser.connect(this.ctx.destination);

      this.soundEngine = new SoundEngine(this.ctx);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // Setup / update track audio chains
  syncProjectTracks(project: Project) {
    if (!this.ctx || !this.masterEffectChain) return;

    this.bpm = project.bpm;
    this.loopEnabled = project.loop.enabled;
    this.loopStartBar = project.loop.startBar;
    this.loopEndBar = project.loop.endBar;

    // Remove deleted tracks
    const activeIds = new Set(project.tracks.map(t => t.id));
    for (const [id, nodes] of this.trackNodes.entries()) {
      if (!activeIds.has(id)) {
        try {
          nodes.gainNode.disconnect();
          nodes.panNode.disconnect();
          nodes.effectChain.output.disconnect();
        } catch {
          // ignore
        }
        this.trackNodes.delete(id);
      }
    }

    // Any track soloed?
    const hasSolo = project.tracks.some(t => t.solo);

    // Sync each track
    for (const track of project.tracks) {
      let nodes = this.trackNodes.get(track.id);
      if (!nodes) {
        const gainNode = this.ctx.createGain();
        const panNode = this.ctx.createStereoPanner();
        const effectChain = new EffectChainNode(this.ctx);
        const analyser = this.ctx.createAnalyser();
        analyser.fftSize = 64;

        // Route: Track Source -> Gain -> Pan -> EffectChain -> Analyser -> MasterEffectChain.input
        gainNode.connect(panNode);
        panNode.connect(effectChain.input);
        effectChain.output.connect(analyser);
        analyser.connect(this.masterEffectChain.input);

        nodes = { gainNode, panNode, effectChain, analyser };
        this.trackNodes.set(track.id, nodes);
      }

      // Volume & Mute/Solo
      let effectiveVol = track.volume;
      if (track.mute || (hasSolo && !track.solo)) {
        effectiveVol = 0;
      }
      nodes.gainNode.gain.setTargetAtTime(effectiveVol, this.ctx.currentTime, 0.03);

      // Pan
      try {
        nodes.panNode.pan.setTargetAtTime(track.pan, this.ctx.currentTime, 0.03);
      } catch {
        // pan range guard
      }

      // Update effects
      nodes.effectChain.update(track.effects);
    }

    // Master
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(project.masterVolume, this.ctx.currentTime, 0.03);
    }
    if (this.masterEffectChain) {
      this.masterEffectChain.update(project.masterEffects);
    }

    // Mono Mode Sync
    if (this.stereoGain && this.monoGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.stereoGain.gain.setTargetAtTime(project.isMono ? 0 : 1, now, 0.03);
      this.monoGain.gain.setTargetAtTime(project.isMono ? 1 : 0, now, 0.03);
    }
  }

  // Play preview note directly
  previewInstrumentNote(instrument: string, note: number, volume: number = 0.85) {
    if (!this.ctx || !this.soundEngine || !this.masterEffectChain) return;
    this.soundEngine.playInstrumentNote(
      instrument as any,
      note,
      this.masterEffectChain.input,
      this.ctx.currentTime,
      0.4,
      volume
    );
  }

  // Play preview drum hit directly
  previewDrumHit(drumType: 'kick' | 'snare' | 'hihat' | 'clap' | 'perc' | 'bass808') {
    if (!this.ctx || !this.soundEngine || !this.masterEffectChain) return;
    this.soundEngine.playDrumHit(drumType, this.masterEffectChain.input, this.ctx.currentTime, 0.9);
  }

  // Start playback
  async play(project: Project) {
    await this.initAudioContext();
    if (!this.ctx) return;

    this.syncProjectTracks(project);

    if (this.isPaused) {
      this.startTime = this.ctx.currentTime;
      this.startBarOffset = this.currentBar;
    } else {
      this.startTime = this.ctx.currentTime;
      this.startBarOffset = this.loopEnabled && this.currentBar >= this.loopEndBar ? this.loopStartBar : this.currentBar;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.lastScheduleTime = this.ctx.currentTime;

    // Calculate initial 16th step
    const secondsPerBeat = 60 / this.bpm;
    const secondsPer16th = secondsPerBeat / 4;
    const initialElapsedSeconds = (this.startBarOffset - 1) * 4 * secondsPerBeat;
    this.nextStepToSchedule = Math.floor(initialElapsedSeconds / secondsPer16th);

    this.runTransportLoop(project);
  }

  pause() {
    this.isPlaying = false;
    this.isPaused = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentBar = this.loopEnabled ? this.loopStartBar : 1.0;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentBar, this.formatTime(this.currentBar));
    }
  }

  seek(targetBar: number) {
    this.currentBar = Math.max(1.0, targetBar);
    if (this.isPlaying && this.ctx) {
      this.startTime = this.ctx.currentTime;
      this.startBarOffset = this.currentBar;
      const secondsPerBeat = 60 / this.bpm;
      const secondsPer16th = secondsPerBeat / 4;
      const elapsedSeconds = (this.startBarOffset - 1) * 4 * secondsPerBeat;
      this.nextStepToSchedule = Math.floor(elapsedSeconds / secondsPer16th);
    } else if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentBar, this.formatTime(this.currentBar));
    }
  }

  runTransportLoop(project: Project) {
    if (!this.isPlaying || !this.ctx) return;

    const currentTime = this.ctx.currentTime;
    const secondsPerBeat = 60 / this.bpm;
    const secondsPer16th = secondsPerBeat / 4;
    const loopDurationSec = (this.loopEndBar - this.loopStartBar) * 4 * secondsPerBeat;

    // Calculate current bar based on elapsed audio time
    let elapsed = (currentTime - this.startTime) + (this.startBarOffset - 1) * 4 * secondsPerBeat;

    if (this.loopEnabled && loopDurationSec > 0) {
      const loopOffsetSec = (this.loopStartBar - 1) * 4 * secondsPerBeat;
      const inLoopSec = (elapsed - loopOffsetSec) % loopDurationSec;
      const effectiveSec = inLoopSec >= 0 ? loopOffsetSec + inLoopSec : elapsed;
      this.currentBar = 1 + effectiveSec / (4 * secondsPerBeat);
    } else {
      this.currentBar = 1 + elapsed / (4 * secondsPerBeat);
    }

    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentBar, this.formatTime(this.currentBar));
    }

    // Schedule events in lookahead window
    while (this.lastScheduleTime < currentTime + this.scheduleAheadTime) {
      const stepTime = this.startTime + (this.nextStepToSchedule * secondsPer16th) - (this.startBarOffset - 1) * 4 * secondsPerBeat;
      
      if (stepTime >= currentTime - 0.05) {
        this.schedule16thStep(this.nextStepToSchedule, stepTime, project);
      }

      this.nextStepToSchedule++;
      this.lastScheduleTime = stepTime;

      // Handle loop jump
      if (this.loopEnabled) {
        const loopSteps = (this.loopEndBar - this.loopStartBar) * 16;
        const startStep = (this.loopStartBar - 1) * 16;
        const currentRelative = this.nextStepToSchedule - startStep;
        if (currentRelative >= loopSteps) {
          this.nextStepToSchedule = startStep;
          this.startTime = stepTime;
          this.startBarOffset = this.loopStartBar;
        }
      }
    }

    // Meter peak updates
    this.pollPeaks(project);

    this.animFrameId = requestAnimationFrame(() => this.runTransportLoop(project));
  }

  schedule16thStep(globalStep: number, time: number, project: Project) {
    if (!this.soundEngine || !this.ctx) return;

    const stepInBar = globalStep % 16; // 0..15
    const barIndex = Math.floor(globalStep / 16) + 1; // 1-based bar

    // Metronome click on beat starts (steps 0, 4, 8, 12)
    if (this.metronomeEnabled && stepInBar % 4 === 0 && this.masterEffectChain) {
      const isDownbeat = stepInBar === 0;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isDownbeat ? 1200 : 800, time);
      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      osc.connect(gain);
      gain.connect(this.masterEffectChain.input);
      osc.start(time);
      osc.stop(time + 0.04);
    }

    // Schedule track clips
    const secondsPerBeat = 60 / this.bpm;
    const secondsPer16th = secondsPerBeat / 4;

    for (const track of project.tracks) {
      const nodes = this.trackNodes.get(track.id);
      if (!nodes) continue;

      for (const clip of track.clips) {
        const clipStartBar = clip.startBar;
        const clipEndBar = clip.startBar + clip.durationBars;

        // Check if current bar is within clip
        if (barIndex >= clipStartBar && barIndex < clipEndBar) {
          const barInClip = barIndex - clipStartBar;
          const stepInClip = barInClip * 16 + stepInBar;

          // 1. Drum pattern
          if (clip.drumPattern) {
            const patternStep = stepInClip % 16;
            const pat = clip.drumPattern;

            if (pat.kick && pat.kick[patternStep]) {
              this.soundEngine.playDrumHit('kick', nodes.gainNode, time, 0.95);
            }
            if (pat.snare && pat.snare[patternStep]) {
              this.soundEngine.playDrumHit('snare', nodes.gainNode, time, 0.9);
            }
            if (pat.hihat && pat.hihat[patternStep]) {
              this.soundEngine.playDrumHit('hihat', nodes.gainNode, time, 0.7);
            }
            if (pat.clap && pat.clap[patternStep]) {
              this.soundEngine.playDrumHit('clap', nodes.gainNode, time, 0.85);
            }
            if (pat.perc && pat.perc[patternStep]) {
              this.soundEngine.playDrumHit('perc', nodes.gainNode, time, 0.75);
            }
            if (pat.bass808 && pat.bass808[patternStep]) {
              this.soundEngine.playDrumHit('bass808', nodes.gainNode, time, 1.0);
            }
          }

          // 2. Note events
          if (clip.notes && clip.notes.length > 0) {
            const stepIn16 = stepInClip % (clip.durationBars * 16);
            for (const n of clip.notes) {
              if (n.step === stepIn16) {
                const noteDuration = (n.durationSteps || 2) * secondsPer16th;
                this.soundEngine.playInstrumentNote(
                  track.instrument,
                  n.note,
                  nodes.gainNode,
                  time,
                  noteDuration,
                  n.velocity || 0.85
                );
              }
            }
          }

          // 3. Audio buffer (starts at clip beginning)
          if (clip.audioBuffer && barInClip === 0 && stepInBar === 0) {
            const source = this.ctx.createBufferSource();
            source.buffer = clip.audioBuffer;
            source.connect(nodes.gainNode);
            source.start(time);
          }
        }
      }
    }
  }

  pollPeaks(project: Project) {
    if (!this.onPeakMeterUpdate) return;
    const trackPeaks = new Map<string, number>();

    for (const track of project.tracks) {
      const nodes = this.trackNodes.get(track.id);
      if (nodes && !track.mute) {
        const data = new Uint8Array(nodes.analyser.frequencyBinCount);
        nodes.analyser.getByteTimeDomainData(data);
        let max = 0;
        for (let i = 0; i < data.length; i++) {
          const v = Math.abs(data[i] - 128) / 128;
          if (v > max) max = v;
        }
        trackPeaks.set(track.id, max);
      } else {
        trackPeaks.set(track.id, 0);
      }
    }

    let masterPeak = 0;
    if (this.masterAnalyser) {
      const data = new Uint8Array(this.masterAnalyser.frequencyBinCount);
      this.masterAnalyser.getByteTimeDomainData(data);
      for (let i = 0; i < data.length; i++) {
        const v = Math.abs(data[i] - 128) / 128;
        if (v > masterPeak) masterPeak = v;
      }
    }

    this.onPeakMeterUpdate(trackPeaks, masterPeak);
  }

  formatTime(barFloat: number): string {
    const totalBars = Math.floor(barFloat);
    const subBar = barFloat - totalBars;
    const beat = Math.floor(subBar * 4) + 1;
    const ticks = Math.floor((subBar * 4 - (beat - 1)) * 240);

    const seconds = (barFloat - 1) * 4 * (60 / this.bpm);
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    const pad = (n: number, w: number = 2) => String(n).padStart(w, '0');
    return `${pad(mins)}:${pad(secs)}:${pad(millis, 3)}`;
  }

  // Live Microphone Recording
  async startRecording(onFinished: (buffer: AudioBuffer, waveform: number[]) => void) {
    await this.initAudioContext();
    if (!this.ctx) return false;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      this.recordedChunks = [];
      this.onRecordFinished = onFinished;

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };

      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        if (this.ctx) {
          try {
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            // Generate visual waveform points
            const data = audioBuffer.getChannelData(0);
            const step = Math.ceil(data.length / 64);
            const waveform: number[] = [];
            for (let i = 0; i < 64; i++) {
              let sum = 0;
              for (let j = 0; j < step; j++) {
                sum += Math.abs(data[i * step + j] || 0);
              }
              waveform.push(Math.min(1.0, (sum / step) * 2.5));
            }
            if (this.onRecordFinished) {
              this.onRecordFinished(audioBuffer, waveform);
            }
          } catch (err) {
            console.error('Error decoding recorded audio', err);
          }
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Microphone permission denied', err);
      return false;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }

  // Export full project to downloadable .WAV file
  async exportToWav(project: Project): Promise<Blob> {
    const totalBars = project.totalBars || 16;
    const secondsPerBeat = 60 / project.bpm;
    const totalDuration = totalBars * 4 * secondsPerBeat + 1.0; // +1s tail
    const sampleRate = 44100;

    const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * totalDuration), sampleRate);
    const soundEngine = new SoundEngine(offlineCtx as unknown as AudioContext);

    // Setup master effects and gain
    const masterGain = offlineCtx.createGain();
    masterGain.gain.value = project.masterVolume;
    masterGain.connect(offlineCtx.destination);

    const secondsPer16th = secondsPerBeat / 4;
    const total16thSteps = totalBars * 16;

    for (let step = 0; step < total16thSteps; step++) {
      const stepTime = step * secondsPer16th;
      const barIndex = Math.floor(step / 16) + 1;
      const stepInBar = step % 16;

      for (const track of project.tracks) {
        if (track.mute) continue;

        const trackGain = offlineCtx.createGain();
        trackGain.gain.value = track.volume;
        trackGain.connect(masterGain);

        for (const clip of track.clips) {
          const clipStartBar = clip.startBar;
          const clipEndBar = clip.startBar + clip.durationBars;

          if (barIndex >= clipStartBar && barIndex < clipEndBar) {
            const barInClip = barIndex - clipStartBar;
            const stepInClip = barInClip * 16 + stepInBar;

            if (clip.drumPattern) {
              const patternStep = stepInClip % 16;
              const pat = clip.drumPattern;
              if (pat.kick && pat.kick[patternStep]) soundEngine.playDrumHit('kick', trackGain, stepTime, 0.95);
              if (pat.snare && pat.snare[patternStep]) soundEngine.playDrumHit('snare', trackGain, stepTime, 0.9);
              if (pat.hihat && pat.hihat[patternStep]) soundEngine.playDrumHit('hihat', trackGain, stepTime, 0.7);
              if (pat.clap && pat.clap[patternStep]) soundEngine.playDrumHit('clap', trackGain, stepTime, 0.85);
              if (pat.perc && pat.perc[patternStep]) soundEngine.playDrumHit('perc', trackGain, stepTime, 0.75);
              if (pat.bass808 && pat.bass808[patternStep]) soundEngine.playDrumHit('bass808', trackGain, stepTime, 1.0);
            }

            if (clip.notes) {
              const stepIn16 = stepInClip % (clip.durationBars * 16);
              for (const n of clip.notes) {
                if (n.step === stepIn16) {
                  soundEngine.playInstrumentNote(
                    track.instrument,
                    n.note,
                    trackGain,
                    stepTime,
                    (n.durationSteps || 2) * secondsPer16th,
                    n.velocity || 0.85
                  );
                }
              }
            }

            if (clip.audioBuffer && barInClip === 0 && stepInBar === 0) {
              const src = offlineCtx.createBufferSource();
              src.buffer = clip.audioBuffer;
              src.connect(trackGain);
              src.start(stepTime);
            }
          }
        }
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return bufferToWave(renderedBuffer, renderedBuffer.length);
  }
}

// Convert AudioBuffer to WAV format
function bufferToWave(abuffer: AudioBuffer, len: number): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sample: number = 0;
  let offset: number = 0;
  let pos: number = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit precision

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (offset < len) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: 'audio/wav' });
}
