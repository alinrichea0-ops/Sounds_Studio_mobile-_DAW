import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Drum, 
  Piano, 
  Guitar, 
  Mic, 
  AudioWaveform, 
  Zap, 
  Music, 
  Sparkles, 
  Radio, 
  Volume2,
  Layers
} from 'lucide-react';
import { InstrumentId, TrackType } from '../types/audio';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (trackData: {
    name: string;
    type: TrackType;
    instrument: InstrumentId;
    color: string;
  }) => void;
  onPreviewSound: (instrument: InstrumentId) => void;
}

interface InstrumentOption {
  id: InstrumentId;
  name: string;
  category: 'beats' | 'keys' | 'guitars' | 'synths' | 'bass' | 'brass_strings' | 'vocal_audio';
  type: TrackType;
  description: string;
  defaultColor: string;
  icon: any;
}

const INSTRUMENTS: InstrumentOption[] = [
  // Beats
  {
    id: 'drum_trap',
    name: 'Trap 808 Kit',
    category: 'beats',
    type: 'beat',
    description: 'Crisp trap snare, rolling hi-hats, tight punchy kick & 808 sub',
    defaultColor: '#0084ff',
    icon: Drum,
  },
  {
    id: 'drum_afro',
    name: 'Afrobeat & Amapiano Kit',
    category: 'beats',
    type: 'beat',
    description: 'Organic shakers, syncopated congas, log drum and snappy rims',
    defaultColor: '#06b6d4',
    icon: Drum,
  },
  {
    id: 'drum_boombap',
    name: 'Boom Bap Vintage Drums',
    category: 'beats',
    type: 'beat',
    description: 'Warm dusty kicks, crackling snares, vintage vinyl atmosphere',
    defaultColor: '#3b82f6',
    icon: Drum,
  },
  // Keyboards
  {
    id: 'grand_piano',
    name: 'Acoustic Grand Piano',
    category: 'keys',
    type: 'keyboard',
    description: 'Rich acoustic harmonics, dynamic hammer response and sustain',
    defaultColor: '#a855f7',
    icon: Piano,
  },
  {
    id: 'rhodes',
    name: 'Rhodes Electric Piano',
    category: 'keys',
    type: 'keyboard',
    description: 'Soulful neo-soul tines, warm bell chime and vintage vibrato',
    defaultColor: '#9333ea',
    icon: Piano,
  },
  // Bass
  {
    id: 'bass_808',
    name: 'Deep 808 Sub-Bass',
    category: 'bass',
    type: 'bass',
    description: 'Heavy sliding sub frequency glide for trap, drill, and hip-hop',
    defaultColor: '#10b981',
    icon: Zap,
  },
  {
    id: 'bass_slap',
    name: 'Electric Slap Bass',
    category: 'bass',
    type: 'bass',
    description: 'Funky punchy thumb slap with bright fret resonance',
    defaultColor: '#059669',
    icon: Zap,
  },
  {
    id: 'bass_synth',
    name: 'Acid Synth Bass',
    category: 'bass',
    type: 'bass',
    description: 'Resonant squelchy sawtooth bass with aggressive cut',
    defaultColor: '#34d399',
    icon: Zap,
  },
  // Guitars
  {
    id: 'guitar_clean',
    name: 'Clean Electric Guitar',
    category: 'guitars',
    type: 'guitar',
    description: 'Sparkling single-coil strat tone with pristine acoustic bite',
    defaultColor: '#f97316',
    icon: Guitar,
  },
  {
    id: 'guitar_dist',
    name: 'Overdrive Rock Guitar',
    category: 'guitars',
    type: 'guitar',
    description: 'Saturated tube amplifier distortion and rich sustain harmonics',
    defaultColor: '#ea580c',
    icon: Guitar,
  },
  // Synths
  {
    id: 'synth_lead',
    name: 'Cyber Saw Lead',
    category: 'synths',
    type: 'synth',
    description: 'Dual detuned super-saw synth lead that cuts through any mix',
    defaultColor: '#ec4899',
    icon: Sparkles,
  },
  {
    id: 'synth_pluck',
    name: 'Crystal Pluck Synth',
    category: 'synths',
    type: 'synth',
    description: 'Short snappy envelope with resonant filter decay',
    defaultColor: '#f43f5e',
    icon: Sparkles,
  },
  {
    id: 'synth_pad',
    name: 'Ambient Warm Pad',
    category: 'synths',
    type: 'synth',
    description: 'Lush slowly evolving atmospheric string pad texture',
    defaultColor: '#d946ef',
    icon: Layers,
  },
  // Strings & Brass
  {
    id: 'strings_ensemble',
    name: 'Orchestral Strings',
    category: 'brass_strings',
    type: 'strings',
    description: 'Full cinematic violin, viola, and cello string section',
    defaultColor: '#ef4444',
    icon: Music,
  },
  {
    id: 'brass_section',
    name: 'Punchy Brass & Horns',
    category: 'brass_strings',
    type: 'brass',
    description: 'Big brass hits with staccato trumpet, trombone, and sax bite',
    defaultColor: '#eab308',
    icon: Volume2,
  },
  // Vocal & Audio
  {
    id: 'vocal_mic',
    name: 'Microphone Audio Track',
    category: 'vocal_audio',
    type: 'vocal',
    description: 'Real-time microphone recording track with pre-amp and vocal effects',
    defaultColor: '#00e5ff',
    icon: Mic,
  },
  {
    id: 'audio_sampler',
    name: 'Audio Sampler Track',
    category: 'vocal_audio',
    type: 'audio',
    description: 'Import WAV/MP3 files or record sound chops into sample clips',
    defaultColor: '#eab308',
    icon: AudioWaveform,
  },
];

