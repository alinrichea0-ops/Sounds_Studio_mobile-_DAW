import { InstrumentId } from '../types/audio';

// Helper to convert MIDI note number (e.g. 60 = C4) to frequency in Hz
export function midiToFreq(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// Generate noise buffer for snare and hihat
let noiseBufferInstance: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noiseBufferInstance || noiseBufferInstance.sampleRate !== ctx.sampleRate) {
    const bufferSize = ctx.sampleRate * 2;
    noiseBufferInstance = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBufferInstance.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBufferInstance;
}

export class SoundEngine {
  ctx: AudioContext;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  // Play a drum hit
  playDrumHit(
    drumType: 'kick' | 'snare' | 'hihat' | 'clap' | 'perc' | 'bass808',
    destination: AudioNode,
    time: number = 0,
    velocity: number = 0.9
  ) {
    const t = time || this.ctx.currentTime;
    const vol = Math.max(0.01, Math.min(1.0, velocity));

    if (drumType === 'kick') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.08);

      gain.gain.setValueAtTime(vol * 1.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(t);
      osc.stop(t + 0.35);

      // Click transient
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(400, t);
      click.frequency.exponentialRampToValueAtTime(80, t + 0.02);
      clickGain.gain.setValueAtTime(vol * 0.7, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      click.connect(clickGain);
      clickGain.connect(destination);
      click.start(t);
      click.stop(t + 0.02);

    } else if (drumType === 'snare') {
      // Noise component
      const noise = this.ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(this.ctx);
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1000, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(vol * 0.9, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(destination);

      noise.start(t);
      noise.stop(t + 0.22);

      // Body tone
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.1);
      oscGain.gain.setValueAtTime(vol * 0.7, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(oscGain);
      oscGain.connect(destination);
      osc.start(t);
      osc.stop(t + 0.12);

    } else if (drumType === 'hihat') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(this.ctx);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      noise.start(t);
      noise.stop(t + 0.06);

    } else if (drumType === 'clap') {
      // Multi-burst clap
      [0, 0.012, 0.024, 0.036].forEach((offset, idx) => {
        const noise = this.ctx.createBufferSource();
        noise.buffer = getNoiseBuffer(this.ctx);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, t + offset);
        filter.Q.setValueAtTime(1.5, t + offset);

        const gain = this.ctx.createGain();
        const burstVol = idx === 3 ? vol * 0.8 : vol * 0.5;
        const dur = idx === 3 ? 0.18 : 0.02;

        gain.gain.setValueAtTime(burstVol, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        noise.start(t + offset);
        noise.stop(t + offset + dur);
      });

    } else if (drumType === 'perc') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.08);

