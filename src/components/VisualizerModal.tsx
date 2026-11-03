import React, { useEffect, useRef } from 'react';
import { X, Activity, Radio } from 'lucide-react';
import { DawAudioEngine } from '../audio/audioEngine';

interface VisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioEngine: DawAudioEngine;
}

export const VisualizerModal: React.FC<VisualizerModalProps> = ({
  isOpen,
  onClose,
  audioEngine,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.masterAnalyser;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = '#070c17';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Spectrum Bars in background
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (freqData[i] / 255) * height * 0.75;
        const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
        grad.addColorStop(0, '#00e5ff11');
        grad.addColorStop(0.7, '#00e5ff66');
        grad.addColorStop(1, '#00e5ffcc');

        ctx.fillStyle = grad;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      // 2. Draw Oscilloscope Waveform on top
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#00e5ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00e5ff';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let waveX = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(waveX, y);
        } else {
          ctx.lineTo(waveX, y);
        }
        waveX += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isOpen, audioEngine]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-[#0d1424] border border-[#1e2f4c] shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-[#142033] border-b border-[#1c2c47] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/20 border border-[#00e5ff] flex items-center justify-center text-[#00e5ff]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Real-Time Master Audio Spectrum
              </h2>
              <p className="text-[11px] text-slate-400">
                Oscilloscope & FFT Spectrum Analyzer (Fijerena ny onjam-peo mivantana)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a273e] hover:bg-[#223554] border border-[#2a3f62] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={600}
            height={260}
            className="w-full h-64 rounded-xl border border-[#1c2c47] bg-[#070c17] shadow-inner"
          />
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
            <span>20 Hz (Sub Bass)</span>
            <span>250 Hz (Low Mid)</span>
            <span>1 kHz (Mids)</span>
            <span>4 kHz (Presence)</span>
            <span>20 kHz (Air)</span>
          </div>
        </div>

        <div className="p-4 bg-[#111c2e] border-t border-[#1c2c47] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00e5ff] hover:bg-[#00c8e0] text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
