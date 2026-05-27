import type { AssignmentData } from '../types/index.js';

export function buildPrompt(data: AssignmentData): string {
  const questionTypeDetails = data.questionTypes
    .map((qt) => {
      let description = `- **${qt.type}**: ${qt.numberOfQuestions} question(s), ${qt.marksPerQuestion} mark(s) each (total: ${qt.numberOfQuestions * qt.marksPerQuestion} marks)`;
      if (qt.type.toLowerCase().includes('mcq') || qt.type.toLowerCase().includes('multiple choice')) {
        description += '. Each MCQ must include exactly 4 options labeled A, B, C, D.';
      }
      return description;
    })
    .join('\n');

  const prompt = `You are an expert academic assessment creator. Generate a professional question paper based on the following specifications.

## Assessment Details
- **Title**: ${data.title}
- **School/Institution**: ${data.schoolName}
- **Subject**: ${data.subject}
- **Grade/Class**: ${data.grade}
${data.timeAllowed ? `- **Time Allowed**: ${data.timeAllowed}` : ''}
${data.dueDate ? `- **Due Date**: ${data.dueDate}` : ''}
- **Total Questions**: ${data.totalQuestions}
- **Total Marks**: ${data.totalMarks}

## Question Types Required
${questionTypeDetails}

## Difficulty Distribution
Distribute questions across difficulty levels:
- **Easy**: approximately 30% of questions
- **Moderate**: approximately 50% of questions  
- **Challenging**: approximately 20% of questions

${data.additionalInstructions ? `## Additional Instructions\n${data.additionalInstructions}\n` : ''}

## Output Requirements
Generate the question paper and answer key. Return ONLY valid JSON in the following exact format with NO additional text, explanations, or markdown formatting outside the JSON:

{
  "sections": [
    {
      "title": "Section A - Multiple Choice Questions",
      "instruction": "Choose the correct answer from the given options. Each question carries X mark(s).",
      "questions": [
        {
          "question": "The question text goes here?",
          "difficulty": "easy",
          "marks": 1,
          "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"]
        }
      ]
    },
    {
      "title": "Section B - Short Answer Questions",
      "instruction": "Answer the following questions briefly. Each question carries X mark(s).",
      "questions": [
        {
          "question": "The question text goes here?",
          "difficulty": "moderate",
          "marks": 2
        }
      ]
    }
  ],
  "answerKey": [
    {
      "title": "Section A - Answers",
      "instruction": "Answer Key for Section A",
      "questions": [
        {
          "question": "The question text goes here?",
          "difficulty": "easy",
          "marks": 1,
          "answer": "B. The correct answer"
        }
      ]
    }
  ]
}

## Critical Rules
1. Return ONLY the JSON object, no markdown code blocks, no explanations before or after.
2. Each section must correspond to a question type specified above.
3. The total number of questions across all sections must equal exactly ${data.totalQuestions}.
4. The total marks across all questions must equal exactly ${data.totalMarks}.
5. Every question in the answerKey must include an "answer" field with the correct answer.
6. For MCQ questions, always include exactly 4 options.
7. Each question must have a "difficulty" field set to "easy", "moderate", or "challenging".
8. Each question must have a "marks" field matching the marks per question for that type.
9. Questions must be pedagogically sound, grade-appropriate, and cover diverse topics within the subject.
10. The answerKey must contain all sections with complete answers for every question.`;

  return prompt;
}