      gain.gain.setValueAtTime(vol * 0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(t);
      osc.stop(t + 0.1);

    } else if (drumType === 'bass808') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);

      gain.gain.setValueAtTime(vol * 1.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(t);
      osc.stop(t + 0.6);
    }
  }

  // Play melodic note on selected instrument
  playInstrumentNote(
    instrument: InstrumentId,
    midiNote: number,
    destination: AudioNode,
    time: number = 0,
    durationSec: number = 0.5,
    velocity: number = 0.85
  ) {
    const t = time || this.ctx.currentTime;
    const freq = midiToFreq(midiNote);
    const vol = Math.max(0.01, Math.min(1.2, velocity));
    const dur = Math.max(0.05, durationSec);

    switch (instrument) {
      case 'grand_piano': {
        // Multi-oscillator additive model with bell acoustic attack
        const fundamental = this.ctx.createOscillator();
        const harmonic2 = this.ctx.createOscillator();
        const harmonic3 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        fundamental.type = 'triangle';
        fundamental.frequency.setValueAtTime(freq, t);

        harmonic2.type = 'sine';
        harmonic2.frequency.setValueAtTime(freq * 2, t);

        harmonic3.type = 'sine';
        harmonic3.frequency.setValueAtTime(freq * 3, t);

        gain.gain.setValueAtTime(vol * 0.9, t);
        gain.gain.exponentialRampToValueAtTime(vol * 0.4, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3800, t);
        filter.frequency.exponentialRampToValueAtTime(freq * 2, t + dur);

        fundamental.connect(filter);
        harmonic2.connect(filter);
        harmonic3.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        fundamental.start(t);
        harmonic2.start(t);
        harmonic3.start(t);

        fundamental.stop(t + dur + 0.3);
        harmonic2.stop(t + dur + 0.3);
        harmonic3.stop(t + dur + 0.3);
        break;
      }

      case 'rhodes': {
        const osc = this.ctx.createOscillator();
        const sine2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        sine2.type = 'triangle';
        sine2.frequency.setValueAtTime(freq * 2.005, t);

        gain.gain.setValueAtTime(vol * 0.85, t);
        gain.gain.exponentialRampToValueAtTime(vol * 0.5, t + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.4);

        osc.connect(gain);
        sine2.connect(gain);
        gain.connect(destination);

        osc.start(t);
        sine2.start(t);
        osc.stop(t + dur + 0.4);
        sine2.stop(t + dur + 0.4);
        break;
      }

      case 'synth_lead': {
        // Dual detuned saw with punchy resonant cutoff
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, t);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq * 1.008, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 6, t);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.5, t + dur);
        filter.Q.setValueAtTime(6.0, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * 0.65, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + dur + 0.1);
        osc2.stop(t + dur + 0.1);
        break;
      }

      case 'synth_pluck': {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 8, t);
        filter.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.18);
        filter.Q.setValueAtTime(4.0, t);

        gain.gain.setValueAtTime(vol * 0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(dur, 0.35));

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc.start(t);
        osc.stop(t + Math.min(dur, 0.35));
        break;
      }

      case 'synth_pad':
      case 'strings_ensemble': {
        // Warm rich pad with slow attack
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const osc3 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, t);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq * 0.995, t);

        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(freq * 1.005, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, t);
        filter.Q.setValueAtTime(2.0, t);

        const attack = 0.08;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(vol * 0.6, t + attack);
        gain.gain.setValueAtTime(vol * 0.6, t + dur);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.4);

        osc1.connect(filter);
        osc2.connect(filter);
        osc3.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc1.start(t);
        osc2.start(t);
        osc3.start(t);
        osc1.stop(t + dur + 0.4);
        osc2.stop(t + dur + 0.4);
        osc3.stop(t + dur + 0.4);
        break;
      }

      case 'guitar_clean':
      case 'guitar_dist': {
        const osc = this.ctx.createOscillator();
        const oscOctave = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = instrument === 'guitar_dist' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        oscOctave.type = 'sine';
        oscOctave.frequency.setValueAtTime(freq * 2, t);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(instrument === 'guitar_dist' ? 2400 : 1600, t);
        filter.Q.setValueAtTime(instrument === 'guitar_dist' ? 3.5 : 1.2, t);

        gain.gain.setValueAtTime(vol * 0.9, t);
        gain.gain.exponentialRampToValueAtTime(vol * 0.35, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.2);

        osc.connect(filter);
        oscOctave.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc.start(t);
        oscOctave.start(t);
        osc.stop(t + dur + 0.2);
        oscOctave.stop(t + dur + 0.2);
        break;
      }

      case 'bass_808':
      case 'bass_synth':
      case 'bass_slap': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // 808 glide sub
        osc.type = instrument === 'bass_synth' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, t);

        if (instrument === 'bass_808') {
          osc.frequency.setValueAtTime(freq * 1.5, t);
          osc.frequency.exponentialRampToValueAtTime(freq, t + 0.05);
        }

        gain.gain.setValueAtTime(vol * 1.1, t);
        gain.gain.exponentialRampToValueAtTime(vol * 0.7, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(instrument === 'bass_synth' ? 600 : 350, t);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc.start(t);
        osc.stop(t + dur + 0.3);
        break;
      }

      case 'brass_section': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, t);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.exponentialRampToValueAtTime(freq * 4, t + 0.05);
        filter.frequency.exponentialRampToValueAtTime(freq * 2, t + dur);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * 0.75, t + 0.04);
        gain.gain.setValueAtTime(vol * 0.65, t + dur);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + dur + 0.15);
        osc2.stop(t + dur + 0.15);
        break;
      }

      default: {
        // Fallback clean synth
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(vol * 0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(gain);
        gain.connect(destination);
        osc.start(t);
        osc.stop(t + dur);
        break;
      }
    }
  }
}
