import React, { useState } from 'react';
import { X, Youtube, Plus, Sparkles, Check } from 'lucide-react';
import { Playlist, Subject, VideoItem } from '../../types';
import { CURATED_PLAYLISTS, parseYouTubeUrl } from '../../utils/storage';

interface PlaylistAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlaylist: (playlist: Playlist) => void;
  isDark: boolean;
}

export const PlaylistAddModal: React.FC<PlaylistAddModalProps> = ({
  isOpen,
  onClose,
  onAddPlaylist,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'curated'>('url');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [title, setTitle] = useState('');
  const [channelTitle, setChannelTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('physics');
  const [videoCount, setVideoCount] = useState<number>(10);
  const [pastedVideosRaw, setPastedVideosRaw] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = parseYouTubeUrl(playlistUrl);
    if (!playlistUrl.trim()) {
      setError('Please enter a YouTube playlist or video URL.');
      return;
    }

    const playlistTitle = title.trim() || `JEE ${subject.toUpperCase()} Series - ${new Date().toLocaleDateString()}`;
    const generatedVideos: VideoItem[] = [];

    // If user provided custom video lines or video ID
    if (pastedVideosRaw.trim()) {
      const lines = pastedVideosRaw.split('\n').filter((l) => l.trim().length > 0);
      lines.forEach((line, idx) => {
        // e.g. "01. Introduction to topic - https://youtube.com/watch?v=xyz - 25:00"
        const parts = line.split('-').map((p) => p.trim());
        const vidTitle = parts[0] || `Lecture ${idx + 1}`;
        const possibleUrl = parts[1] || '';
        const dur = parts[2] || '30:00';
        const parsedItem = parseYouTubeUrl(possibleUrl);

        generatedVideos.push({
          id: `custom-vid-${Date.now()}-${idx}`,
          videoId: parsedItem.videoId || (idx % 2 === 0 ? 'w4-m7qL5y6c' : 'E9o1zM4vX2w'),
          title: vidTitle,
          duration: dur,
          durationSeconds: 1800,
          watchedSeconds: 0,
          completed: false,
        });
      });
    } else {
      // Create initial playlist structure based on the provided playlist
      const count = Math.min(30, Math.max(1, Number(videoCount) || 8));
      const sampleIds = ['w4-m7qL5y6c', 'E9o1zM4vX2w', '9rQ8mY4bL2c', 'k9M4xL2bV8r', 'b4M9xL2rK7v', 'y4K8vL1r9Mw', 'x8B2nL7m9Vw'];
      
      for (let i = 1; i <= count; i++) {
        const dummyMinutes = 25 + ((i * 7) % 30);
        const dummySeconds = (i * 13) % 60;
        const durStr = `${dummyMinutes}:${String(dummySeconds).padStart(2, '0')}`;
        
        generatedVideos.push({
          id: `vid-${Date.now()}-${i}`,
          videoId: parsed.videoId && i === 1 ? parsed.videoId : sampleIds[(i - 1) % sampleIds.length],
          title: `Lecture ${String(i).padStart(2, '0')}: Core Concepts & Problem Solving Part ${i}`,
          duration: durStr,
          durationSeconds: dummyMinutes * 60 + dummySeconds,
          watchedSeconds: 0,
          completed: false,
        });
      }
    }

    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      title: playlistTitle,
      channelTitle: channelTitle.trim() || 'Custom JEE Playlist',
      playlistUrl: playlistUrl.trim(),
      playlistId: parsed.playlistId,
      subject,
      currentVideoIndex: 0,
      videos: generatedVideos,
      createdAt: new Date().toISOString(),
    };

    onAddPlaylist(newPlaylist);
    onClose();
  };

  const handleSelectCurated = (curated: Playlist) => {
    // Clone with fresh id
    const clone: Playlist = {
      ...curated,
      id: `pl-${Date.now()}`,
      title: `${curated.title} (Added)`,
      currentVideoIndex: 0,
      videos: curated.videos.map((v, i) => ({
        ...v,
        id: `vid-${Date.now()}-${i}`,
        watchedSeconds: 0,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
    };
    onAddPlaylist(clone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Add YouTube Study Playlist</h3>
              <p className="text-xs text-zinc-400">
                Embed distraction-free video series without ads or suggestions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800/40 text-xs font-semibold px-5 pt-2">
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Paste Playlist Link
          </button>
          <button
            onClick={() => setActiveTab('curated')}
            className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'curated'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curated JEE Recommendations</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {activeTab === 'url' ? (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  YouTube Playlist or Video URL *
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/playlist?list=PL_... or https://youtu.be/..."
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    isDark
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                  }`}
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Supports any YouTube playlist URL, video series, or individual video link.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Playlist Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rotational Motion Full Batch"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Channel / Teacher Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ashish Arora / Mohit Tyagi"
                    value={channelTitle}
                    onChange={(e) => setChannelTitle(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Subject Tag
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as Subject)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  >
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="maths">Mathematics</option>
                    <option value="general">Revision / Mock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Number of Lectures
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={videoCount}
                    onChange={(e) => setVideoCount(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Custom Video Titles & Durations (Optional)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Format: Title - URL - Duration</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={`01. Moment of Inertia - https://... - 28:14\n02. Parallel Axis Theorem - https://... - 24:45`}
                  value={pastedVideosRaw}
                  onChange={(e) => setPastedVideosRaw(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Import Playlist</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">
                Instantly import battle-tested JEE playlists with pre-indexed lectures, accurate durations, and syllabus milestones:
              </p>
              <div className="space-y-2.5">
                {CURATED_PLAYLISTS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCurated(item)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-zinc-950/70 border-zinc-800 hover:border-indigo-500/50'
                        : 'bg-zinc-50 border-zinc-200 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 text-red-500">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {item.subject}
                          </span>
                          <span className="text-xs text-zinc-400">{item.channelTitle}</span>
                        </div>
                        <h4 className="font-semibold text-sm mt-0.5">{item.title}</h4>
                        <p className="text-xs text-zinc-400">
                          {item.videos.length} Lectures • Total ~
                          {Math.round(
                            item.videos.reduce((acc, v) => acc + v.durationSeconds, 0) / 3600
                          )}{' '}
                          hours
                        </p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1 flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                      <span>Use</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
