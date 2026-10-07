import { useState } from 'react';
import { Chapter, Quiz, AppSettings, Difficulty, QuizMode } from '../types';
import { generateQuiz } from '../utils/quizGenerator';
import { v4 as uuidv4 } from 'uuid';
import { Wand2, Settings, ChevronDown, Sparkles, AlertCircle, Zap, Brain, Shield } from 'lucide-react';

interface QuizGeneratorProps {
  chapters: Chapter[];
  activeChapter: Chapter | null;
  onGenerate: (quiz: Quiz) => void;
  onSelectChapter: (chapter: Chapter) => void;
  settings: AppSettings;
}

export default function QuizGenerator({ chapters, activeChapter, onGenerate, onSelectChapter, settings }: QuizGeneratorProps) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.defaultDifficulty);
  const [mode, setMode] = useState<QuizMode>(settings.defaultMode);

  const handleGenerate = () => {
    if (!activeChapter) return;
    setIsGenerating(true);
    setTimeout(() => {
      const questions = generateQuiz(activeChapter.content, numQuestions, difficulty);
      if (questions.length === 0) {
        setIsGenerating(false);
        alert('Could not generate questions. Try adding more content (200+ characters).');
        return;
      }
      const quiz: Quiz = {
        id: uuidv4(), chapterId: activeChapter.id, chapterTitle: activeChapter.title,
        subject: activeChapter.subject, questions, createdAt: Date.now(), mode,
      };
      onGenerate(quiz);
      setIsGenerating(false);
    }, 1200);
  };

  const modes = [
    { id: 'normal' as QuizMode, label: 'Normal', icon: Brain, desc: 'Standard quiz' },
    { id: 'study' as QuizMode, label: 'Study', icon: Shield, desc: 'Hints enabled, no timer' },
    { id: 'challenge' as QuizMode, label: 'Challenge', icon: Zap, desc: 'Strict timer' },
  ];

  const difficulties = [
    { id: 'easy' as Difficulty, label: 'Easy', color: 'var(--emerald)' },
    { id: 'medium' as Difficulty, label: 'Medium', color: 'var(--amber)' },
    { id: 'hard' as Difficulty, label: 'Hard', color: 'var(--rose)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--text-primary)' }}>Generate Quiz</h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-1">Create multiple choice worksheets from your content</p>
      </div>

      <div className="glass-card-static p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
          <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Quiz Settings</h2>
        </div>

        <div className="space-y-5">
          {/* Chapter Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Select Chapter</label>
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="w-full px-4 py-3 text-left flex items-center justify-between rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                {activeChapter ? (
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{activeChapter.title} <span style={{ color: 'var(--text-muted)' }}>({activeChapter.subject})</span></span>
                ) : <span style={{ color: 'var(--text-muted)' }}>Choose a chapter...</span>}
                <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
              </button>
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto animate-scale-in" style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-card)' }}>
                  {chapters.length > 0 ? chapters.map(ch => (
                    <button key={ch.id} onClick={() => { onSelectChapter(ch); setShowDropdown(false); }}
                      className="w-full px-4 py-3 text-left hover:opacity-80 transition-opacity border-b" style={{ borderColor: 'var(--border-card)' }}>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{ch.title}</span>
                      <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>({ch.subject})</span>
                    </button>
                  )) : <div className="px-4 py-6 text-center" style={{ color: 'var(--text-muted)' }}>No chapters available</div>}
                </div>
              )}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Quiz Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {modes.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  className={`p-3 rounded-xl text-center transition-all ${mode === m.id ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                  style={{ background: mode === m.id ? 'var(--accent-gradient)' : 'var(--bg-secondary)', color: mode === m.id ? 'var(--text-on-accent)' : 'var(--text-primary)' }}>
                  <m.icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-bold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)}
                  className={`p-3 rounded-xl text-center font-bold text-sm transition-all ${difficulty === d.id ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                  style={{
                    background: difficulty === d.id ? d.color : 'var(--bg-secondary)',
                    color: difficulty === d.id ? '#fff' : 'var(--text-primary)',
                  }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Questions: <span className="font-bold" style={{ color: 'var(--text-accent)' }}>{numQuestions}</span>
            </label>
            <input type="range" min="5" max="30" step="5" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} className="w-full" />
          </div>

          {/* Preview */}
          {activeChapter && (
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-sm line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{activeChapter.content.substring(0, 300)}...</p>
              <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{activeChapter.content.split(/\s+/).length} words</span>
                <span>{activeChapter.content.length} chars</span>
              </div>
            </div>
          )}

          {activeChapter && activeChapter.content.length < 200 && (
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'var(--amber)' + '15', border: '1px solid var(--amber)' + '30' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--amber)' }} />
              <p className="text-xs" style={{ color: 'var(--amber)' }}>Content may be too short. 200+ characters recommended.</p>
            </div>
          )}

          <button onClick={handleGenerate} disabled={!activeChapter || isGenerating}
            className={`w-full btn-primary justify-center py-4 text-base ${!activeChapter || isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isGenerating ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate Quiz</>
            )}
          </button>
        </div>
      </div>

      {chapters.length === 0 && (
        <div className="glass-card-static text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>No Chapters Available</h3>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Upload content first in "Chapters".</p>
        </div>
      )}
    </div>
  );
}
