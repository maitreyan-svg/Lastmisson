import React, { useState, useEffect } from 'react';
import { Target, Clock, Zap, ChevronDown, ChevronUp, Award } from 'lucide-react';

interface CountdownBannerProps {
  isDark: boolean;
  onOpenTargetModal?: () => void;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({ isDark }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSecondsRemaining: 0,
    percentageElapsed: 0,
    daysRemainingFloat: 0,
  });

  // Fixed dates as requested: October 1, 2026 to January 22, 2027
  const startDate = new Date('2026-10-01T00:00:00').getTime();
  const targetDate = new Date('2027-01-22T09:00:00').getTime();
  const totalDuration = targetDate - startDate;

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSecondsRemaining: 0,
          percentageElapsed: 100,
          daysRemainingFloat: 0,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const elapsed = Math.max(0, now - startDate);
      const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalSecondsRemaining: Math.floor(difference / 1000),
        percentageElapsed: Math.round(percentage * 10) / 10,
        daysRemainingFloat: Math.round((difference / (1000 * 60 * 60 * 24)) * 10) / 10,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [startDate, targetDate, totalDuration]);

  return (
    <div
      className={`w-full rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-2xl shadow-indigo-950/20'
          : 'bg-white border-zinc-200 text-zinc-900 shadow-xl shadow-zinc-200/50'
      }`}
    >
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="p-4 sm:p-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Title & Exam Info */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 flex-shrink-0">
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-500">
                  JEE Main 2027 • Session 1
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  Oct 1, 2026 → Jan 22, 2027
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
                Target Examination Countdown
              </h2>
            </div>
          </div>

          {/* Right Action / Toggle */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isDark
                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
              }`}
              title={collapsed ? 'Expand countdown' : 'Collapse countdown'}
            >
              <span>{collapsed ? 'Details' : 'Minimize'}</span>
              {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Big Countdown Digits */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-5">
          {/* Days */}
          <div
            className={`p-3 sm:p-4 rounded-xl border flex flex-col items-center justify-center transition-transform hover:scale-[1.02] ${
              isDark
                ? 'bg-zinc-950/60 border-zinc-800/80 shadow-inner'
                : 'bg-zinc-50/80 border-zinc-200/80 shadow-sm'
            }`}
          >
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono-nums tracking-tight text-amber-500">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-1">
              Days Left
            </span>
          </div>

          {/* Hours */}
          <div
            className={`p-3 sm:p-4 rounded-xl border flex flex-col items-center justify-center transition-transform hover:scale-[1.02] ${
              isDark
                ? 'bg-zinc-950/60 border-zinc-800/80 shadow-inner'
                : 'bg-zinc-50/80 border-zinc-200/80 shadow-sm'
            }`}
          >
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono-nums tracking-tight text-indigo-400">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-1">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div
            className={`p-3 sm:p-4 rounded-xl border flex flex-col items-center justify-center transition-transform hover:scale-[1.02] ${
              isDark
                ? 'bg-zinc-950/60 border-zinc-800/80 shadow-inner'
                : 'bg-zinc-50/80 border-zinc-200/80 shadow-sm'
            }`}
          >
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono-nums tracking-tight">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-1">
              Minutes
            </span>
          </div>

          {/* Seconds */}
          <div
            className={`p-3 sm:p-4 rounded-xl border flex flex-col items-center justify-center transition-transform hover:scale-[1.02] ${
              isDark
                ? 'bg-zinc-950/60 border-zinc-800/80 shadow-inner'
                : 'bg-zinc-50/80 border-zinc-200/80 shadow-sm'
            }`}
          >
            <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono-nums tracking-tight text-emerald-400">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-1">
              Seconds
            </span>
          </div>
        </div>

        {/* Progress bar & timeline info */}
        {!collapsed && (
          <div className="mt-5 space-y-3 pt-4 border-t border-zinc-800/40">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Preparation Window: <strong>113 Days Total</strong></span>
              </span>
              <span className="text-amber-400 font-mono-nums font-semibold">
                {timeLeft.percentageElapsed}% elapsed
              </span>
            </div>

            {/* Visual timeline bar */}
            <div className="w-full h-2.5 rounded-full bg-zinc-800/60 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.max(4, timeLeft.percentageElapsed)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Every hour dedicated now builds your rank at <strong>IIT Bombay / Delhi</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span>Expected D-Day: <strong>Friday, 22 Jan 2027 (09:00 IST)</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
