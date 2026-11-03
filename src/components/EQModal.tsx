import React from 'react';
import { X, Activity, RotateCcw } from 'lucide-react';
import { Track, EffectConfig } from '../types/audio';
import { Knob } from './Knob';

interface EQModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string | null) => void;
  trackEffects: EffectConfig;
  masterEffects: EffectConfig;
  onChangeEffects: (target: 'track' | 'master', newEffects: EffectConfig) => void;
}

export const EQModal: React.FC<EQModalProps> = ({
  isOpen,
  onClose,
  tracks,
  selectedTrackId,
  onSelectTrack,
  trackEffects,
  masterEffects,
  onChangeEffects,
}) => {
  if (!isOpen) return null;

  const currentTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];
  const isMaster = selectedTrackId === null;
  const activeEffects = isMaster ? masterEffects : (currentTrack?.effects || trackEffects);
  const eq = activeEffects.eq;

  const updateEqGain = (band: keyof EffectConfig['eq'], gain: number) => {
    const updated = JSON.parse(JSON.stringify(activeEffects)) as EffectConfig;
    updated.eq[band] = gain;
    onChangeEffects(isMaster ? 'master' : 'track', updated);
  };

  const applyPreset = (presetName: string) => {
    const updated = JSON.parse(JSON.stringify(activeEffects)) as EffectConfig;
    if (presetName === 'flat') {
      updated.eq = { lowGain: 0, lowMidGain: 0, midGain: 0, midHighGain: 0, highGain: 0 };
    } else if (presetName === 'bass') {
      updated.eq = { lowGain: 6, lowMidGain: 3, midGain: -1, midHighGain: 0, highGain: 1 };
    } else if (presetName === 'vocal') {
      updated.eq = { lowGain: -3, lowMidGain: 0, midGain: 2, midHighGain: 5, highGain: 3 };
    } else if (presetName === 'bright') {
      updated.eq = { lowGain: -1, lowMidGain: 0, midGain: 1, midHighGain: 4, highGain: 6 };
    }
    onChangeEffects(isMaster ? 'master' : 'track', updated);
  };

  // Generate SVG curve points based on 5 band gains
  // SVG height is 160 (center 80 = 0dB, top 20 = +15dB, bottom 140 = -15dB)
  const calcY = (gain: number) => 80 - (gain / 15) * 55;

  const y1 = calcY(eq.lowGain);
  const y2 = calcY(eq.lowMidGain);
  const y3 = calcY(eq.midGain);
  const y4 = calcY(eq.midHighGain);
  const y5 = calcY(eq.highGain);

  const curvePath = `M 30,${y1} C 90,${y1} 130,${y2} 180,${y2} C 230,${y2} 270,${y3} 320,${y3} C 370,${y3} 410,${y4} 460,${y4} C 510,${y4} 550,${y5} 610,${y5}`;
  const fillPath = `${curvePath} L 610,160 L 30,160 Z`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl rounded-2xl bg-[#0d1424] border border-[#1e2f4c] shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#142033] border-b border-[#1c2c47] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/20 border border-[#00e5ff] flex items-center justify-center text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.4)]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                5-Band Parametric Graphic EQ
              </h2>
              <p className="text-[11px] text-slate-400">
                Lafan-peo sy tonom-peo (Frequency spectrum response curve)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a273e] hover:bg-[#223554] border border-[#2a3f62] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Track Bar & Presets */}
        <div className="px-4 py-2 bg-[#090f1b] border-b border-[#182740] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => onSelectTrack(null)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                isMaster
                  ? 'bg-[#00e5ff] text-slate-950 shadow-[0_0_6px_rgba(0,229,255,0.4)]'
                  : 'bg-[#121c2e] text-slate-400 hover:text-white'
              }`}
            >
              Master
            </button>
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTrack(t.id)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  selectedTrackId === t.id
                    ? 'bg-[#182844] text-white border border-[#00e5ff]'
                    : 'bg-[#121c2e] text-slate-400 hover:text-white'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Presets:</span>
            {['flat', 'bass', 'vocal', 'bright'].map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className="px-2 py-0.5 rounded bg-[#142033] hover:bg-[#1a2c47] text-[10px] font-semibold text-slate-300 capitalize border border-[#1f314f]"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Curve Canvas / SVG */}
        <div className="relative mx-4 mt-4 h-44 bg-[#070c17] rounded-xl border border-[#16253d] overflow-hidden flex items-center justify-center">
          {/* Frequency grid lines */}
          <div className="absolute inset-0 grid grid-cols-5 pointer-events-none opacity-20">
            <div className="border-r border-[#00e5ff]" />
            <div className="border-r border-[#00e5ff]" />
            <div className="border-r border-[#00e5ff]" />
            <div className="border-r border-[#00e5ff]" />
            <div />
          </div>

          {/* dB Horizontal markers */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-2 text-[9px] font-mono text-slate-500">
            <div>+15 dB</div>
            <div className="border-b border-[#1a2c47] border-dashed w-full" />
            <div>0 dB (Flat)</div>
            <div className="border-b border-[#1a2c47] border-dashed w-full" />
            <div>-15 dB</div>
          </div>

          {/* SVG Response Curve */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 640 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="eqGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={fillPath} fill="url(#eqGrad)" />
            <path
              d={curvePath}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]"
            />
            {/* Control Point Dots */}
            <circle cx="30" cy={y1} r="5" fill="#00e5ff" className="drop-shadow-[0_0_4px_#00e5ff]" />
            <circle cx="180" cy={y2} r="5" fill="#00e5ff" className="drop-shadow-[0_0_4px_#00e5ff]" />
            <circle cx="320" cy={y3} r="5" fill="#00e5ff" className="drop-shadow-[0_0_4px_#00e5ff]" />
            <circle cx="460" cy={y4} r="5" fill="#00e5ff" className="drop-shadow-[0_0_4px_#00e5ff]" />
            <circle cx="610" cy={y5} r="5" fill="#00e5ff" className="drop-shadow-[0_0_4px_#00e5ff]" />
          </svg>
        </div>

        {/* 5 Band Knobs */}
        <div className="p-4 grid grid-cols-5 gap-3 items-center justify-items-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 mb-1">100 Hz (Low)</span>
            <Knob
              value={eq.lowGain}
              min={-15}
              max={15}
              label={`${eq.lowGain > 0 ? '+' : ''}${eq.lowGain} dB`}
              color="#00e5ff"
              onChange={(val) => updateEqGain('lowGain', val)}
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 mb-1">400 Hz (Low-Mid)</span>
            <Knob
              value={eq.lowMidGain}
              min={-15}
              max={15}
              label={`${eq.lowMidGain > 0 ? '+' : ''}${eq.lowMidGain} dB`}
              color="#00e5ff"
              onChange={(val) => updateEqGain('lowMidGain', val)}
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 mb-1">1.2 kHz (Mid)</span>
            <Knob
              value={eq.midGain}
              min={-15}
              max={15}
              label={`${eq.midGain > 0 ? '+' : ''}${eq.midGain} dB`}
              color="#00e5ff"
              onChange={(val) => updateEqGain('midGain', val)}
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 mb-1">3.5 kHz (High-Mid)</span>
            <Knob
              value={eq.midHighGain}
              min={-15}
              max={15}
              label={`${eq.midHighGain > 0 ? '+' : ''}${eq.midHighGain} dB`}
              color="#00e5ff"
              onChange={(val) => updateEqGain('midHighGain', val)}
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 mb-1">10 kHz (High)</span>
            <Knob
              value={eq.highGain}
              min={-15}
              max={15}
              label={`${eq.highGain > 0 ? '+' : ''}${eq.highGain} dB`}
              color="#00e5ff"
              onChange={(val) => updateEqGain('highGain', val)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#111c2e] border-t border-[#1c2c47] flex items-center justify-between">
          <button
            onClick={() => applyPreset('flat')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18263e] hover:bg-[#203352] text-xs font-semibold text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Flat</span>
          </button>

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
