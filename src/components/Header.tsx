import React from 'react';
import {
  Target,
  Sun,
  Moon,
  ListVideo,
  CheckSquare,
  Clock,
  BookOpen,
  Calendar,
  User,
  Flame,
  Maximize,
  Minimize,
} from 'lucide-react';
import { UserProfile } from '../types';

export type ActiveTab = 'player' | 'targets' | 'timer' | 'chapters' | 'calendar';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  user: UserProfile;
  onOpenAuth: () => void;
  daysRemaining: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  user,
  onOpenAuth,
  daysRemaining,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'player', label: 'YouTube Player', icon: <ListVideo className="w-4 h-4" /> },
    { id: 'targets', label: 'Daily Targets', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'timer', label: 'Study Timer', icon: <Clock className="w-4 h-4" /> },
    { id: 'chapters', label: 'Chapter Tracker', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'calendar', label: 'Study Calendar', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark
          ? 'bg-zinc-950/85 border-zinc-800/80 text-zinc-100'
          : 'bg-white/85 border-zinc-200 text-zinc-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Countdown Teaser */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Target className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight">JEE MISSION</span>
                  <span className="text-xs px-1.5 py-0.2 font-black rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    2027
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">Distraction-Free Focus</p>
              </div>
            </div>

            {/* Quick Countdown Pill in Header */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span className="text-zinc-400 text-[11px]">D-Day:</span>
              <span className="text-amber-400 font-mono-nums font-bold">
                {daysRemaining} Days
              </span>
              <span className="text-[10px] text-zinc-400">(Jan 22, 2027)</span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Action Icons: Fullscreen, Theme Toggle, User Profile */}
          <div className="flex items-center gap-2">
            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-xl border text-xs transition-colors hidden sm:flex ${
                isDark
                  ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                  : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isDark
                  ? 'border-zinc-800 hover:bg-zinc-800 text-amber-400'
                  : 'border-zinc-200 hover:bg-zinc-100 text-zinc-700'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile Pill / Auth Button */}
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                  : 'bg-zinc-100 border-zinc-200 hover:border-zinc-300 text-zinc-800'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {user.name ? user.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[11px] font-bold leading-tight truncate max-w-[90px]">
                  {user.name || 'Aspirant'}
                </p>
                <p className="text-[9px] text-zinc-400 leading-none">
                  {user.dreamCollege ? user.dreamCollege.split(' ')[0] : 'IIT 2027'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Secondary Nav Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2.5 pt-1 text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
