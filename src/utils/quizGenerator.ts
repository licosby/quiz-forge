import { QuizQuestion, Difficulty } from '../types';
import { v4 as uuidv4 } from 'uuid';

function extractKeyTerms(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'this', 'that', 'these', 'those', 'it', 'its',
    'they', 'them', 'their', 'we', 'our', 'you', 'your', 'he', 'him',
    'his', 'she', 'her', 'me', 'my', 'not', 'no', 'nor', 'as', 'if',
    'then', 'than', 'too', 'very', 'just', 'about', 'above', 'after',
    'again', 'all', 'also', 'am', 'any', 'because', 'before', 'between',
    'both', 'each', 'few', 'get', 'got', 'here', 'how', 'into', 'more',
    'most', 'now', 'only', 'other', 'over', 'same', 'so', 'some', 'still',
    'such', 'there', 'through', 'under', 'up', 'what', 'when', 'where',
    'which', 'while', 'who', 'why', 'down', 'during', 'even', 'further',
    'however', 'indeed', 'instead', 'itself', 'like', 'many', 'much',
    'must', 'never', 'new', 'none', 'nothing', 'off', 'often', 'once',
    'one', 'own', 'rather', 'really', 'since', 'something', 'sometime',
    'somewhere', 'take', 'though', 'thus', 'together', 'until', 'upon',
    'well', 'whether', 'these', 'those', 'being', 'having', 'doing',
  ]);

  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const termFrequency: Record<string, number> = {};

  words.forEach(word => {
    if (!stopWords.has(word)) {
      termFrequency[word] = (termFrequency[word] || 0) + 1;
    }
  });

  return Object.entries(termFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 50);
}

function extractKeySentences(text: string): string[] {
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 300);

  const scored = sentences.map(sentence => {
    let score = 0;
    if (sentence.length > 60) score += 2;
    if (/\d{4}/.test(sentence)) score += 3;
    if (/\b(is|are|means|refers|defined|consists|includes|involves)\b/i.test(sentence)) score += 3;
    if (/\b(important|significant|key|main|primary|essential|fundamental|critical)\b/i.test(sentence)) score += 2;
    if (/\b(because|therefore|thus|consequently|as a result|leads to|causes)\b/i.test(sentence)) score += 2;
    if (/\b(similar|different|compared|unlike|whereas|however|although)\b/i.test(sentence)) score += 1;
    return { sentence, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(s => s.sentence);
}

function getDifficultyForQuestion(index: number, total: number, targetDifficulty: Difficulty): Difficulty {
  if (targetDifficulty === 'easy') return 'easy';
  if (targetDifficulty === 'hard') return 'hard';

  // Medium: mix of difficulties
  const ratio = index / total;
  if (ratio < 0.3) return 'easy';
  if (ratio < 0.7) return 'medium';
  return 'hard';
}

function generateFillBlank(sentence: string, keyTerms: string[], difficulty: Difficulty): QuizQuestion | null {
  const termsInSentence = keyTerms.filter(term =>
    sentence.toLowerCase().includes(term)
  );

  if (termsInSentence.length === 0) return null;

  const targetTerm = termsInSentence[Math.floor(Math.random() * termsInSentence.length)];
  const wrongCount = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 3;

  const wrongAnswers = keyTerms
    .filter(t => t !== targetTerm && t.length > 3)
    .sort(() => Math.random() - 0.5)
    .slice(0, wrongCount);

  if (wrongAnswers.length < 3) return null;

  const questionText = sentence.replace(
    new RegExp(`\\b${targetTerm}\\b`, 'gi'),
    '_____'
  );

  if (!questionText.includes('_____')) return null;

  const options = [targetTerm, ...wrongAnswers.slice(0, 3)].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(targetTerm);

  return {
    id: uuidv4(),
    question: `Fill in the blank: "${questionText}"`,
    options,
    correctAnswer: correctIndex,
    explanation: `The correct answer is "${targetTerm}".`,
    difficulty,
  };
}

function generateDefinition(text: string, keyTerms: string[], difficulty: Difficulty): QuizQuestion | null {
  const patterns = [
    /(\w[\w\s]{3,30})\s+(?:is|are|refers to|means|is defined as)\s+([^.,;]{10,100})/gi,
    /(?:the term|the concept of)\s+(\w[\w\s]{3,30})\s+(?:refers to|means|describes)\s+([^.,;]{10,100})/gi,
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[Math.floor(Math.random() * matches.length)];
      const term = match[1].trim();
      const definition = match[2].trim();

      const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 150);
      const wrongDefs = sentences
        .filter(s => s !== definition && !s.toLowerCase().includes(term.toLowerCase()))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(s => s.length > 80 ? s.substring(0, 80) + '...' : s);

      if (wrongDefs.length < 3) continue;

      const options = [definition, ...wrongDefs].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(definition);

      return {
        id: uuidv4(),
        question: `Which best defines "${term}"?`,
        options,
        correctAnswer: correctIndex,
        explanation: `"${term}" is defined as: ${definition}`,
        difficulty,
      };
    }
  }
  return null;
}

