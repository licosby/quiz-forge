import { useState } from 'react';
import { Quiz } from '../types';
import { ArrowLeft, RotateCcw, Printer, CheckCircle, XCircle, BookOpen, Lightbulb } from 'lucide-react';

interface QuizResultsProps {
  quiz: Quiz;
  onBack: () => void;
  onRetake: () => void;
  onPrint: () => void;
}

export default function QuizResults({ quiz, onBack, onRetake, onPrint }: QuizResultsProps) {
  const score = quiz.score || 0;
  const total = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);
  const answers = quiz.answers || {};
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getGrade = () => {
    if (percentage >= 90) return { label: 'A+', color: 'var(--emerald)', message: 'Outstanding!' };
    if (percentage >= 80) return { label: 'A', color: 'var(--emerald)', message: 'Excellent work!' };
    if (percentage >= 70) return { label: 'B', color: 'var(--sky)', message: 'Great job!' };
    if (percentage >= 60) return { label: 'C', color: 'var(--amber)', message: 'Good effort!' };
    return { label: 'D', color: 'var(--rose)', message: 'Keep studying!' };
  };

  const grade = getGrade();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost p-2" aria-label="Go back"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 style={{ color: 'var(--text-primary)' }}>Quiz Results</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{quiz.chapterTitle} • {quiz.subject}</p>
        </div>
      </div>

      <div className="glass-card-static p-8 text-center">
        <div className="animate-score-reveal">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-4" style={{ background: grade.color + '15' }}>
            <span className="text-5xl font-black" style={{ color: grade.color }}>{grade.label}</span>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-1" style={{ color: grade.color }}>{grade.message}</h2>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{percentage}%</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Score</p>
          </div>
          <div className="w-px h-12" style={{ background: 'var(--border-primary)' }} />
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{score}/{total}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Correct</p>
          </div>
        </div>

        <div className="mt-6 max-w-md mx-auto">
          <div className="progress-bar h-3">
            <div className="progress-bar-fill h-full" style={{ width: `${percentage}%`, background: grade.color }} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <button onClick={onRetake} className="btn-secondary"><RotateCcw className="w-4 h-4" /> Retake</button>
          <button onClick={onPrint} className="btn-secondary"><Printer className="w-4 h-4" /> Print</button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Detailed Review</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Click on any question to see detailed explanations and source references
        </p>
        <div className="space-y-3">
          {quiz.questions.map((question, qIndex) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            const isExpanded = expandedQuestions.has(question.id);

            return (
              <div key={question.id} className="glass-card-static p-4" style={{ borderColor: isCorrect ? 'var(--emerald)' + '40' : 'var(--rose)' + '40' }}>
                <div 
                  className="flex items-start gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleQuestion(question.id)}
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: isCorrect ? 'var(--emerald)' + '20' : 'var(--rose)' + '20' }}>
                    {isCorrect ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--emerald)' }} /> : <XCircle className="w-4 h-4" style={{ color: 'var(--rose)' }} />}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Q{qIndex + 1}.</span> {question.question}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? '▼ Click to collapse' : '▶ Click to expand'}
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="ml-10 space-y-3 animate-fade-in">
                    <div className="space-y-1">
                      {question.options.map((option, oIndex) => {
                        const isUserChoice = userAnswer === oIndex;
                        const isCorrectAnswer = question.correctAnswer === oIndex;
                        const letter = String.fromCharCode(65 + oIndex);
                        
                        let style = { background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid transparent' };
                        let icon = null;
                        
                        if (isCorrectAnswer) {
                          style = { background: 'var(--emerald)' + '15', color: 'var(--emerald)', border: '1px solid var(--emerald)' + '30' };
                          icon = <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--emerald)' }} />;
                        } else if (isUserChoice) {
                          style = { background: 'var(--rose)' + '15', color: 'var(--rose)', border: '1px solid var(--rose)' + '30' };
                          icon = <XCircle className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--rose)' }} />;
                        }

                        return (
                          <div key={oIndex} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={style}>
                            <span className="font-bold flex-shrink-0">{letter}.</span>
                            <span className="flex-1">{option}</span>
                            {icon}
                            {isCorrectAnswer && (
                              <span className="text-xs font-semibold flex-shrink-0">✓ Correct Answer</span>
                            )}
                            {isUserChoice && !isCorrect && (
                              <span className="text-xs font-semibold flex-shrink-0">Your Answer</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="p-3 rounded-lg" style={{ 
                        background: 'var(--accent-primary)' + '10',
                        border: '1px solid var(--accent-primary)' + '20'
                      }}>
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
                          <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-primary)' }}>
                              Explanation:
                            </p>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {question.sourceText && (
                      <div className="p-3 rounded-lg" style={{ 
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)'
                      }}>
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                          <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                              📖 Source from your chapter:
                            </p>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                              "{question.sourceText}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isCorrect && (
                      <div className="p-3 rounded-lg" style={{ 
                        background: 'var(--rose)' + '10',
                        border: '1px solid var(--rose)' + '20'
                      }}>
                        <p className="text-xs" style={{ color: 'var(--rose)' }}>
                          <strong>Why the other options are incorrect:</strong> The other choices don't accurately describe or relate to the concept being tested. Review the source text above to understand the correct context and relationships.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
