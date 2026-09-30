import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Plus, Clock, AlertCircle } from 'lucide-react';
import { DailyTarget, Subject, Priority } from '../../types';

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (target: DailyTarget) => void;
  initialTarget?: DailyTarget | null;
  isDark: boolean;
}

export const TargetModal: React.FC<TargetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTarget,
  isDark,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('physics');
  const [priority, setPriority] = useState<Priority>('high');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialTarget) {
      setTitle(initialTarget.title);
      setSubject(initialTarget.subject);
      setPriority(initialTarget.priority);
      setEstimatedMinutes(initialTarget.estimatedMinutes);
      setNotes(initialTarget.notes || '');
      setDate(initialTarget.date);
    } else {
      setTitle('');
      setSubject('physics');
      setPriority('high');
      setEstimatedMinutes(60);
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialTarget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetToSave: DailyTarget = {
      id: initialTarget ? initialTarget.id : `target-${Date.now()}`,
      title: title.trim(),
      subject,
      priority,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      completed: initialTarget ? initialTarget.completed : false,
      completedAt: initialTarget?.completedAt,
      date,
      notes: notes.trim(),
      createdAt: initialTarget ? initialTarget.createdAt : new Date().toISOString(),
    };

    onSave(targetToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {initialTarget ? 'Edit Study Target' : 'Create Daily Study Target'}
              </h3>
              <p className="text-xs text-zinc-400">
                Define your personal milestone for today
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Target Title / Task *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Solve 30 PYQs from Electrostatics or Read GOC notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize ${
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
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Normal Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Est. Duration (Minutes)</span>
              </label>
              <input
                type="number"
                min={5}
                max={360}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Specific Questions / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Questions 15 to 45 from module, focus on calculating work done by non-conservative forces."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
              }`}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{initialTarget ? 'Save Changes' : 'Add Target'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
