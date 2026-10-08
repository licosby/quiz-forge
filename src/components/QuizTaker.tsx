import { useState } from 'react';
import { Quiz } from '../types';
import { ArrowLeft, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';

interface QuizTakerProps {
  quiz: Quiz;
  onSubmit: (quizId: string, answers: Record<string, number>, score: number) => void;
  onBack: () => void;
}

export default function QuizTaker({ quiz, onSubmit, onBack }: QuizTakerProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSource, setShowSource] = useState<string | null>(null);

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    onSubmit(quiz.id, answers, score);
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost p-2" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{quiz.chapterTitle}</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {quiz.subject} • Question {answeredCount} of {totalQuestions}
            </p>
          </div>
        </div>
        <div className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
          {answeredCount}/{totalQuestions} answered
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <div
            key={question.id}
            className="glass-card-static p-6 animate-fade-in"
            style={{ animationDelay: `${qIndex * 0.05}s` }}
          >
            <div className="flex items-start gap-3 mb-6">
              <span className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}>
                {qIndex + 1}
              </span>
              <div className="flex-1">
                <p className="text-base font-medium leading-relaxed pt-1" style={{ color: 'var(--text-primary)' }}>
                  {question.question}
                </p>
                {question.sourceText && (
                  <button
                    onClick={() => setShowSource(showSource === question.id ? null : question.id)}
                    className="mt-2 text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-all hover:scale-105"
                    style={{ 
                      background: 'var(--accent-primary)' + '15',
                      color: 'var(--accent-primary)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <BookOpen className="w-3 h-3" />
                    {showSource === question.id ? 'Hide Source' : 'Show Source'}
                  </button>
                )}
                {showSource === question.id && question.sourceText && (
                  <div className="mt-3 p-3 rounded-lg text-sm" style={{ 
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                      📖 From your uploaded chapter:
                    </p>
                    <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {question.sourceText}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 ml-0 md:ml-12">
              {question.options.map((option, oIndex) => {
                const isSelected = answers[question.id] === oIndex;
                const letter = String.fromCharCode(65 + oIndex);

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelectAnswer(question.id, oIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
                    style={{
                      background: isSelected ? 'var(--accent-primary)' + '20' : 'var(--bg-secondary)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid transparent',
                      color: 'var(--text-primary)',
                    }}
                    aria-label={`Option ${letter}: ${option}`}
                  >
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: isSelected ? 'var(--accent-primary)' : 'var(--bg-card-solid)',
                        color: isSelected ? 'var(--text-on-accent)' : 'var(--text-muted)',
                        border: '1px solid var(--border-input)',
                      }}>
                      {letter}
                    </span>
                    <span className="text-sm flex-1">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t py-4 -mx-6 px-6 no-print" style={{ borderColor: 'var(--border-card)' }}>
        {showConfirm ? (
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center gap-2" style={{ color: 'var(--amber)' }}>
              <AlertTriangle className="w-5 h-5" />
              {answeredCount < totalQuestions && (
                <span className="text-sm font-medium">
                  {totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? 's' : ''} unanswered
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary">Go Back</button>
              <button onClick={handleSubmit} className="btn-primary">Confirm Submit</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {answeredCount === totalQuestions ? '✓ All questions answered!' : `${answeredCount} of ${totalQuestions} answered`}
            </p>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={answeredCount === 0}
              className={`btn-primary ${answeredCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
