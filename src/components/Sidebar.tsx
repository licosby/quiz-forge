import { View } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Wand2,
  Menu,
  X,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isOpen: boolean;
  onToggle: () => void;
  chapterCount: number;
  quizCount: number;
}

export default function Sidebar({ currentView, onNavigate, isOpen, onToggle, chapterCount, quizCount }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chapters' as View, label: 'My Chapters', icon: BookOpen, badge: chapterCount },
    { id: 'generate' as View, label: 'Generate Quiz', icon: Wand2 },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 text-white transition-all duration-300 z-50 shadow-2xl ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {isOpen && (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-amber-400" />
            <h1 className="text-lg font-bold tracking-tight">QuizForge</h1>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all duration-200 group ${
                isActive
                  ? 'bg-white/20 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-indigo-300 group-hover:text-amber-400'}`} />
              {isOpen && (
                <>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-amber-400/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-amber-400" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-xs text-indigo-300 space-y-1">
            <p>{chapterCount} chapter{chapterCount !== 1 ? 's' : ''} uploaded</p>
            <p>{quizCount} quiz{quizCount !== 1 ? 'zes' : ''} generated</p>
          </div>
        </div>
      )}
    </aside>
  );
}