export const AddTrackModal: React.FC<AddTrackModalProps> = ({
  isOpen,
  onClose,
  onAddTrack,
  onPreviewSound,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedInst, setSelectedInst] = useState<InstrumentOption>(INSTRUMENTS[0]);
  const [customName, setCustomName] = useState<string>(INSTRUMENTS[0].name.toUpperCase());
  const [customColor, setCustomColor] = useState<string>(INSTRUMENTS[0].defaultColor);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Instruments' },
    { id: 'beats', label: 'Drums & Beats' },
    { id: 'keys', label: 'Keyboards' },
    { id: 'bass', label: '808 & Bass' },
    { id: 'guitars', label: 'Guitars' },
    { id: 'synths', label: 'Synths & Leads' },
    { id: 'brass_strings', label: 'Strings & Brass' },
    { id: 'vocal_audio', label: 'Vocals & Audio' },
  ];

  const filtered = selectedCategory === 'all'
    ? INSTRUMENTS
    : INSTRUMENTS.filter(i => i.category === selectedCategory);

  const handleSelectInst = (inst: InstrumentOption) => {
    setSelectedInst(inst);
    setCustomName(inst.name.toUpperCase());
    setCustomColor(inst.defaultColor);
    onPreviewSound(inst.id);
  };

  const handleConfirm = () => {
    onAddTrack({
      name: customName || selectedInst.name.toUpperCase(),
      type: selectedInst.type,
      instrument: selectedInst.id,
      color: customColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-[#0f1728] border border-[#1e2f4c] shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#142033] border-b border-[#1c2c47] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/20 border border-[#00e5ff] flex items-center justify-center text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.4)]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Add Instrument Track
              </h2>
              <p className="text-[11px] text-slate-400">
                Safidio ny karazan-java maneno tianao hampidirina (Select sound engine)
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

        {/* Category Pills */}
        <div className="px-4 py-2 bg-[#0c1424] border-b border-[#192742] flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#00e5ff] text-slate-950 font-bold shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                  : 'bg-[#142033] text-slate-400 hover:text-white hover:bg-[#1a2c47]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Instruments Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto max-h-[380px]">
          {filtered.map((inst) => {
            const isChosen = selectedInst.id === inst.id;
            const Icon = inst.icon;

            return (
              <div
                key={inst.id}
                onClick={() => handleSelectInst(inst)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isChosen
                    ? 'bg-[#182844] border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                    : 'bg-[#121c2e] hover:bg-[#16233a] border-[#1e2f4c]'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${inst.defaultColor}18`,
                    borderColor: inst.defaultColor,
                    color: inst.defaultColor,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white tracking-wide truncate">
                      {inst.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewSound(inst.id);
                      }}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#00e5ff]/20 text-[#00e5ff] hover:bg-[#00e5ff]/35 border border-[#00e5ff]/40"
                    >
                      Audition
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {inst.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Customization footer */}
        <div className="p-4 bg-[#111c2e] border-t border-[#1c2c47] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Track Name */}
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                Track Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-36 sm:w-44 px-2.5 py-1.5 rounded-lg bg-[#0a1120] border border-[#233857] text-xs font-bold text-white focus:outline-none focus:border-[#00e5ff]"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                Color
              </label>
              <div className="flex items-center gap-1.5">
                {['#00e5ff', '#0084ff', '#a855f7', '#f97316', '#eab308', '#10b981', '#ec4899', '#ef4444'].map((col) => (
                  <button
                    key={col}
                    onClick={() => setCustomColor(col)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      customColor === col ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#18263e] hover:bg-[#203352] text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-[#00e5ff] hover:bg-[#00c8e0] text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.5)] active:scale-95 transition-all"
            >
              Add Track to Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
