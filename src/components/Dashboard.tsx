import { Chapter, Quiz, View, UserStats, AppSettings, ACHIEVEMENTS } from '../types';
import { BookOpen, Wand2, PlayCircle, BarChart3, Printer, Trophy, Target, TrendingUp, Flame, Trash2, RotateCcw } from 'lucide-react';

interface DashboardProps {
  chapters: Chapter[];
  quizzes: Quiz[];
  stats: UserStats;
  settings: AppSettings;
  onStartQuiz: (quiz: Quiz) => void;
  onNavigate: (view: View) => void;
  onDeleteQuiz: (id: string) => void;
}

export default function Dashboard({ chapters, quizzes, stats, onStartQuiz, onNavigate, onDeleteQuiz }: DashboardProps) {
  const gradedQuizzes = quizzes.filter(q => q.graded);
  const avgScore = gradedQuizzes.length > 0
    ? Math.round(gradedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / gradedQuizzes.reduce((sum, q) => sum + q.questions.length, 0) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-gradient" style={{ fontFamily: 'Nunito, sans-serif' }}>Welcome Back!</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">Ready to test your knowledge today?</p>
        </div>
        {stats.streak > 0 && (
          <div className="glass-card-static inline-flex items-center gap-2 px-4 py-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats.streak} day streak</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { icon: BookOpen, label: 'Chapters', value: chapters.length, color: 'var(--accent-primary)' },
          { icon: Target, label: 'Quizzes', value: quizzes.length, color: 'var(--emerald)' },
          { icon: Trophy, label: 'Avg Score', value: `${avgScore}%`, color: 'var(--amber)' },
          { icon: TrendingUp, label: 'Accuracy', value: stats.totalQuestions > 0 ? `${Math.round(stats.totalCorrect / stats.totalQuestions * 100)}%` : '—', color: 'var(--rose)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 md:p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('chapters')}
          className="glass-card p-6 text-left group cursor-pointer"
          style={{ background: 'var(--accent-gradient)', border: 'none' }}
        >
          <BookOpen className="w-8 h-8 mb-3 text-white/90 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white">Upload Content</h3>
          <p className="text-sm text-white/70 mt-1">Add lectures and readings to generate quizzes</p>
        </button>
        <button
          onClick={() => onNavigate('generate')}
          className="glass-card p-6 text-left group cursor-pointer"
          style={{ background: 'linear-gradient(135deg, var(--emerald), #059669)', border: 'none' }}
        >
          <Wand2 className="w-8 h-8 mb-3 text-white/90 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white">Generate Quiz</h3>
          <p className="text-sm text-white/70 mt-1">Create multiple choice worksheets instantly</p>
        </button>
      </div>

      {/* Achievements */}
      {stats.achievements.length > 0 && (
        <div className="glass-card-static p-5">
          <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy className="w-5 h-5" style={{ color: 'var(--amber)' }} /> Achievements
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.achievements.map(id => {
              const achievement = ACHIEVEMENTS[id];
              if (!achievement) return null;
              return (
                <div key={id} className="tooltip glass-card-static px-3 py-2 flex items-center gap-2" data-tooltip={achievement.description}>
                  <span className="text-lg">{achievement.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{achievement.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Quizzes */}
      {quizzes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Nunito, sans-serif' }}>Recent Quizzes</h2>
          <div className="space-y-3">
            {quizzes.slice(-5).reverse().map((quiz, i) => (
              <div
                key={quiz.id}
                className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{quiz.chapterTitle}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--text-accent)' }}>
                      {quiz.subject}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{quiz.questions.length} questions</span>
                    {quiz.graded && (
                      <span className={`text-xs font-bold ${
                        (quiz.score! / quiz.questions.length) >= 0.7 ? '' : ''
                      }`} style={{ color: (quiz.score! / quiz.questions.length) >= 0.7 ? 'var(--emerald)' : 'var(--rose)' }}>
                        {Math.round((quiz.score! / quiz.questions.length) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {!quiz.graded ? (
                    <button onClick={() => onStartQuiz(quiz)} className="btn-primary text-sm py-2 px-3">
                      <PlayCircle className="w-4 h-4" /> Take
                    </button>
                  ) : (
                    <button onClick={() => onStartQuiz(quiz)} className="btn-secondary text-sm py-2 px-3">
                      <RotateCcw className="w-4 h-4" /> Retake
                    </button>
                  )}
                  <button onClick={() => onDeleteQuiz(quiz.id)} className="btn-ghost text-sm py-2 px-2" style={{ color: 'var(--rose)' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {chapters.length === 0 && quizzes.length === 0 && (
        <div className="glass-card-static text-center py-12 animate-bounce-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
            <Wand2 className="w-10 h-10" style={{ color: 'var(--text-accent)' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Get Started</h3>
          <p className="mt-2 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Upload your lecture notes or reading materials, then generate multiple choice quizzes to test your knowledge.
          </p>
          <button onClick={() => onNavigate('chapters')} className="btn-primary mt-4">
            <BookOpen className="w-4 h-4" /> Upload First Chapter
          </button>
        </div>
      )}
    </div>
  );
}
