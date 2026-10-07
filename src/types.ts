export interface Chapter {
  id: string;
  title: string;
  subject: string;
  content: string;
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subject: string;
  questions: QuizQuestion[];
  createdAt: number;
  answers?: Record<string, number>;
  score?: number;
  graded?: boolean;
}

export type View = 'dashboard' | 'chapters' | 'generate' | 'quiz' | 'results' | 'print';
