import { Chapter, Quiz, View } from '../types';
import { BookOpen, Wand2, PlayCircle, BarChart3, Printer, Trophy, Target, TrendingUp } from 'lucide-react';

interface DashboardProps {
  chapters: Chapter[];
  quizzes: Quiz[];
  onStartQuiz: (quiz: Quiz) => void;
  onViewResults: (quiz: Quiz) => void;
  onPrintQuiz: (quiz: Quiz) => void;
  onNavigate: (view: View) => void;
}

export default function Dashboard({ chapters, quizzes, onStartQuiz, onViewResults, onPrintQuiz, onNavigate }: DashboardProps) {
  const gradedQuizzes = quizzes.filter(q => q.graded);
  const avgScore = gradedQuizzes.length > 0
    ? Math.round(gradedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / gradedQuizzes.reduce((sum, q) => sum + q.questions.length, 0) * 100)
    : 0;

  const subjects = [...new Set(chapters.map(c => c.subject))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to QuizForge</h1>
        <p className="text-gray-500 mt-1">Your AI-powered study worksheet generator</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
              <p className="text-xs text-gray-500">Chapters</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
              <p className="text-xs text-gray-500">Quizzes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              <p className="text-xs text-gray-500">Subjects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('chapters')}
          className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl p-6 text-left hover:from-indigo-600 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200 group"
        >
          <BookOpen className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold">Upload Chapter Content</h3>
          <p className="text-indigo-200 text-sm mt-1">Add your lectures and readings to generate quizzes</p>
        </button>
        <button
          onClick={() => onNavigate('generate')}
          className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 text-left hover:from-purple-600 hover:to-purple-800 transition-all shadow-lg shadow-purple-200 group"
        >
          <Wand2 className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold">Generate a Quiz</h3>
          <p className="text-purple-200 text-sm mt-1">Create multiple choice worksheets from your content</p>
        </button>
      </div>

      {/* Recent Quizzes */}
      {quizzes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Quizzes</h2>
          <div className="space-y-3">
            {quizzes.slice(-5).reverse().map(quiz => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{quiz.chapterTitle}</h3>
                  <p className="text-sm text-gray-500">
                    {quiz.questions.length} questions • {quiz.subject}
                    {quiz.graded && (
                      <span className={`ml-2 font-medium ${
                        (quiz.score! / quiz.questions.length) >= 0.7 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        Score: {quiz.score}/{quiz.questions.length} ({Math.round((quiz.score! / quiz.questions.length) * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!quiz.graded && (
                    <button
                      onClick={() => onStartQuiz(quiz)}
                      className="flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" /> Take
                    </button>
                  )}
                  {quiz.graded && (
                    <button
                      onClick={() => onViewResults(quiz)}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" /> Results
                    </button>
                  )}
                  <button
                    onClick={() => onPrintQuiz(quiz)}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button
                    onClick={() => onStartQuiz({ ...quiz, answers: undefined, score: undefined, graded: false })}
                    className="flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                  >
                    <Wand2 className="w-4 h-4" /> Retake
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {chapters.length === 0 && quizzes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
            <Wand2 className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Get Started</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Upload your lecture notes or reading materials, then generate multiple choice quizzes to test your knowledge.
          </p>
        </div>
      )}
    </div>
  );
}
