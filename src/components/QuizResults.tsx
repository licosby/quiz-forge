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
    if (percentage >= 90) return { label: 'A+', color: 'text-green-600', bg: 'bg-green-50', message: 'Outstanding!' };
    if (percentage >= 80) return { label: 'A', color: 'text-green-600', bg: 'bg-green-50', message: 'Excellent work!' };
    if (percentage >= 70) return { label: 'B', color: 'text-blue-600', bg: 'bg-blue-50', message: 'Great job!' };
    if (percentage >= 60) return { label: 'C', color: 'text-amber-600', bg: 'bg-amber-50', message: 'Good effort!' };
    return { label: 'D', color: 'text-red-600', bg: 'bg-red-50', message: 'Keep studying!' };
  };

  const grade = getGrade();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
          <p className="text-sm text-gray-500">{quiz.chapterTitle} • {quiz.subject}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full mb-4 ${grade.bg}`}>
          <span className={`text-5xl font-black ${grade.color}`}>{grade.label}</span>
        </div>
        <h2 className={`text-xl font-bold mb-1 ${grade.color}`}>{grade.message}</h2>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="text-center">
            <p className="text-3xl font-black text-gray-900">{percentage}%</p>
            <p className="text-xs text-gray-500">Score</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <p className="text-3xl font-black text-gray-900">{score}/{total}</p>
            <p className="text-xs text-gray-500">Correct</p>
          </div>
        </div>

        <div className="mt-6 max-w-md mx-auto">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <button onClick={onRetake} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            <RotateCcw className="w-4 h-4" /> Retake
          </button>
          <button onClick={onPrint} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Detailed Review</h2>
        <p className="text-sm mb-4 text-gray-600">
          Click on any question to see detailed explanations and source references
        </p>
        <div className="space-y-3">
          {quiz.questions.map((question, qIndex) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            const isExpanded = expandedQuestions.has(question.id);

            return (
              <div key={question.id} className={`bg-white rounded-lg shadow-md border-2 p-4 ${
                isCorrect ? 'border-green-200' : 'border-red-200'
              }`}>
                <div 
                  className="flex items-start gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleQuestion(question.id)}
                >
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {isCorrect ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="text-gray-500">Q{qIndex + 1}.</span> {question.question}
                    </p>
                    <p className="text-xs mt-1 text-gray-500">
                      {isExpanded ? '▼ Click to collapse' : '▶ Click to expand'}
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="ml-10 space-y-3">
                    <div className="space-y-1">
                      {question.options.map((option, oIndex) => {
                        const isUserChoice = userAnswer === oIndex;
                        const isCorrectAnswer = question.correctAnswer === oIndex;
                        const letter = String.fromCharCode(65 + oIndex);
                        
                        let style = 'bg-gray-50 text-gray-600 border border-transparent';
                        let icon = null;
                        
                        if (isCorrectAnswer) {
                          style = 'bg-green-50 text-green-700 border border-green-200';
                          icon = <CheckCircle className="w-3 h-3 flex-shrink-0 text-green-600" />;
                        } else if (isUserChoice) {
                          style = 'bg-red-50 text-red-700 border border-red-200';
                          icon = <XCircle className="w-3 h-3 flex-shrink-0 text-red-600" />;
                        }

                        return (
                          <div key={oIndex} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${style}`}>
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
                      <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-600" />
                          <div>
                            <p className="text-xs font-semibold mb-1 text-indigo-600">
                              Explanation:
                            </p>
                            <p className="text-xs leading-relaxed text-gray-700">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {question.sourceText && (
                      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-500" />
                          <div>
                            <p className="text-xs font-semibold mb-1 text-gray-500">
                              📖 Source from your chapter:
                            </p>
                            <p className="text-xs leading-relaxed text-gray-700">
                              "{question.sourceText}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isCorrect && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-xs text-red-700">
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
