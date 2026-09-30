import { Playlist, DailyTarget, Chapter, StudySession, UserProfile } from '../types';
import { INITIAL_CHAPTERS } from './syllabusData';

const STORAGE_KEYS = {
  USER: 'jee2027_user',
  THEME: 'jee2027_theme',
  PLAYLISTS: 'jee2027_playlists',
  ACTIVE_PLAYLIST_ID: 'jee2027_active_playlist_id',
  DAILY_TARGETS: 'jee2027_daily_targets',
  CHAPTERS: 'jee2027_chapters',
  SESSIONS: 'jee2027_study_sessions',
};

export const DEFAULT_USER: UserProfile = {
  id: 'jee_aspirant_1',
  name: 'Maitrey',
  email: 'maitreyongay@gmail.com',
  dreamCollege: 'IIT Bombay (Computer Science)',
  targetPercentile: '99.85 %ile',
  targetYear: 2027,
  isLoggedIn: true,
};

export const CURATED_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-pg-rotational',
    title: 'Rotational Motion - Advanced Concepts & Applications',
    channelTitle: 'Physics Galaxy (Ashish Arora)',
    subject: 'physics',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL_A4M5IAEzWf3tL7Xk-qB_w3l98b4Y8xZ',
    playlistId: 'PL_A4M5IAEzWf3tL7Xk-qB_w3l98b4Y8xZ',
    currentVideoIndex: 0,
    createdAt: '2026-10-01',
    videos: [
      {
        id: 'pg-rot-1',
        videoId: 'w4-m7qL5y6c',
        title: '01. Moment of Inertia - Standard Bodies & Perpendicular Axis Theorem',
        duration: '28:14',
        durationSeconds: 1694,
        watchedSeconds: 1694,
        completed: true,
        notes: 'Integration methods for non-uniform rods and disk sectors.'
      },
      {
        id: 'pg-rot-2',
        videoId: 'E9o1zM4vX2w',
        title: '02. Parallel Axis Theorem & Cavity Problems in M.I.',
        duration: '24:45',
        durationSeconds: 1485,
        watchedSeconds: 840,
        completed: false,
        notes: 'Negative mass concept simplifies cavity moments.'
      },
      {
        id: 'pg-rot-3',
        videoId: 'kX1Z2Q7oP8y',
        title: '03. Torque about an Axis & Dynamic Equilibrium',
        duration: '32:10',
        durationSeconds: 1930,
        watchedSeconds: 0,
        completed: false
      },
      {
        id: 'pg-rot-4',
        videoId: 'L3k9xW2m8Vp',
        title: '04. Pure Rolling Motion - Kinematics & Instantaneous Center',
        duration: '35:20',
        durationSeconds: 2120,
        watchedSeconds: 0,
        completed: false
      },
      {
        id: 'pg-rot-5',
        videoId: 'r7M4tQ9bL1k',
        title: '05. Angular Momentum Conservation & Collisions with Hinged Rods',
        duration: '42:15',
        durationSeconds: 2535,
        watchedSeconds: 0,
        completed: false
      },
      {
        id: 'pg-rot-6',
        videoId: 'p8Y3rM6vL9o',
        title: '06. Rolling with Slipping & Friction Direction Dynamics',
        duration: '38:50',
        durationSeconds: 2330,
        watchedSeconds: 0,
        completed: false
      }
    ]
  },
  {
    id: 'pl-mt-calculus',
    title: 'Calculus - Functions, Continuity & Limits',
    channelTitle: 'Mohit Tyagi (Competishun)',
    subject: 'maths',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL_A4M5IAEzWd4F7v3nN9X_K41-a8Kx99',
    playlistId: 'PL_A4M5IAEzWd4F7v3nN9X_K41-a8Kx99',
    currentVideoIndex: 1,
    createdAt: '2026-10-02',
    videos: [
      {
        id: 'mt-calc-1',
        videoId: '9rQ8mY4bL2c',
        title: '01. Domain, Range & Periodic Functions Fundamentals',
        duration: '34:20',
        durationSeconds: 2060,
        watchedSeconds: 2060,
        completed: true,
        notes: 'Fractional part {x} and [x] periodicity.'
      },
      {
        id: 'mt-calc-2',
        videoId: 'y4K8vL1r9Mw',
        title: '02. Functional Equations & Injectivity/Surjectivity',
        duration: '41:10',
        durationSeconds: 2470,
        watchedSeconds: 1220,
        completed: false,
        notes: 'f(x+y) = f(x)f(y) implies f(x)=a^x.'
      },
      {
        id: 'mt-calc-3',
        videoId: 't3M9kR2bX8y',
        title: '03. Standard Limits & Expansion Methods (Taylor Series)',
        duration: '38:40',
        durationSeconds: 2320,
        watchedSeconds: 0,
        completed: false
      },
      {
        id: 'mt-calc-4',
        videoId: 'v2B8xN7m4Lk',
        title: '04. L\'Hopital Rule Pitfalls & 1^infinity Indeterminate Forms',
        duration: '36:15',
        durationSeconds: 2175,
        watchedSeconds: 0,
        completed: false
      },
      {
        id: 'mt-calc-5',
        videoId: 'm8Y3qL9bK1p',
        title: '05. Continuity in Intervals & Intermediate Value Theorem',
        duration: '44:30',
        durationSeconds: 2670,
        watchedSeconds: 0,
        completed: false
      }
    ]
  },
  {
    id: 'pl-sr-goc',
    title: 'General Organic Chemistry (GOC) & Reaction Mechanisms',
    channelTitle: 'Sachin Rana (IITB)',
    subject: 'chemistry',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL_A4M5IAEzWcf98m_GocChem2027',
    playlistId: 'PL_A4M5IAEzWcf98m_GocChem2027',
    currentVideoIndex: 0,
    createdAt: '2026-10-03',
    videos: [
      {
        id: 'sr-goc-1',
        videoId: 'k9M4xL2bV8r',
        title: '01. Inductive & Resonance Effects - Stability of Intermediates',
        duration: '39:50',
        durationSeconds: 2390,
        watchedSeconds: 1400,
        completed: false,
        notes: 'Carbocation rearrangement order: Hydride shift > Methyl shift.'
      },
      {
        id: 'sr-goc-2',
        videoId: 'x8B2nL7m9Vw',
        title: '02. Hyperconjugation & Aromaticity (Huckel Rule)',
        duration: '31:25',
        durationSeconds: 1885,
        watchedSeconds: 0,
        completed: false
      },
      {
        id: 'sr-goc-3',
        videoId: 'm3K7rP9bL4y',
        title: '03. Acidic and Basic Strengths - SIR and SIP Effects',
        duration: '45:15',
        durationSeconds: 2715,
        watchedSeconds: 0,
        completed: false
      },
      {
        id: 'sr-goc-4',
        videoId: 'p7Y2kM9rX1c',
        title: '04. Electrophilic Aromatic Substitution (EAS) Mechanism',
        duration: '37:40',
        durationSeconds: 2260,
        watchedSeconds: 0,
        completed: false
      }
    ]
  },
  {
    id: 'pl-ed-physics-pyq',
    title: 'Eduniti - Most Repeated JEE Main PYQ Concepts (Physics)',
    channelTitle: 'Eduniti (Mohit Goenka)',
    subject: 'physics',
    playlistUrl: 'https://www.youtube.com/playlist?list=PL_A4M5IAEzWdEduNitiPYQ2027',
    playlistId: 'PL_A4M5IAEzWdEduNitiPYQ2027',
    currentVideoIndex: 0,
    createdAt: '2026-10-04',
    videos: [
      {
        id: 'ed-pyq-1',
        videoId: 'b4M9xL2rK7v',
        title: '01. Current Electricity - Top 20 Most Repeated Question Types',
        duration: '46:12',
        durationSeconds: 2772,
        watchedSeconds: 0,
        completed: false
      },
      {
        id: 'ed-pyq-2',
        videoId: 'q2K8vM4bL9x',
        title: '02. Modern Physics - De-Broglie, Photoelectric & Bohr Model PYQs',
        duration: '42:30',
        durationSeconds: 2550,
        watchedSeconds: 0,
        completed: false
      },
      {
        id: 'ed-pyq-3',
        videoId: 'z7N3pL8kM1r',
        title: '03. Thermodynamics & Heat Transfer - Formula Sprint & High Yield PYQs',
        duration: '39:15',
        durationSeconds: 2355,
        watchedSeconds: 0,
        completed: false
      }
    ]
  }
];

