import { useState } from 'react';
import { Chapter, Quiz } from '../types';
import { generateQuizFromContent } from '../utils/quizGenerator';
import { Wand2, AlertCircle, Loader2 } from 'lucide-react';

interface QuizGeneratorProps {
  chapters: Chapter[];
  onGenerate: (quiz: Quiz) => void;
}

export default function QuizGenerator({ chapters, onGenerate }: QuizGeneratorProps) {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedChapter) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Generate questions using AI
      const questions = await generateQuizFromContent(selectedChapter.content, numQuestions);

      if (questions.length === 0) {
        throw new Error('No questions were generated. Please try again with different content.');
      }

      // Create quiz object
      const quiz: Quiz = {
        id: Date.now().toString(),
        chapterId: selectedChapter.id,
        chapterTitle: selectedChapter.title,
        subject: selectedChapter.subject,
        questions: questions,
        createdAt: Date.now(),
      };

      onGenerate(quiz);
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">No Chapters Available</h2>
        <p className="text-gray-600">Please add a chapter first before generating a quiz.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Quiz</h1>
        <p className="text-gray-600">Create a quiz from your structured chapter content</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Chapter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Chapter
            </label>
            <select
              value={selectedChapter?.id || ''}
              onChange={(e) => {
                const chapter = chapters.find(c => c.id === e.target.value);
                setSelectedChapter(chapter || null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a chapter...</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title} ({chapter.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions: {numQuestions}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40</span>
              <span>45</span>
              <span>50</span>
            </div>
          </div>

          {/* Preview */}
          {selectedChapter && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Content Preview</h3>
              <pre className="text-xs whitespace-pre-wrap font-mono text-gray-600 max-h-48 overflow-y-auto">
                {selectedChapter.content.substring(0, 500)}
                {selectedChapter.content.length > 500 && '\n\n... (truncated)'}
              </pre>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 text-green-700">
                  ✓ {selectedChapter.content.length.toLocaleString()} characters ready for AI analysis
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-medium text-red-900 mb-1">Generation Failed</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!selectedChapter || isGenerating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                AI is analyzing your content...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate Quiz with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">How It Works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Upload any textbook chapter, lecture notes, or study material</li>
          <li>• AI automatically analyzes the content and generates exam-style questions</li>
          <li>• Questions include clear stems, plausible answer choices, and explanations</li>
          <li>• Each question references the source text for verification</li>
          <li>• No manual formatting required - just upload and generate!</li>
        </ul>
      </div>
    </div>
  );
}
