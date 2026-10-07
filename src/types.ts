export type Subject = 'Math' | 'Science' | 'History' | 'English' | 'Custom';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuizMode = 'study' | 'challenge' | 'normal';
export type ThemeName = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'high-contrast';
export type View = 'dashboard' | 'chapters' | 'generate' | 'quiz' | 'results' | 'print' | 'settings';

export interface Chapter {
  id: string;
  title: string;
  subject: Subject;
  content: string;
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: Difficulty;
}

export interface Quiz {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subject: Subject;
  questions: QuizQuestion[];
  createdAt: number;
  answers?: Record<string, number>;
  score?: number;
  graded?: boolean;
  mode?: QuizMode;
  timeTaken?: number;
}

export interface UserStats {
  totalQuizzes: number;
  totalCorrect: number;
  totalQuestions: number;
  streak: number;
  bestStreak: number;
  lastQuizDate: number;
  achievements: string[];
}

export interface AppSettings {
  theme: ThemeName;
  soundEnabled: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  defaultDifficulty: Difficulty;
  defaultMode: QuizMode;
  timerPerQuestion: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  soundEnabled: true,
  largeText: false,
  reducedMotion: false,
  highContrast: false,
  shuffleQuestions: true,
  shuffleAnswers: true,
  defaultDifficulty: 'medium',
  defaultMode: 'normal',
  timerPerQuestion: 30,
};

export const ACHIEVEMENTS: Record<string, { label: string; icon: string; description: string }> = {
  first_quiz: { label: 'First Steps', icon: '🎯', description: 'Complete your first quiz' },
  perfect_score: { label: 'Perfectionist', icon: '⭐', description: 'Score 100% on a quiz' },
  streak_3: { label: 'On Fire', icon: '🔥', description: '3-day study streak' },
  streak_7: { label: 'Dedicated', icon: '💪', description: '7-day study streak' },
  ten_quizzes: { label: 'Scholar', icon: '📚', description: 'Complete 10 quizzes' },
  speed_demon: { label: 'Speed Demon', icon: '⚡', description: 'Finish a quiz in under 2 minutes' },
  hard_mode: { label: 'Challenge Accepted', icon: '🏆', description: 'Complete a hard difficulty quiz' },
  all_subjects: { label: 'Renaissance', icon: '🌟', description: 'Take quizzes in all subjects' },
};
