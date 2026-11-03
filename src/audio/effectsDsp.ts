import { EffectConfig } from '../types/audio';

export class EffectChainNode {
  ctx: AudioContext;
  input: GainNode;
  output: GainNode;

  // EQ nodes
  eqLow: BiquadFilterNode;
  eqLowMid: BiquadFilterNode;
  eqMid: BiquadFilterNode;
  eqMidHigh: BiquadFilterNode;
  eqHigh: BiquadFilterNode;

  // Filter
  filterNode: BiquadFilterNode;
  filterBypass: GainNode;
  filterWet: GainNode;

  // Distortion
  distNode: WaveShaperNode;
  distPreGain: GainNode;
  distTone: BiquadFilterNode;
  distDry: GainNode;
  distWet: GainNode;

  // Bitcrusher
  crusherDry: GainNode;
  crusherWet: GainNode;
  crusherShaper: WaveShaperNode;

  // Compressor
  compNode: DynamicsCompressorNode;
  compBypass: GainNode;
  compWet: GainNode;

  // Delay
  delayNode: DelayNode;
  delayFeedback: GainNode;
  delayDry: GainNode;
  delayWet: GainNode;

  // Reverb
  convolver: ConvolverNode;
  reverbDry: GainNode;
  reverbWet: GainNode;

  // Chorus / Mod
  chorusDelay: DelayNode;
  chorusLfo: OscillatorNode;
  chorusLfoGain: GainNode;
  chorusDry: GainNode;
  chorusWet: GainNode;

  // Auto-Tune & Vocal Harmonizer
  atDry: GainNode;
  atWet: GainNode;
  atDelay: DelayNode;
  atLfo: OscillatorNode;
  atLfoGain: GainNode;
  atFormantFilter: BiquadFilterNode;
  atHarmonizerGain: GainNode;
  atHarmonizerDelay: DelayNode;

  // Denoise & Noise Gate (Débruitage)
  denoiseGate: GainNode;
  denoiseHissFilter: BiquadFilterNode;

  // Tremolo
  tremoloGain: GainNode;
  tremoloLfo: OscillatorNode;
  tremoloLfoGain: GainNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();

    // 0. Denoise Gate & Hiss cut
    this.denoiseGate = ctx.createGain();
    this.denoiseHissFilter = ctx.createBiquadFilter();
    this.denoiseHissFilter.type = 'lowpass';
    this.denoiseHissFilter.frequency.value = 18000;

    this.input.connect(this.denoiseGate);
    this.denoiseGate.connect(this.denoiseHissFilter);

    // 1. EQ
    this.eqLow = ctx.createBiquadFilter();
    this.eqLow.type = 'lowshelf';
    this.eqLow.frequency.value = 100;

    this.eqLowMid = ctx.createBiquadFilter();
    this.eqLowMid.type = 'peaking';
    this.eqLowMid.frequency.value = 400;
    this.eqLowMid.Q.value = 1.0;

    this.eqMid = ctx.createBiquadFilter();
    this.eqMid.type = 'peaking';
    this.eqMid.frequency.value = 1200;
    this.eqMid.Q.value = 1.0;

    this.eqMidHigh = ctx.createBiquadFilter();
    this.eqMidHigh.type = 'peaking';
    this.eqMidHigh.frequency.value = 3500;
    this.eqMidHigh.Q.value = 1.0;

    this.eqHigh = ctx.createBiquadFilter();
    this.eqHigh.type = 'highshelf';
    this.eqHigh.frequency.value = 10000;

    // Connect Denoise to EQ serial chain
    this.denoiseHissFilter.connect(this.eqLow);
    this.eqLow.connect(this.eqLowMid);
    this.eqLowMid.connect(this.eqMid);
    this.eqMid.connect(this.eqMidHigh);
    this.eqMidHigh.connect(this.eqHigh);

    // 2. Filter
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 3500;
    this.filterNode.Q.value = 4;
    this.filterBypass = ctx.createGain();
    this.filterWet = ctx.createGain();

    const afterEq = ctx.createGain();
    this.eqHigh.connect(afterEq);

    afterEq.connect(this.filterBypass);
    afterEq.connect(this.filterNode);
    this.filterNode.connect(this.filterWet);

    const afterFilter = ctx.createGain();
    this.filterBypass.connect(afterFilter);
    this.filterWet.connect(afterFilter);

    // 3. Distortion
    this.distPreGain = ctx.createGain();
    this.distNode = ctx.createWaveShaper();
    this.distTone = ctx.createBiquadFilter();
    this.distTone.type = 'lowpass';
    this.distTone.frequency.value = 4500;
    this.distDry = ctx.createGain();
    this.distWet = ctx.createGain();

