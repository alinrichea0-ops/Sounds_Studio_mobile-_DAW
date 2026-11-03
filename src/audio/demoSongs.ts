import { Project, Track, Clip } from '../types/audio';
import { createDefaultEffects } from './defaultEffects';

export function createInitialProject(): Project {
  // Beat Pattern (16 steps)
  const beatPattern1 = {
    kick: [true, false, false, false, false, false, true, false, false, true, false, false, false, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
    perc: [false, false, true, false, false, false, false, true, false, false, true, false, false, false, true, false],
    bass808: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  };

  // Keyboard notes (Fm - Ab - Eb - Db progression)
  // Step 0..31 (2 bars)
  const keyboardNotes1 = [
    // Bar 1 (F minor: F4 65, Ab4 68, C5 72)
    { id: 'k1', note: 65, step: 0, durationSteps: 6, velocity: 0.8 },
    { id: 'k2', note: 68, step: 0, durationSteps: 6, velocity: 0.75 },
    { id: 'k3', note: 72, step: 0, durationSteps: 6, velocity: 0.85 },
    // Bar 1 second half (Ab major: Ab4 68, C5 72, Eb5 75)
    { id: 'k4', note: 68, step: 8, durationSteps: 6, velocity: 0.8 },
    { id: 'k5', note: 72, step: 8, durationSteps: 6, velocity: 0.8 },
    { id: 'k6', note: 75, step: 8, durationSteps: 6, velocity: 0.85 },
    // Bar 2 (Eb major: Eb4 63, G4 67, Bb4 70)
    { id: 'k7', note: 63, step: 16, durationSteps: 6, velocity: 0.8 },
    { id: 'k8', note: 67, step: 16, durationSteps: 6, velocity: 0.75 },
    { id: 'k9', note: 70, step: 16, durationSteps: 6, velocity: 0.8 },
    // Bar 2 second half (Db major: Db4 61, F4 65, Ab4 68)
    { id: 'k10', note: 61, step: 24, durationSteps: 6, velocity: 0.85 },
    { id: 'k11', note: 65, step: 24, durationSteps: 6, velocity: 0.8 },
    { id: 'k12', note: 68, step: 24, durationSteps: 6, velocity: 0.8 },
  ];

  // Guitar melody riff notes
  const guitarNotes1 = [
    { id: 'g1', note: 72, step: 2, durationSteps: 2, velocity: 0.9 }, // C5
    { id: 'g2', note: 75, step: 4, durationSteps: 2, velocity: 0.85 }, // Eb5
    { id: 'g3', note: 77, step: 6, durationSteps: 3, velocity: 0.95 }, // F5
    { id: 'g4', note: 75, step: 10, durationSteps: 2, velocity: 0.8 },
    { id: 'g5', note: 72, step: 12, durationSteps: 2, velocity: 0.85 },
    { id: 'g6', note: 70, step: 14, durationSteps: 2, velocity: 0.8 },
    { id: 'g7', note: 68, step: 18, durationSteps: 3, velocity: 0.9 }, // Ab4
    { id: 'g8', note: 70, step: 22, durationSteps: 2, velocity: 0.85 },
    { id: 'g9', note: 72, step: 26, durationSteps: 4, velocity: 0.9 },
  ];

  // Vocal chops / melodic vocal lead
  const vocalNotes1 = [
    { id: 'v1', note: 77, step: 0, durationSteps: 4, velocity: 0.9 },
    { id: 'v2', note: 80, step: 6, durationSteps: 4, velocity: 0.85 },
    { id: 'v3', note: 82, step: 12, durationSteps: 3, velocity: 0.9 },
    { id: 'v4', note: 77, step: 16, durationSteps: 6, velocity: 0.85 },
    { id: 'v5', note: 75, step: 24, durationSteps: 4, velocity: 0.8 },
  ];

  // Simulated waveform points for audio track
  const audioWaveform: number[] = [
    0.2, 0.4, 0.8, 0.5, 0.3, 0.9, 0.6, 0.2, 0.7, 0.4, 0.9, 0.8, 0.3, 0.5, 0.7, 0.2,
    0.3, 0.6, 0.9, 0.4, 0.2, 0.8, 0.7, 0.3, 0.6, 0.9, 0.5, 0.3, 0.8, 0.6, 0.4, 0.1
  ];

  const tracks: Track[] = [
    {
      id: 't-vocal',
      name: 'VOCAL',
      type: 'vocal',
      instrument: 'synth_lead',
      color: '#00e5ff',
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      armed: false,
      effects: {
        ...createDefaultEffects(),
        autotune: { enabled: true, key: 'C', scale: 'minor', speed: 5, amount: 0.95, formantShift: 0, harmony: 'off', mix: 0.9 },
        reverb: { enabled: true, mix: 0.4, decay: 2.5, preDelay: 0.02 },
        delay: { enabled: true, mix: 0.25, time: 0.25, feedback: 0.4 },
      },
      clips: [
        {
          id: 'c-vocal-1',
          trackId: 't-vocal',
          name: 'Vocal Hook A',
          startBar: 1,
          durationBars: 4,
          type: 'pattern',
          notes: vocalNotes1,
          color: '#00e5ff',
        },
        {
          id: 'c-vocal-2',
          trackId: 't-vocal',
          name: 'Vocal Hook B',
          startBar: 5,
          durationBars: 4,
          type: 'pattern',
          notes: vocalNotes1,
          color: '#00e5ff',
        },
      ],
    },
    {
      id: 't-beat',
      name: 'BEAT',
      type: 'beat',
      instrument: 'drum_trap',
      color: '#0084ff',
      volume: 0.9,
      pan: 0,
      mute: false,
      solo: false,
      armed: false,
      effects: {
        ...createDefaultEffects(),
        compressor: { enabled: true, threshold: -16, ratio: 5, attack: 0.01, release: 0.12 },
      },
      clips: [
        {
          id: 'c-beat-1',
          trackId: 't-beat',
          name: 'Trap 808 Groove',
          startBar: 1,
          durationBars: 4,
          type: 'drum',
          drumPattern: beatPattern1,
          color: '#0084ff',
        },
        {
          id: 'c-beat-2',
          trackId: 't-beat',
          name: 'Trap 808 Groove',
          startBar: 5,
          durationBars: 4,
          type: 'drum',
          drumPattern: beatPattern1,
          color: '#0084ff',
        },
      ],
    },
    {
      id: 't-keyboard',
      name: 'KEYBOARD',
      type: 'keyboard',
      instrument: 'rhodes',
      color: '#a855f7',
      volume: 0.85,
      pan: -0.2,
      mute: false,
      solo: false,
      armed: false,
      effects: {
        ...createDefaultEffects(),
        chorus: { enabled: true, rate: 1.8, depth: 0.65, mix: 0.45 },
        reverb: { enabled: true, mix: 0.35, decay: 2.0, preDelay: 0.01 },
      },
      clips: [
        {
          id: 'c-key-1',
          trackId: 't-keyboard',
          name: 'Rhodes Chords',
          startBar: 1,
          durationBars: 4,
          type: 'pattern',
          notes: keyboardNotes1,
          color: '#a855f7',
        },
        {
          id: 'c-key-2',
          trackId: 't-keyboard',
          name: 'Rhodes Chords',
          startBar: 5,
          durationBars: 4,
          type: 'pattern',
          notes: keyboardNotes1,
          color: '#a855f7',
        },
      ],
    },
    {
      id: 't-guitar',
      name: 'GUITAR',
      type: 'guitar',
      instrument: 'guitar_clean',
      color: '#f97316',
      volume: 0.8,
      pan: 0.25,
      mute: false,
      solo: false,
      armed: false,
      effects: {
        ...createDefaultEffects(),
        distortion: { enabled: true, drive: 8, tone: 4200, mix: 0.3 },
        delay: { enabled: true, mix: 0.35, time: 0.3, feedback: 0.5 },
      },
      clips: [
        {
          id: 'c-guitar-1',
          trackId: 't-guitar',
          name: 'Electric Riff',
          startBar: 1,
          durationBars: 4,
          type: 'pattern',
          notes: guitarNotes1,
          color: '#f97316',
        },
        {
          id: 'c-guitar-2',
          trackId: 't-guitar',
          name: 'Electric Riff',
          startBar: 5,
          durationBars: 4,
          type: 'pattern',
          notes: guitarNotes1,
          color: '#f97316',
        },
      ],
    },
    {
      id: 't-audio',
      name: 'AUDIO',
      type: 'audio',
      instrument: 'synth_pluck',
      color: '#eab308',
      volume: 0.75,
      pan: 0,
      mute: false,
      solo: false,
      armed: false,
      effects: {
        ...createDefaultEffects(),
        reverb: { enabled: true, mix: 0.3, decay: 1.8, preDelay: 0.01 },
      },
      clips: [
        {
          id: 'c-audio-1',
          trackId: 't-audio',
          name: 'Atmosphere Loop',
          startBar: 1,
          durationBars: 4,
          type: 'audio',
          waveformPoints: audioWaveform,
          notes: [
            { id: 'a1', note: 60, step: 0, durationSteps: 8, velocity: 0.6 },
            { id: 'a2', note: 63, step: 8, durationSteps: 8, velocity: 0.6 },
            { id: 'a3', note: 67, step: 16, durationSteps: 8, velocity: 0.6 },
            { id: 'a4', note: 58, step: 24, durationSteps: 8, velocity: 0.6 },
          ],
          color: '#eab308',
        },
        {
          id: 'c-audio-2',
          trackId: 't-audio',
          name: 'Atmosphere Loop',
          startBar: 5,
          durationBars: 4,
          type: 'audio',
          waveformPoints: audioWaveform,
          notes: [
            { id: 'a5', note: 60, step: 0, durationSteps: 8, velocity: 0.6 },
            { id: 'a6', note: 63, step: 8, durationSteps: 8, velocity: 0.6 },
            { id: 'a7', note: 67, step: 16, durationSteps: 8, velocity: 0.6 },
            { id: 'a8', note: 58, step: 24, durationSteps: 8, velocity: 0.6 },
          ],
          color: '#eab308',
        },
      ],
    },
  ];

  return {
    id: 'proj-default-1',
    name: 'Hit Session 01',
    bpm: 140,
    timeSignature: [4, 4],
    totalBars: 16,
    tracks,
    masterVolume: 0.9,
    masterEffects: {
      ...createDefaultEffects(),
      compressor: { enabled: true, threshold: -12, ratio: 3.5, attack: 0.02, release: 0.1 },
    },
    masteringConfig: {
      preset: 'streaming',
      drive: 3.0,
      ceiling: -0.8,
      stereoWidth: 1.25,
      warmth: 0.4,
      targetLufs: -14,
      isMono: false,
    },
    isMono: false,
    loop: {
      enabled: true,
      startBar: 1,
      endBar: 9,
    },
  };
}
