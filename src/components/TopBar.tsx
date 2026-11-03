import React, { useState } from 'react';
import { 
  Menu, 
  Folder, 
  Settings, 
  Undo2, 
  Redo2, 
  Activity, 
  ZoomIn, 
  ZoomOut, 
  Grid3X3, 
  ChevronDown,
  Volume2,
  Clock,
  Smartphone
} from 'lucide-react';
import { ActiveModal } from '../types/audio';

interface TopBarProps {
  timeDisplay: string;
  bpm: number;
  metronome: boolean;
  canUndo: boolean;
  canRedo: boolean;
  zoomLevel: number;
  gridSnap: string;
  onToggleMetronome: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCycleGridSnap: () => void;
  onChangeBpm: (newBpm: number) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  timeDisplay,
  bpm,
  metronome,
  canUndo,
  canRedo,
  zoomLevel,
  gridSnap,
  onToggleMetronome,
  onOpenModal,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onCycleGridSnap,
  onChangeBpm,
}) => {
  const [showBpmMenu, setShowBpmMenu] = useState(false);

  return (
    <header className="h-14 px-3 flex items-center justify-between daw-header-bg border-b border-[#1c2c47] text-slate-200 select-none shrink-0 z-20">
      {/* Left controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Menu burger */}
        <button
          onClick={() => onOpenModal('project_menu')}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 transition-all text-slate-300 hover:text-white"
          title="Project Menu"
          aria-label="Open Project Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* PROJECT button */}
        <button
          onClick={() => onOpenModal('project_menu')}
          className="h-9 px-3 flex items-center gap-2 rounded-lg bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 transition-all text-xs font-semibold tracking-wide text-slate-200 hover:text-white"
          title="Open Project Manager"
        >
          <Folder className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>PROJECT</span>
        </button>

        {/* Settings gear */}
        <button
          onClick={() => onOpenModal('project_menu')}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 transition-all text-slate-300 hover:text-white"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* APK / Mobile Install Button */}
        <button
          onClick={() => onOpenModal('install_apk')}
          className="h-9 px-2.5 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00e5ff]/15 to-[#0084ff]/15 hover:from-[#00e5ff]/25 hover:to-[#0084ff]/25 border border-[#00e5ff]/50 active:scale-95 transition-all text-xs font-bold text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.25)]"
          title="Mametraka amin'ny finday (Install APK)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">APK</span>
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`h-9 w-9 flex items-center justify-center rounded-lg border border-[#233554] transition-all ${
              canUndo 
                ? 'bg-[#142033] hover:bg-[#1a2c47] text-slate-200 active:scale-95' 
                : 'bg-[#0f1726] text-slate-600 opacity-50 cursor-not-allowed'
            }`}
            title="Undo"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`h-9 w-9 flex items-center justify-center rounded-lg border border-[#233554] transition-all ${
              canRedo 
                ? 'bg-[#142033] hover:bg-[#1a2c47] text-slate-200 active:scale-95' 
                : 'bg-[#0f1726] text-slate-600 opacity-50 cursor-not-allowed'
            }`}
            title="Redo"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center LCD & View controls */}
      <div className="flex items-center gap-2">
        {/* LCD Digital Timecode display */}
        <div className="h-9 px-4 flex items-center justify-center rounded-lg bg-[#070d19] border border-[#00e5ff]/40 shadow-[0_0_12px_rgba(0,229,255,0.15)]">
          <span className="font-lcd text-sm sm:text-base font-bold text-[#00e5ff] tracking-widest drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]">
            {timeDisplay}
          </span>
        </div>

        {/* Metronome toggle */}
        <button
          onClick={onToggleMetronome}
          className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-all ${
            metronome
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
              : 'bg-[#142033] border-[#233554] text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Metronome"
          aria-label="Toggle Metronome"
        >
          {/* Metronome pendulum SVG */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L4 21h16L12 2zm0 4.5l5.2 12.5H6.8L12 6.5zM11 9h2v6h-2z" />
          </svg>
        </button>

        {/* Waveform / Visualizer toggle */}
        <button
          onClick={() => onOpenModal('visualizer')}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 text-slate-300 hover:text-[#00e5ff] transition-all"
          title="Open Master Audio Spectrum"
          aria-label="Open Spectrum Visualizer"
        >
          <Activity className="w-4 h-4" />
        </button>

        {/* Zoom Out / In */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 text-slate-300 hover:text-white transition-all"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomIn}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 text-slate-300 hover:text-white transition-all"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Snap button */}
        <button
          onClick={onCycleGridSnap}
          className="h-9 px-2.5 flex items-center gap-1.5 rounded-lg bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 text-xs font-medium text-slate-300 hover:text-white transition-all"
          title={`Grid Snap: ${gridSnap}`}
        >
          <Grid3X3 className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span className="hidden sm:inline text-[11px] font-lcd">{gridSnap}</span>
        </button>
      </div>

      {/* Right: TEMPO Control */}
      <div className="relative">
        <button
          onClick={() => setShowBpmMenu(!showBpmMenu)}
          className="h-9 px-3 flex items-center gap-2 rounded-lg bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 text-xs font-semibold tracking-wide text-slate-200 transition-all"
        >
          <span className="text-slate-400">TEMPO :</span>
          <span className="text-[#00e5ff] font-lcd text-sm font-bold">{bpm}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showBpmMenu && (
          <div className="absolute right-0 top-11 w-52 p-3 rounded-xl bg-[#111b2d] border border-[#233857] shadow-2xl z-50 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-300 pb-1 border-b border-[#1c2c47]">
              <span>Tempo (BPM)</span>
              <span className="font-lcd font-bold text-[#00e5ff] text-sm">{bpm}</span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => onChangeBpm(Number(e.target.value))}
              className="w-full accent-[#00e5ff] cursor-pointer"
            />

            {/* Quick buttons */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              {[80, 110, 128, 140, 160, 174].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    onChangeBpm(preset);
                    setShowBpmMenu(false);
                  }}
                  className={`py-1 text-[11px] font-mono rounded font-medium border transition-colors ${
                    bpm === preset
                      ? 'bg-[#00e5ff] text-slate-950 border-[#00e5ff]'
                      : 'bg-[#18263e] border-[#223554] text-slate-300 hover:bg-[#203352]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBpmMenu(false)}
              className="mt-1 w-full py-1 text-center text-xs font-medium text-slate-400 hover:text-white bg-[#142033] rounded"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
