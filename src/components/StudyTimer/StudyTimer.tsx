import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle,
  BookOpen,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subject, StudySession } from '../../types';
import { playTimerCompleteChime } from '../../utils/audio';

interface StudyTimerProps {
  onLogSession: (session: StudySession) => void;
  isDark: boolean;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ onLogSession, isDark }) => {
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('pomodoro');
  const [pomoPreset, setPomoPreset] = useState<number>(50); // 50 mins default deep work
  const [secondsLeft, setSecondsLeft] = useState<number>(50 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [subject, setSubject] = useState<Subject>('physics');
  const [topic, setTopic] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [loggedNotice, setLoggedNotice] = useState<string | null>(null);

  // Stopwatch state
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch preset
  const handleSelectPreset = (minutes: number) => {
    setIsRunning(false);
    setPomoPreset(minutes);
    setSecondsLeft(minutes * 60);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (timerMode === 'pomodoro') {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              setIsRunning(false);
              if (soundEnabled) {
                playTimerCompleteChime();
              }
              try {
                confetti({
                  particleCount: 70,
                  spread: 80,
                  origin: { y: 0.6 },
                });
              } catch {}
              // Automatically prompt or log
              autoLogPomoSession(pomoPreset);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode, pomoPreset, soundEnabled]);

  const autoLogPomoSession = (minutes: number) => {
    const session: StudySession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      subject,
      durationMinutes: minutes,
      timestamp: Date.now(),
      topic: topic.trim() || `${pomoPreset} min Deep Focus`,
    };
    onLogSession(session);
    setLoggedNotice(`Logged ${minutes} min session to Study History!`);
    setTimeout(() => setLoggedNotice(null), 4000);
  };

  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerMode === 'pomodoro') {
      setSecondsLeft(pomoPreset * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const handleManualLog = () => {
    const elapsedMinutes =
      timerMode === 'pomodoro'
        ? Math.max(1, Math.round((pomoPreset * 60 - secondsLeft) / 60))
        : Math.max(1, Math.round(stopwatchSeconds / 60));

    const session: StudySession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      subject,
      durationMinutes: elapsedMinutes,
      timestamp: Date.now(),
      topic: topic.trim() || `${subject.toUpperCase()} Practice Session`,
    };

    onLogSession(session);
    setLoggedNotice(`Logged ${elapsedMinutes} min session to Study History!`);
    setTimeout(() => setLoggedNotice(null), 3000);

    // Reset after logging
    handleReset();
  };

  const formatDisplayTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentDisplaySeconds = timerMode === 'pomodoro' ? secondsLeft : stopwatchSeconds;
  const pomoProgress =
    timerMode === 'pomodoro'
      ? Math.round(((pomoPreset * 60 - secondsLeft) / (pomoPreset * 60)) * 100)
      : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Main Timer Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all text-center relative overflow-hidden ${
          isDark
            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-2xl shadow-indigo-950/20'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-xl shadow-zinc-200/50'
        }`}
      >
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Switcher */}
        <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 max-w-xs mx-auto mb-6">
          <button
            onClick={() => {
              setIsRunning(false);
              setTimerMode('pomodoro');
              setSecondsLeft(pomoPreset * 60);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              timerMode === 'pomodoro'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Pomodoro Focus
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setTimerMode('stopwatch');
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              timerMode === 'stopwatch'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Stopwatch
          </button>
        </div>

        {/* Pomodoro Presets */}
        {timerMode === 'pomodoro' && (
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {[25, 50, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSelectPreset(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  pomoPreset === mins
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isDark
                    ? 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {mins} mins
              </button>
            ))}
          </div>
        )}

        {/* Large Digital Clock */}
        <div className="py-4">
          <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono-nums tracking-tighter text-zinc-100">
            {formatDisplayTime(currentDisplaySeconds)}
          </div>
          <p className="text-xs uppercase tracking-widest font-semibold text-zinc-400 mt-2">
            {isRunning ? 'Session In Progress' : 'Ready To Study'}
          </p>
        </div>

        {/* Progress bar for Pomodoro */}
        {timerMode === 'pomodoro' && (
          <div className="max-w-md mx-auto my-4">
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${pomoProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Controls: Play, Reset, Sound */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handleReset}
            className={`p-3.5 rounded-2xl border transition-colors ${
              isDark
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black'
            }`}
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl transition-all scale-100 active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3.5 rounded-2xl border transition-colors ${
              soundEnabled
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
                : isDark
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400'
                : 'bg-zinc-100 border-zinc-200 text-zinc-400'
            }`}
            title={soundEnabled ? 'Chime Enabled' : 'Chime Muted'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Notification pill */}
        {loggedNotice && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4" />
            <span>{loggedNotice}</span>
          </div>
        )}

        {/* Session Subject & Topic Logger */}
        <div className="mt-8 pt-6 border-t border-zinc-800/50 max-w-md mx-auto text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Tag This Study Session
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              >
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="maths">Mathematics</option>
                <option value="general">Mock Test / Revision</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Topic / Notes</label>
              <input
                type="text"
                placeholder="e.g. Rotational Kinematics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>
          </div>

          <button
            onClick={handleManualLog}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-zinc-700"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Log Elapsed Time to Study Calendar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
