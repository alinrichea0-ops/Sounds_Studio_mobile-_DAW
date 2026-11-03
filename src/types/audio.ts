export type TrackType = 
  | 'vocal' 
  | 'beat' 
  | 'keyboard' 
  | 'guitar' 
  | 'bass' 
  | 'synth' 
  | 'strings' 
  | 'brass' 
  | 'audio';

export type InstrumentId = 
  | 'drum_trap' 
  | 'drum_boombap' 
  | 'drum_afro'
  | 'drum_electronic'
  | 'grand_piano' 
  | 'rhodes' 
  | 'synth_lead' 
  | 'synth_pad' 
  | 'synth_pluck' 
  | 'bass_808' 
  | 'bass_slap' 
  | 'bass_synth'
  | 'guitar_clean' 
  | 'guitar_dist' 
  | 'strings_ensemble' 
  | 'brass_section' 
  | 'vocal_mic' 
  | 'audio_sampler';

export interface NoteEvent {
  id: string;
  note: number; // MIDI pitch 0-127 (60 is C4)
  step: number; // 0-15 (within a bar of 16th notes) or bar relative
  durationSteps: number; // duration in 16th note steps (default 2)
  velocity: number; // 0.0 - 1.0
}

export interface DrumStepPattern {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  clap: boolean[];
  perc: boolean[];
  bass808: boolean[];
}

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  startBar: number; // 1-based, e.g. 1, 2, 3...
  durationBars: number; // e.g. 2 or 4 bars
  type: 'pattern' | 'drum' | 'audio';
  notes?: NoteEvent[];
  drumPattern?: DrumStepPattern;
  audioBuffer?: AudioBuffer | null;
  waveformPoints?: number[];
  color?: string;
}

export interface EffectConfig {
  reverb: {
    enabled: boolean;
    mix: number; // 0 - 1
    decay: number; // seconds (0.5 - 10)
    preDelay: number; // seconds
  };
  delay: {
    enabled: boolean;
    mix: number; // 0 - 1
    time: number; // seconds (0.05 - 1)
    feedback: number; // 0 - 0.95
  };
  distortion: {
    enabled: boolean;
    drive: number; // 0 - 50
    tone: number; // filter hz
    mix: number; // 0 - 1
  };
  chorus: {
    enabled: boolean;
    rate: number; // 0.1 - 8 Hz
    depth: number; // 0 - 1
    mix: number; // 0 - 1
  };
  flanger: {
    enabled: boolean;
    rate: number; // 0.1 - 5 Hz
    depth: number; // 0 - 1
    feedback: number; // 0 - 0.9
    mix: number;
  };
  phaser: {
    enabled: boolean;
    rate: number; // 0.1 - 8 Hz
    depth: number; // 0 - 1
    feedback: number; // 0 - 0.8
    mix: number;
  };
  bitcrusher: {
    enabled: boolean;
    bits: number; // 2 - 16
    reduction: number; // 1 - 20 (sample rate downsampling)
    mix: number;
  };
  filter: {
    enabled: boolean;
    type: 'lowpass' | 'highpass' | 'bandpass';
    cutoff: number; // 40 - 18000 Hz
    resonance: number; // 0.1 - 20 Q
  };
  compressor: {
    enabled: boolean;
    threshold: number; // -60 to 0 dB
    ratio: number; // 1 to 20
    attack: number; // 0.001 to 0.1
    release: number; // 0.05 to 1
  };
  tremolo: {
    enabled: boolean;
    rate: number; // 0.5 - 15 Hz
    depth: number; // 0 - 1
  };
  widener: {
    enabled: boolean;
    width: number; // 0 - 2 (1 = normal, 2 = wide)
  };
  autotune: {
    enabled: boolean;
    key: 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
    scale: 'major' | 'minor' | 'pentatonic' | 'chromatic' | 'blues';
    speed: number; // 0 (hard snap / T-Pain) to 100 (natural)
    amount: number; // 0 - 1
    formantShift: number; // -12 to +12 semitones
    harmony: 'off' | 'octave_down' | 'octave_up' | 'third_up' | 'fifth_up';
    mix: number; // 0 - 1
  };
  denoise: {
    enabled: boolean;
    threshold: number; // -70 to -10 dB
    reduction: number; // 0 to 1
    hissCut: number; // 3000 to 18000 Hz
  };
  eq: {
    lowGain: number; // -15 to +15 dB (100 Hz)
    lowMidGain: number; // -15 to +15 dB (400 Hz)
    midGain: number; // -15 to +15 dB (1000 Hz)
    midHighGain: number; // -15 to +15 dB (3500 Hz)
    highGain: number; // -15 to +15 dB (10000 Hz)
  };
}

export interface MasteringConfig {
  preset: string; // 'streaming' | 'club_bass' | 'analog_tape' | 'acoustic_air' | 'edm_loud';
  drive: number; // 0 to 12 dB
  ceiling: number; // -0.1 to -2.0 dB
  stereoWidth: number; // 0.0 (mono) to 2.0 (extra wide)
  warmth: number; // 0 to 1
  targetLufs: number; // -16 to -6
  isMono: boolean;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  instrument: InstrumentId;
  color: string;
  volume: number; // 0.0 to 1.5, default 0.85
  pan: number; // -1.0 to 1.0, default 0
  mute: boolean;
  solo: boolean;
  armed: boolean;
  effects: EffectConfig;
  clips: Clip[];
}

export interface Project {
  id: string;
  name: string;
  bpm: number;
  timeSignature: [number, number];
  totalBars: number;
  tracks: Track[];
  masterVolume: number;
  masterEffects: EffectConfig;
  masteringConfig: MasteringConfig;
  isMono: boolean;
  loop: {
    enabled: boolean;
    startBar: number;
    endBar: number;
  };
}

export type ActiveModal = 
  | null 
  | 'piano_roll' 
  | 'mixer' 
  | 'eq' 
  | 'fx' 
  | 'add_track' 
  | 'visualizer' 
  | 'project_menu' 
  | 'drum_sequencer'
  | 'install_apk'
  | 'mastering';
