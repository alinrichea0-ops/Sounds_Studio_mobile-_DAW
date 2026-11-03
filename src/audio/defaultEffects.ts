import { EffectConfig } from '../types/audio';

export function createDefaultEffects(): EffectConfig {
  return {
    reverb: {
      enabled: false,
      mix: 0.35,
      decay: 2.2,
      preDelay: 0.02,
    },
    delay: {
      enabled: false,
      mix: 0.3,
      time: 0.28,
      feedback: 0.45,
    },
    distortion: {
      enabled: false,
      drive: 12,
      tone: 4500,
      mix: 0.4,
    },
    chorus: {
      enabled: false,
      rate: 1.5,
      depth: 0.6,
      mix: 0.5,
    },
    flanger: {
      enabled: false,
      rate: 0.8,
      depth: 0.7,
      feedback: 0.65,
      mix: 0.5,
    },
    phaser: {
      enabled: false,
      rate: 1.2,
      depth: 0.75,
      feedback: 0.5,
      mix: 0.5,
    },
    bitcrusher: {
      enabled: false,
      bits: 8,
      reduction: 4,
      mix: 0.6,
    },
    filter: {
      enabled: false,
      type: 'lowpass',
      cutoff: 3500,
      resonance: 4.0,
    },
    compressor: {
      enabled: false,
      threshold: -18,
      ratio: 4,
      attack: 0.015,
      release: 0.15,
    },
    tremolo: {
      enabled: false,
      rate: 4.5,
      depth: 0.7,
    },
    widener: {
      enabled: false,
      width: 1.4,
    },
    autotune: {
      enabled: false,
      key: 'C',
      scale: 'minor',
      speed: 10, // Fast snap T-Pain style
      amount: 0.9,
      formantShift: 0,
      harmony: 'off',
      mix: 0.85,
    },
    denoise: {
      enabled: false,
      threshold: -45,
      reduction: 0.8,
      hissCut: 12000,
    },
    eq: {
      lowGain: 0,
      lowMidGain: 0,
      midGain: 0,
      midHighGain: 0,
      highGain: 0,
    },
  };
}
