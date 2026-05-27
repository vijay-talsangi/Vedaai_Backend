import { z } from 'zod';
import type { GeneratedPaper } from '../types/index.js';
import { logger } from '../utils/logger.js';

const questionSchema = z.object({
  question: z.string().min(1),
  difficulty: z.enum(['easy', 'moderate', 'challenging']),
  marks: z.number().min(1),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
});

const sectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(questionSchema).min(1),
});

const generatedPaperSchema = z.object({
  sections: z.array(sectionSchema).min(1),
  answerKey: z.array(sectionSchema).optional(),
});

export function extractJSON(text: string): string {
  // Try to extract JSON from markdown code blocks first
  const codeBlockPatterns = [
    /```json\s*\n?([\s\S]*?)\n?\s*```/i,
    /```\s*\n?([\s\S]*?)\n?\s*```/,
  ];

  for (const pattern of codeBlockPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const candidate = match[1].trim();
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        // Not valid JSON in this code block, continue
      }
    }
  }

  // Try to find raw JSON object in the text
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    const candidate = text.substring(jsonStart, jsonEnd + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Try progressively smaller substrings by finding nested braces
      logger.warn('Failed to parse extracted JSON, attempting cleanup');
    }
  }

  // Last resort: try the entire text
  try {
    JSON.parse(text.trim());
    return text.trim();
  } catch {
    throw new Error('Could not extract valid JSON from AI response');
  }
}

export function validatePaper(data: unknown): GeneratedPaper {
  const result = generatedPaperSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    logger.error(`Paper validation failed: ${errors}`);
    throw new Error(`Invalid paper structure: ${errors}`);
  }

  return result.data as GeneratedPaper;
}

export function parseAndValidate(text: string): GeneratedPaper {
  const jsonStr = extractJSON(text);
  const parsed: unknown = JSON.parse(jsonStr);
  return validatePaper(parsed);
}
