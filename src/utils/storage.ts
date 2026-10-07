import { Chapter, Quiz, UserStats, AppSettings, DEFAULT_SETTINGS } from '../types';

const KEYS = {
  chapters: 'quizforge-chapters',
  quizzes: 'quizforge-quizzes',
  settings: 'quizforge-settings',
  stats: 'quizforge-stats',
  currentQuiz: 'quizforge-current-quiz',
  theme: 'quizforge-theme',
};

export function loadChapters(): Chapter[] {
  try {
    const data = localStorage.getItem(KEYS.chapters);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveChapters(chapters: Chapter[]) {
  localStorage.setItem(KEYS.chapters, JSON.stringify(chapters));
}

export function loadQuizzes(): Quiz[] {
  try {
    const data = localStorage.getItem(KEYS.quizzes);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveQuizzes(quizzes: Quiz[]) {
  localStorage.setItem(KEYS.quizzes, JSON.stringify(quizzes));
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(KEYS.settings);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  localStorage.setItem(KEYS.theme, settings.theme);
}

export function loadStats(): UserStats {
  try {
    const data = localStorage.getItem(KEYS.stats);
    return data ? JSON.parse(data) : {
      totalQuizzes: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      streak: 0,
      bestStreak: 0,
      lastQuizDate: 0,
      achievements: [],
    };
  } catch {
    return {
      totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0,
      streak: 0, bestStreak: 0, lastQuizDate: 0, achievements: [],
    };
  }
}

export function saveStats(stats: UserStats) {
  localStorage.setItem(KEYS.stats, JSON.stringify(stats));
}

export function saveCurrentQuiz(quiz: Quiz | null) {
  if (quiz) {
    localStorage.setItem(KEYS.currentQuiz, JSON.stringify(quiz));
  } else {
    localStorage.removeItem(KEYS.currentQuiz);
  }
}

export function loadCurrentQuiz(): Quiz | null {
  try {
    const data = localStorage.getItem(KEYS.currentQuiz);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function exportData(): string {
  return JSON.stringify({
    chapters: loadChapters(),
    quizzes: loadQuizzes(),
    settings: loadSettings(),
    stats: loadStats(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.chapters) saveChapters(data.chapters);
    if (data.quizzes) saveQuizzes(data.quizzes);
    if (data.settings) saveSettings(data.settings);
    if (data.stats) saveStats(data.stats);
    return true;
  } catch {
    return false;
  }
}
