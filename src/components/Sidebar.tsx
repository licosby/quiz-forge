import { View } from '../types';
import { LayoutDashboard, BookOpen, Wand2, Menu, X, GraduationCap, Settings, Flame } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isOpen: boolean;
  onToggle: () => void;
  chapterCount: number;
  quizCount: number;
  streak: number;
}

export default function Sidebar({ currentView, onNavigate, isOpen, onToggle, chapterCount, quizCount, streak }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chapters' as View, label: 'Chapters', icon: BookOpen, badge: chapterCount },
    { id: 'generate' as View, label: 'Generate', icon: Wand2 },
    { id: 'settings' as View, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden no-print"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isOpen ? 'w-64' : 'w-16'}`}
        style={{ background: 'var(--bg-sidebar)' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {isOpen && (
            <div className="flex items-center gap-2 animate-fade-in">
              <GraduationCap className="w-7 h-7 text-amber-300" />
              <h1 className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
                QuizForge
              </h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Streak badge */}
        {isOpen && streak > 0 && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-white/10 flex items-center gap-2 animate-fade-in">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-white/90 font-medium">{streak} day streak!</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-4 px-2">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); if (window.innerWidth < 768) onToggle(); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                } animate-fade-in-up stagger-${i + 1}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-white/50 group-hover:text-amber-300'}`} />
                {isOpen && (
                  <>
                    <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-white/20 text-white/90 text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="text-xs text-white/50 space-y-1">
              <p>{chapterCount} chapter{chapterCount !== 1 ? 's' : ''} uploaded</p>
              <p>{quizCount} quiz{quizCount !== 1 ? 'zes' : ''} generated</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
