import { useState } from 'react';
import { Quiz } from '../types';
import { gradeQuiz } from '../utils/quizGenerator';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

interface QuizTakerProps {
  quiz: Quiz;
  onSubmit: (quizId: string, answers: Record<string, number>, score: number) => void;
  onBack: () => void;
}

export default function QuizTaker({ quiz, onSubmit, onBack }: QuizTakerProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    const result = gradeQuiz(quiz.questions, answers);
    onSubmit(quiz.id, answers, result.score);
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.chapterTitle}</h1>
            <p className="text-sm text-gray-500">{quiz.subject} • {totalQuestions} questions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-700">
            {answeredCount}/{totalQuestions} answered
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-full h-2 overflow-hidden shadow-sm">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <div
            key={question.id}
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${
              answers[question.id] !== undefined
                ? 'border-indigo-200 bg-indigo-50/30'
                : 'border-gray-100'
            }`}
          >
            {/* Question Number & Text */}
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                {qIndex + 1}
              </span>
              <p className="text-gray-900 font-medium leading-relaxed pt-1">{question.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2 ml-11">
              {question.options.map((option, oIndex) => {
                const isSelected = answers[question.id] === oIndex;
                const letter = String.fromCharCode(65 + oIndex);
                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelectAnswer(question.id, oIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 border border-gray-100'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-gray-500 border border-gray-200'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-sm">{option}</span>
                    {isSelected && <CheckCircle className="w-5 h-5 ml-auto text-white/80" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Section */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 -mx-6 px-6 py-4">
        {showConfirm ? (
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              {answeredCount < totalQuestions && (
                <span className="text-sm font-medium">
                  {totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? 's' : ''} unanswered
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <p className="text-sm text-gray-500">
              {answeredCount === totalQuestions
                ? '✓ All questions answered! Ready to submit.'
                : `${answeredCount} of ${totalQuestions} questions answered`}
            </p>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={answeredCount === 0}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                answeredCount === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200'
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
