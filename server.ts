import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Supabase Backend Configuration
const SUPABASE_PROJECT_ID = 'gmutpgntebhguedpoanh';
const SUPABASE_REGION = 'ap-southeast-1';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

let supabase: SupabaseClient | null = null;
if (SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    console.log(`[Supabase] Backend connected to project ${SUPABASE_PROJECT_ID} (${SUPABASE_REGION})`);
  } catch (err) {
    console.warn('[Supabase] Client initialization warning:', err);
  }
} else {
  console.log(`[Supabase] Running with target project ${SUPABASE_PROJECT_ID} (${SUPABASE_REGION})`);
}

// In-memory server fallback cache to ensure instant persistence
interface StorageCache {
  user: any;
  targets: any[];
  playlists: any[];
  chapters: any[];
  sessions: any[];
}

const serverStorage: Record<string, StorageCache> = {};

function getOrCreateUserCache(userId: string): StorageCache {
  if (!serverStorage[userId]) {
    serverStorage[userId] = {
      user: null,
      targets: [],
      playlists: [],
      chapters: [],
      sessions: [],
    };
  }
  return serverStorage[userId];
}

// --- Backend API Routes ---

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    supabaseProjectId: SUPABASE_PROJECT_ID,
    region: SUPABASE_REGION,
    timestamp: new Date().toISOString(),
  });
});

// Full state sync (pull)
app.get('/api/sync-all', async (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default_user';
  const cache = getOrCreateUserCache(userId);

  // If Supabase is configured with a key, try pulling from Supabase
  if (supabase) {
    try {
      const [userRes, targetsRes, playlistsRes, chaptersRes, sessionsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('daily_targets').select('*').eq('user_id', userId),
        supabase.from('playlists').select('*').eq('user_id', userId),
        supabase.from('chapters').select('*').eq('user_id', userId),
        supabase.from('study_sessions').select('*').eq('user_id', userId),
      ]);

      if (userRes.data) cache.user = userRes.data;
      if (targetsRes.data && targetsRes.data.length > 0) cache.targets = targetsRes.data;
      if (playlistsRes.data && playlistsRes.data.length > 0) cache.playlists = playlistsRes.data;
      if (chaptersRes.data && chaptersRes.data.length > 0) cache.chapters = chaptersRes.data;
      if (sessionsRes.data && sessionsRes.data.length > 0) cache.sessions = sessionsRes.data;
    } catch (e) {
      console.warn('[Supabase Pull] Warning:', e);
    }
  }

  res.json({
    success: true,
    data: cache,
  });
});

// Full state sync (save)
app.post('/api/sync-all', async (req: Request, res: Response) => {
  const { userId, user, targets, playlists, chapters, sessions } = req.body;
  const uid = userId || user?.id || 'default_user';
  const cache = getOrCreateUserCache(uid);

  if (user) cache.user = user;
  if (targets) cache.targets = targets;
  if (playlists) cache.playlists = playlists;
  if (chapters) cache.chapters = chapters;
  if (sessions) cache.sessions = sessions;

  // Persist to Supabase if configured
  if (supabase) {
    try {
      const promises: PromiseLike<any>[] = [];

      if (user) {
        promises.push(
          supabase.from('user_profiles').upsert(
            {
              id: uid,
              name: user.name,
              email: user.email,
              dream_college: user.dreamCollege,
              target_percentile: user.targetPercentile,
              target_year: user.targetYear || 2027,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
        );
      }

      if (targets && targets.length > 0) {
        const rows = targets.map((t: any) => ({
          id: t.id,
          user_id: uid,
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
        promises.push(supabase.from('daily_targets').upsert(rows, { onConflict: 'id' }));
      }

      if (playlists && playlists.length > 0) {
        const rows = playlists.map((p: any) => ({
          id: p.id,
          user_id: uid,
          title: p.title,
          channel_title: p.channelTitle,
          playlist_url: p.playlistUrl,
          playlist_id: p.playlistId || null,
          subject: p.subject,
          current_video_index: p.currentVideoIndex,
          videos: p.videos,
          updated_at: new Date().toISOString(),
        }));
        promises.push(supabase.from('playlists').upsert(rows, { onConflict: 'id' }));
      }

      if (chapters && chapters.length > 0) {
        const rows = chapters.map((c: any) => ({
          id: c.id,
          user_id: uid,
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
        promises.push(supabase.from('chapters').upsert(rows, { onConflict: 'id' }));
      }

      if (sessions && sessions.length > 0) {
        const rows = sessions.map((s: any) => ({
          id: s.id,
          user_id: uid,
          date: s.date,
          subject: s.subject,
          duration_minutes: s.durationMinutes,
          timestamp: s.timestamp,
          topic: s.topic || null,
          notes: s.notes || null,
        }));
        promises.push(supabase.from('study_sessions').upsert(rows, { onConflict: 'id' }));
      }

      await Promise.allSettled(promises);
    } catch (err) {
      console.warn('[Supabase Sync Error]', err);
    }
  }

  res.json({ success: true, message: 'Saved to backend' });
});

// User routes
app.get('/api/user', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default_user';
  const cache = getOrCreateUserCache(userId);
  res.json(cache.user);
});

app.post('/api/user', async (req: Request, res: Response) => {
  const user = req.body;
  const uid = user.id || 'default_user';
  const cache = getOrCreateUserCache(uid);
  cache.user = user;

  if (supabase) {
    try {
      await supabase.from('user_profiles').upsert({
        id: uid,
        name: user.name,
        email: user.email,
        dream_college: user.dreamCollege,
        target_percentile: user.targetPercentile,
        target_year: user.targetYear || 2027,
        updated_at: new Date().toISOString(),
      });
    } catch {}
  }

  res.json({ success: true, user });
});

// Targets routes
app.get('/api/targets', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default_user';
  const cache = getOrCreateUserCache(userId);
  res.json(cache.targets);
});

app.post('/api/targets', async (req: Request, res: Response) => {
  const { userId, targets } = req.body;
  const uid = userId || 'default_user';
  const cache = getOrCreateUserCache(uid);
  cache.targets = targets || [];
  res.json({ success: true });
});

// Start Server & Mount Vite
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
