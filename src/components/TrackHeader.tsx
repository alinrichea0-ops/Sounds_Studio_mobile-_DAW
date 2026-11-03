import React, { useState } from 'react';
import { 
  Mic, 
  Drum, 
  Piano, 
  Guitar, 
  AudioWaveform, 
  Sliders, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Sparkles, 
  Edit2,
  Radio
} from 'lucide-react';
import { Track } from '../types/audio';
import { Knob } from './Knob';

interface TrackHeaderProps {
  track: Track;
  peakLevel: number; // 0..1
  isSelected: boolean;
  onSelectTrack: (trackId: string) => void;
  onToggleMute: (trackId: string) => void;
  onToggleSolo: (trackId: string) => void;
  onToggleArmed: (trackId: string) => void;
  onChangeVolume: (trackId: string, vol: number) => void;
  onChangePan: (trackId: string, pan: number) => void;
  onDeleteTrack: (trackId: string) => void;
  onDuplicateTrack: (trackId: string) => void;
  onOpenTrackFx: (trackId: string) => void;
  onRenameTrack: (trackId: string, newName: string) => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  peakLevel,
  isSelected,
  onSelectTrack,
  onToggleMute,
  onToggleSolo,
  onToggleArmed,
  onChangeVolume,
  onChangePan,
  onDeleteTrack,
  onDuplicateTrack,
  onOpenTrackFx,
  onRenameTrack,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(track.name);

  // Pick suitable icon based on track type
  const renderIcon = () => {
    const iconClass = "w-6 h-6";
    switch (track.type) {
      case 'vocal':
        return <Mic className={iconClass} style={{ color: track.color }} />;
      case 'beat':
        return <Drum className={iconClass} style={{ color: track.color }} />;
      case 'keyboard':
        return <Piano className={iconClass} style={{ color: track.color }} />;
      case 'guitar':
        return <Guitar className={iconClass} style={{ color: track.color }} />;
      case 'audio':
        return <AudioWaveform className={iconClass} style={{ color: track.color }} />;
      default:
        return <Sliders className={iconClass} style={{ color: track.color }} />;
    }
  };

  // Convert peak level (0..1) to 8 LED segments
  const ledSegments = 8;
  const activeSegments = Math.round(peakLevel * ledSegments);

