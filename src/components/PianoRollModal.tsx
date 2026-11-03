import React, { useState } from 'react';
import { 
  X, 
  Piano, 
  Drum, 
  Trash2, 
  Copy, 
  Scissors, 
  ClipboardPaste, 
  ArrowUp, 
  ArrowDown, 
  ChevronsUp, 
  ChevronsDown, 
  CheckSquare, 
  Wand2, 
  MousePointer,
  Sparkles
} from 'lucide-react';
import { Track, Clip, NoteEvent, DrumStepPattern } from '../types/audio';

interface PianoRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string) => void;
  onUpdateClipNotes: (trackId: string, clipId: string, notes: NoteEvent[]) => void;
  onUpdateClipDrums: (trackId: string, clipId: string, pattern: DrumStepPattern) => void;
  onPreviewNote: (instrument: string, note: number) => void;
  onPreviewDrum: (drum: 'kick' | 'snare' | 'hihat' | 'clap' | 'perc' | 'bass808') => void;
}

const PIANO_NOTES = [
  { midi: 72, name: 'C5', isBlack: false },
  { midi: 71, name: 'B4', isBlack: false },
  { midi: 70, name: 'A#4', isBlack: true },
  { midi: 69, name: 'A4', isBlack: false },
  { midi: 68, name: 'G#4', isBlack: true },
  { midi: 67, name: 'G4', isBlack: false },
  { midi: 66, name: 'F#4', isBlack: true },
  { midi: 65, name: 'F4', isBlack: false },
  { midi: 64, name: 'E4', isBlack: false },
  { midi: 63, name: 'D#4', isBlack: true },
  { midi: 62, name: 'D4', isBlack: false },
  { midi: 61, name: 'C#4', isBlack: true },
  { midi: 60, name: 'C4', isBlack: false },
  { midi: 59, name: 'B3', isBlack: false },
  { midi: 58, name: 'A#3', isBlack: true },
  { midi: 57, name: 'A3', isBlack: false },
  { midi: 56, name: 'G#3', isBlack: true },
  { midi: 55, name: 'G3', isBlack: false },
  { midi: 53, name: 'F3', isBlack: false },
  { midi: 51, name: 'D#3', isBlack: true },
  { midi: 48, name: 'C3', isBlack: false },
];

const DRUM_PARTS: Array<{ key: keyof DrumStepPattern; label: string; color: string }> = [
  { key: 'kick', label: 'Kick 808', color: '#00e5ff' },
  { key: 'snare', label: 'Snare Hit', color: '#0084ff' },
  { key: 'hihat', label: 'Hi-Hat 16th', color: '#a855f7' },
  { key: 'clap', label: 'Studio Clap', color: '#f97316' },
  { key: 'perc', label: 'Perc / Rim', color: '#eab308' },
  { key: 'bass808', label: '808 Sub Boom', color: '#10b981' },
];

