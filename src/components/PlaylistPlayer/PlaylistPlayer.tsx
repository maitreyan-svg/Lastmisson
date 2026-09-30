import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  Circle,
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  Save,
  Check,
  Search,
  ListVideo,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Playlist, VideoItem } from '../../types';
import { PlaylistAddModal } from './PlaylistAddModal';
import { playTargetCheckSound } from '../../utils/audio';

interface PlaylistPlayerProps {
  playlists: Playlist[];
  activePlaylistId: string;
  onSelectPlaylist: (id: string) => void;
  onUpdatePlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (id: string) => void;
  onAddPlaylist: (playlist: Playlist) => void;
  isDark: boolean;
}

export const PlaylistPlayer: React.FC<PlaylistPlayerProps> = ({
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  onUpdatePlaylist,
  onDeletePlaylist,
  onAddPlaylist,
  isDark,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) || playlists[0];
  const currentVideoIndex = activePlaylist ? activePlaylist.currentVideoIndex : 0;
  const currentVideo: VideoItem | undefined = activePlaylist?.videos[currentVideoIndex];

  // Watch position ticker: simulate auto-updating watched position while watching
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    if (currentVideo) {
      setNoteText(currentVideo.notes || '');
    }
  }, [currentVideo?.id]);

  // Periodic position auto-saver
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentVideo || currentVideo.completed) return;

      const now = Date.now();
      const elapsedSec = Math.floor((now - lastTickRef.current) / 1000);
      lastTickRef.current = now;

      // Only increment if tab is visible and active
      if (document.visibilityState === 'visible' && elapsedSec > 0 && elapsedSec < 15) {
        const nextWatched = Math.min(
          currentVideo.durationSeconds,
          currentVideo.watchedSeconds + elapsedSec
        );

        if (nextWatched !== currentVideo.watchedSeconds) {
          const updatedVideos = activePlaylist.videos.map((v, i) =>
            i === currentVideoIndex ? { ...v, watchedSeconds: nextWatched } : v
          );
          onUpdatePlaylist({
            ...activePlaylist,
            videos: updatedVideos,
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activePlaylist, currentVideo, currentVideoIndex, onUpdatePlaylist]);

  if (!activePlaylist) {
    return (
      <div
        className={`p-12 text-center rounded-2xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}
      >
        <ListVideo className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold">No Playlist Added</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-5">
          Paste any YouTube study playlist or choose from curated JEE lecture series to watch distraction-free.
        </p>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Playlist</span>
        </button>
        <PlaylistAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddPlaylist={onAddPlaylist}
          isDark={isDark}
        />
      </div>
    );
  }

  const handleSelectVideo = (index: number) => {
    lastTickRef.current = Date.now();
    const updated = {
      ...activePlaylist,
      currentVideoIndex: index,
    };
    onUpdatePlaylist(updated);
  };

  const handleToggleComplete = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetVideo = activePlaylist.videos[index];
    const willComplete = !targetVideo.completed;

    if (willComplete) {
      playTargetCheckSound();
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {}
    }

    const updatedVideos = activePlaylist.videos.map((v, i) =>
      i === index
        ? {
            ...v,
            completed: willComplete,
            watchedSeconds: willComplete ? v.durationSeconds : v.watchedSeconds,
          }
        : v
    );

    onUpdatePlaylist({
      ...activePlaylist,
      videos: updatedVideos,
    });
  };

  const handleSaveNotes = () => {
    if (!currentVideo) return;
    const updatedVideos = activePlaylist.videos.map((v, i) =>
      i === currentVideoIndex ? { ...v, notes: noteText } : v
    );
    onUpdatePlaylist({
      ...activePlaylist,
      videos: updatedVideos,
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const completedCount = activePlaylist.videos.filter((v) => v.completed).length;
  const progressPercent = Math.round(
    (completedCount / Math.max(1, activePlaylist.videos.length)) * 100
  );

  const filteredVideos = activePlaylist.videos
    .map((v, originalIndex) => ({ video: v, originalIndex }))
    .filter(({ video }) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // Construct clean embed url
  // Using youtube-nocookie and standard parameters for distraction-free watching
  const embedUrl = currentVideo?.videoId
    ? `https://www.youtube-nocookie.com/embed/${currentVideo.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3`
    : activePlaylist.playlistId
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${activePlaylist.playlistId}&enablejsapi=1`
    : '';

  return (
    <div className={`space-y-4 ${cinemaMode ? 'fixed inset-0 z-50 p-4 bg-black/95 overflow-y-auto' : ''}`}>
      {/* Top Playlist Switcher & Meta Bar */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isDark
            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}
      >
        {/* Left: Current Playlist Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-indigo-400 flex items-center gap-1">
              <ListVideo className="w-4 h-4" />
              Playlist:
            </span>
            <select
              value={activePlaylist.id}
              onChange={(e) => onSelectPlaylist(e.target.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[260px] truncate ${
                isDark ? 'bg-zinc-950 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
              }`}
            >
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.title} ({pl.subject.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>•</span>
            <span>{activePlaylist.channelTitle}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold font-mono-nums">
              {completedCount}/{activePlaylist.videos.length} completed ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Right Buttons: Add Playlist, Cinema Mode, Delete */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setCinemaMode(!cinemaMode)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              cinemaMode
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : isDark
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-black'
            }`}
            title="Distraction-Free Cinema Mode"
          >
            {cinemaMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{cinemaMode ? 'Exit Focus' : 'Cinema Focus'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Playlist</span>
          </button>

          {playlists.length > 1 && (
            <button
              onClick={() => {
                if (window.confirm(`Remove playlist "${activePlaylist.title}"?`)) {
                  onDeletePlaylist(activePlaylist.id);
                }
              }}
              className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Remove this playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Player Grid: 70% Video + 30% Playlist Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Video Player Column */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Iframe Container */}
          <div
            className={`w-full aspect-video rounded-2xl overflow-hidden border relative bg-black shadow-2xl ${
              isDark ? 'border-zinc-800' : 'border-zinc-300'
            }`}
          >
            {embedUrl ? (
              <iframe
                key={currentVideo?.videoId || 'embed'}
                src={embedUrl}
                title={currentVideo?.title || 'JEE Lecture'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
                <Play className="w-12 h-12 mb-2 text-zinc-600" />
                <span>Select a lecture to start streaming</span>
              </div>
            )}
          </div>

          {/* Video Control Bar & Title */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Lecture {currentVideoIndex + 1} of {activePlaylist.videos.length}
                  </span>
                  {currentVideo && (
                    <span className="text-xs font-mono-nums text-zinc-400">
                      Duration: {currentVideo.duration}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold mt-1 line-clamp-1">
                  {currentVideo?.title || 'No Lecture Selected'}
                </h3>
              </div>

              {/* Navigation and Completion */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  disabled={currentVideoIndex === 0}
                  onClick={() => handleSelectVideo(currentVideoIndex - 1)}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none ${
                    isDark ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                  }`}
                  title="Previous Lecture"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  disabled={currentVideoIndex >= activePlaylist.videos.length - 1}
                  onClick={() => handleSelectVideo(currentVideoIndex + 1)}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none ${
                    isDark ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                  }`}
                  title="Next Lecture"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleToggleComplete(currentVideoIndex)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                    currentVideo?.completed
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : isDark
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300'
                  }`}
                >
                  {currentVideo?.completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      <span>Mark Watched</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Watched Progress in this video */}
            {currentVideo && (
              <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Auto-saved position:{' '}
                    <strong className="text-zinc-200 font-mono-nums">
                      {formatTime(currentVideo.watchedSeconds)} / {currentVideo.duration}
                    </strong>
                  </span>
                </span>
                <span className="font-mono-nums text-[11px]">
                  {Math.round(
                    (currentVideo.watchedSeconds / Math.max(1, currentVideo.durationSeconds)) * 100
                  )}
                  % done
                </span>
              </div>
            )}
          </div>

          {/* Quick Notes Panel for this Lecture */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                Lecture Short Notes & Formulae
              </span>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors"
              >
                {isSavedNotice ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSavedNotice ? 'Saved!' : 'Save Notes'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Jot down key formulae, trick points, or timestamp bookmarks (e.g. 14:20 - Perpendicular axis theorem proof)..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDark
                  ? 'bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
              }`}
            />
          </div>
        </div>

        {/* Sidebar: Lecture List Column */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div
            className={`p-4 rounded-2xl border flex flex-col h-[640px] ${
              isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            {/* Sidebar Header */}
            <div className="pb-3 border-b border-zinc-800/50">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <span>Playlist Lectures</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono-nums">
                    {activePlaylist.videos.length}
                  </span>
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{progressPercent}% Complete</span>
                </div>
              </div>

              {/* Search in playlist */}
              <div className="mt-3 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search lecture topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                  }`}
                />
              </div>
            </div>

            {/* Videos Scroll Area */}
            <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1">
              {filteredVideos.map(({ video, originalIndex }) => {
                const isActive = originalIndex === currentVideoIndex;
                const watchedPercent = Math.min(
                  100,
                  Math.round((video.watchedSeconds / Math.max(1, video.durationSeconds)) * 100)
                );

                return (
                  <div
                    key={video.id}
                    onClick={() => handleSelectVideo(originalIndex)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs relative group ${
                      isActive
                        ? isDark
                          ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-950/50'
                          : 'bg-indigo-50/90 border-indigo-400 text-indigo-950'
                        : isDark
                        ? 'bg-zinc-950/40 border-zinc-800/60 hover:bg-zinc-800/40'
                        : 'bg-zinc-50/70 border-zinc-200/80 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Checkmark or Play Icon */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleComplete(originalIndex, e)}
                        className="mt-0.5 text-zinc-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                      >
                        {video.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isActive ? (
                          <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500" />
                        )}
                      </button>

                      {/* Video info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-mono-nums text-[10px] font-bold ${
                              isActive ? 'text-indigo-400' : 'text-zinc-400'
                            }`}
                          >
                            #{String(originalIndex + 1).padStart(2, '0')}
                          </span>
                          <span className="font-mono-nums text-[11px] text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {video.duration}
                          </span>
                        </div>

                        <p
                          className={`font-medium line-clamp-2 mt-0.5 ${
                            video.completed ? 'line-through text-zinc-400' : isActive ? 'font-bold' : ''
                          }`}
                        >
                          {video.title}
                        </p>

                        {/* Watched progress bar inside list item */}
                        <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              video.completed ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${video.completed ? 100 : watchedPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredVideos.length === 0 && (
                <div className="text-center py-10 text-xs text-zinc-400">
                  No lectures found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PlaylistAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPlaylist={onAddPlaylist}
        isDark={isDark}
      />
    </div>
  );
};
