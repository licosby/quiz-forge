import { useState } from 'react';
import { Quiz } from '../types';
import { ArrowLeft, Printer, Eye } from 'lucide-react';

interface PrintViewProps {
  quiz: Quiz;
  onBack: () => void;
}

export default function PrintView({ quiz, onBack }: PrintViewProps) {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [showDate, setShowDate] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls (hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Print Preview</h1>
            <p className="text-sm text-gray-500">Preview and print your quiz worksheet</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              showAnswerKey
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            {showAnswerKey ? 'Hide' : 'Show'} Answer Key
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Print Options */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 print:hidden">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDate}
              onChange={(e) => setShowDate(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Include date field</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAnswerKey}
              onChange={(e) => setShowAnswerKey(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Include answer key (separate page)</span>
          </label>
        </div>
      </div>

      {/* Printable Quiz */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:rounded-none">
        <div className="p-8 print:p-4">
          {/* Quiz Header */}
          <div className="border-b-2 border-gray-800 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 print:text-xl">{quiz.chapterTitle}</h1>
                <p className="text-gray-600 mt-1">Subject: {quiz.subject}</p>
                <p className="text-gray-600 text-sm">Multiple Choice Quiz • {quiz.questions.length} Questions</p>
              </div>
              <div className="text-right">
                {showDate && (
                  <p className="text-sm text-gray-600">Date: _______________</p>
                )}
                <p className="text-sm text-gray-600 mt-1">Name: _______________</p>
                <p className="text-sm text-gray-600 mt-1">Score: _____ / {quiz.questions.length}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg print:bg-gray-50">
            <p className="text-sm text-gray-700 font-medium">
              Instructions: Read each question carefully and circle the letter of the best answer. Each question has only one correct answer.
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {quiz.questions.map((question, qIndex) => (
              <div key={question.id} className="break-inside-avoid">
                <p className="font-medium text-gray-900 mb-2">
                  <span className="text-gray-500">{qIndex + 1}.</span> {question.question}
                </p>
                <div className="ml-6 space-y-1.5">
                  {question.options.map((option, oIndex) => {
                    const letter = String.fromCharCode(65 + oIndex);
                    return (
                      <div key={oIndex} className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[20px]">{letter})</span>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              Generated by QuizForge • {new Date(quiz.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Answer Key (separate page) */}
      {showAnswerKey && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:rounded-none print:break-before-page">
          <div className="p-8 print:p-4">
            <div className="border-b-2 border-gray-800 pb-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Answer Key</h2>
              <p className="text-gray-600 text-sm">{quiz.chapterTitle} • {quiz.subject}</p>
              <p className="text-xs text-red-600 font-medium mt-1">⚠ Instructor Copy - Do Not Distribute</p>
            </div>

            {/* Quick Answer Grid */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Quick Reference</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {quiz.questions.map((question, qIndex) => {
                  const letter = String.fromCharCode(65 + question.correctAnswer);
                  return (
                    <div key={question.id} className="text-center">
                      <span className="text-xs text-gray-500">{qIndex + 1}.</span>
                      <span className="font-bold text-gray-900 ml-0.5">{letter}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Answers */}
            <div className="space-y-4">
              {quiz.questions.map((question, qIndex) => {
                const correctLetter = String.fromCharCode(65 + question.correctAnswer);
                return (
                  <div key={question.id} className="break-inside-avoid">
                    <p className="font-medium text-gray-900 text-sm">
                      <span className="text-gray-500">{qIndex + 1}.</span> Answer: <span className="text-emerald-700 font-bold">{correctLetter}) {question.options[question.correctAnswer]}</span>
                    </p>
                    {question.explanation && (
                      <p className="text-xs text-gray-500 ml-6 mt-0.5">{question.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grading Notes */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Grading Notes</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Total Questions: {quiz.questions.length}</p>
                <p>• Points per question: _____</p>
                <p>• Total Points: _____</p>
                <p>• Student Score: _____ / _____</p>
                <p>• Percentage: _____%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
