import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyTarget, Subject } from '../../types';
import { TargetModal } from './TargetModal';
import { playTargetCheckSound } from '../../utils/audio';

interface DailyTargetsProps {
  targets: DailyTarget[];
  onAddTarget: (target: DailyTarget) => void;
  onUpdateTarget: (target: DailyTarget) => void;
  onDeleteTarget: (id: string) => void;
  isDark: boolean;
}

export const DailyTargets: React.FC<DailyTargetsProps> = ({
  targets,
  onAddTarget,
  onUpdateTarget,
  onDeleteTarget,
  isDark,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<DailyTarget | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggleComplete = (target: DailyTarget) => {
    const willComplete = !target.completed;
    if (willComplete) {
      playTargetCheckSound();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    }

    onUpdateTarget({
      ...target,
      completed: willComplete,
      completedAt: willComplete ? new Date().toISOString() : undefined,
    });
  };

  const handleEdit = (target: DailyTarget) => {
    setEditingTarget(target);
    setIsModalOpen(true);
  };

  const handleSaveTarget = (target: DailyTarget) => {
    if (editingTarget) {
      onUpdateTarget(target);
    } else {
      onAddTarget(target);
    }
  };

  // Filtered list
  const filteredTargets = targets.filter((target) => {
    if (filterStatus === 'pending' && target.completed) return false;
    if (filterStatus === 'completed' && !target.completed) return false;
    if (selectedSubject !== 'all' && target.subject !== selectedSubject) return false;
    return true;
  });

  const completedCount = targets.filter((t) => t.completed).length;
  const totalCount = targets.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalMinutes = targets.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  const remainingMinutes = targets
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

  const getSubjectColor = (subj: Subject) => {
    switch (subj) {
      case 'physics':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'chemistry':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'maths':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'high':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and KPI cards */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                Personal Daily Goals
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono-nums">
                {todayStr}
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight mt-0.5">
              Daily Study Targets
            </h3>
            <p className="text-xs text-zinc-400">
              Manually created targets. Break down chapters into daily achievable tasks.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTarget(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 self-start sm:self-auto transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Target</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800/40">
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">Completed</span>
            <div className="text-lg font-bold font-mono-nums text-emerald-400 mt-0.5">
              {completedCount} / {totalCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">Completion Rate</span>
            <div className="text-lg font-bold font-mono-nums text-indigo-400 mt-0.5">
              {progressPercent}%
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">Total Planned</span>
            <div className="text-lg font-bold font-mono-nums text-zinc-200 mt-0.5">
              {Math.round((totalMinutes / 60) * 10) / 10} hrs
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400 block font-medium">Remaining Work</span>
            <div className="text-lg font-bold font-mono-nums text-amber-400 mt-0.5">
              {Math.round((remainingMinutes / 60) * 10) / 10} hrs
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Target List */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/40">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              All ({targets.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Pending ({targets.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={`text-xs px-2.5 py-1 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-300 text-zinc-800'
              }`}
            >
              <option value="all">All Subjects</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="maths">Mathematics</option>
              <option value="general">Revision / Mock</option>
            </select>
          </div>
        </div>

        {/* Targets List */}
        <div className="mt-3 space-y-2">
          {filteredTargets.map((target) => (
            <div
              key={target.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                target.completed
                  ? isDark
                    ? 'bg-zinc-950/40 border-zinc-800/60 opacity-70'
                    : 'bg-zinc-50 border-zinc-200 opacity-70'
                  : isDark
                  ? 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Complete checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleComplete(target)}
                  className="mt-0.5 text-zinc-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                >
                  {target.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-400 hover:text-zinc-200" />
                  )}
                </button>

                {/* Target Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getSubjectColor(
                        target.subject
                      )}`}
                    >
                      {target.subject}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getPriorityBadge(
                        target.priority
                      )}`}
                    >
                      {target.priority}
                    </span>
                    <span className="text-[11px] font-mono-nums text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {target.estimatedMinutes} mins
                    </span>
                  </div>

                  <h4
                    className={`font-semibold text-sm mt-1.5 ${
                      target.completed ? 'line-through text-zinc-400' : 'text-zinc-100'
                    }`}
                  >
                    {target.title}
                  </h4>

                  {target.notes && (
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {target.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit, Delete */}
              <div className="flex items-center gap-1 self-start sm:self-center flex-shrink-0">
                <button
                  onClick={() => handleEdit(target)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  title="Edit target"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteTarget(target.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete target"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredTargets.length === 0 && (
            <div className="text-center py-12 text-zinc-400 text-xs">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <span>No study targets in this category. Click &quot;Create Target&quot; to add your own goal!</span>
            </div>
          )}
        </div>
      </div>

      <TargetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTarget}
        initialTarget={editingTarget}
        isDark={isDark}
      />
    </div>
  );
};
