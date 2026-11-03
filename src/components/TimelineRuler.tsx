import React, { useRef } from 'react';

interface TimelineRulerProps {
  totalBars: number;
  currentBar: number;
  barWidth: number; // pixels per bar (e.g. 80px)
  loopStartBar: number;
  loopEndBar: number;
  loopEnabled: boolean;
  onSeek: (bar: number) => void;
  onSetLoopRange?: (start: number, end: number) => void;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  totalBars,
  currentBar,
  barWidth,
  loopStartBar,
  loopEndBar,
  loopEnabled,
  onSeek,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickedBar = Math.max(1, 1 + clickX / barWidth);
    onSeek(clickedBar);
  };

  const playheadPixelX = (currentBar - 1) * barWidth;
  const loopStartPixelX = (loopStartBar - 1) * barWidth;
  const loopWidthPixels = (loopEndBar - loopStartBar) * barWidth;

  return (
    <div
      ref={rulerRef}
      onPointerDown={handlePointerDown}
      className="relative h-9 bg-[#101828] border-b border-[#1c2c47] select-none cursor-pointer overflow-hidden shrink-0"
      style={{ width: totalBars * barWidth }}
    >
      {/* Loop Region Highlight */}
      {loopEnabled && (
        <div
          className="absolute top-0 bottom-0 bg-[#00e5ff]/10 border-x border-[#00e5ff]/40 pointer-events-none"
          style={{
            left: loopStartPixelX,
            width: loopWidthPixels,
          }}
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00e5ff]" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00e5ff]" />
        </div>
      )}

      {/* Bar markers and ticks */}
      {Array.from({ length: totalBars }).map((_, barIdx) => {
        const barNumber = barIdx + 1;
        const left = barIdx * barWidth;

        return (
          <div
            key={barNumber}
            className="absolute top-0 bottom-0 flex flex-col justify-between"
            style={{ left, width: barWidth }}
          >
            {/* Bar number */}
            <div className="text-[11px] font-lcd font-bold text-slate-400 pl-1.5 pt-1">
              {barNumber}
            </div>

            {/* Sub-beat tick marks */}
            <div className="flex justify-between items-end h-3 px-0.5 pb-0.5">
              <div className="w-[1px] h-3 bg-[#385175]" />
              <div className="w-[1px] h-1.5 bg-[#20314a]" />
              <div className="w-[1px] h-2 bg-[#2a4060]" />
              <div className="w-[1px] h-1.5 bg-[#20314a]" />
            </div>
          </div>
        );
      })}

      {/* Playhead Triangular Marker */}
      <div
        className="absolute top-0 z-30 transition-none pointer-events-none"
        style={{ left: playheadPixelX, transform: 'translateX(-50%)' }}
      >
        <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-[#00e5ff] drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
      </div>
    </div>
  );
};
