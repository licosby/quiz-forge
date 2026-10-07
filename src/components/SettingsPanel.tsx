import { useRef } from 'react';
import { AppSettings, UserStats, ThemeName, ACHIEVEMENTS } from '../types';
import { Palette, Volume2, Type, Accessibility, Shuffle, Download, Upload, Flame, Trophy } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  stats: UserStats;
  onUpdate: (partial: Partial<AppSettings>) => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

const THEMES: { id: ThemeName; label: string; colors: string }[] = [
  { id: 'light', label: 'Light', colors: 'bg-gradient-to-br from-purple-100 to-violet-200' },
  { id: 'dark', label: 'Dark', colors: 'bg-gradient-to-br from-gray-800 to-gray-900' },
  { id: 'ocean', label: 'Ocean', colors: 'bg-gradient-to-br from-blue-900 to-cyan-900' },
  { id: 'forest', label: 'Forest', colors: 'bg-gradient-to-br from-green-900 to-emerald-900' },
  { id: 'sunset', label: 'Sunset', colors: 'bg-gradient-to-br from-red-900 to-orange-900' },
  { id: 'high-contrast', label: 'High Contrast', colors: 'bg-gradient-to-br from-black to-gray-800' },
];

export default function SettingsPanel({ settings, stats, onUpdate, onExport, onImport }: SettingsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (onImport) onImport(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div>
        <h1 style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--text-primary)' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-1">Customize your QuizForge experience</p>
      </div>

      {/* Theme Selection */}
      <div className="glass-card-static p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Palette className="w-5 h-5" style={{ color: 'var(--text-accent)' }} /> Theme
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => onUpdate({ theme: theme.id })}
              className={`p-3 rounded-xl text-center transition-all ${settings.theme === theme.id ? 'ring-2 ring-purple-500 scale-105' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className={`w-full h-12 rounded-lg mb-2 ${theme.colors}`} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sound & Accessibility */}
      <div className="glass-card-static p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Accessibility className="w-5 h-5" style={{ color: 'var(--text-accent)' }} /> Accessibility & Sound
        </h2>
        <div className="space-y-4">
          <Toggle label="Sound Effects" description="Play sounds for correct/incorrect answers"
            icon={<Volume2 className="w-4 h-4" />} checked={settings.soundEnabled} onChange={v => onUpdate({ soundEnabled: v })} />
          <Toggle label="Large Text" description="Increase font size for better readability"
            icon={<Type className="w-4 h-4" />} checked={settings.largeText} onChange={v => onUpdate({ largeText: v })} />
          <Toggle label="Reduced Motion" description="Minimize animations and transitions"
            icon={<Accessibility className="w-4 h-4" />} checked={settings.reducedMotion} onChange={v => onUpdate({ reducedMotion: v })} />
        </div>
      </div>

      {/* Quiz Defaults */}
      <div className="glass-card-static p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Shuffle className="w-5 h-5" style={{ color: 'var(--text-accent)' }} /> Quiz Defaults
        </h2>
        <div className="space-y-4">
          <Toggle label="Shuffle Questions" description="Randomize question order each time"
            icon={<Shuffle className="w-4 h-4" />} checked={settings.shuffleQuestions} onChange={v => onUpdate({ shuffleQuestions: v })} />
          <Toggle label="Shuffle Answers" description="Randomize answer option order"
            icon={<Shuffle className="w-4 h-4" />} checked={settings.shuffleAnswers} onChange={v => onUpdate({ shuffleAnswers: v })} />
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Timer per Question (seconds)</label>
            <input type="range" min="10" max="120" step="5" value={settings.timerPerQuestion}
              onChange={e => onUpdate({ timerPerQuestion: Number(e.target.value) })} className="w-full mt-2" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{settings.timerPerQuestion}s per question</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card-static p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Trophy className="w-5 h-5" style={{ color: 'var(--amber)' }} /> Your Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Quizzes Taken" value={stats.totalQuizzes} />
          <StatBox label="Accuracy" value={stats.totalQuestions > 0 ? `${Math.round(stats.totalCorrect / stats.totalQuestions * 100)}%` : '—'} />
          <StatBox label="Current Streak" value={`${stats.streak} days`} icon={<Flame className="w-4 h-4 text-orange-500" />} />
          <StatBox label="Best Streak" value={`${stats.bestStreak} days`} />
        </div>

        {stats.achievements.length > 0 && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-card)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Achievements ({stats.achievements.length}/{Object.keys(ACHIEVEMENTS).length})</p>
            <div className="flex flex-wrap gap-2">
              {stats.achievements.map(id => {
                const a = ACHIEVEMENTS[id];
                if (!a) return null;
                return <span key={id} className="text-lg" title={a.label}>{a.icon}</span>;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Import/Export */}
      <div className="glass-card-static p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Download className="w-5 h-5" style={{ color: 'var(--text-accent)' }} /> Data Management
        </h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={onExport} className="btn-secondary">
            <Download className="w-4 h-4" /> Export Data (JSON)
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary">
            <Upload className="w-4 h-4" /> Import Data
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Export saves all your chapters, quizzes, settings, and stats. Import restores from a backup file.
        </p>
      </div>
    </div>
  );
}

function Toggle({ label, description, icon, checked, onChange }: {
  label: string; description: string; icon: React.ReactNode; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-secondary)', color: 'var(--text-accent)' }}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ background: checked ? 'var(--accent-primary)' : 'var(--bg-secondary)' }}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
      <div className="flex items-center justify-center gap-1">
        {icon}
        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}