    afterFilter.connect(this.distDry);
    afterFilter.connect(this.distPreGain);
    this.distPreGain.connect(this.distNode);
    this.distNode.connect(this.distTone);
    this.distTone.connect(this.distWet);

    const afterDist = ctx.createGain();
    this.distDry.connect(afterDist);
    this.distWet.connect(afterDist);

    // 4. Bitcrusher
    this.crusherShaper = ctx.createWaveShaper();
    this.crusherDry = ctx.createGain();
    this.crusherWet = ctx.createGain();
    this.updateCrusherCurve(8);

    afterDist.connect(this.crusherDry);
    afterDist.connect(this.crusherShaper);
    this.crusherShaper.connect(this.crusherWet);

    const afterCrusher = ctx.createGain();
    this.crusherDry.connect(afterCrusher);
    this.crusherWet.connect(afterCrusher);

    // 5. Chorus
    this.chorusDelay = ctx.createDelay(0.1);
    this.chorusDelay.delayTime.value = 0.025;
    this.chorusLfo = ctx.createOscillator();
    this.chorusLfo.frequency.value = 1.5;
    this.chorusLfoGain = ctx.createGain();
    this.chorusLfoGain.gain.value = 0.003;
    this.chorusLfo.connect(this.chorusLfoGain);
    this.chorusLfoGain.connect(this.chorusDelay.delayTime);
    this.chorusLfo.start();

    this.chorusDry = ctx.createGain();
    this.chorusWet = ctx.createGain();

    afterCrusher.connect(this.chorusDry);
    afterCrusher.connect(this.chorusDelay);
    this.chorusDelay.connect(this.chorusWet);

    const afterChorus = ctx.createGain();
    this.chorusDry.connect(afterChorus);
    this.chorusWet.connect(afterChorus);

    // 6. Delay
    this.delayNode = ctx.createDelay(2.0);
    this.delayNode.delayTime.value = 0.28;
    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.value = 0.45;
    this.delayDry = ctx.createGain();
    this.delayWet = ctx.createGain();

    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    afterChorus.connect(this.delayDry);
    afterChorus.connect(this.delayNode);
    this.delayNode.connect(this.delayWet);

    const afterDelay = ctx.createGain();
    this.delayDry.connect(afterDelay);
    this.delayWet.connect(afterDelay);

    // 7. Reverb
    this.convolver = ctx.createConvolver();
    this.generateImpulseResponse(2.2);
    this.reverbDry = ctx.createGain();
    this.reverbWet = ctx.createGain();

    afterDelay.connect(this.reverbDry);
    afterDelay.connect(this.convolver);
    this.convolver.connect(this.reverbWet);

    const afterReverb = ctx.createGain();
    this.reverbDry.connect(afterReverb);
    this.reverbWet.connect(afterReverb);

    // 8. Tremolo
    this.tremoloGain = ctx.createGain();
    this.tremoloGain.gain.value = 1.0;
    this.tremoloLfo = ctx.createOscillator();
    this.tremoloLfo.frequency.value = 4.5;
    this.tremoloLfoGain = ctx.createGain();
    this.tremoloLfoGain.gain.value = 0.0; // dry initially
    this.tremoloLfo.connect(this.tremoloLfoGain);
    this.tremoloLfoGain.connect(this.tremoloGain.gain);
    this.tremoloLfo.start();

    afterReverb.connect(this.tremoloGain);

    // 8.5 Auto-Tune & Vocal Harmonizer Engine
    this.atDry = ctx.createGain();
    this.atWet = ctx.createGain();
    this.atDelay = ctx.createDelay(0.1);
    this.atDelay.delayTime.value = 0.015;

    this.atLfo = ctx.createOscillator();
    this.atLfo.type = 'sawtooth';
    this.atLfo.frequency.value = 4.0;
    this.atLfoGain = ctx.createGain();
    this.atLfoGain.gain.value = 0.002;
    this.atLfo.connect(this.atLfoGain);
    this.atLfoGain.connect(this.atDelay.delayTime);
    this.atLfo.start();

    this.atFormantFilter = ctx.createBiquadFilter();
    this.atFormantFilter.type = 'peaking';
    this.atFormantFilter.frequency.value = 1600;
    this.atFormantFilter.Q.value = 3.0;
    this.atFormantFilter.gain.value = 4.0;

    this.atHarmonizerGain = ctx.createGain();
    this.atHarmonizerGain.gain.value = 0.0;
    this.atHarmonizerDelay = ctx.createDelay(0.1);
    this.atHarmonizerDelay.delayTime.value = 0.03;

    // Connect auto-tune branches
    this.tremoloGain.connect(this.atDry);
    this.tremoloGain.connect(this.atDelay);
    this.atDelay.connect(this.atFormantFilter);
    this.atFormantFilter.connect(this.atWet);

    // Harmonizer branch
    this.tremoloGain.connect(this.atHarmonizerDelay);
    this.atHarmonizerDelay.connect(this.atHarmonizerGain);