function generateWhichQuestion(text: string, keyTerms: string[], difficulty: Difficulty): QuizQuestion | null {
  const sentences = extractKeySentences(text);
  if (sentences.length < 4) return null;

  const correctSentence = sentences[Math.floor(Math.random() * sentences.length)];
  const wrongSentences = sentences
    .filter(s => s !== correctSentence)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(s => s.length > 100 ? s.substring(0, 100) + '...' : s);

  if (wrongSentences.length < 3) return null;

  const options = [correctSentence, ...wrongSentences].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(correctSentence);
  const topic = keyTerms[Math.floor(Math.random() * Math.min(5, keyTerms.length))];

  return {
    id: uuidv4(),
    question: `Which statement about "${topic}" is correct?`,
    options,
    correctAnswer: correctIndex,
    explanation: `Correct: "${correctSentence}"`,
    difficulty,
  };
}

function generateTrueFalse(text: string, difficulty: Difficulty): QuizQuestion | null {
  const sentences = extractKeySentences(text);
  if (sentences.length < 4) return null;

  const sentence = sentences[Math.floor(Math.random() * sentences.length)];
  const wrongSentence = sentence
    .replace(/\b(is|are|was|were)\b/i, (m) => {
      const opp: Record<string, string> = { 'is': 'is not', 'are': 'are not', 'was': 'was not', 'were': 'were not' };
      return opp[m.toLowerCase()] || m;
    });

  if (wrongSentence === sentence) return null;

  const options = [sentence, wrongSentence];
  const otherSentences = sentences.filter(s => s !== sentence).slice(0, 2);
  while (options.length < 4 && otherSentences.length > 0) {
    options.push(otherSentences.pop()!);
  }

  if (options.length < 4) return null;

  const correctIndex = options.indexOf(sentence);

  return {
    id: uuidv4(),
    question: `Which is a true statement based on the material?`,
    options,
    correctAnswer: correctIndex,
    explanation: `Correct: "${sentence}"`,
    difficulty,
  };
}

export function generateQuiz(text: string, numQuestions: number = 10, difficulty: Difficulty = 'medium'): QuizQuestion[] {
  const keyTerms = extractKeyTerms(text);
  const questions: QuizQuestion[] = [];
  const usedSentences = new Set<string>();

  // Fill in the blank (40%)
  const fillCount = Math.ceil(numQuestions * 0.4);
  let attempts = 0;
  while (questions.length < fillCount && attempts < 100) {
    const sentences = extractKeySentences(text);
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    if (sentence && !usedSentences.has(sentence)) {
      const diff = getDifficultyForQuestion(questions.length, fillCount, difficulty);
      const q = generateFillBlank(sentence, keyTerms, diff);
      if (q) {
        questions.push(q);
        usedSentences.add(sentence);
      }
    }
    attempts++;
  }

  // Definition (20%)
  const defCount = Math.ceil(numQuestions * 0.2);
  attempts = 0;
  while (questions.length < fillCount + defCount && attempts < 50) {
    const diff = getDifficultyForQuestion(questions.length, numQuestions, difficulty);
    const q = generateDefinition(text, keyTerms, diff);
    if (q && !questions.some(e => e.question === q.question)) questions.push(q);
    attempts++;
  }

  // Which of the following (20%)
  const whichCount = Math.ceil(numQuestions * 0.2);
  attempts = 0;
  while (questions.length < fillCount + defCount + whichCount && attempts < 50) {
    const diff = getDifficultyForQuestion(questions.length, numQuestions, difficulty);
    const q = generateWhichQuestion(text, keyTerms, diff);
    if (q && !questions.some(e => e.question === q.question)) questions.push(q);
    attempts++;
  }

  // True/False style (20%)
  attempts = 0;
  while (questions.length < numQuestions && attempts < 50) {
    const diff = getDifficultyForQuestion(questions.length, numQuestions, difficulty);
    const q = generateTrueFalse(text, diff);
    if (q && !questions.some(e => e.question === q.question)) questions.push(q);
    attempts++;
  }

  // Fallback
  attempts = 0;
  while (questions.length < numQuestions && attempts < 100) {
    const sentences = extractKeySentences(text);
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    if (sentence) {
      const q = generateFillBlank(sentence, keyTerms, difficulty);
      if (q && !questions.some(e => e.question === q.question)) questions.push(q);
    }
    attempts++;
  }

  return questions.slice(0, numQuestions);
}

export function gradeQuiz(questions: QuizQuestion[], answers: Record<string, number>) {
  let score = 0;
  const results = questions.map(q => {
    const userAnswer = answers[q.id];
    const correct = userAnswer === q.correctAnswer;
    if (correct) score++;
    return { questionId: q.id, correct };
  });

  return {
    score,
    total: questions.length,
    percentage: Math.round((score / questions.length) * 100),
    results,
  };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function shuffleQuizQuestions(questions: QuizQuestion[], shuffleAnswers: boolean): QuizQuestion[] {
  let shuffled = shuffleArray(questions);

  if (shuffleAnswers) {
    shuffled = shuffled.map(q => {
      const correctOption = q.options[q.correctAnswer];
      const newOptions = shuffleArray(q.options);
      return {
        ...q,
        options: newOptions,
        correctAnswer: newOptions.indexOf(correctOption),
      };
    });
  }

  return shuffled;
}
