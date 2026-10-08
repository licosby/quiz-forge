import { useState, useEffect } from 'react';
import { Chapter, Quiz, View } from './types';
import { loadChapters, saveChapters, loadQuizzes, saveQuizzes } from './utils/storage';
import Sidebar from './components/Sidebar';
import ChapterManager from './components/ChapterManager';
import QuizGenerator from './components/QuizGenerator';
import QuizTaker from './components/QuizTaker';
import QuizResults from './components/QuizResults';

function App() {
  const [view, setView] = useState<View>('chapters');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    setChapters(loadChapters());
    setQuizzes(loadQuizzes());
  }, []);

  // Save chapters to localStorage whenever they change
  useEffect(() => {
    saveChapters(chapters);
  }, [chapters]);

  // Save quizzes to localStorage whenever they change
  useEffect(() => {
    saveQuizzes(quizzes);
  }, [quizzes]);

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

  const addChapter = (chapter: Chapter) => {
    setChapters(prev => [...prev, chapter]);
  };

  const deleteChapter = (id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
  };

  const generateQuiz = (quiz: Quiz) => {
    setQuizzes(prev => [...prev, quiz]);
    setActiveQuiz(quiz);
    setView('quiz');
  };

  const submitQuiz = (quizId: string, answers: Record<string, number>, score: number) => {
    setQuizzes(prev => prev.map(q => 
      q.id === quizId ? { ...q, answers, score, graded: true } : q
    ));
    const updatedQuiz = quizzes.find(q => q.id === quizId);
    if (updatedQuiz) {
      setActiveQuiz({ ...updatedQuiz, answers, score, graded: true });
    }
    setView('results');
  };

  const retakeQuiz = () => {
    if (activeQuiz) {
      const resetQuiz = { ...activeQuiz, answers: undefined, score: undefined, graded: false };
      setActiveQuiz(resetQuiz);
      setView('quiz');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'chapters':
        return <ChapterManager chapters={chapters} onAdd={addChapter} onDelete={deleteChapter} />;
      case 'generate':
        return <QuizGenerator chapters={chapters} onGenerate={generateQuiz} />;
      case 'quiz':
        return activeQuiz ? <QuizTaker quiz={activeQuiz} onSubmit={submitQuiz} onBack={() => setView('generate')} /> : null;
      case 'results':
        return activeQuiz ? <QuizResults quiz={activeQuiz} onBack={() => setView('generate')} onRetake={retakeQuiz} onPrint={() => window.print()} /> : null;
      default:
        return <ChapterManager chapters={chapters} onAdd={addChapter} onDelete={deleteChapter} />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar 
        currentView={view} 
        onViewChange={setView} 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chapterCount={chapters.length}
        quizCount={quizzes.length}
      />
      <main 
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}
        style={{ padding: '2rem' }}
      >
        {renderView()}
      </main>
    </div>
  );
}

export default App;
