import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Award,
  RotateCw,
  FileText,
  Trash2,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Chapter, TheoryStatus, PyqStatus } from '../../types';
import { AddChapterModal } from './AddChapterModal';
import { playTargetCheckSound } from '../../utils/audio';

interface ChapterTrackerProps {
  chapters: Chapter[];
  onUpdateChapter: (chapter: Chapter) => void;
  onAddChapter: (chapter: Chapter) => void;
  onDeleteChapter: (id: string) => void;
  isDark: boolean;
}

export const ChapterTracker: React.FC<ChapterTrackerProps> = ({
  chapters,
  onUpdateChapter,
  onAddChapter,
  onDeleteChapter,
  isDark,
}) => {
  const [activeSubject, setActiveSubject] = useState<'physics' | 'chemistry' | 'maths'>('physics');
  const [classFilter, setClassFilter] = useState<'all' | '11' | '12'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter chapters
  const subjectChapters = chapters.filter((c) => c.subject === activeSubject);
  const filteredChapters = subjectChapters.filter((c) => {
    if (classFilter !== 'all' && c.classLevel !== classFilter) return false;
    if (searchQuery.trim() && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Pillar 1: Cycle theory status
  const cycleTheory = (chapter: Chapter) => {
    const nextMap: Record<TheoryStatus, TheoryStatus> = {
      not_started: 'in_progress',
      in_progress: 'completed',
      completed: 'not_started',
    };
    const nextStatus = nextMap[chapter.theory];
    if (nextStatus === 'completed') {
      playTargetCheckSound();
      try {
        confetti({ particleCount: 35, spread: 45, origin: { y: 0.7 } });
      } catch {}
    }
    onUpdateChapter({ ...chapter, theory: nextStatus });
  };

  // Pillar 2: Adjust questions
  const adjustQuestions = (chapter: Chapter, delta: number) => {
    const nextVal = Math.max(0, chapter.questionsSolved + delta);
    onUpdateChapter({ ...chapter, questionsSolved: nextVal });
  };

  // Pillar 3: Cycle PYQs status
  const cyclePyqs = (chapter: Chapter) => {
    const nextMap: Record<PyqStatus, PyqStatus> = {
      none: 'partial',
      partial: 'completed',
      completed: 'mastered',
      mastered: 'none',
    };
    const nextStatus = nextMap[chapter.pyqsStatus];
    if (nextStatus === 'mastered') {
      playTargetCheckSound();
      try {
        confetti({ particleCount: 45, spread: 55, origin: { y: 0.6 } });
      } catch {}
    }
    onUpdateChapter({ ...chapter, pyqsStatus: nextStatus });
  };

  // Pillar 4: Adjust revision count
  const adjustRevision = (chapter: Chapter, delta: number) => {
    const nextCount = Math.max(0, chapter.revisionCount + delta);
    onUpdateChapter({ ...chapter, revisionCount: nextCount });
  };

  // Toggle formula sheet
  const toggleFormulaSheet = (chapter: Chapter) => {
    onUpdateChapter({ ...chapter, formulaSheet: !chapter.formulaSheet });
  };

  // Subject Stats
  const totalChapters = subjectChapters.length;
  const theoryCompleted = subjectChapters.filter((c) => c.theory === 'completed').length;
  const totalQuestionsSolved = subjectChapters.reduce((acc, c) => acc + c.questionsSolved, 0);
  const totalQuestionsTarget = subjectChapters.reduce((acc, c) => acc + c.questionsTarget, 0);
  const pyqMastered = subjectChapters.filter((c) => c.pyqsStatus === 'mastered' || c.pyqsStatus === 'completed').length;
  const revisedMultiple = subjectChapters.filter((c) => c.revisionCount >= 2).length;

  const getSubjectAccent = (sub: string) => {
    switch (sub) {
      case 'physics':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'chemistry':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  const getTheoryBadge = (status: TheoryStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'in_progress':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getPyqBadge = (status: PyqStatus) => {
    switch (status) {
      case 'mastered':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold';
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'partial':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
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
                JEE Syllabus Progress Tracker
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono-nums">
                Theory • Questions • PYQs • Revisions
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight mt-0.5">
              Chapter & Syllabus Mastery
            </h3>
            <p className="text-xs text-zinc-400">
              Track your 4 preparation pillars per chapter. Click statuses to cycle them directly.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 self-start sm:self-auto transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        </div>

        {/* 4 KPI Cards for the active subject */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800/40">
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">Theory Completed</span>
            <div className="text-lg font-bold font-mono-nums text-emerald-400 mt-0.5">
              {theoryCompleted} / {totalChapters}{' '}
              <span className="text-xs font-normal text-zinc-400">
                ({Math.round((theoryCompleted / Math.max(1, totalChapters)) * 100)}%)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">Questions Solved</span>
            <div className="text-lg font-bold font-mono-nums text-indigo-400 mt-0.5">
              {totalQuestionsSolved} / {totalQuestionsTarget}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">PYQs Completed/Mastered</span>
            <div className="text-lg font-bold font-mono-nums text-purple-400 mt-0.5">
              {pyqMastered} chapters
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">Revised 2+ Times</span>
            <div className="text-lg font-bold font-mono-nums text-amber-400 mt-0.5">
              {revisedMultiple} chapters
            </div>
          </div>
        </div>
      </div>

      {/* Main Chapter Table Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Subject switcher tabs & filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-zinc-800/50">
          {/* Subject Pills */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {(['physics', 'chemistry', 'maths'] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeSubject === sub
                    ? sub === 'physics'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : sub === 'chemistry'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : isDark
                    ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>{sub}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono-nums">
                  {chapters.filter((c) => c.subject === sub).length}
                </span>
              </button>
            ))}
          </div>

          {/* Class Filter & Search */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center p-1 rounded-xl bg-zinc-950/40 border border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setClassFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  classFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setClassFilter('11')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  classFilter === '11' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Class 11
              </button>
              <button
                onClick={() => setClassFilter('12')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  classFilter === '12' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Class 12
              </button>
            </div>

            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search chapter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="mt-4 space-y-2.5">
          {filteredChapters.map((chapter) => {
            const qPercent = Math.min(
              100,
              Math.round((chapter.questionsSolved / Math.max(1, chapter.questionsTarget)) * 100)
            );

            return (
              <div
                key={chapter.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all hover:border-zinc-700 ${
                  isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-zinc-50/80 border-zinc-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left: Chapter Name & Class Tag */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Class {chapter.classLevel}
                      </span>
                      {chapter.formulaSheet && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Short Notes Ready
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm sm:text-base mt-1 text-zinc-100">
                      {chapter.name}
                    </h4>
                  </div>

                  {/* 4 Pillars Tracker Controls */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {/* 1. Theory Status Cycle Button */}
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5">
                        1. Theory
                      </span>
                      <button
                        onClick={() => cycleTheory(chapter)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all capitalize ${getTheoryBadge(
                          chapter.theory
                        )}`}
                        title="Click to cycle Theory status"
                      >
                        {chapter.theory.replace('_', ' ')}
                      </button>
                    </div>

                    {/* 2. Questions Solved Controller */}
                    <div className="flex flex-col min-w-[130px]">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5 flex justify-between">
                        <span>2. Questions</span>
                        <span className="font-mono-nums text-zinc-300">
                          {chapter.questionsSolved}/{chapter.questionsTarget}
                        </span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustQuestions(chapter, -5)}
                          className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono font-bold"
                          title="-5 Questions"
                        >
                          -5
                        </button>
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                            style={{ width: `${qPercent}%` }}
                          />
                        </div>
                        <button
                          onClick={() => adjustQuestions(chapter, 10)}
                          className="px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-mono font-bold"
                          title="+10 Questions"
                        >
                          +10
                        </button>
                      </div>
                    </div>

                    {/* 3. PYQs Status Cycle Button */}
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5">
                        3. PYQs
                      </span>
                      <button
                        onClick={() => cyclePyqs(chapter)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all capitalize ${getPyqBadge(
                          chapter.pyqsStatus
                        )}`}
                        title="Click to cycle PYQs status (None -> Partial -> Completed -> Mastered)"
                      >
                        {chapter.pyqsStatus}
                      </button>
                    </div>

                    {/* 4. Revision Count */}
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5">
                        4. Revisions
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustRevision(chapter, -1)}
                          className="w-5 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold"
                          title="Decrease Revision"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono-nums text-amber-400">
                          {chapter.revisionCount}
                        </span>
                        <button
                          onClick={() => adjustRevision(chapter, 1)}
                          className="w-5 h-6 rounded bg-amber-600/30 text-amber-300 hover:bg-amber-600 hover:text-white text-xs font-bold"
                          title="Add Revision"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Short Notes & Delete */}
                    <div className="flex items-center gap-1 self-end lg:self-center ml-1">
                      <button
                        onClick={() => toggleFormulaSheet(chapter)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          chapter.formulaSheet
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Toggle Formula Sheet / Short Notes ready"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete chapter "${chapter.name}"?`)) {
                            onDeleteChapter(chapter.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete chapter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredChapters.length === 0 && (
            <div className="text-center py-12 text-zinc-400 text-xs">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <span>No chapters match this filter. Use &quot;Add Chapter&quot; to customize.</span>
            </div>
          )}
        </div>
      </div>

      <AddChapterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddChapter={onAddChapter}
        defaultSubject={activeSubject}
        isDark={isDark}
      />
    </div>
  );
};
