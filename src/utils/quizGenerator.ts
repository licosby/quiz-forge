import { Question } from '../types';

// Clean text by removing page numbers, headers, footers, URLs
function cleanText(content: string): string {
  return content
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\d{2,4}\s+Chapter\s+\d+/gi, '')
    .replace(/Click\s+and\s+Explore[^.]*/gi, '')
    .replace(/This\s+(?:OpenStax\s+)?book\s+is\s+available[^.]*/gi, '')
    .replace(/Figure\s+\d+[^.]*/gi, '')
    .replace(/Table\s+\d+[^.]*/gi, '')
    .replace(/Map\s+\d+[^.]*/gi, '')
    .replace(/\s*\|\s*[^|]*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// A structured fact extracted from text
interface StructuredFact {
  topic: string;       // What the fact is about (e.g., "14th Amendment", "Reconstruction")
  attribute: string;   // What's being said about it (e.g., "granted citizenship")
  question: string;    // The question to ask
  context: string;     // Original sentence for reference
  category: string;    // Group similar facts together
}

// Extract structured facts from text
function extractStructuredFacts(content: string): StructuredFact[] {
  const cleaned = cleanText(content);
  const sentences = cleaned
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 250 && s.split(' ').length >= 6 && s.split(' ').length <= 30);

  const facts: StructuredFact[] = [];

  for (const sentence of sentences) {
    // Skip bad sentences
    if (/^\d+$/.test(sentence)) continue;
    if (/^(Chapter|Figure|Table|Map)\s+\d+/i.test(sentence)) continue;
    if (/http|www\.|\.com|\.org/i.test(sentence)) continue;
    if (/Click|Explore|available|free at/i.test(sentence)) continue;
    if (/^(This|The|These|That)\s+(map|figure|table|image|diagram)/i.test(sentence)) continue;

    // Pattern 1: "[Subject] was/were [past participle] [details]"
    // Example: "The 14th Amendment was ratified in 1868"
    const passiveMatch = sentence.match(/^([A-Z][^.]{3,50}?)\s+(?:was|were)\s+([a-z]+ed)\s+(.{5,100}?)(?:\.|$)/i);
    if (passiveMatch) {
      const topic = passiveMatch[1].trim();
      const action = passiveMatch[2].trim();
      const details = passiveMatch[3].trim();
      
      if (topic.length > 3 && details.length > 5) {
        facts.push({
          topic,
          attribute: `${action} ${details}`,
          question: `What happened to ${topic}?`,
          context: sentence,
          category: getTopicCategory(topic),
        });
      }
    }

    // Pattern 2: "[Subject] [verb] [object]" (active voice)
    // Example: "Lincoln issued the Emancipation Proclamation"
    const activeMatch = sentence.match(/^([A-Z][^.]{3,35}?)\s+([a-z]+(?:ed|d|t))\s+(.{5,80}?)(?:\.|$)/i);
    if (activeMatch && !/^(The|This|That|These|Those|It|They|We|He|She|However|Although|While|After|Before|During)\b/i.test(sentence)) {
      const topic = activeMatch[1].trim();
      const verb = activeMatch[2].trim();
      const object = activeMatch[3].trim();
      
      if (topic.length > 3 && object.length > 5) {
        facts.push({
          topic,
          attribute: `${verb} ${object}`,
          question: `What did ${topic} do?`,
          context: sentence,
          category: getTopicCategory(topic),
        });
      }
    }

    // Pattern 3: "[Subject] is/was [description]"
    // Example: "Reconstruction was the period after the Civil War"
    const isMatch = sentence.match(/^([A-Z][^.]{3,40}?)\s+(?:is|are|was|were)\s+(.{10,100}?)(?:\.|$)/i);
    if (isMatch && !/^(The|This|That|These|Those|It|They|We|He|She)\b/i.test(sentence)) {
      const topic = isMatch[1].trim();
      const description = isMatch[2].trim();
      
      if (topic.length > 3 && description.length > 10 && !/^(http|www|a\s+.*\s+of\s+the\s+.*\s+book)/i.test(description)) {
        facts.push({
          topic,
          attribute: description,
          question: `What was ${topic}?`,
          context: sentence,
          category: getTopicCategory(topic),
        });
      }
    }

    // Pattern 4: Year-based facts
    // Example: "The Civil War ended in 1865"
    const yearMatch = sentence.match(/(.{10,50}?)\s+(?:in|during|of)\s+(\d{4})/i);
    if (yearMatch) {
      const event = yearMatch[1].trim();
      const year = yearMatch[2];
      
      if (event.length > 10 && event.length < 50) {
        facts.push({
          topic: event,
          attribute: year,
          question: `When did ${event}?`,
          context: sentence,
          category: 'dates',
        });
      }
    }
  }

  return facts;
}

