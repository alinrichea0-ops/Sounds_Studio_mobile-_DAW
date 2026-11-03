import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Project, Track, Clip, ActiveModal, InstrumentId, TrackType, EffectConfig, NoteEvent, DrumStepPattern, MasteringConfig } from './types/audio';
import { DawAudioEngine } from './audio/audioEngine';
import { createInitialProject } from './audio/demoSongs';
import { createDefaultEffects } from './audio/defaultEffects';
import { TopBar } from './components/TopBar';
import { TrackHeader } from './components/TrackHeader';
import { TimelineRuler } from './components/TimelineRuler';
import { TimelineGrid } from './components/TimelineGrid';
import { BottomToolbar } from './components/BottomToolbar';
import { AddTrackModal } from './components/AddTrackModal';
import { FXRackModal } from './components/FXRackModal';
import { EQModal } from './components/EQModal';
import { MixerModal } from './components/MixerModal';
import { PianoRollModal } from './components/PianoRollModal';
import { VisualizerModal } from './components/VisualizerModal';
import { ProjectMenuModal } from './components/ProjectMenuModal';
import { InstallApkModal } from './components/InstallApkModal';
import { MasteringModal } from './components/MasteringModal';

export default function App() {
  // Master DAW state
  const [project, setProject] = useState<Project>(() => {
    try {
      const saved = localStorage.getItem('soundstudio_saved_project');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return createInitialProject();
  });

  // Undo / Redo history
  const [history, setHistory] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);

  const pushHistory = useCallback((current: Project) => {
    setHistory(prev => [...prev.slice(-15), JSON.parse(JSON.stringify(current))]);
    setFuture([]);
  }, []);

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setFuture(f => [JSON.parse(JSON.stringify(project)), ...f]);
    setProject(prev);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(f => f.slice(1));
    setHistory(h => [...h, JSON.parse(JSON.stringify(project))]);
    setProject(next);
  };

  // Selection state
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(() => project.tracks[0]?.id || null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Transport & Clock state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentBar, setCurrentBar] = useState<number>(1.0);
  const [timeDisplay, setTimeDisplay] = useState<string>('00:00:00.000');
  const [metronome, setMetronome] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(true);
  const [quantize, setQuantize] = useState<boolean>(true);
  const [gridSnap, setGridSnap] = useState<string>('1/16');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // VU Meters
  const [trackPeaks, setTrackPeaks] = useState<Map<string, number>>(new Map());
  const [masterPeak, setMasterPeak] = useState<number>(0);

  // Active Modals
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Audio Engine instance ref
  const audioEngineRef = useRef<DawAudioEngine | null>(null);
  if (!audioEngineRef.current) {
    audioEngineRef.current = new DawAudioEngine();
  }
  const audioEngine = audioEngineRef.current;

  // Horizontal bar width scaled by zoom (base 84px)
  const barWidth = Math.round(84 * zoomLevel);

  // Sync state with audio engine callbacks
  useEffect(() => {
    audioEngine.onTimeUpdate = (bar, formatted) => {
      setCurrentBar(bar);
      setTimeDisplay(formatted);
    };

    audioEngine.onPeakMeterUpdate = (peaks, mPeak) => {
      setTrackPeaks(peaks);
      setMasterPeak(mPeak);
    };

    return () => {
      audioEngine.stop();
    };
  }, [audioEngine]);

  // Keep project synced into audio engine
  useEffect(() => {
    if (audioEngine) {
      audioEngine.metronomeEnabled = metronome;
      audioEngine.loopEnabled = loop;
      audioEngine.syncProjectTracks(project);
    }
    // Auto-save to LocalStorage
    try {
      localStorage.setItem('soundstudio_saved_project', JSON.stringify(project));
    } catch {
      // ignore
    }
  }, [project, metronome, loop, audioEngine]);

  // Transport Handlers
  const handlePlay = async () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      await audioEngine.play(project);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    audioEngine.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentBar(1.0);
    setTimeDisplay('00:00:00.000');
  };

  const handleRewind = () => {
    const target = Math.max(1.0, currentBar - 4);
    audioEngine.seek(target);
  };

  const handleFastForward = () => {
    const target = Math.min(project.totalBars, currentBar + 4);
    audioEngine.seek(target);
  };

  const handleSeek = (bar: number) => {
    audioEngine.seek(bar);
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      audioEngine.stopRecording();
      setIsRecording(false);
    } else {
      const ok = await audioEngine.startRecording((audioBuffer, waveform) => {
        // Add new recorded audio clip to armed or vocal track
        const armedTrack = project.tracks.find(t => t.armed) || project.tracks.find(t => t.type === 'vocal' || t.type === 'audio') || project.tracks[0];
        if (armedTrack) {
          const newClip: Clip = {
            id: `clip-rec-${Date.now()}`,
            trackId: armedTrack.id,
            name: `Rec Vocal ${armedTrack.clips.length + 1}`,
            startBar: Math.floor(currentBar),
            durationBars: 4,
            type: 'audio',
            audioBuffer,
            waveformPoints: waveform,
            color: armedTrack.color,
          };
          pushHistory(project);
          setProject(prev => ({
            ...prev,
            tracks: prev.tracks.map(t => t.id === armedTrack.id ? { ...t, clips: [...t.clips, newClip] } : t),
          }));
        }
      });
      if (ok) {
        setIsRecording(true);
        if (!isPlaying) {
          handlePlay();
        }
      }
    }
  };

  // Track Actions
  const handleAddTrack = (trackData: { name: string; type: TrackType; instrument: InstrumentId; color: string }) => {
    pushHistory(project);
    const newTrack: Track = {
      id: `t-${Date.now()}`,
      name: trackData.name,
      type: trackData.type,
      instrument: trackData.instrument,
      color: trackData.color,
      volume: 0.85,
      pan: 0,
      mute: false,
      solo: false,
      armed: false,
      effects: createDefaultEffects(),
      clips: [],
    };

    setProject(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack],
    }));
    setSelectedTrackId(newTrack.id);
  };

  const handleDeleteTrack = (trackId: string) => {
    if (project.tracks.length <= 1) {
      alert('Tsy azo fafana ny track farany (Cannot delete the only track).');
      return;
    }
    pushHistory(project);
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== trackId),
    }));
    if (selectedTrackId === trackId) {
      setSelectedTrackId(project.tracks[0]?.id || null);
    }
  };

  const handleDuplicateTrack = (trackId: string) => {
    const track = project.tracks.find(t => t.id === trackId);
    if (!track) return;
    pushHistory(project);
    const dup: Track = {
      ...JSON.parse(JSON.stringify(track)),
      id: `t-${Date.now()}`,
      name: `${track.name} (Copy)`,
    };
    setProject(prev => ({
      ...prev,
      tracks: [...prev.tracks, dup],
    }));
  };

  const handleRenameTrack = (trackId: string, newName: string) => {
    pushHistory(project);
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, name: newName } : t),
    }));
  };

  const handleToggleMute = (trackId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, mute: !t.mute } : t),
    }));
  };

  const handleToggleSolo = (trackId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, solo: !t.solo } : t),
    }));
  };

  const handleToggleArmed = (trackId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, armed: !t.armed } : { ...t, armed: false }),
    }));
  };

  const handleChangeVolume = (trackId: string, vol: number) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, volume: vol } : t),
    }));
  };

  const handleChangePan = (trackId: string, pan: number) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, pan } : t),
    }));
  };

  // Add Clip to Track
  const handleAddClipToTrack = (trackId: string, clickedBar: number) => {
    const track = project.tracks.find(t => t.id === trackId);
    if (!track) return;

    // Check if clip already covers this bar
    const exists = track.clips.some(c => clickedBar >= c.startBar && clickedBar < c.startBar + c.durationBars);
    if (exists) return;

    pushHistory(project);
    const isDrum = track.type === 'beat';
    const newClip: Clip = {
      id: `c-${Date.now()}`,
      trackId: track.id,
      name: `${track.name} Pattern ${track.clips.length + 1}`,
      startBar: clickedBar,
      durationBars: 4,
      type: isDrum ? 'drum' : 'pattern',
      color: track.color,
      drumPattern: isDrum ? {
        kick: [true, false, false, false, false, false, true, false, false, true, false, false, false, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        perc: [false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false],
        bass808: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      } : undefined,
      notes: !isDrum ? [
        { id: 'n1', note: 65, step: 0, durationSteps: 4, velocity: 0.8 },
        { id: 'n2', note: 68, step: 4, durationSteps: 4, velocity: 0.8 },
        { id: 'n3', note: 72, step: 8, durationSteps: 4, velocity: 0.85 },
        { id: 'n4', note: 75, step: 12, durationSteps: 4, velocity: 0.8 },
      ] : undefined,
    };

    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t),
    }));
    setSelectedClipId(newClip.id);
  };

  // Change Effects
  const handleChangeEffects = (target: 'track' | 'master', newEffects: EffectConfig) => {
    if (target === 'master') {
      setProject(prev => ({ ...prev, masterEffects: newEffects }));
    } else if (selectedTrackId) {
      setProject(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => t.id === selectedTrackId ? { ...t, effects: newEffects } : t),
      }));
    }
  };

  // Piano Roll Clip updates
  const handleUpdateClipNotes = (trackId: string, clipId: string, notes: NoteEvent[]) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? {
        ...t,
        clips: t.clips.map(c => c.id === clipId ? { ...c, notes } : c),
      } : t),
    }));
  };

  const handleUpdateClipDrums = (trackId: string, clipId: string, pattern: DrumStepPattern) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => t.id === trackId ? {
        ...t,
        clips: t.clips.map(c => c.id === clipId ? { ...c, drumPattern: pattern } : c),
      } : t),
    }));
  };

  // Export to WAV
  const handleExportWav = async () => {
    try {
      const wavBlob = await audioEngine.exportToWav(project);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_master.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error', err);
      alert('Tsy nety ny nanondrana ny raki-peo (Export failed).');
    }
  };

  // Mastering & Mono Handlers
  const handleUpdateMastering = (config: MasteringConfig) => {
    setProject(prev => ({
      ...prev,
      masteringConfig: config,
    }));
  };

  const handleToggleMono = () => {
    setProject(prev => {
      const nextMono = !prev.isMono;
      return {
        ...prev,
        isMono: nextMono,
        masteringConfig: prev.masteringConfig
          ? { ...prev.masteringConfig, isMono: nextMono }
          : {
              preset: 'streaming',
              drive: 3.5,
              ceiling: -0.8,
              stereoWidth: 1.2,
              warmth: 0.35,
              targetLufs: -14,
              isMono: nextMono,
            },
      };
    });
  };

  // Zoom
  const handleZoomIn = () => setZoomLevel(z => Math.min(2.0, z + 0.2));
  const handleZoomOut = () => setZoomLevel(z => Math.max(0.6, z - 0.2));

  // Cycle Grid Snap
  const handleCycleGridSnap = () => {
    const snaps = ['1/4', '1/8', '1/16', '1/32'];
    const idx = snaps.indexOf(gridSnap);
    setGridSnap(snaps[(idx + 1) % snaps.length]);
  };

  const currentSelectedTrack = project.tracks.find(t => t.id === selectedTrackId) || project.tracks[0];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a101d] text-slate-100 select-none">
      {/* 1. TOP BAR */}
      <TopBar
        timeDisplay={timeDisplay}
        bpm={project.bpm}
        metronome={metronome}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        zoomLevel={zoomLevel}
        gridSnap={gridSnap}
        onToggleMetronome={() => setMetronome(!metronome)}
        onOpenModal={(modal) => setActiveModal(modal)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCycleGridSnap={handleCycleGridSnap}
        onChangeBpm={(newBpm) => setProject(p => ({ ...p, bpm: newBpm }))}
      />

      {/* 2. MAIN WORKSPACE (Left Track Headers + Right Timeline) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: + ADD TRACK button & Track Headers list */}
        <div className="w-56 sm:w-64 md:w-72 bg-[#0c1424] border-r border-[#18263f] flex flex-col shrink-0 z-10 shadow-xl">
          {/* Top of left column: Glowing "+ ADD TRACK" button exactly matching the screenshot! */}
          <div className="h-9 px-2 bg-[#0e172a] border-b border-[#1c2c47] flex items-center justify-center shrink-0">
            <button
              onClick={() => setActiveModal('add_track')}
              className="w-full h-7 rounded-lg bg-gradient-to-r from-[#00d2ff]/20 to-[#00f2fe]/20 hover:from-[#00d2ff]/30 hover:to-[#00f2fe]/30 border border-[#00e5ff] text-[#00e5ff] text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.35)] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ADD TRACK</span>
            </button>
          </div>

          {/* Scrollable Track Headers list */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
            {project.tracks.map((track) => (
              <TrackHeader
                key={track.id}
                track={track}
                peakLevel={trackPeaks.get(track.id) || 0}
                isSelected={selectedTrackId === track.id}
                onSelectTrack={(id) => setSelectedTrackId(id)}
                onToggleMute={handleToggleMute}
                onToggleSolo={handleToggleSolo}
                onToggleArmed={handleToggleArmed}
                onChangeVolume={handleChangeVolume}
                onChangePan={handleChangePan}
                onDeleteTrack={handleDeleteTrack}
                onDuplicateTrack={handleDuplicateTrack}
                onOpenTrackFx={(id) => {
                  setSelectedTrackId(id);
                  setActiveModal('fx');
                }}
                onRenameTrack={handleRenameTrack}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Timeline Ruler + Grid Canvas */}
        <div className="flex-1 flex flex-col overflow-auto bg-[#080e1a] relative scrollbar-thin">
          {/* Timeline Bar Ruler */}
          <TimelineRuler
            totalBars={project.totalBars}
            currentBar={currentBar}
            barWidth={barWidth}
            loopStartBar={project.loop.startBar}
            loopEndBar={project.loop.endBar}
            loopEnabled={loop}
            onSeek={handleSeek}
          />

          {/* Main Sequencer Grid Canvas */}
          <div className="flex-1 overflow-auto">
            <TimelineGrid
              tracks={project.tracks}
              currentBar={currentBar}
              totalBars={project.totalBars}
              barWidth={barWidth}
              selectedTrackId={selectedTrackId}
              selectedClipId={selectedClipId}
              onSelectTrack={(id) => setSelectedTrackId(id)}
              onSelectClip={(id) => setSelectedClipId(id)}
              onOpenClipEditor={(clip, track) => {
                setSelectedTrackId(track.id);
                setSelectedClipId(clip.id);
                setActiveModal('piano_roll');
              }}
              onAddClipToTrack={handleAddClipToTrack}
              onMoveClip={() => {}}
            />
          </div>
        </div>
      </div>

      {/* 3. BOTTOM TOOLBAR (Piano Roll, Mixer, EQ, FX, Mastering, Transport, Loop, Mono, Export) */}
      <BottomToolbar
        isPlaying={isPlaying}
        isPaused={isPaused}
        isRecording={isRecording}
        metronome={metronome}
        loop={loop}
        quantize={quantize}
        isMono={project.isMono}
        activeModal={activeModal}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onRewind={handleRewind}
        onFastForward={handleFastForward}
        onToggleRecord={handleToggleRecord}
        onToggleMetronome={() => setMetronome(!metronome)}
        onToggleLoop={() => setLoop(!loop)}
        onToggleQuantize={() => setQuantize(!quantize)}
        onToggleMono={handleToggleMono}
        onOpenModal={(modal) => setActiveModal(modal)}
        onExport={handleExportWav}
      />

      {/* 4. MODALS & SUB-PANELS */}

      {/* Add Track Instrument Library Modal */}
      <AddTrackModal
        isOpen={activeModal === 'add_track'}
        onClose={() => setActiveModal(null)}
        onAddTrack={handleAddTrack}
        onPreviewSound={(inst) => audioEngine.previewInstrumentNote(inst, 65, 0.9)}
      />

      {/* Multi-Effects Rack Modal ("tena mitadiava effet maro ataovy ao") */}
      <FXRackModal
        isOpen={activeModal === 'fx'}
        onClose={() => setActiveModal(null)}
        tracks={project.tracks}
        selectedTrackId={selectedTrackId}
        onSelectTrack={(id) => setSelectedTrackId(id)}
        trackEffects={currentSelectedTrack?.effects || createDefaultEffects()}
        masterEffects={project.masterEffects}
        onChangeEffects={handleChangeEffects}
      />

      {/* 5-Band Parametric Graphic EQ Modal */}
      <EQModal
        isOpen={activeModal === 'eq'}
        onClose={() => setActiveModal(null)}
        tracks={project.tracks}
        selectedTrackId={selectedTrackId}
        onSelectTrack={(id) => setSelectedTrackId(id)}
        trackEffects={currentSelectedTrack?.effects || createDefaultEffects()}
        masterEffects={project.masterEffects}
        onChangeEffects={handleChangeEffects}
      />

      {/* Studio Mixing Console Modal */}
      <MixerModal
        isOpen={activeModal === 'mixer'}
        onClose={() => setActiveModal(null)}
        tracks={project.tracks}
        trackPeaks={trackPeaks}
        masterPeak={masterPeak}
        masterVolume={project.masterVolume}
        onChangeMasterVolume={(vol) => setProject(p => ({ ...p, masterVolume: vol }))}
        onChangeTrackVolume={handleChangeVolume}
        onChangeTrackPan={handleChangePan}
        onToggleMute={handleToggleMute}
        onToggleSolo={handleToggleSolo}
        onOpenTrackFx={(id) => {
          setSelectedTrackId(id);
          setActiveModal('fx');
        }}
      />

      {/* Piano Roll & Drum Sequencer Modal */}
      <PianoRollModal
        isOpen={activeModal === 'piano_roll'}
        onClose={() => setActiveModal(null)}
        tracks={project.tracks}
        selectedTrackId={selectedTrackId}
        onSelectTrack={(id) => setSelectedTrackId(id)}
        onUpdateClipNotes={handleUpdateClipNotes}
        onUpdateClipDrums={handleUpdateClipDrums}
        onPreviewNote={(inst, note) => audioEngine.previewInstrumentNote(inst, note, 0.9)}
        onPreviewDrum={(drum) => audioEngine.previewDrumHit(drum)}
      />

      {/* Real-Time Master Audio Spectrum & Oscilloscope Modal */}
      <VisualizerModal
        isOpen={activeModal === 'visualizer'}
        onClose={() => setActiveModal(null)}
        audioEngine={audioEngine}
      />

      {/* Project Manager & Settings Modal */}
      <ProjectMenuModal
        isOpen={activeModal === 'project_menu'}
        onClose={() => setActiveModal(null)}
        project={project}
        onLoadProject={(loaded) => {
          pushHistory(project);
          setProject(loaded);
          setSelectedTrackId(loaded.tracks[0]?.id || null);
        }}
        onExportWav={handleExportWav}
        onOpenInstallApk={() => setActiveModal('install_apk')}
      />

      {/* Install Mobile App / APK Guidance Modal */}
      <InstallApkModal
        isOpen={activeModal === 'install_apk'}
        onClose={() => setActiveModal(null)}
      />

      {/* 1-Click Studio & AI Mastering Modal ("tsindrina manome type mastering ary vita eo ny mastering") */}
      <MasteringModal
        isOpen={activeModal === 'mastering'}
        onClose={() => setActiveModal(null)}
        project={project}
        onUpdateMastering={handleUpdateMastering}
        onToggleMono={handleToggleMono}
        onExportMasteredWav={handleExportWav}
      />
    </div>
  );
}
