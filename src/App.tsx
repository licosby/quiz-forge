import { useState, useEffect, useCallback } from 'react';
import { Chapter, Quiz, View, AppSettings, UserStats, DEFAULT_SETTINGS } from './types';
import { loadChapters, saveChapters, loadQuizzes, saveQuizzes, loadSettings, saveSettings, loadStats, saveStats, saveCurrentQuiz, loadCurrentQuiz, exportData, importData } from './utils/storage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChapterManager from './components/ChapterManager';
import QuizGenerator from './components/QuizGenerator';
import QuizTaker from './components/QuizTaker';
import QuizResults from './components/QuizResults';
import PrintView from './components/PrintView';
import SettingsPanel from './components/SettingsPanel';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<UserStats>({
    totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0,
    streak: 0, bestStreak: 0, lastQuizDate: 0, achievements: [],
  });

  // Load all data on mount
  useEffect(() => {
    setChapters(loadChapters());
    setQuizzes(loadQuizzes());
    setSettings(loadSettings());
    setStats(loadStats());

    // Resume quiz if exists
    const resumed = loadCurrentQuiz();
    if (resumed && !resumed.graded) {
      setActiveQuiz(resumed);
      setView('quiz');
    }
  }, []);

  // Persist data
  useEffect(() => { saveChapters(chapters); }, [chapters]);
  useEffect(() => { saveQuizzes(quizzes); }, [quizzes]);
  useEffect(() => {
    saveSettings(settings);
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.className = settings.theme +
      (settings.largeText ? ' large-text' : '') +
      (settings.reducedMotion ? ' reduced-motion' : '');
  }, [settings]);
  useEffect(() => { saveStats(stats); }, [stats]);
  useEffect(() => { saveCurrentQuiz(activeQuiz); }, [activeQuiz]);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const addChapter = useCallback((chapter: Chapter) => {
    setChapters(prev => [...prev, chapter]);
  }, []);

  const deleteChapter = useCallback((id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
    setQuizzes(prev => prev.filter(q => q.chapterId !== id));
  }, []);

  const addQuiz = useCallback((quiz: Quiz) => {
    setQuizzes(prev => [...prev, quiz]);
    setActiveQuiz(quiz);
    setView('quiz');
  }, []);

  const saveQuizAnswers = useCallback((quizId: string, answers: Record<string, number>, score: number, timeTaken?: number) => {
    const updatedQuiz = { ...activeQuiz!, answers, score, graded: true, timeTaken };

    setQuizzes(prev => prev.map(q =>
      q.id === quizId ? updatedQuiz : q
    ));
    setActiveQuiz(updatedQuiz);

    // Update stats
    setStats(prev => {
      const now = Date.now();
      const lastDay = Math.floor(prev.lastQuizDate / 86400000);
      const today = Math.floor(now / 86400000);
      const isConsecutive = today === lastDay + 1 || today === lastDay;
      const newStreak = isConsecutive ? (today === lastDay ? prev.streak : prev.streak + 1) : 1;

      const newAchievements = [...prev.achievements];
      if (!newAchievements.includes('first_quiz')) newAchievements.push('first_quiz');
      if (score === updatedQuiz.questions.length && !newAchievements.includes('perfect_score')) newAchievements.push('perfect_score');
      if (newStreak >= 3 && !newAchievements.includes('streak_3')) newAchievements.push('streak_3');
      if (newStreak >= 7 && !newAchievements.includes('streak_7')) newAchievements.push('streak_7');
      if (prev.totalQuizzes + 1 >= 10 && !newAchievements.includes('ten_quizzes')) newAchievements.push('ten_quizzes');
      if (timeTaken && timeTaken < 120 && !newAchievements.includes('speed_demon')) newAchievements.push('speed_demon');
      if (updatedQuiz.questions.some(q => q.difficulty === 'hard') && !newAchievements.includes('hard_mode')) newAchievements.push('hard_mode');

      return {
        totalQuizzes: prev.totalQuizzes + 1,
        totalCorrect: prev.totalCorrect + score,
        totalQuestions: prev.totalQuestions + updatedQuiz.questions.length,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        lastQuizDate: now,
        achievements: newAchievements,
      };
    });

    setView('results');
  }, [activeQuiz]);

  const startQuiz = useCallback((quiz: Quiz) => {
    const resetQuiz = { ...quiz, answers: undefined, score: undefined, graded: false };
    setActiveQuiz(resetQuiz);
    setView('quiz');
  }, []);

  const deleteQuiz = useCallback((id: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  }, []);

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard chapters={chapters} quizzes={quizzes} stats={stats} settings={settings} onStartQuiz={startQuiz} onNavigate={setView} onDeleteQuiz={deleteQuiz} />;
      case 'chapters':
        return <ChapterManager chapters={chapters} onAdd={addChapter} onDelete={deleteChapter} activeChapter={activeChapter} onSelectChapter={setActiveChapter} />;
      case 'generate':
        return <QuizGenerator chapters={chapters} activeChapter={activeChapter} onGenerate={addQuiz} onSelectChapter={setActiveChapter} settings={settings} />;
      case 'quiz':
        return activeQuiz ? <QuizTaker quiz={activeQuiz} settings={settings} onSubmit={saveQuizAnswers} onBack={() => setView('dashboard')} /> : null;
      case 'results':
        return activeQuiz ? <QuizResults quiz={activeQuiz} stats={stats} onBack={() => setView('dashboard')} onRetake={() => startQuiz(activeQuiz)} onPrint={() => setView('print')} /> : null;
      case 'print':
        return activeQuiz ? <PrintView quiz={activeQuiz} onBack={() => setView('dashboard')} /> : null;
      case 'settings':
        return <SettingsPanel settings={settings} stats={stats} onUpdate={updateSettings} onExport={() => { const blob = new Blob([exportData()], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'quizforge-backup.json'; a.click(); URL.revokeObjectURL(url); }} onImport={(json: string) => { if (importData(json)) { setChapters(loadChapters()); setQuizzes(loadQuizzes()); setSettings(loadSettings()); setStats(loadStats()); } }} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background decorations */}
      <div className="bg-blobs no-print">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>
      <div className="pattern-overlay no-print" />

      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link no-print">Skip to main content</a>

      {/* Sidebar */}
      <Sidebar
        currentView={view}
        onNavigate={setView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chapterCount={chapters.length}
        quizCount={quizzes.length}
        streak={stats.streak}
      />

      {/* Main content */}
      <main
        id="main-content"
        className={`relative z-10 transition-all duration-300 ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-16'}`}
        role="main"
        aria-label="Main content"
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          {renderView()}
        </div>

        {/* Footer */}
        <footer className="no-print mt-12 pb-8 text-center">
          <div className="glass-card-static inline-flex items-center gap-4 px-6 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>QuizForge © 2024</span>
            <span>•</span>
            <button onClick={() => setView('settings')} className="hover:underline" style={{ color: 'var(--text-accent)' }}>Settings</button>
            <span>•</span>
            <span>Made for learners</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
