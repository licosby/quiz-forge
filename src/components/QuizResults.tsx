import { Quiz } from '../types';
import { ArrowLeft, RotateCcw, Printer, CheckCircle, XCircle } from 'lucide-react';

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

  const getGrade = () => {
    if (percentage >= 90) return { label: 'A', color: 'text-emerald-600', bg: 'bg-emerald-50', message: 'Excellent work!' };
    if (percentage >= 80) return { label: 'B', color: 'text-blue-600', bg: 'bg-blue-50', message: 'Great job!' };
    if (percentage >= 70) return { label: 'C', color: 'text-amber-600', bg: 'bg-amber-50', message: 'Good effort!' };
    if (percentage >= 60) return { label: 'D', color: 'text-orange-600', bg: 'bg-orange-50', message: 'Keep studying!' };
    return { label: 'F', color: 'text-red-600', bg: 'bg-red-50', message: 'Review the material and try again.' };
  };

  const grade = getGrade();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
          <p className="text-sm text-gray-500">{quiz.chapterTitle} • {quiz.subject}</p>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${grade.bg} mb-4`}>
          <span className={`text-4xl font-bold ${grade.color}`}>{grade.label}</span>
        </div>
        <h2 className={`text-2xl font-bold ${grade.color}`}>{grade.message}</h2>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
            <p className="text-sm text-gray-500">Score</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{score}/{total}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{total - score}</p>
            <p className="text-sm text-gray-500">Incorrect</p>
          </div>
        </div>

        {/* Score Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                percentage >= 70 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={onRetake}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Results
          </button>
        </div>
      </div>

      {/* Question Review */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Question Review</h2>
        <div className="space-y-4">
          {quiz.questions.map((question, qIndex) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div
                key={question.id}
                className={`bg-white rounded-xl p-5 shadow-sm border ${
                  isCorrect ? 'border-emerald-200' : 'border-red-200'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      <span className="text-gray-400 mr-2">Q{qIndex + 1}.</span>
                      {question.question}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-1.5 ml-10">
                  {question.options.map((option, oIndex) => {
                    const isUserChoice = userAnswer === oIndex;
                    const isCorrectAnswer = question.correctAnswer === oIndex;
                    const letter = String.fromCharCode(65 + oIndex);

                    let optionClass = 'bg-gray-50 text-gray-600 border-gray-100';
                    if (isCorrectAnswer) {
                      optionClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    } else if (isUserChoice && !isCorrect) {
                      optionClass = 'bg-red-50 text-red-800 border-red-200';
                    }

                    return (
                      <div
                        key={oIndex}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${optionClass}`}
                      >
                        <span className="font-bold w-5">{letter}.</span>
                        <span className="flex-1">{option}</span>
                        {isCorrectAnswer && (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Correct
                          </span>
                        )}
                        {isUserChoice && !isCorrect && (
                          <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Your answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {question.explanation && !isCorrect && (
                  <div className="mt-3 ml-10 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Explanation:</span> {question.explanation}
                    </p>
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