// Categorize topics to group similar facts
function getTopicCategory(topic: string): string {
  const lower = topic.toLowerCase();
  
  // Amendments
  if (/\d+(st|nd|rd|th)\s+amendment/i.test(topic)) return 'amendments';
  
  // Presidents
  if (/\b(president|washington|adams|jefferson|madison|monroe|jackson|lincoln|grant|johnson)\b/i.test(topic)) return 'presidents';
  
  // Wars/Battles
  if (/\b(war|battle|campaign|conflict)\b/i.test(lower)) return 'wars';
  
  // Laws/Acts
  if (/\b(act|law|bill|legislation|statute)\b/i.test(lower)) return 'laws';
  
  // People
  if (/^[A-Z][a-z]+\s+[A-Z]/.test(topic) && topic.split(' ').length <= 3) return 'people';
  
  // Places
  if (/\b(street|city|state|country|river|mountain)\b/i.test(lower)) return 'places';
  
  // Movements/Events
  if (/\b(movement|era|period|reconstruction|revolution)\b/i.test(lower)) return 'events';
  
  return 'general';
}

// Generate a quiz question from a fact
function generateQuestion(fact: StructuredFact, allFacts: StructuredFact[]): Question | null {
  // Find wrong answers from the SAME category (or similar length)
  const sameCategory = allFacts.filter(f => 
    f.category === fact.category && 
    f.attribute !== fact.attribute &&
    f.attribute.length > 5 &&
    Math.abs(f.attribute.length - fact.attribute.length) < fact.attribute.length
  );

  let wrongAnswers: string[];
  
  if (sameCategory.length >= 3) {
    // Best case: wrong answers from same category
    wrongAnswers = sameCategory
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(f => f.attribute);
  } else {
    // Fallback: wrong answers with similar length from any category
    wrongAnswers = allFacts
      .filter(f => 
        f.attribute !== fact.attribute &&
        f.attribute.length > 5 &&
        Math.abs(f.attribute.length - fact.attribute.length) < fact.attribute.length * 0.8
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(f => f.attribute);
  }

  if (wrongAnswers.length < 3) return null;

  // Create options
  const options = [fact.attribute, ...wrongAnswers].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(fact.attribute);

  // Make question more specific
  let question = fact.question;
  
  // Improve question phrasing
  if (fact.category === 'amendments') {
    question = `What did the ${fact.topic} do?`;
  } else if (fact.category === 'presidents') {
    question = `What is ${fact.topic} known for?`;
  } else if (fact.category === 'dates') {
    question = `When did ${fact.topic}?`;
  } else if (fact.category === 'wars') {
    question = `What occurred during ${fact.topic}?`;
  }

  return {
    id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question,
    options,
    correctAnswer: correctIndex,
    explanation: `The correct answer is: "${fact.attribute}"`,
    sourceText: fact.context,
  };
}

// Main quiz generation function
export function generateQuizFromContent(content: string, numQuestions: number = 10): Question[] {
  if (content.length < 200) {
    return [];
  }

  const facts = extractStructuredFacts(content);
  
  if (facts.length < 4) {
    return [];
  }

  const questions: Question[] = [];
  const usedIndices = new Set<number>();

  // Generate questions, trying to use different categories
  const categories = [...new Set(facts.map(f => f.category))];
  
  // First pass: one question per category
  for (const category of categories) {
    if (questions.length >= numQuestions) break;
    
    const categoryFacts = facts
      .map((f, i) => ({ fact: f, index: i }))
      .filter(({ fact, index }) => fact.category === category && !usedIndices.has(index));
    
    if (categoryFacts.length > 0) {
      const { fact, index } = categoryFacts[Math.floor(Math.random() * categoryFacts.length)];
      const question = generateQuestion(fact, facts);
      
      if (question) {
        questions.push(question);
        usedIndices.add(index);
      }
    }
  }

  // Second pass: fill remaining slots
  for (let i = 0; i < facts.length && questions.length < numQuestions; i++) {
    if (usedIndices.has(i)) continue;
    
    const question = generateQuestion(facts[i], facts);
    if (question) {
      questions.push(question);
      usedIndices.add(i);
    }
  }

  return questions.slice(0, numQuestions);
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