export const PianoRollModal: React.FC<PianoRollModalProps> = ({
  isOpen,
  onClose,
  tracks,
  selectedTrackId,
  onSelectTrack,
  onUpdateClipNotes,
  onUpdateClipDrums,
  onPreviewNote,
  onPreviewDrum,
}) => {
  // Selection and clipboard state
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [clipboard, setClipboard] = useState<NoteEvent[]>([]);
  const [selectToolActive, setSelectToolActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];
  const activeClip = currentTrack?.clips[0];
  const isDrumTrack = currentTrack?.type === 'beat' || activeClip?.type === 'drum';

  const notes = activeClip?.notes || [];

  // Toggle note block in piano roll
  const toggleNote = (midi: number, step: number) => {
    if (!activeClip || !currentTrack) return;
    const existing = notes.find(n => n.note === midi && n.step === step);

    if (selectToolActive && existing) {
      // In select mode, clicking an existing note toggles its selection
      const next = new Set(selectedNoteIds);
      if (next.has(existing.id)) next.delete(existing.id);
      else next.add(existing.id);
      setSelectedNoteIds(next);
      return;
    }

    let newNotes: NoteEvent[];
    if (existing) {
      newNotes = notes.filter(n => !(n.note === midi && n.step === step));
      if (selectedNoteIds.has(existing.id)) {
        const next = new Set(selectedNoteIds);
        next.delete(existing.id);
        setSelectedNoteIds(next);
      }
    } else {
      const newNote: NoteEvent = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        note: midi,
        step,
        durationSteps: 2,
        velocity: 0.85,
      };
      newNotes = [...notes, newNote];
      onPreviewNote(currentTrack.instrument, midi);
    }
    onUpdateClipNotes(currentTrack.id, activeClip.id, newNotes);
  };

  // Drum pattern toggle
  const toggleDrumStep = (part: keyof DrumStepPattern, stepIdx: number) => {
    if (!activeClip || !currentTrack) return;
    const currentPattern = activeClip.drumPattern || {
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      clap: Array(16).fill(false),
      perc: Array(16).fill(false),
      bass808: Array(16).fill(false),
    };

    const newPattern = { ...currentPattern };
    const row = [...(newPattern[part] || Array(16).fill(false))];
    row[stepIdx] = !row[stepIdx];
    newPattern[part] = row;

    if (row[stepIdx]) {
      onPreviewDrum(part as any);
    }

    onUpdateClipDrums(currentTrack.id, activeClip.id, newPattern);
  };

  // NOTE EDITING OPERATIONS:
  // 1. Select All
  const handleSelectAll = () => {
    if (selectedNoteIds.size === notes.length && notes.length > 0) {
      setSelectedNoteIds(new Set()); // deselect all
    } else {
      setSelectedNoteIds(new Set(notes.map(n => n.id)));
    }
  };

  // 2. Copy
  const handleCopy = () => {
    const targetNotes = selectedNoteIds.size > 0
      ? notes.filter(n => selectedNoteIds.has(n.id))
      : notes;
    if (targetNotes.length === 0) return;
    setClipboard(JSON.parse(JSON.stringify(targetNotes)));
  };

  // 3. Cut
  const handleCut = () => {
    if (!activeClip || !currentTrack) return;
    const targetNotes = selectedNoteIds.size > 0
      ? notes.filter(n => selectedNoteIds.has(n.id))
      : notes;
    if (targetNotes.length === 0) return;

    setClipboard(JSON.parse(JSON.stringify(targetNotes)));
    const targetIds = new Set(targetNotes.map(n => n.id));
    const remaining = notes.filter(n => !targetIds.has(n.id));
    setSelectedNoteIds(new Set());
    onUpdateClipNotes(currentTrack.id, activeClip.id, remaining);
  };

  // 4. Paste
  const handlePaste = () => {
    if (!activeClip || !currentTrack || clipboard.length === 0) return;
    const pasted: NoteEvent[] = clipboard.map(n => ({
      ...n,
      id: `pasted-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      step: (n.step + 4) % 16, // offset by 1 beat
    }));

    const newIds = new Set(pasted.map(n => n.id));
    setSelectedNoteIds(newIds);
    onUpdateClipNotes(currentTrack.id, activeClip.id, [...notes, ...pasted]);
  };

  // 5. Move Up (+1 semitone)
  const handleMoveUp = () => {
    if (!activeClip || !currentTrack) return;
    const targetIds = selectedNoteIds.size > 0 ? selectedNoteIds : new Set(notes.map(n => n.id));
    const updated = notes.map(n => {
      if (targetIds.has(n.id)) {
        return { ...n, note: Math.min(84, n.note + 1) };
      }
      return n;
    });
    onUpdateClipNotes(currentTrack.id, activeClip.id, updated);
  };

  // 6. Move Down (-1 semitone)
  const handleMoveDown = () => {
    if (!activeClip || !currentTrack) return;
    const targetIds = selectedNoteIds.size > 0 ? selectedNoteIds : new Set(notes.map(n => n.id));
    const updated = notes.map(n => {
      if (targetIds.has(n.id)) {
        return { ...n, note: Math.max(36, n.note - 1) };
      }
      return n;
    });
    onUpdateClipNotes(currentTrack.id, activeClip.id, updated);
  };

  // 7. Octave Up (+12)
  const handleOctaveUp = () => {
    if (!activeClip || !currentTrack) return;
    const targetIds = selectedNoteIds.size > 0 ? selectedNoteIds : new Set(notes.map(n => n.id));
    const updated = notes.map(n => {
      if (targetIds.has(n.id)) {
        return { ...n, note: Math.min(84, n.note + 12) };
      }
      return n;
    });
    onUpdateClipNotes(currentTrack.id, activeClip.id, updated);
  };

  // 8. Octave Down (-12)
  const handleOctaveDown = () => {
    if (!activeClip || !currentTrack) return;
    const targetIds = selectedNoteIds.size > 0 ? selectedNoteIds : new Set(notes.map(n => n.id));
    const updated = notes.map(n => {
      if (targetIds.has(n.id)) {
        return { ...n, note: Math.max(36, n.note - 12) };
      }
      return n;
    });
    onUpdateClipNotes(currentTrack.id, activeClip.id, updated);
  };

  // 9. Humanize
  const handleHumanize = () => {
    if (!activeClip || !currentTrack || notes.length === 0) return;
    const targetIds = selectedNoteIds.size > 0 ? selectedNoteIds : new Set(notes.map(n => n.id));
    const updated = notes.map(n => {
      if (targetIds.has(n.id)) {
        // Natural human velocity groove between 0.65 and 0.95
        const humanVel = Number((0.65 + Math.random() * 0.3).toFixed(2));
        const dur = Math.max(1, Math.min(4, (n.durationSteps || 2) + (Math.random() > 0.5 ? 0 : (Math.random() > 0.5 ? 1 : -1))));
        return {
          ...n,
          velocity: humanVel,
          durationSteps: dur,
        };
      }
      return n;
    });
    onUpdateClipNotes(currentTrack.id, activeClip.id, updated);
  };

  // Clear
  const clearAllNotes = () => {
    if (!activeClip || !currentTrack) return;
    if (isDrumTrack) {
      onUpdateClipDrums(currentTrack.id, activeClip.id, {
        kick: Array(16).fill(false),
        snare: Array(16).fill(false),
        hihat: Array(16).fill(false),
        clap: Array(16).fill(false),
        perc: Array(16).fill(false),
        bass808: Array(16).fill(false),
      });
    } else {
      setSelectedNoteIds(new Set());
      onUpdateClipNotes(currentTrack.id, activeClip.id, []);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-5xl max-h-[92vh] rounded-2xl bg-[#0c1322] border border-[#1e2f4c] shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3 bg-[#142033] border-b border-[#1c2c47] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/20 border border-[#00e5ff] flex items-center justify-center text-[#00e5ff]">
              {isDrumTrack ? <Drum className="w-4 h-4" /> : <Piano className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                {isDrumTrack ? 'Drum Step Sequencer' : 'Piano Roll Note Editor'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Safidio ny naoty hanovana azy (Cut, Copy, Paste, Move Up/Down, Octave, Humanize)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAllNotes}
              className="px-2.5 py-1 rounded-lg bg-[#18263e] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#223554] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1a273e] hover:bg-[#223554] border border-[#2a3f62] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Note Editing Operations Toolbar */}
        {!isDrumTrack && (
          <div className="px-3 py-2 bg-[#0e1728] border-b border-[#1c2c47] flex flex-wrap items-center gap-1.5 text-xs shrink-0 overflow-x-auto scrollbar-none">
            {/* Select Tool Mode */}
            <button
              onClick={() => setSelectToolActive(!selectToolActive)}
              className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                selectToolActive
                  ? 'bg-[#00e5ff] text-slate-950 border-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                  : 'bg-[#142033] text-slate-300 border-[#223554] hover:text-white'
              }`}
              title="Toggle Note Select Tool (Fidio ny naoty)"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Select ({selectedNoteIds.size})</span>
            </button>

            {/* Select All */}
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 rounded-lg bg-[#142033] hover:bg-[#1a2c47] text-slate-300 hover:text-white border border-[#223554] font-semibold flex items-center gap-1.5"
              title="Fidio ny naoty rehetra"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>Select All</span>
            </button>

            <div className="h-4 w-px bg-[#233554] mx-1" />

            {/* Cut */}
            <button
              onClick={handleCut}
              className="px-2.5 py-1 rounded-lg bg-[#142033] hover:bg-[#1a2c47] text-slate-300 hover:text-white border border-[#223554] font-semibold flex items-center gap-1.5"
              title="Hetezo ny naoty voafidy (Cut)"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Cut</span>
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-[#142033] hover:bg-[#1a2c47] text-slate-300 hover:text-white border border-[#223554] font-semibold flex items-center gap-1.5"
              title="Adikao ny naoty (Copy)"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copy</span>
            </button>

            {/* Paste */}
            <button
              onClick={handlePaste}
              disabled={clipboard.length === 0}
              className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${
                clipboard.length > 0
                  ? 'bg-[#142033] hover:bg-[#1a2c47] text-slate-200 border-[#223554]'
                  : 'bg-[#0f1726] text-slate-600 border-[#1c283e] cursor-not-allowed opacity-50'
              }`}
              title="Apetaho ny naoty (Paste)"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paste ({clipboard.length})</span>
            </button>

            <div className="h-4 w-px bg-[#233554] mx-1" />

            {/* Move Up */}
            <button
              onClick={handleMoveUp}
              className="px-2 py-1 rounded-lg bg-[#142033] hover:bg-[#1a2c47] text-slate-300 hover:text-white border border-[#223554] font-semibold flex items-center gap-1"
              title="Akaro 1 demi-ton (Move Up +1)"
            >
              <ArrowUp className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>Up +1</span>
            </button>

            {/* Move Down */}
            <button
              onClick={handleMoveDown}
              className="px-2 py-1 rounded-lg bg-[#142033] hover:bg-[#1a2c47] text-slate-300 hover:text-white border border-[#223554] font-semibold flex items-center gap-1"
              title="Ahenao 1 demi-ton (Move Down -1)"
            >
              <ArrowDown className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>Down -1</span>
            </button>

            {/* Up Octave */}
            <button
              onClick={handleOctaveUp}
              className="px-2 py-1 rounded-lg bg-[#142033] hover:bg-[#1a2c47] text-slate-300 hover:text-white border border-[#223554] font-semibold flex items-center gap-1"
              title="Akaro 1 octave feno (+12)"
            >
              <ChevronsUp className="w-3.5 h-3.5 text-purple-400" />
              <span>Octave +12</span>
            </button>

            {/* Down Octave */}
            <button
              onClick={handleOctaveDown}
              className="px-2 py-1 rounded-lg bg-[#142033] hover:bg-[#1a2c47] text-slate-300 hover:text-white border border-[#223554] font-semibold flex items-center gap-1"
              title="Ahenao 1 octave feno (-12)"
            >
              <ChevronsDown className="w-3.5 h-3.5 text-purple-400" />
              <span>Octave -12</span>
            </button>

            <div className="h-4 w-px bg-[#233554] mx-1" />

            {/* Humanize */}
            <button
              onClick={handleHumanize}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 font-bold flex items-center gap-1.5 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
              title="Omeo fahatsapana voajanahary ny naoty (Humanize timing & velocity groove)"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Humanize</span>
            </button>
          </div>
        )}

        {/* Track switch tabs */}
        <div className="px-4 py-2 bg-[#090f1b] border-b border-[#182740] flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Track:
          </span>
          {tracks.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelectTrack(t.id);
                setSelectedNoteIds(new Set());
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                currentTrack?.id === t.id
                  ? 'bg-[#182844] text-white border-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                  : 'bg-[#121c2e] text-slate-400 border-[#1c2c47] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Sequencer Grid Body */}
        <div className="flex-1 overflow-auto max-h-[500px] bg-[#070c17] flex">
          {/* DRUM MODE */}
          {isDrumTrack ? (
            <div className="w-full p-4 flex flex-col gap-3">
              {/* Step numbers header 1..16 */}
              <div className="flex items-center">
                <div className="w-28 shrink-0 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Drum Part
                </div>
                <div className="flex-1 grid grid-cols-16 gap-1 text-center font-mono text-[10px] text-slate-400">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`py-0.5 rounded ${i % 4 === 0 ? 'text-[#00e5ff] font-bold bg-[#142033]' : ''}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {DRUM_PARTS.map((part) => {
                const pattern = (activeClip?.drumPattern as any)?.[part.key] || Array(16).fill(false);

                return (
                  <div key={part.key} className="flex items-center gap-2">
                    <button
                      onClick={() => onPreviewDrum(part.key as any)}
                      className="w-28 h-10 px-2 rounded-xl bg-[#121c2e] hover:bg-[#18263e] border border-[#1e2f4c] text-left flex items-center justify-between text-xs font-bold text-white shrink-0 group active:scale-95 transition-all"
                    >
                      <span className="truncate">{part.label}</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: part.color }} />
                    </button>

                    <div className="flex-1 grid grid-cols-16 gap-1 h-10">
                      {Array.from({ length: 16 }).map((_, sIdx) => {
                        const isActive = pattern[sIdx];
                        const isBeatStart = sIdx % 4 === 0;

                        return (
                          <button
                            key={sIdx}
                            onClick={() => toggleDrumStep(part.key, sIdx)}
                            className={`h-full rounded-lg border transition-all ${
                              isActive
                                ? 'shadow-md border-white'
                                : isBeatStart
                                ? 'bg-[#152238] border-[#223554] hover:bg-[#1e2f4c]'
                                : 'bg-[#0f1728] border-[#18253d] hover:bg-[#152033]'
                            }`}
                            style={{
                              backgroundColor: isActive ? part.color : undefined,
                              boxShadow: isActive ? `0 0 10px ${part.color}88` : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* MELODIC PIANO ROLL MODE */
            <div className="flex w-full">
              {/* Left Piano Keyboard keys */}
              <div className="w-24 shrink-0 bg-[#0e1626] border-r border-[#1c2c47] flex flex-col">
                {PIANO_NOTES.map((note) => (
                  <button
                    key={note.midi}
                    onClick={() => onPreviewNote(currentTrack.instrument, note.midi)}
                    className={`h-7 px-2 border-b flex items-center justify-between text-xs font-mono transition-colors active:scale-95 ${
                      note.isBlack
                        ? 'bg-[#141e30] border-[#0a111e] text-slate-300 hover:bg-[#1c2a42]'
                        : 'bg-[#1e2c45] border-[#162338] text-white font-bold hover:bg-[#283b5c]'
                    }`}
                  >
                    <span>{note.name}</span>
                    <span className="text-[9px] text-slate-500 font-sans">{note.midi}</span>
                  </button>
                ))}
              </div>

              {/* Note Grid (16 steps) */}
              <div className="flex-1 flex flex-col min-w-[500px]">
                {/* Step header numbers */}
                <div className="h-6 bg-[#0a1120] border-b border-[#1c2c47] grid grid-cols-16 text-center font-mono text-[9px] text-slate-400">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`flex items-center justify-center ${i % 4 === 0 ? 'text-[#00e5ff] font-bold' : ''}`}>
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Rows corresponding to piano keys */}
                {PIANO_NOTES.map((note) => (
                  <div
                    key={note.midi}
                    className="h-7 border-b border-[#142033] grid grid-cols-16"
                  >
                    {Array.from({ length: 16 }).map((_, stepIdx) => {
                      const noteObj = notes.find(
                        n => n.note === note.midi && n.step === stepIdx
                      );
                      const isNoteActive = !!noteObj;
                      const isNoteSelected = noteObj ? selectedNoteIds.has(noteObj.id) : false;
                      const isBeatStart = stepIdx % 4 === 0;

                      return (
                        <div
                          key={stepIdx}
                          onClick={() => toggleNote(note.midi, stepIdx)}
                          className={`h-full border-r cursor-pointer transition-all relative flex items-center justify-center ${
                            isBeatStart ? 'border-[#1b2b46]' : 'border-[#111c2e]'
                          } ${
                            isNoteActive
                              ? isNoteSelected
                                ? 'ring-2 ring-white brightness-125 z-10'
                                : 'border-white'
                              : note.isBlack
                              ? 'bg-[#080e1a]/80 hover:bg-[#101b2e]'
                              : 'bg-[#0b1220]/80 hover:bg-[#132035]'
                          }`}
                          style={{
                            backgroundColor: isNoteActive ? currentTrack.color : undefined,
                            boxShadow: isNoteActive
                              ? isNoteSelected
                                ? `0 0 12px #ffffff`
                                : `0 0 8px ${currentTrack.color}`
                              : undefined,
                          }}
                        >
                          {isNoteSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white shadow" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#111c2e] border-t border-[#1c2c47] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Playing on <strong className="text-white">{currentTrack?.name}</strong> ({currentTrack?.instrument}) | {notes.length} notes in clip
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00e5ff] hover:bg-[#00c8e0] text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]"
          >
            Done Editing
          </button>
        </div>
      </div>
    </div>
  );
};
