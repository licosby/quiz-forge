import { useState, useEffect } from 'react';
import { Chapter, Quiz, View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChapterManager from './components/ChapterManager';
import QuizGenerator from './components/QuizGenerator';
import QuizTaker from './components/QuizTaker';
import QuizResults from './components/QuizResults';
import PrintView from './components/PrintView';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const savedChapters = localStorage.getItem('quizforge-chapters');
    const savedQuizzes = localStorage.getItem('quizforge-quizzes');
    if (savedChapters) setChapters(JSON.parse(savedChapters));
    if (savedQuizzes) setQuizzes(JSON.parse(savedQuizzes));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('quizforge-chapters', JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem('quizforge-quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  const addChapter = (chapter: Chapter) => {
    setChapters(prev => [...prev, chapter]);
  };

  const deleteChapter = (id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
    setQuizzes(prev => prev.filter(q => q.chapterId !== id));
  };

  const addQuiz = (quiz: Quiz) => {
    setQuizzes(prev => [...prev, quiz]);
    setActiveQuiz(quiz);
    setView('quiz');
  };

  const saveQuizAnswers = (quizId: string, answers: Record<string, number>, score: number) => {
    setQuizzes(prev => prev.map(q =>
      q.id === quizId ? { ...q, answers, score, graded: true } : q
    ));
    if (activeQuiz && activeQuiz.id === quizId) {
      setActiveQuiz(prev => prev ? { ...prev, answers, score, graded: true } : null);
    }
  };

  const deleteQuiz = (id: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView('quiz');
  };

  const viewResults = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView('results');
  };

  const printQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView('print');
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            chapters={chapters}
            quizzes={quizzes}
            onStartQuiz={startQuiz}
            onViewResults={viewResults}
            onPrintQuiz={printQuiz}
            onNavigate={setView}
          />
        );
      case 'chapters':
        return (
          <ChapterManager
            chapters={chapters}
            onAdd={addChapter}
            onDelete={deleteChapter}
            activeChapter={activeChapter}
            onSelectChapter={setActiveChapter}
          />
        );
      case 'generate':
        return (
          <QuizGenerator
            chapters={chapters}
            activeChapter={activeChapter}
            onGenerate={addQuiz}
            onSelectChapter={setActiveChapter}
          />
        );
      case 'quiz':
        return activeQuiz ? (
          <QuizTaker
            quiz={activeQuiz}
            onSubmit={saveQuizAnswers}
            onBack={() => setView('dashboard')}
          />
        ) : null;
      case 'results':
        return activeQuiz ? (
          <QuizResults
            quiz={activeQuiz}
            onBack={() => setView('dashboard')}
            onRetake={() => {
              const resetQuiz = { ...activeQuiz, answers: undefined, score: undefined, graded: false };
              setActiveQuiz(resetQuiz);
              setView('quiz');
            }}
            onPrint={() => setView('print')}
          />
        ) : null;
      case 'print':
        return activeQuiz ? (
          <PrintView
            quiz={activeQuiz}
            onBack={() => setView('dashboard')}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        currentView={view}
        onNavigate={setView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chapterCount={chapters.length}
        quizCount={quizzes.length}
      />
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
