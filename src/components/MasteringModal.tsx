import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Zap, 
  Volume2, 
  Layers, 
  Download, 
  Check, 
  Radio, 
  Headphones, 
  Flame, 
  Music,
  Disc
} from 'lucide-react';
import { Project, MasteringConfig } from '../types/audio';
import { Knob } from './Knob';

interface MasteringModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateMastering: (config: MasteringConfig) => void;
  onToggleMono: () => void;
  onExportMasteredWav: () => void;
}

interface MasteringPresetItem {
  id: string;
  name: string;
  targetLufs: number;
  description: string;
  icon: any;
  color: string;
  drive: number;
  ceiling: number;
  stereoWidth: number;
  warmth: number;
  eq: { low: number; mid: number; high: number };
}

const MASTERING_PRESETS: MasteringPresetItem[] = [
  {
    id: 'streaming',
    name: 'Spotify & Streaming Standard',
    targetLufs: -14,
    description: 'Namboarina manokana ho an\'ny Spotify, Apple Music, sy YouTube (Loudness normalisé madio tsara tsy misy saturation).',
    icon: Headphones,
    color: '#00e5ff',
    drive: 3.5,
    ceiling: -0.8,
    stereoWidth: 1.2,
    warmth: 0.35,
    eq: { low: 1.5, mid: 0.5, high: 2.0 },
  },
  {
    id: 'club_bass',
    name: 'Club, Trap & Drill Heavy Bass',
    targetLufs: -8,
    description: 'Feo mafy be (Loudness avo dia avo) miaraka amin\'ny basy 808 manindrona sy kick mafonja ho an\'ny boîte de nuit sy Sound System.',
    icon: Flame,
    color: '#ef4444',
    drive: 6.8,
    ceiling: -0.2,
    stereoWidth: 1.35,
    warmth: 0.6,
    eq: { low: 4.0, mid: -1.0, high: 2.5 },
  },
  {
    id: 'analog_tape',
    name: 'Warm Analog Tape (Vintage Studio)',
    targetLufs: -12,
    description: 'Hafanana sy tube saturation toy ny nandraisana tamin\'ny kasety Studio vintage (feon-kira malemy sady manana endrika kanto).',
    icon: Disc,
    color: '#f97316',
    drive: 4.2,
    ceiling: -0.5,
    stereoWidth: 1.15,
    warmth: 0.85,
    eq: { low: 2.5, mid: 1.5, high: -0.5 },
  },
  {
    id: 'acoustic_air',
    name: 'Acoustic & Vocal Clarity',
    targetLufs: -16,
    description: 'Mampisongadina ny feon\'ny mpihira, gitara acoustique, sy piano miaraka amin\'ny transparence kristaly.',
    icon: Music,
    color: '#10b981',
    drive: 2.0,
    ceiling: -1.0,
    stereoWidth: 1.4,
    warmth: 0.2,
    eq: { low: 0.5, mid: 1.0, high: 3.5 },
  },
  {
    id: 'edm_loud',
    name: 'EDM & Hyperpop Maximizer',
    targetLufs: -7,
    description: 'Hery faratampony sy stereo imaging mivelatra be (Punchy transient limiter + hard brickwall ceiling).',
    icon: Zap,
    color: '#a855f7',
    drive: 8.0,
    ceiling: -0.1,
    stereoWidth: 1.6,
    warmth: 0.45,
    eq: { low: 3.0, mid: 0.0, high: 4.0 },
  },
];

