import React, { useState } from 'react';
import { 
  X, 
  Disc, 
  Sliders, 
  Sparkles, 
  Volume2, 
  Zap, 
  Radio, 
  Waves, 
  Maximize2,
  Minimize2,
  Check
} from 'lucide-react';
import { Track, EffectConfig } from '../types/audio';
import { Knob } from './Knob';

interface FXRackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string | null) => void; // null for Master Bus
  trackEffects: EffectConfig;
  masterEffects: EffectConfig;
  onChangeEffects: (target: 'track' | 'master', newEffects: EffectConfig) => void;
}

export const FXRackModal: React.FC<FXRackModalProps> = ({
  isOpen,
  onClose,
  tracks,
  selectedTrackId,
  onSelectTrack,
  trackEffects,
  masterEffects,
  onChangeEffects,
}) => {
  const [activeTab, setActiveTab] = useState<'track' | 'master'>('track');

  if (!isOpen) return null;

  const currentTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];
  const activeEffects = activeTab === 'master' ? masterEffects : (currentTrack?.effects || trackEffects);

  const updateFx = (updater: (prev: EffectConfig) => EffectConfig) => {
    const updated = updater(JSON.parse(JSON.stringify(activeEffects)));
    onChangeEffects(activeTab, updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#0d1424] border border-[#1e2f4c] shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#142033] border-b border-[#1c2c47] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/20 border border-[#00e5ff] flex items-center justify-center text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]">
              <Disc className="w-5 h-5 animate-[spin_8s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Audio Effects Rack (Effet Maro)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 font-mono">
                  12 DSP Processors
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Amboary ny reverb, delay, distortion, chorus, bitcrusher, phaser, ary compressor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Target Switch: Selected Track vs Master */}
            <div className="flex items-center bg-[#0a1120] p-1 rounded-xl border border-[#1f314f]">
              <button
                onClick={() => setActiveTab('track')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'track'
                    ? 'bg-[#00e5ff] text-slate-950 shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Track: {currentTrack?.name || 'Selected'}
              </button>
              <button
                onClick={() => setActiveTab('master')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'master'
                    ? 'bg-[#00e5ff] text-slate-950 shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Master Bus
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1a273e] hover:bg-[#223554] border border-[#2a3f62] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Track Selector Bar (when in Track mode) */}
        {activeTab === 'track' && (
          <div className="px-4 py-2 bg-[#0a1120] border-b border-[#17253d] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Select Track:
            </span>
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTrack(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                  currentTrack?.id === t.id
                    ? 'bg-[#182844] text-white border-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                    : 'bg-[#121c2e] text-slate-400 border-[#1c2c47] hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Effects Modules Grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto max-h-[580px]">
          
          {/* 0. AUTO-TUNE & VOCAL PITCH CORRECTION (Dedicated High-End Processor) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#12233f] to-[#0c182b] border-2 border-[#00e5ff]/60 shadow-[0_0_15px_rgba(0,229,255,0.2)] md:col-span-2 lg:col-span-3 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1c3559] gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00e5ff] text-slate-950 font-black flex items-center justify-center text-xs shadow-[0_0_10px_#00e5ff]">
                  AT
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white tracking-wider">
                      AUTO-TUNE & PITCH CORRECTION
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 font-mono">
                      Vocal Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Fandrindrana ny haavon'ny feo ho marina (Automatic pitch snap, robot formant & vocal harmony)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Presets */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Presets:</span>
                  {[
                    { label: 'T-Pain / Travis', speed: 0, amount: 1.0, formant: 0, harmony: 'off' },
                    { label: 'Natural Vocal', speed: 45, amount: 0.75, formant: 0, harmony: 'off' },
                    { label: 'Hyperpop 🐿️', speed: 5, amount: 0.95, formant: 7, harmony: 'off' },
                    { label: 'Deep 808 🦁', speed: 10, amount: 0.95, formant: -7, harmony: 'off' },
                    { label: 'Choir 3rd', speed: 20, amount: 0.85, formant: 0, harmony: 'third_up' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => updateFx(fx => {
                        fx.autotune.enabled = true;
                        fx.autotune.speed = preset.speed;
                        fx.autotune.amount = preset.amount;
                        fx.autotune.formantShift = preset.formant;
                        fx.autotune.harmony = preset.harmony as any;
                        return fx;
                      })}
                      className="px-2 py-0.5 rounded bg-[#162744] hover:bg-[#1e345c] text-[10px] font-semibold text-slate-300 border border-[#233f6b]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pl-2 border-l border-[#1f375e]">
                  <span className="text-xs font-bold text-white">Power</span>
                  <input
                    type="checkbox"
                    checked={activeEffects.autotune?.enabled || false}
                    onChange={(e) => updateFx(fx => { 
                      if (!fx.autotune) fx.autotune = { enabled: false, key: 'C', scale: 'minor', speed: 10, amount: 0.9, formantShift: 0, harmony: 'off', mix: 0.85 };
                      fx.autotune.enabled = e.target.checked; 
                      return fx; 
                    })}
                    className="w-5 h-5 accent-[#00e5ff] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 items-center">
              {/* Key and Scale Selectors */}
              <div className="md:col-span-4 flex flex-col gap-2.5 bg-[#0b1424] p-3 rounded-xl border border-[#1b2f50]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Root Key</span>
                  <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((k) => (
                      <button
                        key={k}
                        onClick={() => updateFx(fx => { fx.autotune.key = k as any; return fx; })}
                        className={`w-6 h-6 rounded text-[10px] font-bold transition-all ${
                          (activeEffects.autotune?.key || 'C') === k
                            ? 'bg-[#00e5ff] text-slate-950 shadow-[0_0_6px_rgba(0,229,255,0.6)]'
                            : 'bg-[#142238] text-slate-400 hover:text-white'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Musical Scale</span>
                  <select
                    value={activeEffects.autotune?.scale || 'minor'}
                    onChange={(e) => updateFx(fx => { fx.autotune.scale = e.target.value as any; return fx; })}
                    className="bg-[#142238] text-xs font-bold text-[#00e5ff] px-2.5 py-1 rounded border border-[#233a5f]"
                  >
                    <option value="major">Major (Faly / Mazava)</option>
                    <option value="minor">Natural Minor (Malahelo / Mafonja)</option>
                    <option value="pentatonic">Pentatonic (Gadona malagasy/folkoric)</option>
                    <option value="blues">Blues / Soul</option>
                    <option value="chromatic">Chromatic (Naoty rehetra)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Vocal Harmonizer</span>
                  <select
                    value={activeEffects.autotune?.harmony || 'off'}
                    onChange={(e) => updateFx(fx => { fx.autotune.harmony = e.target.value as any; return fx; })}
                    className="bg-[#142238] text-xs font-bold text-[#a855f7] px-2.5 py-1 rounded border border-[#233a5f]"
                  >
                    <option value="off">Off (Feo tokana)</option>
                    <option value="octave_down">-1 Octave (Basy mampaneno)</option>
                    <option value="octave_up">+1 Octave (Feo avo)</option>
                    <option value="third_up">+3rd Harmony (Feo faha-telo)</option>
                    <option value="fifth_up">+5th Power Harmony (Feo faha-dimy)</option>
                  </select>
                </div>
              </div>

              {/* Rotary Knobs */}
              <div className="md:col-span-8 grid grid-cols-4 sm:grid-cols-4 gap-2 items-center justify-items-center">
                <Knob
                  value={activeEffects.autotune?.speed ?? 10}
                  min={0}
                  max={100}
                  step={1}
                  label="Retune Speed"
                  unit="ms"
                  color="#00e5ff"
                  onChange={(val) => updateFx(fx => { fx.autotune.speed = val; return fx; })}
                />

                <Knob
                  value={activeEffects.autotune?.amount ?? 0.9}
                  min={0}
                  max={1}
                  label="Correction"
                  unit="%"
                  color="#00e5ff"
                  onChange={(val) => updateFx(fx => { fx.autotune.amount = val; return fx; })}
                />

                <Knob
                  value={activeEffects.autotune?.formantShift ?? 0}
                  min={-12}
                  max={12}
                  step={1}
                  label="Formant Shift"
                  unit="st"
                  color="#a855f7"
                  onChange={(val) => updateFx(fx => { fx.autotune.formantShift = val; return fx; })}
                />

                <Knob
                  value={activeEffects.autotune?.mix ?? 0.85}
                  min={0}
                  max={1}
                  label="Wet Mix"
                  unit="%"
                  color="#00e5ff"
                  onChange={(val) => updateFx(fx => { fx.autotune.mix = val; return fx; })}
                />
              </div>
            </div>

            {/* Bottom Scale Snapping Visualizer Bar */}
            <div className="pt-2 border-t border-[#1a3152] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
                <span className="text-white font-bold">Scale Notes:</span>
                <span>
                  {activeEffects.autotune?.key || 'C'} {activeEffects.autotune?.scale || 'minor'} scale active
                </span>
              </div>
              <span className="text-[#00e5ff] font-bold">
                {activeEffects.autotune?.speed === 0 ? 'ROBOTIC HARD SNAP (T-Pain mode)' : `${activeEffects.autotune?.speed || 10}ms glide`}
              </span>
            </div>
          </div>

          {/* 0.5 DÉBRUITAGE & NOISE GATE (Fanadiovana Feo) */}
          <div className="p-3.5 rounded-xl bg-[#121c2f] border border-[#1e2f4c] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2a42]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">DÉBRUITAGE / NOISE GATE</span>
                <span className="text-[10px] text-emerald-400 font-mono">Anti-Hiss</span>
              </div>
              <input
                type="checkbox"
                checked={activeEffects.denoise?.enabled || false}
                onChange={(e) => updateFx(fx => { 
                  if (!fx.denoise) fx.denoise = { enabled: false, threshold: -45, reduction: 0.8, hissCut: 12000 };
                  fx.denoise.enabled = e.target.checked; 
                  return fx; 
                })}
                className="w-4 h-4 accent-emerald-400 cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 items-center justify-items-center">
              <Knob
                value={activeEffects.denoise?.threshold ?? -45}
                min={-70}
                max={-15}
                label="Threshold"
                unit="dB"
                color="#10b981"
                onChange={(val) => updateFx(fx => { 
                  if (!fx.denoise) fx.denoise = { enabled: false, threshold: -45, reduction: 0.8, hissCut: 12000 };
                  fx.denoise.threshold = val; 
                  return fx; 
                })}
              />
              <Knob
                value={activeEffects.denoise?.reduction ?? 0.8}
                min={0}
                max={1}
                label="Reduction"
                unit="%"
                color="#10b981"
                onChange={(val) => updateFx(fx => { 
                  if (!fx.denoise) fx.denoise = { enabled: false, threshold: -45, reduction: 0.8, hissCut: 12000 };
                  fx.denoise.reduction = val; 
                  return fx; 
                })}
              />
              <Knob
                value={activeEffects.denoise?.hissCut ?? 12000}
                min={3000}
                max={18000}
                label="Hiss Cut"
                unit="Hz"
                color="#10b981"
                onChange={(val) => updateFx(fx => { 
                  if (!fx.denoise) fx.denoise = { enabled: false, threshold: -45, reduction: 0.8, hissCut: 12000 };
                  fx.denoise.hissCut = val; 
                  return fx; 
                })}
              />
            </div>
            <div className="mt-2 pt-1 border-t border-[#182740] flex items-center justify-between text-[9px] text-slate-400">
              <span>Manala feon-drivotra sy fofona mikrô</span>
              <button
                onClick={() => updateFx(fx => {
                  fx.denoise = { enabled: true, threshold: -48, reduction: 0.85, hissCut: 11000 };
                  return fx;
                })}
                className="text-[9px] font-bold text-emerald-400 hover:underline"
              >
                Auto Clean Mic
              </button>
            </div>
          </div>

          {/* 1. REVERB */}
          <div className="p-3.5 rounded-xl bg-[#121c2f] border border-[#1e2f4c] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2a42]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">REVERB (Akony)</span>
                <span className="text-[10px] text-slate-400 font-mono">Concert Hall</span>
              </div>
              <input
                type="checkbox"
                checked={activeEffects.reverb.enabled}
                onChange={(e) => updateFx(fx => { fx.reverb.enabled = e.target.checked; return fx; })}
                className="w-4 h-4 accent-[#00e5ff] cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 items-center justify-items-center">
              <Knob
                value={activeEffects.reverb.mix}
                min={0}
                max={1}
                label="Mix"
                unit="%"
                color="#00e5ff"
                onChange={(val) => updateFx(fx => { fx.reverb.mix = val; return fx; })}
              />
              <Knob
                value={activeEffects.reverb.decay}
                min={0.5}
                max={8}
                label="Decay"
                unit="s"
                color="#00e5ff"
                onChange={(val) => updateFx(fx => { fx.reverb.decay = val; return fx; })}
              />
              <Knob
                value={activeEffects.reverb.preDelay}
                min={0}
                max={0.2}
                label="Pre-Delay"
                unit="s"
                color="#00e5ff"
                onChange={(val) => updateFx(fx => { fx.reverb.preDelay = val; return fx; })}
              />
            </div>
          </div>

          {/* 2. DELAY / ECHO */}
          <div className="p-3.5 rounded-xl bg-[#121c2f] border border-[#1e2f4c] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2a42]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">DELAY & ECHO</span>
                <span className="text-[10px] text-slate-400 font-mono">Ping-Pong</span>
              </div>
              <input
                type="checkbox"
                checked={activeEffects.delay.enabled}
                onChange={(e) => updateFx(fx => { fx.delay.enabled = e.target.checked; return fx; })}
                className="w-4 h-4 accent-[#00e5ff] cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 items-center justify-items-center">
              <Knob
                value={activeEffects.delay.mix}
                min={0}
                max={1}
                label="Mix"
                color="#3b82f6"
                onChange={(val) => updateFx(fx => { fx.delay.mix = val; return fx; })}
              />
              <Knob
                value={activeEffects.delay.time}
                min={0.05}
                max={1.0}
                label="Time"
                unit="s"
                color="#3b82f6"
                onChange={(val) => updateFx(fx => { fx.delay.time = val; return fx; })}
              />
              <Knob
                value={activeEffects.delay.feedback}
                min={0}
                max={0.9}
                label="Feedback"
                color="#3b82f6"
                onChange={(val) => updateFx(fx => { fx.delay.feedback = val; return fx; })}
              />
            </div>
          </div>

          {/* 3. DISTORTION / OVERDRIVE */}
          <div className="p-3.5 rounded-xl bg-[#121c2f] border border-[#1e2f4c] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2a42]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">DISTORTION / DRIVE</span>
                <span className="text-[10px] text-slate-400 font-mono">Tube Saturation</span>
              </div>
              <input
                type="checkbox"
                checked={activeEffects.distortion.enabled}
                onChange={(e) => updateFx(fx => { fx.distortion.enabled = e.target.checked; return fx; })}
                className="w-4 h-4 accent-[#f97316] cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 items-center justify-items-center">
              <Knob
                value={activeEffects.distortion.drive}
                min={0}
                max={40}
                label="Drive"
                color="#f97316"
                onChange={(val) => updateFx(fx => { fx.distortion.drive = val; return fx; })}
              />
              <Knob
                value={activeEffects.distortion.tone}
                min={1000}
                max={10000}
                label="Tone"
                unit="Hz"
                color="#f97316"
                onChange={(val) => updateFx(fx => { fx.distortion.tone = val; return fx; })}
              />
              <Knob
                value={activeEffects.distortion.mix}
                min={0}
                max={1}
                label="Mix"
                color="#f97316"
                onChange={(val) => updateFx(fx => { fx.distortion.mix = val; return fx; })}
              />
            </div>
          </div>

          {/* 4. CHORUS */}
          <div className="p-3.5 rounded-xl bg-[#121c2f] border border-[#1e2f4c] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2a42]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">CHORUS (Tuika)</span>
                <span className="text-[10px] text-slate-400 font-mono">Analog Warmth</span>
              </div>
              <input
                type="checkbox"
                checked={activeEffects.chorus.enabled}
                onChange={(e) => updateFx(fx => { fx.chorus.enabled = e.target.checked; return fx; })}
                className="w-4 h-4 accent-[#a855f7] cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 items-center justify-items-center">
              <Knob
                value={activeEffects.chorus.rate}
                min={0.2}
                max={6}
                label="Rate"
                unit="Hz"
                color="#a855f7"
                onChange={(val) => updateFx(fx => { fx.chorus.rate = val; return fx; })}
              />
              <Knob
                value={activeEffects.chorus.depth}
                min={0}
                max={1}
                label="Depth"
                color="#a855f7"
                onChange={(val) => updateFx(fx => { fx.chorus.depth = val; return fx; })}
              />
              <Knob
                value={activeEffects.chorus.mix}
                min={0}
                max={1}
                label="Mix"
                color="#a855f7"
                onChange={(val) => updateFx(fx => { fx.chorus.mix = val; return fx; })}
              />
            </div>
          </div>

          {/* 5. BITCRUSHER (Lo-Fi Vintage) */}
          <div className="p-3.5 rounded-xl bg-[#121c2f] border border-[#1e2f4c] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2a42]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">BITCRUSHER (Lo-Fi)</span>
                <span className="text-[10px] text-slate-400 font-mono">8-Bit Grit</span>
              </div>
              <input
                type="checkbox"
                checked={activeEffects.bitcrusher.enabled}
                onChange={(e) => updateFx(fx => { fx.bitcrusher.enabled = e.target.checked; return fx; })}
                className="w-4 h-4 accent-[#ec4899] cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 items-center justify-items-center">
              <Knob
                value={activeEffects.bitcrusher.bits}
                min={3}
                max={16}
                step={1}
                label="Bits"
                color="#ec4899"
                onChange={(val) => updateFx(fx => { fx.bitcrusher.bits = val; return fx; })}
              />
              <Knob
                value={activeEffects.bitcrusher.reduction}
                min={1}
                max={16}
                step={1}
                label="Sample Down"
                color="#ec4899"
                onChange={(val) => updateFx(fx => { fx.bitcrusher.reduction = val; return fx; })}
              />
              <Knob
                value={activeEffects.bitcrusher.mix}
                min={0}
                max={1}
                label="Mix"
                color="#ec4899"
                onChange={(val) => updateFx(fx => { fx.bitcrusher.mix = val; return fx; })}
              />
            </div>
          </div>

          {/* 6. RESONANT FILTER */}
          <div className="p-3.5 rounded-xl bg-[#121c2f] border border-[#1e2f4c] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2a42]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">FILTER (Sivana)</span>
                <select
                  value={activeEffects.filter.type}
                  onChange={(e) => updateFx(fx => { fx.filter.type = e.target.value as any; return fx; })}
                  className="bg-[#0b1220] text-[10px] text-slate-300 px-1 py-0.5 rounded border border-[#1f314d]"
                >
                  <option value="lowpass">Lowpass</option>
                  <option value="highpass">Highpass</option>
                  <option value="bandpass">Bandpass</option>
                </select>
              </div>
              <input
                type="checkbox"
                checked={activeEffects.filter.enabled}
                onChange={(e) => updateFx(fx => { fx.filter.enabled = e.target.checked; return fx; })}
                className="w-4 h-4 accent-[#10b981] cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 items-center justify-items-center">
              <Knob
                value={activeEffects.filter.cutoff}
                min={80}
                max={16000}
                label="Cutoff"
                unit="Hz"
                color="#10b981"
                onChange={(val) => updateFx(fx => { fx.filter.cutoff = val; return fx; })}
              />
              <Knob
                value={activeEffects.filter.resonance}
                min={0.5}
                max={15}
                label="Resonance Q"
                color="#10b981"
                onChange={(val) => updateFx(fx => { fx.filter.resonance = val; return fx; })}
              />
            </div>
          </div>

          {/* 7. DYNAMICS COMPRESSOR */}
          <div className="p-3.5 rounded-xl bg-[#121c2f] border border-[#1e2f4c] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2a42]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">COMPRESSOR</span>
                <span className="text-[10px] text-slate-400 font-mono">Punch & Glue</span>
              </div>
              <input
                type="checkbox"
                checked={activeEffects.compressor.enabled}
                onChange={(e) => updateFx(fx => { fx.compressor.enabled = e.target.checked; return fx; })}
                className="w-4 h-4 accent-[#eab308] cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 pt-3 items-center justify-items-center">
              <Knob
                value={activeEffects.compressor.threshold}
                min={-50}
                max={0}
                label="Thresh"
                unit="dB"
                color="#eab308"
                onChange={(val) => updateFx(fx => { fx.compressor.threshold = val; return fx; })}
              />
              <Knob
                value={activeEffects.compressor.ratio}
                min={1}
                max={16}
                label="Ratio"
                color="#eab308"
                onChange={(val) => updateFx(fx => { fx.compressor.ratio = val; return fx; })}
              />
              <Knob
                value={activeEffects.compressor.attack}
                min={0.001}
                max={0.1}
                label="Attack"
                color="#eab308"
                onChange={(val) => updateFx(fx => { fx.compressor.attack = val; return fx; })}
              />
              <Knob
                value={activeEffects.compressor.release}
                min={0.05}
                max={0.8}
                label="Release"
                color="#eab308"
                onChange={(val) => updateFx(fx => { fx.compressor.release = val; return fx; })}
              />
            </div>
          </div>

          {/* 8. TREMOLO & AUTO-PAN */}
          <div className="p-3.5 rounded-xl bg-[#121c2f] border border-[#1e2f4c] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2a42]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">TREMOLO (Ondy)</span>
                <span className="text-[10px] text-slate-400 font-mono">Amplitude LFO</span>
              </div>
              <input
                type="checkbox"
                checked={activeEffects.tremolo.enabled}
                onChange={(e) => updateFx(fx => { fx.tremolo.enabled = e.target.checked; return fx; })}
                className="w-4 h-4 accent-[#06b6d4] cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 items-center justify-items-center">
              <Knob
                value={activeEffects.tremolo.rate}
                min={0.5}
                max={12}
                label="Speed"
                unit="Hz"
                color="#06b6d4"
                onChange={(val) => updateFx(fx => { fx.tremolo.rate = val; return fx; })}
              />
              <Knob
                value={activeEffects.tremolo.depth}
                min={0}
                max={1}
                label="Depth"
                color="#06b6d4"
                onChange={(val) => updateFx(fx => { fx.tremolo.depth = val; return fx; })}
              />
            </div>
          </div>

          {/* 9. STEREO WIDENER */}
          <div className="p-3.5 rounded-xl bg-[#121c2f] border border-[#1e2f4c] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2a42]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider">STEREO WIDENER</span>
                <span className="text-[10px] text-slate-400 font-mono">3D Spatial</span>
              </div>
              <input
                type="checkbox"
                checked={activeEffects.widener.enabled}
                onChange={(e) => updateFx(fx => { fx.widener.enabled = e.target.checked; return fx; })}
                className="w-4 h-4 accent-[#00e5ff] cursor-pointer"
              />
            </div>
            <div className="flex flex-col items-center justify-center pt-3">
              <Knob
                value={activeEffects.widener.width}
                min={0.5}
                max={2.0}
                label="Stereo Width"
                color="#00e5ff"
                onChange={(val) => updateFx(fx => { fx.widener.width = val; return fx; })}
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#111c2e] border-t border-[#1c2c47] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
            <span>Real-time Web Audio DSP Active (Fiovana mivantana eo noho eo)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00e5ff] hover:bg-[#00c8e0] text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
