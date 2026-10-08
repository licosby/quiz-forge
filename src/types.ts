export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  sourceText?: string;
}

export interface Chapter {
  id: string;
  title: string;
  subject: string;
  content: string;
  createdAt: number;
}

export interface Quiz {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subject: string;
  questions: Question[];
  createdAt: number;
  answers?: Record<string, number>;
  score?: number;
  graded?: boolean;
}

export type View = 'dashboard' | 'chapters' | 'generate' | 'quiz' | 'results' | 'print' | 'settings';
