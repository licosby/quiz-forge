import { useState, useRef } from 'react';
import { Chapter } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Upload, FileText, Trash2, Eye, EyeOff, Plus, BookOpen } from 'lucide-react';

interface ChapterManagerProps {
  chapters: Chapter[];
  onAdd: (chapter: Chapter) => void;
  onDelete: (id: string) => void;
  activeChapter: Chapter | null;
  onSelectChapter: (chapter: Chapter | null) => void;
}

export default function ChapterManager({ chapters, onAdd, onDelete, activeChapter, onSelectChapter }: ChapterManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const chapter: Chapter = {
      id: uuidv4(),
      title: title.trim(),
      subject: subject.trim() || 'General',
      content: content.trim(),
      createdAt: Date.now(),
    };

    onAdd(chapter);
    setTitle('');
    setSubject('');
    setContent('');
    setShowForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const subjects = [...new Set(chapters.map(c => c.subject))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Chapters</h1>
          <p className="text-gray-500 mt-1">Upload and manage your lecture notes and readings</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </button>
      </div>

      {/* Add Chapter Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Chapter</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chapter 1: Introduction to Biology"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Biology, History, Math"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    list="subjects-list"
                  />
                  <datalist id="subjects-list">
                    {subjects.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your lecture notes, reading material, or chapter content here..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[200px] resize-y font-mono text-sm"
                  required
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-400 mt-1">
                Paste text directly or upload a .txt, .md, or .csv file. Minimum 200 characters recommended for best quiz generation.
              </p>
              {content.length > 0 && (
                <p className={`text-xs mt-1 ${content.length < 200 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {content.length} characters {content.length < 200 ? '(add more for better questions)' : '(good length!)'}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Save Chapter
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chapter List */}
      {chapters.length > 0 ? (
        <div className="space-y-3">
          {chapters.map(chapter => (
            <div
              key={chapter.id}
              className={`bg-white rounded-xl shadow-sm border transition-all ${
                activeChapter?.id === chapter.id ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100 hover:shadow-md'
              }`}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => onSelectChapter(chapter)}>
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                    <p className="text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                        {chapter.subject}
                      </span>
                      <span className="ml-2">{chapter.content.length} chars</span>
                      <span className="ml-2 text-gray-400">• {new Date(chapter.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === chapter.id ? null : chapter.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Preview content"
                  >
                    {expandedId === chapter.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onDelete(chapter.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete chapter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === chapter.id && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{chapter.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No Chapters Yet</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            Upload your first chapter's lecture notes or reading material to get started with quiz generation.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Add Your First Chapter
          </button>
        </div>
      )}
    </div>
  );
}
