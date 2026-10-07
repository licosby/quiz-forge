import { QuizQuestion } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Extract key terms and concepts from text
function extractKeyTerms(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'this', 'that', 'these', 'those', 'it', 'its',
    'they', 'them', 'their', 'we', 'our', 'you', 'your', 'he', 'him',
    'his', 'she', 'her', 'i', 'me', 'my', 'not', 'no', 'nor', 'as',
    'if', 'then', 'than', 'too', 'very', 'just', 'about', 'above',
    'after', 'again', 'all', 'also', 'am', 'any', 'because', 'before',
    'between', 'both', 'each', 'few', 'get', 'got', 'here', 'how',
    'into', 'more', 'most', 'now', 'only', 'other', 'over', 'same',
    'so', 'some', 'still', 'such', 'there', 'through', 'under', 'up',
    'what', 'when', 'where', 'which', 'while', 'who', 'why', 'down',
    'during', 'even', 'further', 'however', 'indeed', 'instead',
    'itself', 'like', 'many', 'much', 'must', 'never', 'new', 'none',
    'nothing', 'off', 'often', 'once', 'one', 'own', 'rather', 'really',
    'since', 'something', 'sometime', 'somewhere', 'still', 'take',
    'though', 'thus', 'together', 'until', 'upon', 'well', 'whether'
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

// Extract important sentences
function extractKeySentences(text: string): string[] {
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 300);

  // Score sentences by importance
  const scored = sentences.map(sentence => {
    let score = 0;
    // Longer sentences tend to have more information
    if (sentence.length > 60) score += 2;
    // Sentences with numbers/dates
    if (/\d{4}/.test(sentence)) score += 3;
    // Sentences with definitions (is, are, means, refers)
    if (/\b(is|are|means|refers|defined|consists|includes|involves)\b/i.test(sentence)) score += 3;
    // Sentences with key indicators
    if (/\b(important|significant|key|main|primary|essential|fundamental|critical)\b/i.test(sentence)) score += 2;
    // Sentences with cause/effect
    if (/\b(because|therefore|thus|consequently|as a result|leads to|causes)\b/i.test(sentence)) score += 2;
    // Sentences with comparisons
    if (/\b(similar|different|compared|unlike|whereas|however|although)\b/i.test(sentence)) score += 1;

    return { sentence, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(s => s.sentence);
}

// Generate question from a sentence
function generateQuestionFromSentence(sentence: string, keyTerms: string[]): QuizQuestion | null {
  const termsInSentence = keyTerms.filter(term =>
    sentence.toLowerCase().includes(term)
  );

  if (termsInSentence.length === 0) return null;

  // Pick the term to blank out
  const targetTerm = termsInSentence[Math.floor(Math.random() * termsInSentence.length)];

  // Find wrong answers from other key terms
  const wrongAnswers = keyTerms
    .filter(t => t !== targetTerm && t.length > 3)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  if (wrongAnswers.length < 3) return null;

  // Create the question
  const questionText = sentence.replace(
    new RegExp(`\\b${targetTerm}\\b`, 'gi'),
    '_____'
  );

  // If no blank was created, skip
  if (!questionText.includes('_____')) return null;

  const options = [targetTerm, ...wrongAnswers].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(targetTerm);

  return {
    id: uuidv4(),
    question: `Fill in the blank: "${questionText}"`,
    options,
    correctAnswer: correctIndex,
    explanation: `The correct answer is "${targetTerm}". Original sentence: "${sentence}"`
  };
}

// Generate definition-style questions
function generateDefinitionQuestion(text: string, keyTerms: string[]): QuizQuestion | null {
  // Look for definition patterns
  const definitionPatterns = [
    /(\w[\w\s]{3,30})\s+(?:is|are|refers to|means|is defined as|can be described as)\s+([^.,;]{10,100})/gi,
    /(?:the term|the concept of|the process of)\s+(\w[\w\s]{3,30})\s+(?:refers to|means|describes|involves)\s+([^.,;]{10,100})/gi,
  ];

  for (const pattern of definitionPatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[Math.floor(Math.random() * matches.length)];
      const term = match[1].trim();
      const definition = match[2].trim();

      // Find wrong definitions from other sentences
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
        question: `Which of the following best defines "${term}"?`,
        options,
        correctAnswer: correctIndex,
        explanation: `"${term}" is defined as: ${definition}`
      };
    }
  }
  return null;
}

// Generate "which of the following" style questions
function generateWhichQuestion(text: string, keyTerms: string[]): QuizQuestion | null {
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

  // Pick a topic from key terms
  const topic = keyTerms[Math.floor(Math.random() * Math.min(5, keyTerms.length))];

  return {
    id: uuidv4(),
    question: `Which of the following statements about "${topic}" is correct?`,
    options,
    correctAnswer: correctIndex,
    explanation: `The correct statement is: "${correctSentence}"`
  };
}

// Generate true/false style as multiple choice
function generateTrueFalseQuestion(text: string): QuizQuestion | null {
  const sentences = extractKeySentences(text);
  if (sentences.length < 2) return null;

  const sentence = sentences[Math.floor(Math.random() * sentences.length)];

  // Create a modified (wrong) version
  const words = sentence.split(' ');
  if (words.length < 6) return null;

  // Swap some words to create a wrong statement
  const wrongSentence = sentence
    .replace(/\b(is|are|was|were)\b/i, (match) => {
      const opposites: Record<string, string> = { 'is': 'is not', 'are': 'are not', 'was': 'was not', 'were': 'were not' };
      return opposites[match.toLowerCase()] || match;
    });

  if (wrongSentence === sentence) return null;

  const options = [sentence, wrongSentence].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(sentence);

  // Pad to 4 options with other sentences
  const otherSentences = sentences.filter(s => s !== sentence).slice(0, 2);
  while (options.length < 4 && otherSentences.length > 0) {
    options.push(otherSentences.pop()!);
  }

  if (options.length < 4) return null;

  const newCorrectIndex = options.indexOf(sentence);

  return {
    id: uuidv4(),
    question: `Which of the following is a true statement based on the material?`,
    options,
    correctAnswer: newCorrectIndex,
    explanation: `The correct answer is: "${sentence}"`
  };
}

// Main quiz generation function
export function generateQuiz(text: string, numQuestions: number = 10): QuizQuestion[] {
  const keyTerms = extractKeyTerms(text);
  const questions: QuizQuestion[] = [];
  const usedSentences = new Set<string>();

  // Strategy 1: Fill in the blank questions (40%)
  const fillBlankCount = Math.ceil(numQuestions * 0.4);
  let attempts = 0;
  while (questions.length < fillBlankCount && attempts < 100) {
    const sentences = extractKeySentences(text);
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    if (sentence && !usedSentences.has(sentence)) {
      const q = generateQuestionFromSentence(sentence, keyTerms);
      if (q) {
        questions.push(q);
        usedSentences.add(sentence);
      }
    }
    attempts++;
  }

  // Strategy 2: Definition questions (20%)
  const defCount = Math.ceil(numQuestions * 0.2);
  attempts = 0;
  while (questions.length < fillBlankCount + defCount && attempts < 50) {
    const q = generateDefinitionQuestion(text, keyTerms);
    if (q && !questions.some(existing => existing.question === q.question)) {
      questions.push(q);
    }
    attempts++;
  }

  // Strategy 3: Which of the following (20%)
  const whichCount = Math.ceil(numQuestions * 0.2);
  attempts = 0;
  while (questions.length < fillBlankCount + defCount + whichCount && attempts < 50) {
    const q = generateWhichQuestion(text, keyTerms);
    if (q && !questions.some(existing => existing.question === q.question)) {
      questions.push(q);
    }
    attempts++;
  }

  // Strategy 4: True/False style (20%)
  attempts = 0;
  while (questions.length < numQuestions && attempts < 50) {
    const q = generateTrueFalseQuestion(text);
    if (q && !questions.some(existing => existing.question === q.question)) {
      questions.push(q);
    }
    attempts++;
  }

  // If we still don't have enough, generate more fill-in-the-blank
  attempts = 0;
  while (questions.length < numQuestions && attempts < 100) {
    const sentences = extractKeySentences(text);
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    if (sentence) {
      const q = generateQuestionFromSentence(sentence, keyTerms);
      if (q && !questions.some(existing => existing.question === q.question)) {
        questions.push(q);
      }
    }
    attempts++;
  }

  return questions.slice(0, numQuestions);
}

export function gradeQuiz(questions: QuizQuestion[], answers: Record<string, number>): { score: number; total: number; percentage: number; results: { questionId: string; correct: boolean }[] } {
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
    results
  };
}
