import { Question } from '../types';

// Use Pollinations.ai - a free AI text generation service (no API key needed)
async function generateWithAI(prompt: string): Promise<string> {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
      },
    });
    
    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

// Parse AI response into Question objects
function parseQuestions(aiResponse: string): Question[] {
  const questions: Question[] = [];
  
  // Split into question blocks (look for numbered questions)
  const questionBlocks = aiResponse.split(/\n(?=\d+\.\s)/);
  
  for (const block of questionBlocks) {
    try {
      // Extract question text
      const questionMatch = block.match(/\d+\.\s+(.+?)(?=\n[A-D]\))/s);
      if (!questionMatch) continue;
      
      const questionText = questionMatch[1].trim();
      
      // Extract options (A, B, C, D)
      const optionMatches = [...block.matchAll(/[A-D]\)\s+(.+?)(?=\n[A-D]\)|\n\n|\nCorrect:|$)/gs)];
      if (optionMatches.length < 4) continue;
      
      const options = optionMatches.map(m => m[1].trim());
      
      // Extract correct answer
      const correctMatch = block.match(/Correct:\s*([A-D])/i);
      if (!correctMatch) continue;
      
      const correctLetter = correctMatch[1].toUpperCase();
      const correctAnswer = correctLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      
      // Extract explanation if present
      const explanationMatch = block.match(/Explanation:\s*(.+?)(?=\n\n|\n\d+\.|$)/is);
      const explanation = explanationMatch ? explanationMatch[1].trim() : undefined;
      
      // Extract source text if present
      const sourceMatch = block.match(/Source:\s*"(.+?)"/i);
      const sourceText = sourceMatch ? sourceMatch[1].trim() : undefined;
      
      questions.push({
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question: questionText,
        options,
        correctAnswer,
        explanation,
        sourceText,
      });
    } catch (error) {
      console.error('Error parsing question block:', error);
      continue;
    }
  }
  
  return questions;
}

// Main quiz generation function using AI
export async function generateQuizFromContent(content: string, numQuestions: number = 10): Promise<Question[]> {
  if (content.length < 200) {
    throw new Error('Content is too short. Please upload at least 200 characters.');
  }

  // Truncate content if too long (to avoid token limits)
  const truncatedContent = content.length > 8000 ? content.substring(0, 8000) + '...' : content;

  const prompt = `Generate ${numQuestions} multiple choice questions based on the following educational text. 

Requirements:
- Create clear, concise questions that test understanding (like AP/IB/CLEP exam questions)
- Each question should have exactly 4 answer choices (A, B, C, D)
- Only ONE answer should be correct
- Wrong answers should be plausible but clearly incorrect
- Keep answer choices short (5-15 words each)
- Include brief explanations for correct answers
- Reference the source text when possible

Format each question exactly like this:

1. [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [A/B/C/D]
Explanation: [Brief explanation]
Source: "[Relevant quote from text]"

Text to generate questions from:

${truncatedContent}`;

  try {
    const aiResponse = await generateWithAI(prompt);
    const questions = parseQuestions(aiResponse);
    
    if (questions.length === 0) {
      throw new Error('Failed to generate valid questions. Please try again.');
    }
    
    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error('Quiz generation failed:', error);
    throw new Error('Unable to generate questions. Please try again or check your internet connection.');
  }
}

// Fetch related information from Wikipedia (free, no API key needed)
export async function fetchRelatedInfo(topic: string): Promise<string> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    );
    
    if (!response.ok) return '';
    
    const data = await response.json();
    return data.extract || '';
  } catch (error) {
    console.error('Error fetching Wikipedia info:', error);
    return '';
  }
}
