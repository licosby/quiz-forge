import { Chapter, Quiz } from '../types';

const STORAGE_KEYS = {
  CHAPTERS: 'quizforge_chapters',
  QUIZZES: 'quizforge_quizzes',
};

export function loadChapters(): Chapter[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading chapters:', error);
    return [];
  }
}

export function saveChapters(chapters: Chapter[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  } catch (error) {
    console.error('Error saving chapters:', error);
  }
}

export function loadQuizzes(): Quiz[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading quizzes:', error);
    return [];
  }
}

export function saveQuizzes(quizzes: Quiz[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  } catch (error) {
    console.error('Error saving quizzes:', error);
  }
}

export function deleteChapter(id: string): void {
  try {
    const chapters = loadChapters();
    const filtered = chapters.filter(c => c.id !== id);
    saveChapters(filtered);
  } catch (error) {
    console.error('Error deleting chapter:', error);
  }
}

export function deleteQuiz(id: string): void {
  try {
    const quizzes = loadQuizzes();
    const filtered = quizzes.filter(q => q.id !== id);
    saveQuizzes(filtered);
  } catch (error) {
    console.error('Error deleting quiz:', error);
  }
}
