import React, { useRef } from 'react';
import { Track, Clip, ActiveModal } from '../types/audio';

interface TimelineGridProps {
  tracks: Track[];
  currentBar: number;
  totalBars: number;
  barWidth: number;
  selectedTrackId: string | null;
  selectedClipId: string | null;
  onSelectTrack: (trackId: string) => void;
  onSelectClip: (clipId: string) => void;
  onOpenClipEditor: (clip: Clip, track: Track) => void;
  onAddClipToTrack: (trackId: string, bar: number) => void;
  onMoveClip: (clipId: string, newStartBar: number) => void;
}

export const TimelineGrid: React.FC<TimelineGridProps> = ({
  tracks,
  currentBar,
  totalBars,
  barWidth,
  selectedTrackId,
  selectedClipId,
  onSelectTrack,
  onSelectClip,
  onOpenClipEditor,
  onAddClipToTrack,
}) => {
  const gridWidth = totalBars * barWidth;
  const playheadPixelX = (currentBar - 1) * barWidth;

  const handleTrackLaneClick = (trackId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickedBar = Math.max(1, Math.floor(clickX / barWidth) + 1);
    onSelectTrack(trackId);
    onAddClipToTrack(trackId, clickedBar);
  };

  return (
    <div
      className="relative min-h-full bg-[#0a1120] select-none"
      style={{ width: gridWidth }}
    >
      {/* Background Vertical Grid Lines */}
      <div className="absolute inset-0 flex pointer-events-none">
        {Array.from({ length: totalBars }).map((_, i) => (
          <div
            key={i}
            className="h-full border-r border-[#15233b] flex"
            style={{ width: barWidth }}
          >
            {/* 4 beat sub-divisions */}
            <div className="flex-1 border-r border-[#101b2f]/60" />
            <div className="flex-1 border-r border-[#121f36]/70" />
            <div className="flex-1 border-r border-[#101b2f]/60" />
            <div className="flex-1" />
          </div>
        ))}
      </div>

      {/* Track Lanes */}
      {tracks.map((track) => (
        <div
          key={track.id}
          onClick={(e) => handleTrackLaneClick(track.id, e)}
          className={`relative h-[74px] border-b border-[#16253d] transition-colors cursor-pointer ${
            selectedTrackId === track.id ? 'bg-[#00e5ff]/[0.03]' : 'hover:bg-white/[0.01]'
          }`}
        >
          {/* Clips inside this track */}
          {track.clips.map((clip) => {
            const clipLeft = (clip.startBar - 1) * barWidth;
            const clipWidth = clip.durationBars * barWidth - 3;
            const isSelected = selectedClipId === clip.id;

            return (
              <div
                key={clip.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectClip(clip.id);
                  onSelectTrack(track.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onOpenClipEditor(clip, track);
                }}
                className={`absolute top-1 bottom-1 rounded-md px-2 py-1 flex flex-col justify-between overflow-hidden shadow-md cursor-grab active:cursor-grabbing transition-all ${
                  isSelected
                    ? 'ring-2 ring-white z-10 brightness-110 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                    : 'opacity-90 hover:opacity-100'
                }`}
                style={{
                  left: clipLeft,
                  width: Math.max(30, clipWidth),
                  backgroundColor: `${track.color}22`,
                  border: `1.5px solid ${track.color}`,
                }}
                title={`${clip.name} (Double-click to edit notes/pattern)`}
              >
                {/* Clip Header Label */}
                <div className="flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] font-bold text-white tracking-wide truncate drop-shadow">
                    {clip.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-300 opacity-70">
                    {clip.durationBars}B
                  </span>
                </div>

                {/* Inner Preview Content: Notes, Drums, or Waveform */}
                <div className="flex-1 my-0.5 flex items-center relative overflow-hidden pointer-events-none">
                  {/* Drum pattern preview */}
                  {clip.type === 'drum' && clip.drumPattern && (
                    <div className="w-full h-full flex flex-col justify-center gap-0.5">
                      {['kick', 'snare', 'hihat', 'clap'].map((part) => {
                        const steps = (clip.drumPattern as any)[part] || [];
                        return (
                          <div key={part} className="flex gap-[2px] h-1.5 w-full">
                            {steps.slice(0, 16).map((active: boolean, sIdx: number) => (
                              <div
                                key={sIdx}
                                className="flex-1 rounded-[1px]"
                                style={{
                                  backgroundColor: active ? track.color : 'rgba(255,255,255,0.08)',
                                }}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Melodic notes preview */}
                  {clip.type === 'pattern' && clip.notes && (
                    <div className="w-full h-full relative">
                      {clip.notes.map((n, i) => {
                        const notePercent = ((n.note - 50) / 40) * 100;
                        const stepPercent = (n.step / (clip.durationBars * 16)) * 100;
                        const widthPercent = ((n.durationSteps || 2) / (clip.durationBars * 16)) * 100;

                        return (
                          <div
                            key={i}
                            className="absolute h-1.5 rounded-sm"
                            style={{
                              bottom: `${Math.max(5, Math.min(85, notePercent))}%`,
                              left: `${stepPercent}%`,
                              width: `${Math.max(2, widthPercent)}%`,
                              backgroundColor: track.color,
                              boxShadow: `0 0 2px ${track.color}`,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Audio Waveform preview */}
                  {clip.type === 'audio' && (
                    <div className="w-full h-full flex items-center gap-[2px]">
                      {(clip.waveformPoints || [0.3, 0.7, 0.4, 0.8, 0.9, 0.5, 0.2, 0.6]).map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex-1 rounded-full transition-all"
                          style={{
                            height: `${Math.max(15, pt * 100)}%`,
                            backgroundColor: track.color,
                            opacity: 0.8,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Clip Footer hint */}
                <div className="text-[8px] font-medium text-slate-400 truncate pointer-events-none opacity-60">
                  Tap to edit
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Continuous Glowing Playhead Line */}
      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{ left: playheadPixelX }}
      >
        <div className="w-[1.5px] h-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
      </div>
    </div>
  );
};
