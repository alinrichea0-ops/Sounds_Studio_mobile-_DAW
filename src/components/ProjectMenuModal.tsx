import React, { useRef } from 'react';
import { 
  X, 
  Folder, 
  Save, 
  FilePlus, 
  Upload, 
  Download, 
  Disc, 
  HelpCircle, 
  Check, 
  Play,
  Smartphone
} from 'lucide-react';
import { Project } from '../types/audio';
import { createInitialProject } from '../audio/demoSongs';
import { createDefaultEffects } from '../audio/defaultEffects';

interface ProjectMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onLoadProject: (p: Project) => void;
  onExportWav: () => void;
  onOpenInstallApk: () => void;
}

export const ProjectMenuModal: React.FC<ProjectMenuModalProps> = ({
  isOpen,
  onClose,
  project,
  onLoadProject,
  onExportWav,
  onOpenInstallApk,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveToDisk = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}.daw.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loaded = JSON.parse(event.target?.result as string);
        if (loaded && loaded.tracks) {
          onLoadProject(loaded);
          onClose();
        }
      } catch (err) {
        alert('Tsy nety ny namaky ilay rakitra tetikasa (Could not read project JSON).');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateNew = () => {
    if (confirm('Tianao ve ny hamorona tetikasa vaovao? (Create new blank project?)')) {
      const blank: Project = {
        id: `proj-${Date.now()}`,
        name: 'New Session',
        bpm: 130,
        timeSignature: [4, 4],
        totalBars: 16,
        tracks: [
          {
            id: 't-beat',
            name: 'BEAT',
            type: 'beat',
            instrument: 'drum_trap',
            color: '#0084ff',
            volume: 0.9,
            pan: 0,
            mute: false,
            solo: false,
            armed: false,
            effects: createDefaultEffects(),
            clips: [],
          },
          {
            id: 't-synth',
            name: 'SYNTH',
            type: 'synth',
            instrument: 'synth_lead',
            color: '#00e5ff',
            volume: 0.85,
            pan: 0,
            mute: false,
            solo: false,
            armed: false,
            effects: createDefaultEffects(),
            clips: [],
          },
        ],
        masterVolume: 0.9,
        masterEffects: createDefaultEffects(),
        masteringConfig: {
          preset: 'streaming',
          drive: 3.5,
          ceiling: -0.8,
          stereoWidth: 1.2,
          warmth: 0.35,
          targetLufs: -14,
          isMono: false,
        },
        isMono: false,
        loop: { enabled: true, startBar: 1, endBar: 5 },
      };
      onLoadProject(blank);
      onClose();
    }
  };

  const loadDemo = (type: 'default' | 'synthwave') => {
    if (type === 'default') {
      onLoadProject(createInitialProject());
    } else {
      const synthwave = createInitialProject();
      synthwave.name = 'Cyberwave 80s';
      synthwave.bpm = 126;
      onLoadProject(synthwave);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-2xl bg-[#0d1424] border border-[#1e2f4c] shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#142033] border-b border-[#1c2c47] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/20 border border-[#00e5ff] flex items-center justify-center text-[#00e5ff]">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Project Manager & Options
              </h2>
              <p className="text-[11px] text-slate-400">
                Fitantanana ny tetikasa mozika (Save, load, and export)
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

        {/* Content list */}
        <div className="p-4 flex flex-col gap-3">
          {/* Action cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleSaveToDisk}
              className="p-3.5 rounded-xl bg-[#121c2e] hover:bg-[#18263e] border border-[#1f314f] text-left flex items-center gap-3 transition-all group active:scale-95"
            >
              <div className="w-10 h-10 rounded-lg bg-[#00e5ff]/15 text-[#00e5ff] flex items-center justify-center shrink-0">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#00e5ff]">
                  Save Project JSON
                </div>
                <div className="text-[11px] text-slate-400">Tehirizo amin'ny finday/PC</div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-xl bg-[#121c2e] hover:bg-[#18263e] border border-[#1f314f] text-left flex items-center gap-3 transition-all group active:scale-95"
            >
              <div className="w-10 h-10 rounded-lg bg-[#a855f7]/15 text-[#a855f7] flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#a855f7]">
                  Load Project
                </div>
                <div className="text-[11px] text-slate-400">Sokafy ny tetikasa voatahiry</div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.daw"
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              onClick={handleCreateNew}
              className="p-3.5 rounded-xl bg-[#121c2e] hover:bg-[#18263e] border border-[#1f314f] text-left flex items-center gap-3 transition-all group active:scale-95"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <FilePlus className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                  New Blank Project
                </div>
                <div className="text-[11px] text-slate-400">Manomboha hira vaovao</div>
              </div>
            </button>

            <button
              onClick={() => {
                onClose();
                onExportWav();
              }}
              className="p-3.5 rounded-xl bg-[#121c2e] hover:bg-[#18263e] border border-[#1f314f] text-left flex items-center gap-3 transition-all group active:scale-95"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-400">
                  Export Audio (WAV)
                </div>
                <div className="text-[11px] text-slate-400">Avohay ho raki-peo .wav</div>
              </div>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenInstallApk();
              }}
              className="p-3.5 rounded-xl bg-gradient-to-r from-[#00e5ff]/15 to-[#0084ff]/15 hover:from-[#00e5ff]/25 hover:to-[#0084ff]/25 border border-[#00e5ff]/50 text-left flex items-center gap-3 transition-all group active:scale-95 col-span-2 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
            >
              <div className="w-10 h-10 rounded-lg bg-[#00e5ff] text-slate-950 flex items-center justify-center shrink-0 shadow-[0_0_8px_#00e5ff]">
                <Smartphone className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#00e5ff]">
                  Mametraka amin'ny finday (Install toy ny APK)
                </div>
                <div className="text-[11px] text-[#00e5ff]">Ampiasao toy ny fampiharana Android / iOS tsy misy navigateur</div>
              </div>
            </button>
          </div>

          {/* Demo Projects */}
          <div className="p-3 rounded-xl bg-[#090f1b] border border-[#18263d]">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Hira sy gadona ohatra (Preloaded Demo Projects)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => loadDemo('default')}
                className="px-3 py-2 rounded-lg bg-[#142033] hover:bg-[#1a2c47] border border-[#20324f] text-left text-xs font-semibold text-white flex items-center justify-between"
              >
                <span>Afro Trap Beat (140 BPM)</span>
                <Play className="w-3.5 h-3.5 text-[#00e5ff]" />
              </button>
              <button
                onClick={() => loadDemo('synthwave')}
                className="px-3 py-2 rounded-lg bg-[#142033] hover:bg-[#1a2c47] border border-[#20324f] text-left text-xs font-semibold text-white flex items-center justify-between"
              >
                <span>Cyberwave Retro (126 BPM)</span>
                <Play className="w-3.5 h-3.5 text-[#00e5ff]" />
              </button>
            </div>
          </div>

          {/* Quick instructions in Malagasy */}
          <div className="p-3 rounded-xl bg-[#090f1b] border border-[#18263d] text-xs text-slate-300 flex items-start gap-2.5">
            <HelpCircle className="w-5 h-5 text-[#00e5ff] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">Torolalana tsotra (Quick Tips):</span>
              <p className="text-[11px] text-slate-400">
                • Tsindrio ny <strong className="text-[#00e5ff]">+ ADD TRACK</strong> raha te hampiditra karazan-java maneno vaovao (Piano, Drums, Bass, Guitars, Synths, Mic).
              </p>
              <p className="text-[11px] text-slate-400">
                • Tsindrio ny bokotra <strong className="text-[#00e5ff]">FX</strong> eo ambany hanokafana ireo effet maro (Reverb, Delay, Distortion, Chorus, Bitcrusher, Compressor).
              </p>
              <p className="text-[11px] text-slate-400">
                • Tsindrio ny <strong className="text-[#00e5ff]">PIANO ROLL</strong> hanovana ny naoty sy ny gadon'ny amponga.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#111c2e] border-t border-[#1c2c47] flex justify-end">
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
