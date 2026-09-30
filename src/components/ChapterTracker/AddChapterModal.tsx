import React, { useState } from 'react';
import { X, Plus, BookOpen, Hash } from 'lucide-react';
import { Chapter, TheoryStatus, PyqStatus } from '../../types';

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChapter: (chapter: Chapter) => void;
  defaultSubject: 'physics' | 'chemistry' | 'maths';
  isDark: boolean;
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({
  isOpen,
  onClose,
  onAddChapter,
  defaultSubject,
  isDark,
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState<'physics' | 'chemistry' | 'maths'>(defaultSubject);
  const [classLevel, setClassLevel] = useState<'11' | '12'>('11');
  const [questionsTarget, setQuestionsTarget] = useState(80);
  const [theory, setTheory] = useState<TheoryStatus>('not_started');
  const [pyqsStatus, setPyqsStatus] = useState<PyqStatus>('none');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newChapter: Chapter = {
      id: `chap-${Date.now()}`,
      name: name.trim(),
      subject,
      classLevel,
      theory,
      questionsSolved: 0,
      questionsTarget: Number(questionsTarget) || 75,
      pyqsStatus,
      revisionCount: 0,
      formulaSheet: false,
    };

    onAddChapter(newChapter);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Add JEE Chapter</h3>
              <p className="text-xs text-zinc-400">Track theory, questions, and PYQs</p>
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
              Chapter Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Electromagnetic Induction or Matrices"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setSubject(e.target.value as 'physics' | 'chemistry' | 'maths')}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              >
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="maths">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Class Grade
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value as '11' | '12')}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              >
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span>Target Questions</span>
              </label>
              <input
                type="number"
                min={10}
                max={500}
                value={questionsTarget}
                onChange={(e) => setQuestionsTarget(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-sm font-mono-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Initial Theory Status
              </label>
              <select
                value={theory}
                onChange={(e) => setTheory(e.target.value as TheoryStatus)}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
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
              <span>Add to Syllabus</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