export const INITIAL_DAILY_TARGETS: DailyTarget[] = [
  {
    id: 'target-1',
    title: 'Solve 25 PYQs from Rotational Motion (2023-2025 papers)',
    subject: 'physics',
    priority: 'high',
    estimatedMinutes: 75,
    completed: true,
    date: '2026-10-01',
    completedAt: '2026-10-01T14:30:00Z',
    notes: 'Focus on rolling on inclined plane with friction questions.',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'target-2',
    title: 'Watch GOC Lecture 2 (Hyperconjugation & Aromaticity)',
    subject: 'chemistry',
    priority: 'high',
    estimatedMinutes: 45,
    completed: true,
    date: '2026-10-01',
    completedAt: '2026-10-01T16:15:00Z',
    notes: 'Write short notes on aromaticity exceptions.',
    createdAt: '2026-10-01T08:05:00Z',
  },
  {
    id: 'target-3',
    title: 'Complete Functions & Continuity Module Exercise 1 (30 Qs)',
    subject: 'maths',
    priority: 'high',
    estimatedMinutes: 90,
    completed: false,
    date: '2026-10-01',
    notes: 'Questions 15 to 45 from coaching module.',
    createdAt: '2026-10-01T08:10:00Z',
  },
  {
    id: 'target-4',
    title: 'Revise Electrostatics Formula Sheet & Key Graphs',
    subject: 'physics',
    priority: 'medium',
    estimatedMinutes: 30,
    completed: false,
    date: '2026-10-01',
    notes: 'Check conducting vs non-conducting solid spheres electric field curve.',
    createdAt: '2026-10-01T08:15:00Z',
  },
  {
    id: 'target-5',
    title: 'Coordinate Geometry PYQ Analysis & Error Book Entry',
    subject: 'maths',
    priority: 'medium',
    estimatedMinutes: 45,
    completed: false,
    date: '2026-10-01',
    notes: 'Straight line distance formula & family of lines mistakes.',
    createdAt: '2026-10-01T08:20:00Z',
  },
];

