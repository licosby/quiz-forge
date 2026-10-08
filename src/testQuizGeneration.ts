import { generateQuizFromContent } from './utils/quizGenerator';

// Sample educational text for testing
const sampleText = `
The American Civil War (1861-1865) was fought between the Northern states (Union) and the Southern states (Confederacy). The primary cause was the issue of slavery and states' rights. Abraham Lincoln served as President during most of the war.

The Emancipation Proclamation, issued by Lincoln on January 1, 1863, declared that all slaves in Confederate states were to be set free. However, it did not apply to border states that remained loyal to the Union.

The Battle of Gettysburg, fought from July 1-3, 1863, in Pennsylvania, was a turning point in the war. Union forces under General George Meade defeated Confederate forces under General Robert E. Lee. This battle had the highest number of casualties of the entire war.

The 13th Amendment, ratified in December 1865, officially abolished slavery throughout the United States. The 14th Amendment, ratified in 1868, granted citizenship to all persons born or naturalized in the United States, including former slaves. The 15th Amendment, ratified in 1870, prohibited the denial of voting rights based on race, color, or previous condition of servitude.

Reconstruction (1865-1877) was the period following the Civil War when the United States grappled with the challenges of rebuilding the South and integrating formerly enslaved people into society. President Andrew Johnson, who took office after Lincoln's assassination, favored a lenient approach to Reconstruction.
`;

async function testQuizGeneration() {
  console.log('Testing AI Quiz Generation...\n');
  
  try {
    console.log('Generating 5 questions from sample text...');
    const questions = await generateQuizFromContent(sampleText, 5);
    
    console.log(`\n✓ Successfully generated ${questions.length} questions\n`);
    
    questions.forEach((q: any, index: number) => {
      console.log(`Question ${index + 1}:`);
      console.log(`Q: ${q.question}`);
      q.options.forEach((opt: string, i: number) => {
        const letter = String.fromCharCode(65 + i);
        const marker = i === q.correctAnswer ? ' ✓' : '';
        console.log(`   ${letter}) ${opt}${marker}`);
      });
      console.log(`Explanation: ${q.explanation}`);
      console.log(`Source: "${q.sourceText}"`);
      console.log('');
    });
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testQuizGeneration();
