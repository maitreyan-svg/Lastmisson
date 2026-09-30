import React, { useState, useEffect, useRef } from 'react';
import {
  getStoredUser,
  saveStoredUser,
  getStoredTheme,
  saveStoredTheme,
  getStoredPlaylists,
  saveStoredPlaylists,
  getStoredDailyTargets,
  saveStoredDailyTargets,
  getStoredChapters,
  saveStoredChapters,
  getStoredSessions,
  saveStoredSessions,
} from './utils/storage';
import {
  syncUserToSupabase,
  syncDailyTargetsToSupabase,
  syncPlaylistsToSupabase,
  syncChaptersToSupabase,
  syncSessionsToSupabase,
  pullAllFromSupabase,
} from './utils/supabaseSync';
import {
  UserProfile,
  Playlist,
  DailyTarget,
  Chapter,
  StudySession,
} from './types';
import { Header, ActiveTab } from './components/Header';
import { CountdownBanner } from './components/CountdownBanner';
import { PlaylistPlayer } from './components/PlaylistPlayer/PlaylistPlayer';
import { DailyTargets } from './components/DailyTargets/DailyTargets';
import { StudyTimer } from './components/StudyTimer/StudyTimer';
import { ChapterTracker } from './components/ChapterTracker/ChapterTracker';
import { StudyCalendar } from './components/StudyCalendar/StudyCalendar';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getStoredTheme());
  const isDark = theme === 'dark';

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('player');

  // Core App Data States (with localStorage sync)
  const [user, setUser] = useState<UserProfile>(() => getStoredUser());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => getStoredPlaylists());
  const [activePlaylistId, setActivePlaylistId] = useState<string>(() =>
    playlists.length > 0 ? playlists[0].id : ''
  );
  const [dailyTargets, setDailyTargets] = useState<DailyTarget[]>(() => getStoredDailyTargets());
  const [chapters, setChapters] = useState<Chapter[]>(() => getStoredChapters());
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => getStoredSessions());

  // Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Sync theme to root class
  useEffect(() => {
    saveStoredTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className =
        'bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white min-h-screen';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className =
        'bg-zinc-100 text-zinc-900 antialiased selection:bg-indigo-500 selection:text-white min-h-screen';
    }
  }, [theme]);

  // Initial pull from Backend / Supabase on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const res = await fetch(`/api/sync-all?userId=${encodeURIComponent(user.id)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            if (json.data.user) setUser((prev) => ({ ...prev, ...json.data.user }));
            if (json.data.targets && json.data.targets.length > 0) setDailyTargets(json.data.targets);
            if (json.data.playlists && json.data.playlists.length > 0) setPlaylists(json.data.playlists);
            if (json.data.chapters && json.data.chapters.length > 0) setChapters(json.data.chapters);
            if (json.data.sessions && json.data.sessions.length > 0) setStudySessions(json.data.sessions);
          }
        }
      } catch (err) {
        // Fallback to direct client sync if running purely client-side
        const cloudData = await pullAllFromSupabase(user.id);
        if (cloudData) {
          if (cloudData.user) setUser((prev) => ({ ...prev, ...cloudData.user }));
          if (cloudData.targets && cloudData.targets.length > 0) setDailyTargets(cloudData.targets);
          if (cloudData.playlists && cloudData.playlists.length > 0) setPlaylists(cloudData.playlists);
          if (cloudData.chapters && cloudData.chapters.length > 0) setChapters(cloudData.chapters);
          if (cloudData.sessions && cloudData.sessions.length > 0) setStudySessions(cloudData.sessions);
        }
      }
    }
    loadBackendData();
  }, [user.id]);

  // Background sync helper to backend
  const syncToBackend = (payload: any) => {
    try {
      fetch('/api/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...payload }),
      }).catch(() => {});
    } catch {}
  };

  // Sync playlists
  useEffect(() => {
    saveStoredPlaylists(playlists);
    syncPlaylistsToSupabase(user.id, playlists);
    syncToBackend({ playlists });
  }, [playlists, user.id]);

  // Sync targets
  useEffect(() => {
    saveStoredDailyTargets(dailyTargets);
    syncDailyTargetsToSupabase(user.id, dailyTargets);
    syncToBackend({ targets: dailyTargets });
  }, [dailyTargets, user.id]);

  // Sync chapters
  useEffect(() => {
    saveStoredChapters(chapters);
    syncChaptersToSupabase(user.id, chapters);
    syncToBackend({ chapters });
  }, [chapters, user.id]);

  // Sync sessions
  useEffect(() => {
    saveStoredSessions(studySessions);
    syncSessionsToSupabase(user.id, studySessions);
    syncToBackend({ sessions: studySessions });
  }, [studySessions, user.id]);

  // Sync user profile
  useEffect(() => {
    syncUserToSupabase(user);
    syncToBackend({ user });
  }, [user]);

  // Calculate days remaining to Jan 22, 2027
  const targetExamDate = new Date('2027-01-22T09:00:00').getTime();
  const diffTime = targetExamDate - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Handlers
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    saveStoredUser(updated);
    syncUserToSupabase(updated);
  };

  // Manual Full Sync & Pull functions
  const handleSyncAll = async () => {
    await Promise.all([
      syncUserToSupabase(user),
      syncDailyTargetsToSupabase(user.id, dailyTargets),
      syncPlaylistsToSupabase(user.id, playlists),
      syncChaptersToSupabase(user.id, chapters),
      syncSessionsToSupabase(user.id, studySessions),
    ]);
  };

  const handlePullAll = async () => {
    const cloudData = await pullAllFromSupabase(user.id);
    if (cloudData) {
      if (cloudData.user) {
        setUser((prev) => ({ ...prev, ...cloudData.user }));
      }
      if (cloudData.targets && cloudData.targets.length > 0) {
        setDailyTargets(cloudData.targets);
      }
      if (cloudData.playlists && cloudData.playlists.length > 0) {
        setPlaylists(cloudData.playlists);
      }
      if (cloudData.chapters && cloudData.chapters.length > 0) {
        setChapters(cloudData.chapters);
      }
      if (cloudData.sessions && cloudData.sessions.length > 0) {
        setStudySessions(cloudData.sessions);
      }
    }
  };

  // Playlist handlers
  const handleUpdatePlaylist = (updated: Playlist) => {
    setPlaylists((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddPlaylist = (newPl: Playlist) => {
    setPlaylists((prev) => [newPl, ...prev]);
    setActivePlaylistId(newPl.id);
  };

  const handleDeletePlaylist = (id: string) => {
    const remaining = playlists.filter((p) => p.id !== id);
    setPlaylists(remaining);
    if (remaining.length > 0) {
      setActivePlaylistId(remaining[0].id);
    }
  };

  // Daily target handlers
  const handleAddTarget = (target: DailyTarget) => {
    setDailyTargets((prev) => [target, ...prev]);
  };

  const handleUpdateTarget = (updated: DailyTarget) => {
    setDailyTargets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTarget = (id: string) => {
    setDailyTargets((prev) => prev.filter((t) => t.id !== id));
  };

  // Chapter handlers
  const handleUpdateChapter = (updated: Chapter) => {
    setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleAddChapter = (newChap: Chapter) => {
    setChapters((prev) => [...prev, newChap]);
  };

  const handleDeleteChapter = (id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
  };

  // Session handler (from Timer or Manual Log)
  const handleAddSession = (session: StudySession) => {
    setStudySessions((prev) => [session, ...prev]);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'
      }`}
    >
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        daysRemaining={daysRemaining}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Prominent JEE Countdown Banner */}
        <CountdownBanner isDark={isDark} />

        {/* Tab Content */}
        {activeTab === 'player' && (
          <PlaylistPlayer
            playlists={playlists}
            activePlaylistId={activePlaylistId}
            onSelectPlaylist={setActivePlaylistId}
            onUpdatePlaylist={handleUpdatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onAddPlaylist={handleAddPlaylist}
            isDark={isDark}
          />
        )}

        {activeTab === 'targets' && (
          <DailyTargets
            targets={dailyTargets}
            onAddTarget={handleAddTarget}
            onUpdateTarget={handleUpdateTarget}
            onDeleteTarget={handleDeleteTarget}
            isDark={isDark}
          />
        )}

        {activeTab === 'timer' && (
          <StudyTimer onLogSession={handleAddSession} isDark={isDark} />
        )}

        {activeTab === 'chapters' && (
          <ChapterTracker
            chapters={chapters}
            onUpdateChapter={handleUpdateChapter}
            onAddChapter={handleAddChapter}
            onDeleteChapter={handleDeleteChapter}
            isDark={isDark}
          />
        )}

        {activeTab === 'calendar' && (
          <StudyCalendar
            sessions={studySessions}
            targets={dailyTargets}
            onAddSession={handleAddSession}
            isDark={isDark}
          />
        )}
      </main>

      {/* Minimal Distraction-Free Footer */}
      <footer
        className={`mt-auto border-t py-4 text-center text-xs transition-colors ${
          isDark
            ? 'border-zinc-800/80 bg-zinc-950 text-zinc-400'
            : 'border-zinc-200 bg-white text-zinc-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            JEE Mission 2027 • Target: <strong className="text-zinc-200">22 Jan 2027</strong> • Aim for {user.dreamCollege || 'IIT Bombay'}
          </p>
          <p className="text-[11px] text-zinc-400">
            Distraction-Free Environment • No Recommendations • Pure Study Focus
          </p>
        </div>
      </footer>

      {/* Login / Signup / Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onUpdateUser={handleUpdateUser}
        isDark={isDark}
      />
    </div>
  );
}
