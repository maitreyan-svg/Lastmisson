import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Award,
  Plus,
  BookOpen,
  X,
  CheckCircle,
} from 'lucide-react';
import { StudySession, DailyTarget, Subject } from '../../types';

interface StudyCalendarProps {
  sessions: StudySession[];
  targets: DailyTarget[];
  onAddSession: (session: StudySession) => void;
  isDark: boolean;
}

export const StudyCalendar: React.FC<StudyCalendarProps> = ({
  sessions,
  targets,
  onAddSession,
  isDark,
}) => {
  // Calendar month state - anchor to October 2026 or current date
  const [currentDate, setCurrentDate] = useState(() => new Date('2026-10-01'));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-01');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual session inputs
  const [manualSubject, setManualSubject] = useState<Subject>('physics');
  const [manualDuration, setManualDuration] = useState(60);
  const [manualTopic, setManualTopic] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Aggregate sessions by date string YYYY-MM-DD
  const sessionsByDate: Record<string, StudySession[]> = {};
  sessions.forEach((s) => {
    if (!sessionsByDate[s.date]) sessionsByDate[s.date] = [];
    sessionsByDate[s.date].push(s);
  });

  const targetsByDate: Record<string, DailyTarget[]> = {};
  targets.forEach((t) => {
    if (!targetsByDate[t.date]) targetsByDate[t.date] = [];
    targetsByDate[t.date].push(t);
  });

  // Calculate totals
  const totalMinutesAllTime = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHoursAllTime = Math.round((totalMinutesAllTime / 60) * 10) / 10;

  // Selected date details
  const selectedSessions = sessionsByDate[selectedDateStr] || [];
  const selectedTargets = targetsByDate[selectedDateStr] || [];
  const selectedTotalMinutes = selectedSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Subject breakdown for selected date
  const subjectMinutes: Record<Subject, number> = {
    physics: 0,
    chemistry: 0,
    maths: 0,
    general: 0,
  };
  selectedSessions.forEach((s) => {
    subjectMinutes[s.subject] = (subjectMinutes[s.subject] || 0) + s.durationMinutes;
  });

  const handleCreateManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: StudySession = {
      id: `manual-sess-${Date.now()}`,
      date: selectedDateStr,
      subject: manualSubject,
      durationMinutes: Number(manualDuration) || 45,
      timestamp: Date.now(),
      topic: manualTopic.trim() || `${manualSubject.toUpperCase()} Self-Study`,
    };
    onAddSession(newSession);
    setIsManualModalOpen(false);
    setManualTopic('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and KPI Cards */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                Consistency Tracker
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono-nums">
                Heatmap & Session Logs
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight mt-0.5">
              Study History Calendar
            </h3>
            <p className="text-xs text-zinc-400">
              Visual log of study sessions, daily accomplishments, and subject hours.
            </p>
          </div>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 self-start sm:self-auto transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Study Hours</span>
          </button>
        </div>

        {/* 3 KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-800/40">
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">Total Logged Time</span>
            <div className="text-lg font-bold font-mono-nums text-indigo-400 mt-0.5">
              {totalHoursAllTime} Hours
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">Daily Streak</span>
            <div className="text-lg font-bold font-mono-nums text-amber-400 mt-0.5 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>4 Days Active</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-zinc-400 block font-medium">Daily Average</span>
            <div className="text-lg font-bold font-mono-nums text-emerald-400 mt-0.5">
              ~3.8 Hours / Day
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Day Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Calendar Grid (7 cols) */}
        <div
          className={`lg:col-span-7 p-4 sm:p-5 rounded-2xl border ${
            isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {/* Month Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/40">
            <h4 className="font-bold text-base flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              <span>
                {monthNames[month]} {year}
              </span>
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-3 text-center text-[11px] font-bold text-zinc-400 uppercase">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square opacity-0 pointer-events-none" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDateStr;
              const daySessions = sessionsByDate[dateStr] || [];
              const dayMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
              const dayHours = Math.round((dayMinutes / 60) * 10) / 10;
              const hasActivity = dayMinutes > 0;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`aspect-square p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/15 shadow-md shadow-indigo-950/40'
                      : hasActivity
                      ? isDark
                        ? 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
                        : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                      : isDark
                      ? 'border-transparent hover:border-zinc-800 hover:bg-zinc-800/30'
                      : 'border-transparent hover:border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono-nums ${
                        isSelected ? 'font-bold text-indigo-400' : 'text-zinc-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {hasActivity && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>

                  {hasActivity ? (
                    <span className="text-[10px] font-mono-nums font-bold text-emerald-400 leading-tight">
                      {dayHours}h
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-mono-nums">-</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Inspector Panel (5 cols) */}
        <div
          className={`lg:col-span-5 p-4 sm:p-5 rounded-2xl border flex flex-col justify-between ${
            isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400">Day Details</span>
                <h4 className="font-bold text-base mt-0.5">{selectedDateStr}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block font-medium">Logged Time</span>
                <span className="text-base font-bold font-mono-nums text-emerald-400">
                  {Math.round((selectedTotalMinutes / 60) * 10) / 10} Hours
                </span>
              </div>
            </div>

            {/* Subject breakdown pills */}
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block">Physics</span>
                <span className="text-xs font-bold font-mono-nums text-zinc-200">
                  {Math.round((subjectMinutes.physics / 60) * 10) / 10}h
                </span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Chemistry</span>
                <span className="text-xs font-bold font-mono-nums text-zinc-200">
                  {Math.round((subjectMinutes.chemistry / 60) * 10) / 10}h
                </span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Maths</span>
                <span className="text-xs font-bold font-mono-nums text-zinc-200">
                  {Math.round((subjectMinutes.maths / 60) * 10) / 10}h
                </span>
              </div>
            </div>

            {/* Sessions recorded for this day */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto mt-3 pr-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Study Sessions ({selectedSessions.length})
              </span>
              {selectedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold capitalize text-indigo-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {session.subject}
                    </span>
                    <span className="font-mono-nums text-zinc-300 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {session.durationMinutes} mins
                    </span>
                  </div>
                  {session.topic && (
                    <p className="font-medium text-zinc-200">{session.topic}</p>
                  )}
                  {session.notes && (
                    <p className="text-[11px] text-zinc-400 italic">{session.notes}</p>
                  )}
                </div>
              ))}

              {selectedSessions.length === 0 && (
                <div className="py-6 text-center text-xs text-zinc-400">
                  No sessions recorded for this date.
                </div>
              )}
            </div>

            {/* Targets for this day */}
            {selectedTargets.length > 0 && (
              <div className="mt-4 pt-3 border-t border-zinc-800/40">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Completed Targets ({selectedTargets.filter((t) => t.completed).length}/
                  {selectedTargets.length})
                </span>
                <div className="space-y-1">
                  {selectedTargets.map((t) => (
                    <div
                      key={t.id}
                      className="text-xs flex items-center gap-2 text-zinc-300"
                    >
                      <CheckCircle
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          t.completed ? 'text-emerald-400' : 'text-zinc-600'
                        }`}
                      />
                      <span className={t.completed ? 'line-through text-zinc-400' : ''}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Log button */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="w-full mt-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-zinc-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Session to {selectedDateStr}</span>
          </button>
        </div>
      </div>

      {/* Manual Session Add Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base">Add Study Session to {selectedDateStr}</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualSession} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Subject</label>
                <select
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value as Subject)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm capitalize ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                  }`}
                >
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="maths">Mathematics</option>
                  <option value="general">Revision / Mock Test</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={manualDuration}
                  onChange={(e) => setManualDuration(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-mono-nums ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Topic / Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. HC Verma Exercise 2 or Mock Analysis"
                  value={manualTopic}
                  onChange={(e) => setManualTopic(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
