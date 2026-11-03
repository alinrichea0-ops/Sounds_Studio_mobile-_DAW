import React, { useState, useRef, useEffect } from 'react';

interface KnobProps {
  value: number; // Current value
  min?: number;
  max?: number;
  step?: number;
  size?: number;
  label?: string;
  unit?: string;
  color?: string;
  onChange: (value: number) => void;
}

export const Knob: React.FC<KnobProps> = ({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  size = 36,
  label,
  unit = '',
  color = '#00e5ff',
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number>(0);
  const startValRef = useRef<number>(value);

  // Map value to angle (-135deg to +135deg)
  const clampedVal = Math.max(min, Math.min(max, value));
  const fraction = (clampedVal - min) / (max - min);
  const angle = -135 + fraction * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = clampedVal;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = startYRef.current - e.clientY;
    const range = max - min;
    const sensitivity = 150; // pixels for full range
    const stepVal = range / sensitivity;
    let newVal = startValRef.current + deltaY * stepVal;

    // snap to step
    if (step > 0) {
      newVal = Math.round(newVal / step) * step;
    }
    newVal = Math.max(min, Math.min(max, newVal));
    onChange(Number(newVal.toFixed(2)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none touch-none">
      <div
        className="relative cursor-pointer flex items-center justify-center transition-transform active:scale-95"
        style={{ width: size, height: size }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        title={`${label ? label + ': ' : ''}${clampedVal}${unit}`}
      >
        {/* Outer track ring */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="#16233b"
            strokeWidth="3"
            strokeDasharray="66 100"
            strokeDashoffset="-17"
            strokeLinecap="round"
          />
          {/* Active arc */}
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke={color}
            strokeWidth="3.2"
            strokeDasharray={`${fraction * 66} 100`}
            strokeDashoffset="-17"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_4px_rgba(0,229,255,0.4)] transition-[stroke-dasharray] duration-75"
          />
        </svg>

        {/* Knob metallic Body */}
        <div
          className="rounded-full shadow-inner flex items-center justify-center border border-[#233554]"
          style={{
            width: size - 10,
            height: size - 10,
            background: 'radial-gradient(circle, #1a273e 0%, #0c1424 100%)',
            transform: `rotate(${angle}deg)`,
          }}
        >
          {/* Notch indicator line */}
          <div
            className="w-0.5 h-2.5 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`,
              marginTop: -6,
            }}
          />
        </div>
      </div>

      {label && (
        <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-1 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
};
