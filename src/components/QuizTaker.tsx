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
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{quiz.chapterTitle}</h1>
            <p className="text-xs text-gray-500">
              {quiz.subject} • Question {answeredCount} of {totalQuestions}
            </p>
          </div>
        </div>
        <div className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
          {answeredCount}/{totalQuestions} answered
        </div>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <div
            key={question.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
          >
            <div className="flex items-start gap-3 mb-6">
              <span className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-indigo-600 text-white">
                {qIndex + 1}
              </span>
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900 leading-relaxed">
                  {question.question}
                </p>
                {question.sourceText && (
                  <button
                    onClick={() => setShowSource(showSource === question.id ? null : question.id)}
                    className="mt-2 text-xs flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    {showSource === question.id ? 'Hide Source' : 'Show Source'}
                  </button>
                )}
                {showSource === question.id && question.sourceText && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs font-semibold mb-2 text-gray-500">
                      📖 From your uploaded chapter:
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {question.sourceText}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 ml-12">
              {question.options.map((option, oIndex) => {
                const isSelected = answers[question.id] === oIndex;
                const letter = String.fromCharCode(65 + oIndex);

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelectAnswer(question.id, oIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isSelected 
                        ? 'bg-indigo-50 border-2 border-indigo-600' 
                        : 'bg-gray-50 border-2 border-transparent hover:border-indigo-300'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isSelected 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-gray-500 border border-gray-300'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-sm text-gray-900">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 -mx-8 px-8">
        {showConfirm ? (
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              {answeredCount < totalQuestions && (
                <span className="text-sm font-medium">
                  {totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? 's' : ''} unanswered
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                Go Back
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Confirm Submit
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <p className="text-sm text-gray-600">
              {answeredCount === totalQuestions ? '✓ All questions answered!' : `${answeredCount} of ${totalQuestions} answered`}
            </p>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={answeredCount === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                answeredCount === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