export const INITIAL_STUDY_SESSIONS: StudySession[] = [
  {
    id: 'session-1',
    date: '2026-09-28',
    subject: 'physics',
    durationMinutes: 120,
    timestamp: new Date('2026-09-28T10:00:00').getTime(),
    topic: 'Rotational Motion - Moment of Inertia derivation & problems',
    notes: 'Solved 15 standard problems from Irodov / HC Verma.',
  },
  {
    id: 'session-2',
    date: '2026-09-28',
    subject: 'chemistry',
    durationMinutes: 90,
    timestamp: new Date('2026-09-28T14:30:00').getTime(),
    topic: 'Chemical Bonding - Molecular Orbital Theory (MOT)',
    notes: 'Paramagnetic nature of O2 and bond order calculations.',
  },
  {
    id: 'session-3',
    date: '2026-09-29',
    subject: 'maths',
    durationMinutes: 150,
    timestamp: new Date('2026-09-29T09:00:00').getTime(),
    topic: 'Limits & Calculus - Indeterminate forms & Sandwich Theorem',
    notes: 'Memorized standard expansions of ln(1+x), sin(x), e^x.',
  },
  {
    id: 'session-4',
    date: '2026-09-29',
    subject: 'physics',
    durationMinutes: 105,
    timestamp: new Date('2026-09-29T16:00:00').getTime(),
    topic: 'Electrostatics - Gauss Law & Cavity problems',
    notes: 'Field inside cavity in uniformly charged sphere is constant.',
  },
  {
    id: 'session-5',
    date: '2026-09-30',
    subject: 'chemistry',
    durationMinutes: 110,
    timestamp: new Date('2026-09-30T10:15:00').getTime(),
    topic: 'General Organic Chemistry - Resonance energy & stability',
  },
  {
    id: 'session-6',
    date: '2026-09-30',
    subject: 'maths',
    durationMinutes: 135,
    timestamp: new Date('2026-09-30T15:00:00').getTime(),
    topic: 'Coordinate Geometry - Straight lines & Tangents',
  },
  {
    id: 'session-7',
    date: '2026-10-01',
    subject: 'physics',
    durationMinutes: 120,
    timestamp: new Date('2026-10-01T09:30:00').getTime(),
    topic: 'Rotational Motion PYQs',
    notes: 'Completed 25 PYQs with 88% accuracy.',
  },
];

// Helpers to get/set localStorage with safety
export function getStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_USER;
}

export function saveStoredUser(user: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch {}
}

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'light' || raw === 'dark') return raw;
  } catch {}
  return 'dark'; // Dark mode by default for premium distraction-free feel
}

export function saveStoredTheme(theme: 'dark' | 'light') {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {}
}

export function getStoredPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return CURATED_PLAYLISTS;
}

export function saveStoredPlaylists(playlists: Playlist[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  } catch {}
}

export function getStoredDailyTargets(): DailyTarget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_TARGETS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_DAILY_TARGETS;
}

export function saveStoredDailyTargets(targets: DailyTarget[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_TARGETS, JSON.stringify(targets));
  } catch {}
}

export function getStoredChapters(): Chapter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_CHAPTERS;
}

export function saveStoredChapters(chapters: Chapter[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  } catch {}
}

export function getStoredSessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_STUDY_SESSIONS;
}

export function saveStoredSessions(sessions: StudySession[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch {}
}

// Helper to extract YouTube playlist ID or Video ID from URL
export function parseYouTubeUrl(url: string): { playlistId?: string; videoId?: string } {
  try {
    const trimmed = url.trim();
    if (!trimmed) return {};

    // Direct playlist ID passed
    if (/^[A-Za-z0-9_-]{18,}$/.test(trimmed)) {
      if (trimmed.startsWith('PL') || trimmed.startsWith('UU') || trimmed.startsWith('LL')) {
        return { playlistId: trimmed };
      }
      return { videoId: trimmed };
    }

    const urlObj = new URL(trimmed);
    const listParam = urlObj.searchParams.get('list');
    let videoId = urlObj.searchParams.get('v') || undefined;

    if (!videoId && urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.replace('/', '') || undefined;
    }

    return {
      playlistId: listParam || undefined,
      videoId: videoId || undefined,
    };
  } catch {
    // If not a full URL, check for list parameter string
    const match = url.match(/[?&]list=([A-Za-z0-9_-]+)/);
    if (match) return { playlistId: match[1] };
    return {};
  }
}
