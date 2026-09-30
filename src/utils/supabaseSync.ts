import { getSupabaseClient } from './supabase';
import {
  UserProfile,
  Playlist,
  DailyTarget,
  Chapter,
  StudySession,
} from '../types';

export const SUPABASE_SQL_SETUP = `-- Run this in your Supabase SQL Editor (Project: gmutpgntebhguedpoanh)
-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  dream_college TEXT,
  target_percentile TEXT,
  target_year INT DEFAULT 2027,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Daily Targets Table
CREATE TABLE IF NOT EXISTS public.daily_targets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  priority TEXT NOT NULL,
  estimated_minutes INT DEFAULT 45,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Playlists & Progress Table
CREATE TABLE IF NOT EXISTS public.playlists (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  channel_title TEXT,
  playlist_url TEXT,
  playlist_id TEXT,
  subject TEXT NOT NULL,
  current_video_index INT DEFAULT 0,
  videos JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Chapters Tracker Table
CREATE TABLE IF NOT EXISTS public.chapters (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  subject TEXT NOT NULL,
  name TEXT NOT NULL,
  class_level TEXT NOT NULL,
  theory TEXT NOT NULL,
  questions_solved INT DEFAULT 0,
  questions_target INT DEFAULT 80,
  pyqs_status TEXT NOT NULL,
  revision_count INT DEFAULT 0,
  formula_sheet BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Study Sessions & Calendar History Table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  timestamp BIGINT NOT NULL,
  topic TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional / public for anon key)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anon public access for easy sync
CREATE POLICY "Public read/write profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write targets" ON public.daily_targets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write playlists" ON public.playlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write chapters" ON public.chapters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write sessions" ON public.study_sessions FOR ALL USING (true) WITH CHECK (true);
`;

export async function syncUserToSupabase(user: UserProfile): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('user_profiles').upsert(
      {
        id: user.id || 'default_user',
        name: user.name,
        email: user.email,
        dream_college: user.dreamCollege,
        target_percentile: user.targetPercentile,
        target_year: user.targetYear || 2027,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    return !error;
  } catch {
    return false;
  }
}

export async function syncDailyTargetsToSupabase(
  userId: string,
  targets: DailyTarget[]
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || targets.length === 0) return false;

  try {
    const rows = targets.map((t) => ({
      id: t.id,
      user_id: userId,
      title: t.title,
      subject: t.subject,
      priority: t.priority,
      estimated_minutes: t.estimatedMinutes,
      completed: t.completed,
      completed_at: t.completedAt || null,
      date: t.date,
      notes: t.notes || null,
      created_at: t.createdAt || new Date().toISOString(),
    }));

    const { error } = await client.from('daily_targets').upsert(rows, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

export async function syncPlaylistsToSupabase(
  userId: string,
  playlists: Playlist[]
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || playlists.length === 0) return false;

  try {
    const rows = playlists.map((p) => ({
      id: p.id,
      user_id: userId,
      title: p.title,
      channel_title: p.channelTitle,
      playlist_url: p.playlistUrl,
      playlist_id: p.playlistId || null,
      subject: p.subject,
      current_video_index: p.currentVideoIndex,
      videos: p.videos,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client.from('playlists').upsert(rows, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

export async function syncChaptersToSupabase(
  userId: string,
  chapters: Chapter[]
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || chapters.length === 0) return false;

  try {
    const rows = chapters.map((c) => ({
      id: c.id,
      user_id: userId,
      subject: c.subject,
      name: c.name,
      class_level: c.classLevel,
      theory: c.theory,
      questions_solved: c.questionsSolved,
      questions_target: c.questionsTarget,
      pyqs_status: c.pyqsStatus,
      revision_count: c.revisionCount,
      formula_sheet: c.formulaSheet,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client.from('chapters').upsert(rows, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

export async function syncSessionsToSupabase(
  userId: string,
  sessions: StudySession[]
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || sessions.length === 0) return false;

  try {
    const rows = sessions.map((s) => ({
      id: s.id,
      user_id: userId,
      date: s.date,
      subject: s.subject,
      duration_minutes: s.durationMinutes,
      timestamp: s.timestamp,
      topic: s.topic || null,
      notes: s.notes || null,
    }));

    const { error } = await client.from('study_sessions').upsert(rows, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

export async function pullAllFromSupabase(userId: string): Promise<{
  user?: Partial<UserProfile>;
  targets?: DailyTarget[];
  playlists?: Playlist[];
  chapters?: Chapter[];
  sessions?: StudySession[];
} | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const results: any = {};

    // 1. Profile
    const { data: profileData } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileData) {
      results.user = {
        name: profileData.name,
        email: profileData.email,
        dreamCollege: profileData.dream_college,
        targetPercentile: profileData.target_percentile,
        targetYear: profileData.target_year,
      };
    }

    // 2. Daily Targets
    const { data: targetsData } = await client
      .from('daily_targets')
      .select('*')
      .order('created_at', { ascending: false });

    if (targetsData && targetsData.length > 0) {
      results.targets = targetsData.map((t: any) => ({
        id: t.id,
        title: t.title,
        subject: t.subject,
        priority: t.priority,
        estimatedMinutes: t.estimated_minutes,
        completed: t.completed,
        completedAt: t.completed_at,
        date: t.date,
        notes: t.notes,
        createdAt: t.created_at,
      }));
    }

    // 3. Playlists
    const { data: playlistsData } = await client.from('playlists').select('*');
    if (playlistsData && playlistsData.length > 0) {
      results.playlists = playlistsData.map((p: any) => ({
        id: p.id,
        title: p.title,
        channelTitle: p.channel_title,
        playlistUrl: p.playlist_url,
        playlistId: p.playlist_id,
        subject: p.subject,
        currentVideoIndex: p.current_video_index || 0,
        videos: p.videos || [],
        createdAt: p.created_at,
      }));
    }

    // 4. Chapters
    const { data: chaptersData } = await client.from('chapters').select('*');
    if (chaptersData && chaptersData.length > 0) {
      results.chapters = chaptersData.map((c: any) => ({
        id: c.id,
        subject: c.subject,
        name: c.name,
        classLevel: c.class_level,
        theory: c.theory,
        questionsSolved: c.questions_solved,
        questionsTarget: c.questions_target,
        pyqsStatus: c.pyqs_status,
        revisionCount: c.revision_count,
        formulaSheet: c.formula_sheet,
      }));
    }

    // 5. Sessions
    const { data: sessionsData } = await client
      .from('study_sessions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (sessionsData && sessionsData.length > 0) {
      results.sessions = sessionsData.map((s: any) => ({
        id: s.id,
        date: s.date,
        subject: s.subject,
        durationMinutes: s.duration_minutes,
        timestamp: Number(s.timestamp),
        topic: s.topic,
        notes: s.notes,
      }));
    }

    return results;
  } catch (err) {
    console.warn('Failed pulling data from Supabase:', err);
    return null;
  }
}
