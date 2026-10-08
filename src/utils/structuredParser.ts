import { Question } from '../types';

/**
 * Structured Parser for Quiz Generation
 * 
 * This parser requires content to be formatted with specific markers:
 * 
 * Format 1: Q: and A: markers
 * Q: What is the capital of France?
 * A: Paris
 * 
 * Format 2: Multiple choice format
 * Q: What is 2+2?
 * A) 3
 * B) 4
 * C) 5
 * D) 6
 * Answer: B
 * 
 * Format 3: CSV-like format (one per line)
 * Question|Correct Answer|Wrong 1|Wrong 2|Wrong 3
 */

export function parseStructuredContent(content: string): Question[] {
  const questions: Question[] = [];
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Format 1: Q: and A: markers
    if (line.startsWith('Q:')) {
      const questionText = line.substring(2).trim();
      
      // Look for answer on next line(s)
      i++;
      if (i < lines.length) {
        const answerLine = lines[i];
        
        // Check if it's multiple choice format
        if (answerLine.match(/^[A-D]\)/i)) {
          // Parse multiple choice
          const options: string[] = [];
          let correctAnswer = -1;
          
          while (i < lines.length && lines[i].match(/^[A-D]\)/i)) {
            const optionText = lines[i].substring(2).trim();
            options.push(optionText);
            i++;
          }
          
          // Look for "Answer: X" line
          if (i < lines.length && lines[i].toLowerCase().startsWith('answer:')) {
            const answerLetter = lines[i].substring(7).trim().toUpperCase();
            correctAnswer = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
            i++;
          }
          
          if (options.length === 4 && correctAnswer >= 0 && correctAnswer < 4) {
            questions.push({
              id: `q-${Date.now()}-${questions.length}`,
              question: questionText,
              options: options,
              correctAnswer: correctAnswer,
              explanation: `The correct answer is ${String.fromCharCode(65 + correctAnswer)}.`,
              sourceText: questionText,
            });
          }
        } else if (answerLine.startsWith('A:')) {
          // Simple Q: A: format - need to generate wrong answers
          const correctAnswer = answerLine.substring(2).trim();
          i++;
          
          // Try to find related content for wrong answers
          const wrongAnswers = generateWrongAnswers(correctAnswer, content, questions);
          
          if (wrongAnswers.length >= 3) {
            const options = [correctAnswer, ...wrongAnswers.slice(0, 3)].sort(() => Math.random() - 0.5);
            const correctIndex = options.indexOf(correctAnswer);
            
            questions.push({
              id: `q-${Date.now()}-${questions.length}`,
              question: questionText,
              options: options,
              correctAnswer: correctIndex,
              explanation: `The correct answer is: ${correctAnswer}`,
              sourceText: `${line}\n${answerLine}`,
            });
          }
        }
      }
    }
    // Format 3: CSV-like format (pipe-separated)
    else if (line.includes('|') && line.split('|').length >= 4) {
      const parts = line.split('|').map(p => p.trim());
      
      if (parts.length >= 4) {
        const questionText = parts[0];
        const correctAnswer = parts[1];
        const wrongAnswers = parts.slice(2, 5);
        
        if (wrongAnswers.length >= 3) {
          const options = [correctAnswer, ...wrongAnswers.slice(0, 3)].sort(() => Math.random() - 0.5);
          const correctIndex = options.indexOf(correctAnswer);
          
          questions.push({
            id: `q-${Date.now()}-${questions.length}`,
            question: questionText,
            options: options,
            correctAnswer: correctIndex,
            explanation: `The correct answer is: ${correctAnswer}`,
            sourceText: line,
          });
        }
      }
      i++;
    } else {
      i++;
    }
  }
  
  return questions;
}

/**
 * Generate wrong answers by finding other A: lines in the content
 */
function generateWrongAnswers(correctAnswer: string, content: string, existingQuestions: Question[]): string[] {
  const wrongAnswers: string[] = [];
  const lines = content.split('\n').map(line => line.trim());
  
  // Find all A: lines
  const answerLines = lines.filter(line => line.startsWith('A:'));
  
  // Get unique answers that aren't the correct one
  const uniqueAnswers = new Set<string>();
  answerLines.forEach(line => {
    const answer = line.substring(2).trim();
    if (answer !== correctAnswer && answer.length > 0 && answer.length < 100) {
      uniqueAnswers.add(answer);
    }
  });
  
  // Convert to array and shuffle
  const candidates = Array.from(uniqueAnswers).sort(() => Math.random() - 0.5);
  
  // Take up to 3 wrong answers
  return candidates.slice(0, 3);
}

/**
 * Validate if content has structured format
 */
export function hasStructuredFormat(content: string): boolean {
  const lines = content.split('\n').map(line => line.trim());
  
  // Check for Q: markers
  const hasQMarkers = lines.some(line => line.startsWith('Q:'));
  
  // Check for pipe-separated format
  const hasPipeFormat = lines.some(line => line.includes('|') && line.split('|').length >= 4);
  
  return hasQMarkers || hasPipeFormat;
}

/**
 * Get formatting instructions for users
 */
export function getFormattingInstructions(): string {
  return `
FORMAT YOUR CONTENT LIKE THIS:

Option 1: Simple Q&A Format
Q: What is the capital of France?
A: Paris

Q: Who wrote Romeo and Juliet?
A: William Shakespeare

Option 2: Multiple Choice Format
Q: What is 2+2?
A) 3
B) 4
C) 5
D) 6
Answer: B

Option 3: Pipe-Separated Format
Question|Correct Answer|Wrong 1|Wrong 2|Wrong 3
What is H2O?|Water|Oxygen|Hydrogen|Salt

IMPORTANT:
- Each question must start with "Q:"
- Each answer must start with "A:" or use A) B) C) D) format
- For multiple choice, add "Answer: [letter]" on a new line
- Put each Q&A pair on separate lines
- Use blank lines between questions for clarity
  `.trim();
}
