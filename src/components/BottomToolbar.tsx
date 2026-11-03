import React from 'react';
import { 
  Piano, 
  SlidersVertical, 
  SlidersHorizontal, 
  Activity, 
  Rewind, 
  Play, 
  Pause, 
  Square, 
  FastForward, 
  Repeat, 
  Grid3X3, 
  Download,
  Mic,
  Disc,
  Sparkles,
  Radio
} from 'lucide-react';
import { ActiveModal } from '../types/audio';

interface BottomToolbarProps {
  isPlaying: boolean;
  isPaused: boolean;
  isRecording: boolean;
  metronome: boolean;
  loop: boolean;
  quantize: boolean;
  isMono?: boolean;
  activeModal: ActiveModal;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onToggleRecord: () => void;
  onToggleMetronome: () => void;
  onToggleLoop: () => void;
  onToggleQuantize: () => void;
  onToggleMono?: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onExport: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  isPlaying,
  isPaused,
  isRecording,
  metronome,
  loop,
  quantize,
  isMono = false,
  activeModal,
  onPlay,
  onPause,
  onStop,
  onRewind,
  onFastForward,
  onToggleRecord,
  onToggleMetronome,
  onToggleLoop,
  onToggleQuantize,
  onToggleMono,
  onOpenModal,
  onExport,
}) => {
  return (
    <footer className="h-16 px-2 sm:px-4 daw-footer-bg flex items-center justify-between text-slate-300 select-none shrink-0 z-20 border-t border-[#1c2c47]">
      {/* Left tool panel buttons: PIANO ROLL, MIXER, EQ, FX */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* PIANO ROLL */}
        <button
          onClick={() => onOpenModal(activeModal === 'piano_roll' ? null : 'piano_roll')}
          className={`h-11 px-2.5 sm:px-3 flex flex-col items-center justify-center rounded-lg border transition-all ${
            activeModal === 'piano_roll'
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-slate-300 hover:text-white'
          }`}
          title="Open Piano Roll & Step Sequencer"
        >
          <Piano className="w-4 h-4" />
          <span className="text-[9px] font-bold tracking-wider mt-0.5 whitespace-nowrap">PIANO ROLL</span>
        </button>

        {/* MIXER */}
        <button
          onClick={() => onOpenModal(activeModal === 'mixer' ? null : 'mixer')}
          className={`h-11 px-2.5 sm:px-3 flex flex-col items-center justify-center rounded-lg border transition-all ${
            activeModal === 'mixer'
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-slate-300 hover:text-white'
          }`}
          title="Open Studio Mixer Console"
        >
          <SlidersVertical className="w-4 h-4" />
          <span className="text-[9px] font-bold tracking-wider mt-0.5 whitespace-nowrap">MIXER</span>
        </button>

        {/* EQ */}
        <button
          onClick={() => onOpenModal(activeModal === 'eq' ? null : 'eq')}
          className={`h-11 px-2.5 sm:px-3 flex flex-col items-center justify-center rounded-lg border transition-all ${
            activeModal === 'eq'
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-slate-300 hover:text-white'
          }`}
          title="Open 5-Band Parametric Graphic EQ"
        >
          <Activity className="w-4 h-4" />
          <span className="text-[9px] font-bold tracking-wider mt-0.5 whitespace-nowrap">EQ</span>
        </button>

        {/* FX RACK */}
        <button
          onClick={() => onOpenModal(activeModal === 'fx' ? null : 'fx')}
          className={`h-11 px-2.5 sm:px-3 flex flex-col items-center justify-center rounded-lg border transition-all ${
            activeModal === 'fx'
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-slate-300 hover:text-white'
          }`}
          title="Open Audio Effects Rack (Reverb, Delay, Distortion, Chorus, Bitcrusher, Compressor...)"
        >
          {/* Radial dial icon matching screenshot */}
          <div className="relative w-4 h-4 flex items-center justify-center">
            <Disc className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <span className="text-[9px] font-bold tracking-wider mt-0.5 whitespace-nowrap">FX</span>
        </button>

        {/* MASTERING (1-Click AI & Studio Mastering Deck) */}
        <button
          onClick={() => onOpenModal(activeModal === 'mastering' ? null : 'mastering')}
          className={`h-11 px-2.5 sm:px-3 flex flex-col items-center justify-center rounded-lg border transition-all ${
            activeModal === 'mastering'
              ? 'bg-gradient-to-b from-[#00e5ff]/25 to-[#0084ff]/25 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.5)]'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-slate-300 hover:text-white'
          }`}
          title="Open 1-Click AI & Studio Mastering Deck (Vita eo ny Mastering)"
        >
          <Sparkles className="w-4 h-4 text-[#00e5ff]" />
          <span className="text-[9px] font-bold tracking-wider mt-0.5 whitespace-nowrap">MASTERING</span>
        </button>
      </div>

      {/* Center Transport Controls: REW, REC, PLAY, PAUSE, STOP, FWD */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* REW */}
        <button
          onClick={onRewind}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 text-slate-300 hover:text-white transition-all"
          title="Rewind to start"
          aria-label="Rewind"
        >
          <Rewind className="w-4 h-4" />
        </button>

        {/* REC */}
        <button
          onClick={onToggleRecord}
          className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition-all ${
            isRecording
              ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-red-500 hover:text-red-400 active:scale-95'
          }`}
          title="Record audio / microphone"
          aria-label="Record"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
        </button>

        {/* PLAY (Glowing prominent cyan circle) */}
        <button
          onClick={onPlay}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border transition-all active:scale-95 ${
            isPlaying
              ? 'bg-[#00e5ff] border-[#00e5ff] text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.8)]'
              : 'bg-[#101b2c] hover:bg-[#14233a] border-[#00e5ff] text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.3)]'
          }`}
          title="Play Session"
          aria-label="Play"
        >
          <Play className="w-5 h-5 ml-0.5 fill-current" />
        </button>

        {/* PAUSE */}
        <button
          onClick={onPause}
          className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition-all ${
            isPaused
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-slate-300 hover:text-white active:scale-95'
          }`}
          title="Pause"
          aria-label="Pause"
        >
          <Pause className="w-4 h-4" />
        </button>

        {/* STOP */}
        <button
          onClick={onStop}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 text-slate-300 hover:text-white transition-all"
          title="Stop and return to start"
          aria-label="Stop"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* FWD */}
        <button
          onClick={onFastForward}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#142033] hover:bg-[#1a2c47] border border-[#233554] active:scale-95 text-slate-300 hover:text-white transition-all"
          title="Fast forward"
          aria-label="Fast forward"
        >
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Right toggles: METRONOME, QUANTIZE, LOOP, EXPORT */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* METRONOME */}
        <button
          onClick={onToggleMetronome}
          className={`h-11 px-2.5 sm:px-3 flex flex-col items-center justify-center rounded-lg border transition-all ${
            metronome
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.3)]'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-slate-400 hover:text-slate-200'
          }`}
          title="Metronome click"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L4 21h16L12 2zm0 4.5l5.2 12.5H6.8L12 6.5zM11 9h2v6h-2z" />
          </svg>
          <span className="text-[8px] font-bold tracking-wider mt-0.5 whitespace-nowrap">METRONOME</span>
        </button>

        {/* QUANTIZE */}
        <button
          onClick={onToggleQuantize}
          className={`h-11 px-2.5 sm:px-3 flex flex-col items-center justify-center rounded-lg border transition-all ${
            quantize
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-slate-400 hover:text-slate-200'
          }`}
          title="Auto-Quantize Notes"
        >
          <Grid3X3 className="w-4 h-4" />
          <span className="text-[8px] font-bold tracking-wider mt-0.5 whitespace-nowrap">QUANTIZE</span>
        </button>

        {/* LOOP */}
        <button
          onClick={onToggleLoop}
          className={`h-11 px-2.5 sm:px-3 flex flex-col items-center justify-center rounded-lg border transition-all ${
            loop
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.3)]'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Loop Playback"
        >
          <Repeat className="w-4 h-4" />
          <span className="text-[8px] font-bold tracking-wider mt-0.5 whitespace-nowrap">LOOP</span>
        </button>

        {/* MONO MODE CHECK */}
        <button
          onClick={onToggleMono}
          className={`h-11 px-2 sm:px-2.5 flex flex-col items-center justify-center rounded-lg border transition-all ${
            isMono
              ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)] font-bold'
              : 'bg-[#142033] hover:bg-[#1a2c47] border-[#233554] text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Mono Mode (Check mix phase cancellation & mono speaker compatibility)"
        >
          <Radio className="w-4 h-4" />
          <span className="text-[8px] font-bold tracking-wider mt-0.5 whitespace-nowrap">{isMono ? 'MONO ON' : 'MONO'}</span>
        </button>

        {/* EXPORT */}
        <button
          onClick={onExport}
          className="h-11 px-2.5 sm:px-3 flex flex-col items-center justify-center rounded-lg bg-[#00e5ff]/10 hover:bg-[#00e5ff]/25 border border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.2)] active:scale-95 transition-all"
          title="Export Song to WAV / Project JSON"
        >
          <Download className="w-4 h-4" />
          <span className="text-[8px] font-bold tracking-wider mt-0.5 whitespace-nowrap">EXPORT</span>
        </button>
      </div>
    </footer>
  );
};
