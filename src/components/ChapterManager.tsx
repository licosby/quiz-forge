import { useState, useRef } from 'react';
import { Chapter } from '../types';
import { Upload, FileText, Trash2, Eye, Plus, Loader2, BookOpen } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingStatus('Reading file...');

    try {
      // Check if it's a PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setProcessingStatus('Extracting text from PDF...');
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        const numPages = pdf.numPages;
        
        for (let i = 1; i <= numPages; i++) {
          setProcessingStatus(`Extracting page ${i} of ${numPages}...`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n\n';
        }
        
        setContent(fullText.trim());
        setProcessingStatus('');
        setIsProcessing(false);
        
        // Auto-fill title from filename if empty
        if (!title) {
          setTitle(file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '));
        }
      } else {
        // Handle text files
        setProcessingStatus('Reading text file...');
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setContent(text);
          setProcessingStatus('');
          setIsProcessing(false);
          
          // Auto-fill title from filename if empty
          if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
          }
        };
        reader.onerror = () => {
          setProcessingStatus('');
          setIsProcessing(false);
          alert('Error reading file. Please try again.');
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('File processing error:', error);
      setProcessingStatus('');
      setIsProcessing(false);
      alert('Error processing file. Please try a different file or paste the content manually.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Chapters</h1>
        <p className="text-gray-600">Upload textbook chapters, lecture notes, or any study material</p>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <BookOpen className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Upload any textbook chapter (PDF or text file) or paste content directly</li>
              <li>The AI will automatically analyze the content and generate quiz questions</li>
              <li>No special formatting required - just upload your study material!</li>
              <li>Each student gets randomly generated questions for unique quizzes</li>
            </ul>
          </div>
        </div>
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
                placeholder="e.g., Chapter 16: The Era of Reconstruction"
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
                placeholder="e.g., US History, Biology, Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  rows={12}
                  placeholder="Paste your textbook chapter content here, or upload a file below..."
                  required
                  disabled={isProcessing}
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin text-indigo-600" size={24} />
                      <span className="text-gray-700 font-medium">{processingStatus}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                  <Upload size={18} />
                  Upload File (PDF or Text)
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md,.text"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>
                <span className="flex items-center text-xs text-gray-500">
                  Supports PDF, TXT, and MD files
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                💡 Tip: Upload your textbook chapter as a PDF or paste the text directly. The AI will automatically generate questions from the content.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save Chapter
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setTitle('');
                  setSubject('');
                  setContent('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Chapters Yet</h3>
          <p className="text-gray-600 mb-4">Upload your first textbook chapter to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Your First Chapter
          </button>
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {chapter.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                        {chapter.subject}
                      </span>
                      <span>{chapter.content.length.toLocaleString()} characters</span>
                      <span>•</span>
                      <span>{new Date(chapter.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedId(expandedId === chapter.id ? null : chapter.id)}
                      className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={expandedId === chapter.id ? 'Hide content' : 'Show content'}
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this chapter?')) {
                          onDelete(chapter.id);
                        }
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete chapter"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {expandedId === chapter.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sono max-h-96 overflow-y-auto">
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