  return (
    <div
      onClick={() => onSelectTrack(track.id)}
      className={`relative h-[74px] flex items-center px-2 daw-track-header border-b border-[#18263e] select-none transition-all group ${
        isSelected ? 'bg-[#182944] ring-1 ring-[#00e5ff]/50' : 'hover:bg-[#142238]'
      }`}
    >
      {/* Left colored glowing vertical stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all"
        style={{
          backgroundColor: track.color,
          boxShadow: isSelected ? `0 0 10px ${track.color}` : 'none',
        }}
      />

      {/* Track icon */}
      <div 
        className="w-10 h-10 ml-1 rounded-lg bg-[#0b1220] border border-[#1e2f4c] flex items-center justify-center shrink-0 shadow-inner"
        style={{ borderColor: isSelected ? `${track.color}66` : '#1e2f4c' }}
      >
        {renderIcon()}
      </div>

      {/* Name and M/S buttons */}
      <div className="flex flex-col justify-center ml-2 min-w-0 flex-1">
        {isEditingName ? (
          <input
            type="text"
            value={tempName}
            autoFocus
            onChange={(e) => setTempName(e.target.value)}
            onBlur={() => {
              setIsEditingName(false);
              if (tempName.trim()) onRenameTrack(track.id, tempName.trim());
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingName(false);
                if (tempName.trim()) onRenameTrack(track.id, tempName.trim());
              }
            }}
            className="w-24 text-xs font-bold bg-[#0a1120] text-white px-1 py-0.5 rounded border border-[#00e5ff]"
          />
        ) : (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span
              onDoubleClick={() => setIsEditingName(true)}
              className="text-xs font-extrabold tracking-wider text-slate-200 truncate cursor-text hover:text-white"
              title="Double-click to rename"
            >
              {track.name}
            </span>
            {track.effects?.autotune?.enabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenTrackFx(track.id);
                }}
                className="px-1 py-0.2 rounded text-[8px] font-black bg-[#00e5ff] text-slate-950 shadow-[0_0_6px_rgba(0,229,255,0.7)] shrink-0"
                title="Auto-Tune Active (Click to edit pitch correction)"
              >
                AT
              </button>
            )}
          </div>
        )}

        {/* Mute and Solo buttons */}
        <div className="flex items-center gap-1.5 mt-1">
          {/* MUTE [ M ] */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute(track.id);
            }}
            className={`w-6 h-5 rounded text-[10px] font-bold border transition-all ${
              track.mute
                ? 'bg-red-500/80 border-red-400 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : 'bg-[#152033] border-[#253959] text-slate-400 hover:text-slate-200 hover:bg-[#1a2c47]'
            }`}
            title="Mute track"
          >
            M
          </button>

          {/* SOLO [ S ] */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSolo(track.id);
            }}
            className={`w-6 h-5 rounded text-[10px] font-bold border transition-all ${
              track.solo
                ? 'bg-[#00e5ff] border-[#00e5ff] text-slate-950 font-black shadow-[0_0_8px_rgba(0,229,255,0.6)]'
                : 'bg-[#152033] border-[#253959] text-slate-400 hover:text-slate-200 hover:bg-[#1a2c47]'
            }`}
            title="Solo track"
          >
            S
          </button>

          {/* Arm record button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleArmed(track.id);
            }}
            className={`w-5 h-5 rounded text-[9px] font-bold border flex items-center justify-center transition-all ${
              track.armed
                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse'
                : 'bg-[#152033] border-[#253959] text-slate-500 hover:text-red-400'
            }`}
            title="Arm track for recording"
          >
            <span className="w-2 h-2 rounded-full bg-current" />
          </button>
        </div>
      </div>

      {/* Volume Knob */}
      <div 
        className="mx-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Knob
          value={track.volume}
          min={0}
          max={1.5}
          size={34}
          color={track.color}
          onChange={(newVol) => onChangeVolume(track.id, newVol)}
        />
      </div>

      {/* Stereo Dual-LED VU Peak Meter */}
      <div className="flex gap-0.5 h-10 px-1 py-0.5 bg-[#090f1b] border border-[#192742] rounded shrink-0 items-end">
        {/* Left channel */}
        <div className="flex flex-col-reverse gap-[2px] w-1.5 h-full">
          {Array.from({ length: ledSegments }).map((_, i) => {
            const isActive = i < activeSegments;
            let ledColor = '#10b981'; // Green bottom
            if (i >= 5 && i < 7) ledColor = '#f59e0b'; // Yellow middle
            if (i >= 7) ledColor = '#ef4444'; // Red top clipping

            return (
              <div
                key={i}
                className="w-full h-1 rounded-[1px] transition-opacity duration-75"
                style={{
                  backgroundColor: ledColor,
                  opacity: isActive ? 1 : 0.15,
                  boxShadow: isActive ? `0 0 3px ${ledColor}` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Right channel */}
        <div className="flex flex-col-reverse gap-[2px] w-1.5 h-full">
          {Array.from({ length: ledSegments }).map((_, i) => {
            const isActive = i < Math.max(0, activeSegments - (i % 2 === 0 ? 0 : 1));
            let ledColor = '#10b981';
            if (i >= 5 && i < 7) ledColor = '#f59e0b';
            if (i >= 7) ledColor = '#ef4444';

            return (
              <div
                key={i}
                className="w-full h-1 rounded-[1px] transition-opacity duration-75"
                style={{
                  backgroundColor: ledColor,
                  opacity: isActive ? 1 : 0.15,
                  boxShadow: isActive ? `0 0 3px ${ledColor}` : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 3-dots Menu Button */}
      <div className="relative ml-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="w-6 h-9 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-[#1c2c47] transition-colors"
          title="Track settings"
          aria-label="Track settings"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {showMenu && (
          <div
            className="absolute right-0 top-8 w-44 p-1.5 rounded-xl bg-[#111c2e] border border-[#233857] shadow-2xl z-50 flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowMenu(false);
                onOpenTrackFx(track.id);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:text-[#00e5ff] hover:bg-[#1a2c47] rounded-lg text-left"
            >
              <div className="w-4 h-4 rounded bg-[#00e5ff] text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0 shadow-[0_0_5px_#00e5ff]">
                AT
              </div>
              <span className="font-bold text-[#00e5ff]">Auto-Tune & Pitch</span>
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                onOpenTrackFx(track.id);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:text-[#00e5ff] hover:bg-[#1a2c47] rounded-lg text-left"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>Track FX & EQ</span>
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                setIsEditingName(true);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-[#1a2c47] rounded-lg text-left"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Rename Track</span>
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                onDuplicateTrack(track.id);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-[#1a2c47] rounded-lg text-left"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate Track</span>
            </button>

            <div className="h-px bg-[#1e2f4d] my-0.5" />

            <button
              onClick={() => {
                setShowMenu(false);
                onDeleteTrack(track.id);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 rounded-lg text-left"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Track</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
