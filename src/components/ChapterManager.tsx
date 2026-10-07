import { useState, useRef } from 'react';
import { Chapter, Subject } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Upload, FileText, Trash2, Eye, EyeOff, Plus, BookOpen } from 'lucide-react';

interface ChapterManagerProps {
  chapters: Chapter[];
  onAdd: (chapter: Chapter) => void;
  onDelete: (id: string) => void;
  activeChapter: Chapter | null;
  onSelectChapter: (chapter: Chapter | null) => void;
}

const SUBJECTS: Subject[] = ['Math', 'Science', 'History', 'English', 'Custom'];
const SUBJECT_ICONS: Record<Subject, string> = {
  Math: '🔢', Science: '🔬', History: '📜', English: '📖', Custom: '📝',
};

export default function ChapterManager({ chapters, onAdd, onDelete, activeChapter, onSelectChapter }: ChapterManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('Custom');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onAdd({ id: uuidv4(), title: title.trim(), subject, content: content.trim(), createdAt: Date.now() });
    setTitle(''); setSubject('Custom'); setContent(''); setShowForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target?.result as string);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--text-primary)' }}>My Chapters</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">Upload lecture notes and readings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Chapter
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-card-static p-6 animate-scale-in">
          <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Upload New Chapter</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Chapter 1: Introduction..." required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(s => (
                    <button
                      key={s} type="button" onClick={() => setSubject(s)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${subject === s ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                      style={{
                        background: subject === s ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                        color: subject === s ? 'var(--text-on-accent)' : 'var(--text-primary)',
                      }}
                    >
                      {SUBJECT_ICONS[s]} {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Content *</label>
              <div className="relative">
                <textarea
                  value={content} onChange={e => setContent(e.target.value)}
                  placeholder="Paste your lecture notes, reading material, or chapter content here..."
                  className="min-h-[200px] resize-y font-mono text-sm"
                  required
                />
                <button
                  type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 btn-secondary text-xs py-1.5 px-3"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept=".txt,.md,.csv,.json" onChange={handleFileUpload} className="hidden" />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Paste text or upload a .txt/.md file. 200+ characters recommended.
              </p>
              {content.length > 0 && (
                <p className="text-xs mt-1" style={{ color: content.length < 200 ? 'var(--amber)' : 'var(--emerald)' }}>
                  {content.length} characters {content.length < 200 ? '(add more for better questions)' : '✓ good length'}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Save Chapter</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Chapter List */}
      {chapters.length > 0 ? (
        <div className="space-y-3">
          {chapters.map((chapter, i) => (
            <div
              key={chapter.id}
              className={`glass-card p-4 animate-fade-in-up ${activeChapter?.id === chapter.id ? 'ring-2' : ''}`}
              style={{ animationDelay: `${i * 0.05}s`, ...(activeChapter?.id === chapter.id ? { borderColor: 'var(--accent-primary)' } : {}) }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => onSelectChapter(chapter)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--bg-secondary)' }}>
                    {SUBJECT_ICONS[chapter.subject]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{chapter.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--text-accent)' }}>
                        {chapter.subject}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{chapter.content.length} chars</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandedId(expandedId === chapter.id ? null : chapter.id)}
                    className="btn-ghost p-2"
                    aria-label="Preview content"
                  >
                    {expandedId === chapter.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this chapter?')) onDelete(chapter.id); }}
                    className="btn-ghost p-2"
                    style={{ color: 'var(--rose)' }}
                    aria-label="Delete chapter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === chapter.id && (
                <div className="mt-3 p-4 rounded-xl max-h-48 overflow-y-auto animate-fade-in" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="text-sm whitespace-pre-wrap font-mono" style={{ color: 'var(--text-secondary)' }}>{chapter.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-static text-center py-16 animate-bounce-in">
          <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-accent)', opacity: 0.5 }} />
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>No Chapters Yet</h3>
          <p className="mt-2 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            Upload your first chapter's lecture notes to get started.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Add First Chapter</button>
        </div>
      )}
    </div>
  );
}
