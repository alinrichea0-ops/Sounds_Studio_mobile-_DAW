import React from 'react';
import { X, SlidersVertical, Sparkles, Volume2 } from 'lucide-react';
import { Track, EffectConfig } from '../types/audio';
import { Knob } from './Knob';

interface MixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  trackPeaks: Map<string, number>;
  masterPeak: number;
  masterVolume: number;
  onChangeMasterVolume: (vol: number) => void;
  onChangeTrackVolume: (trackId: string, vol: number) => void;
  onChangeTrackPan: (trackId: string, pan: number) => void;
  onToggleMute: (trackId: string) => void;
  onToggleSolo: (trackId: string) => void;
  onOpenTrackFx: (trackId: string) => void;
}

export const MixerModal: React.FC<MixerModalProps> = ({
  isOpen,
  onClose,
  tracks,
  trackPeaks,
  masterPeak,
  masterVolume,
  onChangeMasterVolume,
  onChangeTrackVolume,
  onChangeTrackPan,
  onToggleMute,
  onToggleSolo,
  onOpenTrackFx,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-5xl max-h-[92vh] rounded-2xl bg-[#0c1322] border border-[#1e2f4c] shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#142033] border-b border-[#1c2c47] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/20 border border-[#00e5ff] flex items-center justify-center text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.4)]">
              <SlidersVertical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Studio Mixing Console (Basy Fangarohana)
              </h2>
              <p className="text-[11px] text-slate-400">
                Lafan-peo tsirairay, fampifandanjana (Panning), ary feo fototra (Master Bus)
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

        {/* Mixer Channel Strips Rack */}
        <div className="p-4 flex-1 flex gap-2.5 overflow-x-auto min-h-[460px] bg-[#090e1a]">
          {/* Track Channels */}
          {tracks.map((track, idx) => {
            const peak = trackPeaks.get(track.id) || 0;
            const segments = 16;
            const activeSegments = Math.round(peak * segments);

            return (
              <div
                key={track.id}
                className="w-28 shrink-0 rounded-xl bg-[#111a2d] border border-[#1b2b46] flex flex-col justify-between p-2 shadow-lg relative group hover:border-[#284068]"
              >
                {/* Top: Track Number & Color */}
                <div className="flex flex-col items-center gap-1 pb-2 border-b border-[#182740]">
                  <div
                    className="w-full h-1.5 rounded-full"
                    style={{ backgroundColor: track.color }}
                  />
                  <div className="text-[11px] font-extrabold text-white truncate max-w-full tracking-wide">
                    {track.name}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    CH {idx + 1}
                  </span>
                </div>

                {/* FX Button & Pan Knob */}
                <div className="flex flex-col items-center gap-1.5 my-2">
                  <button
                    onClick={() => onOpenTrackFx(track.id)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#17253d] hover:bg-[#203352] text-[#00e5ff] border border-[#233857] flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>FX</span>
                  </button>

                  <Knob
                    value={track.pan}
                    min={-1}
                    max={1}
                    size={30}
                    label="Pan"
                    color={track.color}
                    onChange={(val) => onChangeTrackPan(track.id, val)}
                  />
                </div>

                {/* Vertical Fader & VU Meter */}
                <div className="flex-1 flex justify-center items-center gap-2 px-1">
                  {/* Fader slider */}
                  <div className="relative h-44 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.01"
                      value={track.volume}
                      onChange={(e) => onChangeTrackVolume(track.id, Number(e.target.value))}
                      className="w-40 h-2 bg-[#090f1c] rounded-lg appearance-none cursor-pointer accent-[#00e5ff] -rotate-90 origin-center"
                    />
                  </div>

                  {/* High Resolution LED Meter */}
                  <div className="h-40 w-3 bg-[#080d17] border border-[#18273f] rounded flex flex-col-reverse p-0.5 gap-[2px]">
                    {Array.from({ length: segments }).map((_, i) => {
                      const isActive = i < activeSegments;
                      let color = '#10b981';
                      if (i >= 11 && i < 14) color = '#f59e0b';
                      if (i >= 14) color = '#ef4444';

                      return (
                        <div
                          key={i}
                          className="w-full flex-1 rounded-[1px] transition-opacity duration-75"
                          style={{
                            backgroundColor: color,
                            opacity: isActive ? 1 : 0.12,
                            boxShadow: isActive ? `0 0 3px ${color}` : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Volume Readout */}
                <div className="text-center font-lcd text-[11px] font-bold text-[#00e5ff] my-1">
                  {Math.round(track.volume * 100)}%
                </div>

                {/* Mute and Solo Buttons */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-[#182740]">
                  <button
                    onClick={() => onToggleMute(track.id)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${
                      track.mute
                        ? 'bg-red-500 text-white border-red-400'
                        : 'bg-[#152238] text-slate-400 border-[#233554] hover:text-white'
                    }`}
                  >
                    M
                  </button>

                  <button
                    onClick={() => onToggleSolo(track.id)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${
                      track.solo
                        ? 'bg-[#00e5ff] text-slate-950 font-black border-[#00e5ff]'
                        : 'bg-[#152238] text-slate-400 border-[#233554] hover:text-white'
                    }`}
                  >
                    S
                  </button>
                </div>
              </div>
            );
          })}

          {/* Master Bus Channel Strip */}
          <div className="w-36 shrink-0 rounded-xl bg-[#142036] border-2 border-[#00e5ff]/50 flex flex-col justify-between p-2 shadow-2xl relative">
            <div className="flex flex-col items-center gap-1 pb-2 border-b border-[#1f3354]">
              <div className="w-full h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
              <div className="text-xs font-black text-[#00e5ff] tracking-widest">
                MASTER
              </div>
              <span className="text-[9px] font-mono text-slate-300">
                MAIN OUTPUT
              </span>
            </div>

            {/* Spacer */}
            <div className="h-8 flex items-center justify-center">
              <span className="text-[10px] font-mono text-slate-400">0.0 dB RMS</span>
            </div>

            {/* Master Fader & Meter */}
            <div className="flex-1 flex justify-center items-center gap-3 px-1">
              <div className="relative h-44 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => onChangeMasterVolume(Number(e.target.value))}
                  className="w-40 h-2.5 bg-[#090f1c] rounded-lg appearance-none cursor-pointer accent-[#00e5ff] -rotate-90 origin-center"
                />
              </div>

              {/* Master Stereo Peak LED */}
              <div className="h-40 w-4 bg-[#080d17] border border-[#00e5ff]/30 rounded flex flex-col-reverse p-0.5 gap-[2px]">
                {Array.from({ length: 16 }).map((_, i) => {
                  const isActive = i < Math.round(masterPeak * 16);
                  let color = '#10b981';
                  if (i >= 11 && i < 14) color = '#f59e0b';
                  if (i >= 14) color = '#ef4444';

                  return (
                    <div
                      key={i}
                      className="w-full flex-1 rounded-[1px] transition-opacity duration-75"
                      style={{
                        backgroundColor: color,
                        opacity: isActive ? 1 : 0.12,
                        boxShadow: isActive ? `0 0 4px ${color}` : 'none',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Master volume readout */}
            <div className="text-center font-lcd text-xs font-bold text-[#00e5ff] my-1">
              {Math.round(masterVolume * 100)}%
            </div>

            <div className="py-1 text-center bg-[#090f1b] rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
              CLIP PROTECT ON
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#111c2e] border-t border-[#1c2c47] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Channels: {tracks.length} | Master Gain: {Math.round(masterVolume * 100)}%
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00e5ff] hover:bg-[#00c8e0] text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
