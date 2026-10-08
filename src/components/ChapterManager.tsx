import { useState } from 'react';
import { Chapter } from '../types';
import { Upload, FileText, Trash2, Eye, Plus, AlertCircle } from 'lucide-react';
import { hasStructuredFormat, getFormattingInstructions } from '../utils/structuredParser';

interface ChapterManagerProps {
  chapters: Chapter[];
  onAdd: (chapter: Chapter) => void;
  onDelete: (id: string) => void;
}

export default function ChapterManager({ chapters, onAdd, onDelete }: ChapterManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // Check if content has structured format
    if (!hasStructuredFormat(content)) {
      const confirmed = window.confirm(
        'Warning: Your content does not appear to follow the required Q: and A: format. ' +
        'The quiz generator may not work correctly. Do you want to continue anyway?'
      );
      if (!confirmed) return;
    }

    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: title.trim(),
      subject: subject.trim() || 'General',
      content: content.trim(),
      createdAt: Date.now(),
    };

    onAdd(newChapter);
    setTitle('');
    setSubject('');
    setContent('');
    setShowForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Chapters</h1>
        <p className="text-gray-600">Upload your lecture notes and reading materials in structured format</p>
      </div>

      {/* Format Instructions Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <AlertCircle size={20} />
          {showInstructions ? 'Hide' : 'Show'} Formatting Instructions
        </button>

        {showInstructions && (
          <div className="mt-4 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-900">How to Format Your Content</h3>
            <pre className="text-sm bg-white p-4 rounded border border-blue-300 overflow-x-auto whitespace-pre-wrap">
              {getFormattingInstructions()}
            </pre>
          </div>
        )}
      </div>

      {/* Add Chapter Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        <Plus size={20} />
        Add New Chapter
      </button>

      {/* Add Chapter Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Upload New Chapter</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Chapter 1: Introduction to Biology"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Biology, History, Math"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content * (Must follow Q: and A: format)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                rows={12}
                placeholder="Q: What is the capital of France?&#10;A: Paris&#10;&#10;Q: Who wrote Romeo and Juliet?&#10;A: William Shakespeare"
                required
              />
              <div className="mt-2 flex gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                  <Upload size={18} />
                  Upload Text File
                  <input
                    type="file"
                    accept=".txt,.md,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {content && !hasStructuredFormat(content) && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Warning: Content does not appear to follow the Q: and A: format. 
                    Please format your content as shown in the instructions above.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Save Chapter
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">No chapters yet</p>
          <p className="text-sm text-gray-500">Click "Add New Chapter" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{chapter.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                        {chapter.subject}
                      </span>
                      <span>{chapter.content.length} characters</span>
                      <span>•</span>
                      <span>{new Date(chapter.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedId(expandedId === chapter.id ? null : chapter.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Preview content"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this chapter?')) {
                          onDelete(chapter.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete chapter"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {expandedId === chapter.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 max-h-96 overflow-y-auto">
                      {chapter.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
