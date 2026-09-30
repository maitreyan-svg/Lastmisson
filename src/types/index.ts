export type Subject = 'physics' | 'chemistry' | 'maths' | 'general';

export type Priority = 'high' | 'medium' | 'low';

export type TheoryStatus = 'not_started' | 'in_progress' | 'completed';

export type PyqStatus = 'none' | 'partial' | 'completed' | 'mastered';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  dreamCollege: string;
  targetPercentile: string;
  targetYear: number;
  isLoggedIn: boolean;
}

export interface VideoItem {
  id: string;
  videoId: string;
  title: string;
  duration: string;
  durationSeconds: number;
  watchedSeconds: number;
  completed: boolean;
  notes?: string;
}

export interface Playlist {
  id: string;
  title: string;
  channelTitle?: string;
  playlistUrl: string;
  playlistId?: string;
  subject: Subject;
  currentVideoIndex: number;
  videos: VideoItem[];
  createdAt: string;
}

export interface DailyTarget {
  id: string;
  title: string;
  subject: Subject;
  priority: Priority;
  estimatedMinutes: number;
  completed: boolean;
  date: string; // YYYY-MM-DD
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Chapter {
  id: string;
  subject: 'physics' | 'chemistry' | 'maths';
  name: string;
  classLevel: '11' | '12';
  theory: TheoryStatus;
  questionsSolved: number;
  questionsTarget: number;
  pyqsStatus: PyqStatus;
  revisionCount: number;
  formulaSheet: boolean;
  notes?: string;
  updatedAt?: string;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  subject: Subject;
  durationMinutes: number;
  timestamp: number;
  topic?: string;
  notes?: string;
}