export const MasteringModal: React.FC<MasteringModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateMastering,
  onToggleMono,
  onExportMasteredWav,
}) => {
  const [isProcessingExport, setIsProcessingExport] = useState(false);

  if (!isOpen) return null;

  const currentCfg = project.masteringConfig || {
    preset: 'streaming',
    drive: 3.5,
    ceiling: -0.8,
    stereoWidth: 1.2,
    warmth: 0.35,
    targetLufs: -14,
    isMono: project.isMono,
  };

  const handleSelectPreset = (preset: MasteringPresetItem) => {
    const updated: MasteringConfig = {
      preset: preset.id,
      drive: preset.drive,
      ceiling: preset.ceiling,
      stereoWidth: preset.stereoWidth,
      warmth: preset.warmth,
      targetLufs: preset.targetLufs,
      isMono: project.isMono,
    };
    onUpdateMastering(updated);
  };

  const updateParam = (key: keyof MasteringConfig, val: any) => {
    onUpdateMastering({
      ...currentCfg,
      [key]: val,
    });
  };

  const handleDirectMasterAndExport = async () => {
    setIsProcessingExport(true);
    setTimeout(async () => {
      await onExportMasteredWav();
      setIsProcessingExport(false);
      onClose();
    }, 600);
  };

  const activePresetItem = MASTERING_PRESETS.find(p => p.id === currentCfg.preset) || MASTERING_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#0b1220] border-2 border-[#00e5ff]/50 shadow-[0_0_25px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#14233c] to-[#0e192c] border-b border-[#1f3354] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e5ff] text-slate-950 font-black flex items-center justify-center shadow-[0_0_12px_#00e5ff]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  1-CLICK AI & STUDIO MASTERING DECK
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40">
                  Vita eo ny Mastering
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Safidio ny karazana mastering (Streaming, Club Bass, Tape, Acoustic) dia mahazo feon-kira matihanina avy hatrany
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* MONO Check Toggle */}
            <button
              onClick={onToggleMono}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                project.isMono
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)] font-black'
                  : 'bg-[#142033] text-slate-400 border-[#233554] hover:text-white'
              }`}
              title="Toggle Mono summing for phase check"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{project.isMono ? 'MONO MODE (ON)' : 'STEREO MODE'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1a273e] hover:bg-[#223554] border border-[#2a3f62] flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[600px]">
          {/* Preset Selector Grid */}
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
              1. Safidio ny Karazana Mastering (Mastering Type):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {MASTERING_PRESETS.map((preset) => {
                const isSelected = currentCfg.preset === preset.id;
                const Icon = preset.icon;

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#182a47] border-[#00e5ff] shadow-[0_0_14px_rgba(0,229,255,0.3)]'
                        : 'bg-[#0f1728] hover:bg-[#142035] border-[#1d2d47]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: `${preset.color}20`,
                            borderColor: preset.color,
                            color: preset.color,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {preset.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#00e5ff]">
                            Target: {preset.targetLufs} LUFS
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#00e5ff] text-slate-950 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Mastering DSP Controls */}
          <div className="p-4 rounded-xl bg-[#090f1c] border border-[#1b2b46] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#16243a]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Fandrindrana Tsara (Fine-Tuning DSP Controls)
                </span>
                <span className="text-[10px] font-mono text-[#00e5ff]">
                  [{activePresetItem.name}]
                </span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Audio DSP Chain Active</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-items-center py-2">
              <Knob
                value={currentCfg.drive}
                min={0}
                max={10}
                label="Master Drive"
                unit="dB"
                color="#00e5ff"
                onChange={(val) => updateParam('drive', val)}
              />

              <Knob
                value={currentCfg.ceiling}
                min={-2.0}
                max={-0.1}
                label="True Ceiling"
                unit="dB"
                color="#00e5ff"
                onChange={(val) => updateParam('ceiling', val)}
              />

              <Knob
                value={currentCfg.stereoWidth}
                min={0}
                max={2.0}
                label="Stereo Imager"
                unit="x"
                color="#a855f7"
                onChange={(val) => updateParam('stereoWidth', val)}
              />

              <Knob
                value={currentCfg.warmth}
                min={0}
                max={1.0}
                label="Tape Warmth"
                unit="%"
                color="#f97316"
                onChange={(val) => updateParam('warmth', val)}
              />
            </div>

            {/* Target Loudness Bar Indicator */}
            <div className="p-2.5 rounded-lg bg-[#0e172a] border border-[#1a2a44] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <span>Integrated Loudness:</span>
                <span className="text-[#00e5ff] font-bold text-sm">
                  {currentCfg.targetLufs} LUFS
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>True Peak: <strong className="text-white">{currentCfg.ceiling} dBFS</strong></span>
                <span>Stereo Mode: <strong className={project.isMono ? 'text-amber-400' : 'text-emerald-400'}>{project.isMono ? 'MONO' : 'WIDE STEREO'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Instant Master & Export */}
        <div className="p-4 bg-[#101a2d] border-t border-[#1c2c47] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#00e5ff]" />
            <span>Miasa mivantana amin'ny session ity mastering ity.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#16233a] hover:bg-[#1d2f4d] text-xs font-bold text-slate-300"
            >
              Ampiharo eo (Apply & Close)
            </button>

            <button
              onClick={handleDirectMasterAndExport}
              disabled={isProcessingExport}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#0084ff] hover:from-[#00c8e0] hover:to-[#0070db] text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(0,229,255,0.6)] flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isProcessingExport ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Eo am-panodinana (Mastering in progress...)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>VITA EO NY MASTERING (Export Mastered WAV)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
