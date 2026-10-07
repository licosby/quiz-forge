import { useState } from 'react';
import { Chapter, Quiz } from '../types';
import { generateQuiz } from '../utils/quizGenerator';
import { v4 as uuidv4 } from 'uuid';
import { Wand2, Settings, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';

interface QuizGeneratorProps {
  chapters: Chapter[];
  activeChapter: Chapter | null;
  onGenerate: (quiz: Quiz) => void;
  onSelectChapter: (chapter: Chapter) => void;
}

export default function QuizGenerator({ chapters, activeChapter, onGenerate, onSelectChapter }: QuizGeneratorProps) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleGenerate = () => {
    if (!activeChapter) return;
    setIsGenerating(true);

    // Simulate processing time for UX
    setTimeout(() => {
      const questions = generateQuiz(activeChapter.content, numQuestions);

      if (questions.length === 0) {
        setIsGenerating(false);
        alert('Could not generate questions from this content. Try adding more text (minimum 200 characters recommended).');
        return;
      }

      const quiz: Quiz = {
        id: uuidv4(),
        chapterId: activeChapter.id,
        chapterTitle: activeChapter.title,
        subject: activeChapter.subject,
        questions,
        createdAt: Date.now(),
      };

      onGenerate(quiz);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate Quiz</h1>
        <p className="text-gray-500 mt-1">Create multiple choice worksheets from your chapter content</p>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Quiz Settings</h2>
        </div>

        <div className="space-y-5">
          {/* Chapter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Chapter</label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-indigo-300 transition-colors"
              >
                {activeChapter ? (
                  <div>
                    <span className="font-medium text-gray-900">{activeChapter.title}</span>
                    <span className="ml-2 text-sm text-gray-500">({activeChapter.subject})</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Choose a chapter...</span>
                )}
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                  {chapters.length > 0 ? (
                    chapters.map(chapter => (
                      <button
                        key={chapter.id}
                        onClick={() => {
                          onSelectChapter(chapter);
                          setShowDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 ${
                          activeChapter?.id === chapter.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <span className="font-medium text-gray-900">{chapter.title}</span>
                        <span className="ml-2 text-sm text-gray-500">({chapter.subject} • {chapter.content.length} chars)</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                      <p>No chapters available</p>
                      <p className="text-sm mt-1">Upload a chapter first to generate quizzes</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions: <span className="text-indigo-600 font-bold">{numQuestions}</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>30</span>
            </div>
          </div>

          {/* Content Preview */}
          {activeChapter && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Content Preview</h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {activeChapter.content.substring(0, 300)}...
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>{activeChapter.content.split(/\s+/).length} words</span>
                <span>{activeChapter.content.length} characters</span>
                <span>{activeChapter.content.split(/[.!?]+/).filter(s => s.trim().length > 0).length} sentences</span>
              </div>
            </div>
          )}

          {/* Warning for short content */}
          {activeChapter && activeChapter.content.length < 200 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Content may be too short</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  For best results, upload at least 200 characters of content. More content = better questions.
                </p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!activeChapter || isGenerating}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all ${
              !activeChapter || isGenerating
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 hover:shadow-xl'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Quiz
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Tips for Better Quizzes
        </h3>
        <ul className="space-y-2 text-sm text-indigo-800">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            Upload content with clear definitions and key terms for the best questions
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            Longer chapters (500+ words) produce more diverse and accurate questions
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            Content with structured information (headings, lists) works best
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            You can regenerate quizzes multiple times for different question sets
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            Generated quizzes can be taken digitally or printed for manual grading
          </li>
        </ul>
      </div>

      {/* No chapters state */}
      {chapters.length === 0 && (
        <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No Chapters Available</h3>
          <p className="text-gray-500 mt-2">
            Go to "My Chapters" to upload your lecture notes and readings first.
          </p>
        </div>
      )}
    </div>
  );
}
