import { View } from '../types';
import { BookOpen, Wand2, Menu, X } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onToggle: () => void;
  chapterCount: number;
  quizCount: number;
}

export default function Sidebar({ currentView, onViewChange, isOpen, onToggle, chapterCount, quizCount }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 bg-gradient-to-b from-indigo-700 to-purple-800 text-white ${
          isOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {isOpen && (
              <h1 className="text-xl font-bold">QuizForge</h1>
            )}
            <button
              onClick={onToggle}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <button
            onClick={() => onViewChange('chapters')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'chapters' 
                ? 'bg-white/20' 
                : 'hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            {isOpen && (
              <>
                <span className="flex-1 text-left">Chapters</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{chapterCount}</span>
              </>
            )}
          </button>

          <button
            onClick={() => onViewChange('generate')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'generate' 
                ? 'bg-white/20' 
                : 'hover:bg-white/10'
            }`}
          >
            <Wand2 className="w-5 h-5" />
            {isOpen && (
              <>
                <span className="flex-1 text-left">Generate Quiz</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{quizCount}</span>
              </>
            )}
          </button>
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <p className="text-xs text-white/50">
              {chapterCount} chapter{chapterCount !== 1 ? 's' : ''} • {quizCount} quiz{quizCount !== 1 ? 'zes' : ''}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