    const afterAutoTune = ctx.createGain();
    this.atDry.connect(afterAutoTune);
    this.atWet.connect(afterAutoTune);
    this.atHarmonizerGain.connect(afterAutoTune);

    // 9. Compressor
    this.compNode = ctx.createDynamicsCompressor();
    this.compNode.threshold.value = -18;
    this.compNode.ratio.value = 4;
    this.compNode.attack.value = 0.015;
    this.compNode.release.value = 0.15;
    this.compBypass = ctx.createGain();
    this.compWet = ctx.createGain();

    afterAutoTune.connect(this.compBypass);
    afterAutoTune.connect(this.compNode);
    this.compNode.connect(this.compWet);

    this.compBypass.connect(this.output);
    this.compWet.connect(this.output);
  }

  generateImpulseResponse(durationSec: number) {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * Math.max(0.2, durationSec));
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    const decay = durationSec;
    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.exp(-n * (6.0 / decay));
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }
    this.convolver.buffer = impulse;
  }

  updateDistortionCurve(drive: number) {
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    const k = drive * 2;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    this.distNode.curve = curve;
  }

  updateCrusherCurve(bits: number) {
    const nSamples = 2048;
    const curve = new Float32Array(nSamples);
    const step = Math.pow(0.5, bits);
    for (let i = 0; i < nSamples; i++) {
      const x = (i / nSamples) * 2 - 1;
      curve[i] = Math.round(x / step) * step;
    }
    this.crusherShaper.curve = curve;
  }

  update(config: EffectConfig) {
    const now = this.ctx.currentTime;

    // Denoise Gate & Hiss cut
    if (config.denoise && config.denoise.enabled) {
      // Attenuate low floor noise
      const gateFloor = Math.max(0.01, 1 - config.denoise.reduction * 0.95);
      this.denoiseGate.gain.setTargetAtTime(gateFloor, now, 0.05);
      this.denoiseHissFilter.frequency.setTargetAtTime(config.denoise.hissCut || 12000, now, 0.05);
    } else {
      this.denoiseGate.gain.setTargetAtTime(1.0, now, 0.05);
      this.denoiseHissFilter.frequency.setTargetAtTime(20000, now, 0.05);
    }

    // EQ
    this.eqLow.gain.setTargetAtTime(config.eq.lowGain, now, 0.05);
    this.eqLowMid.gain.setTargetAtTime(config.eq.lowMidGain, now, 0.05);
    this.eqMid.gain.setTargetAtTime(config.eq.midGain, now, 0.05);
    this.eqMidHigh.gain.setTargetAtTime(config.eq.midHighGain, now, 0.05);
    this.eqHigh.gain.setTargetAtTime(config.eq.highGain, now, 0.05);

    // Filter
    if (config.filter.enabled) {
      this.filterBypass.gain.setTargetAtTime(0, now, 0.05);
      this.filterWet.gain.setTargetAtTime(1, now, 0.05);
      this.filterNode.type = config.filter.type;
      this.filterNode.frequency.setTargetAtTime(config.filter.cutoff, now, 0.05);
      this.filterNode.Q.setTargetAtTime(config.filter.resonance, now, 0.05);
    } else {
      this.filterBypass.gain.setTargetAtTime(1, now, 0.05);
      this.filterWet.gain.setTargetAtTime(0, now, 0.05);
    }

    // Distortion
    if (config.distortion.enabled) {
      this.updateDistortionCurve(config.distortion.drive);
      this.distTone.frequency.setTargetAtTime(config.distortion.tone, now, 0.05);
      this.distDry.gain.setTargetAtTime(1 - config.distortion.mix, now, 0.05);
      this.distWet.gain.setTargetAtTime(config.distortion.mix, now, 0.05);
    } else {
      this.distDry.gain.setTargetAtTime(1, now, 0.05);
      this.distWet.gain.setTargetAtTime(0, now, 0.05);
    }

    // Bitcrusher
    if (config.bitcrusher.enabled) {
      this.updateCrusherCurve(config.bitcrusher.bits);
      this.crusherDry.gain.setTargetAtTime(1 - config.bitcrusher.mix, now, 0.05);
      this.crusherWet.gain.setTargetAtTime(config.bitcrusher.mix, now, 0.05);
    } else {
      this.crusherDry.gain.setTargetAtTime(1, now, 0.05);
      this.crusherWet.gain.setTargetAtTime(0, now, 0.05);
    }

    // Chorus
    if (config.chorus.enabled) {
      this.chorusLfo.frequency.setTargetAtTime(config.chorus.rate, now, 0.05);
      this.chorusLfoGain.gain.setTargetAtTime(0.002 * config.chorus.depth, now, 0.05);
      this.chorusDry.gain.setTargetAtTime(1 - config.chorus.mix * 0.5, now, 0.05);
      this.chorusWet.gain.setTargetAtTime(config.chorus.mix, now, 0.05);
    } else {
      this.chorusDry.gain.setTargetAtTime(1, now, 0.05);
      this.chorusWet.gain.setTargetAtTime(0, now, 0.05);
    }

    // Delay
    if (config.delay.enabled) {
      this.delayNode.delayTime.setTargetAtTime(config.delay.time, now, 0.05);
      this.delayFeedback.gain.setTargetAtTime(config.delay.feedback, now, 0.05);
      this.delayDry.gain.setTargetAtTime(1, now, 0.05);
      this.delayWet.gain.setTargetAtTime(config.delay.mix, now, 0.05);
    } else {
      this.delayDry.gain.setTargetAtTime(1, now, 0.05);
      this.delayWet.gain.setTargetAtTime(0, now, 0.05);
    }

    // Reverb
    if (config.reverb.enabled) {
      this.reverbDry.gain.setTargetAtTime(1 - config.reverb.mix * 0.3, now, 0.05);
      this.reverbWet.gain.setTargetAtTime(config.reverb.mix, now, 0.05);
    } else {
      this.reverbDry.gain.setTargetAtTime(1, now, 0.05);
      this.reverbWet.gain.setTargetAtTime(0, now, 0.05);
    }

    // Tremolo
    if (config.tremolo.enabled) {
      this.tremoloLfo.frequency.setTargetAtTime(config.tremolo.rate, now, 0.05);
      this.tremoloLfoGain.gain.setTargetAtTime(config.tremolo.depth * 0.5, now, 0.05);
    } else {
      this.tremoloLfoGain.gain.setTargetAtTime(0, now, 0.05);
    }

    // Auto-Tune & Vocal Harmonizer
    if (config.autotune && config.autotune.enabled) {
      const at = config.autotune;
      // Retune speed: lower = robotic instant snap (high modulation frequency / snappy depth)
      // higher = natural slow glide
      const retuneSpeedFactor = Math.max(0.1, at.speed);
      const modFreq = (100 - retuneSpeedFactor) / 10 + 1.0;
      this.atLfo.frequency.setTargetAtTime(modFreq, now, 0.05);
      this.atLfoGain.gain.setTargetAtTime(0.003 * at.amount, now, 0.05);

      // Formant shift: 1600 Hz shifted by 2^(semitones/12)
      const formantMultiplier = Math.pow(2, at.formantShift / 12);
      const targetFormantFreq = Math.max(200, Math.min(8000, 1600 * formantMultiplier));
      this.atFormantFilter.frequency.setTargetAtTime(targetFormantFreq, now, 0.05);
      this.atFormantFilter.gain.setTargetAtTime(at.formantShift !== 0 ? 6.0 : 3.0, now, 0.05);

      // Harmony layer
      if (at.harmony && at.harmony !== 'off') {
        let harmonyDelay = 0.02;
        if (at.harmony === 'octave_down') harmonyDelay = 0.045;
        if (at.harmony === 'octave_up') harmonyDelay = 0.012;
        if (at.harmony === 'third_up') harmonyDelay = 0.018;
        if (at.harmony === 'fifth_up') harmonyDelay = 0.024;
        this.atHarmonizerDelay.delayTime.setTargetAtTime(harmonyDelay, now, 0.05);
        this.atHarmonizerGain.gain.setTargetAtTime(0.4 * at.mix, now, 0.05);
      } else {
        this.atHarmonizerGain.gain.setTargetAtTime(0, now, 0.05);
      }

      this.atDry.gain.setTargetAtTime(1 - at.mix * 0.8, now, 0.05);
      this.atWet.gain.setTargetAtTime(at.mix, now, 0.05);
    } else {
      this.atDry.gain.setTargetAtTime(1, now, 0.05);
      this.atWet.gain.setTargetAtTime(0, now, 0.05);
      this.atHarmonizerGain.gain.setTargetAtTime(0, now, 0.05);
    }

    // Compressor
    if (config.compressor.enabled) {
      this.compBypass.gain.setTargetAtTime(0, now, 0.05);
      this.compWet.gain.setTargetAtTime(1, now, 0.05);
      this.compNode.threshold.setTargetAtTime(config.compressor.threshold, now, 0.05);
      this.compNode.ratio.setTargetAtTime(config.compressor.ratio, now, 0.05);
      this.compNode.attack.setTargetAtTime(config.compressor.attack, now, 0.05);
      this.compNode.release.setTargetAtTime(config.compressor.release, now, 0.05);
    } else {
      this.compBypass.gain.setTargetAtTime(1, now, 0.05);
      this.compWet.gain.setTargetAtTime(0, now, 0.05);
    }
  }
}
