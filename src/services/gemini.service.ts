import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { buildPrompt } from '../utils/promptBuilder.js';
import { parseAndValidate } from './parser.service.js';
import { logger } from '../utils/logger.js';
import type { AssignmentData, GeneratedPaper } from '../types/index.js';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: config.GEMINI_MODEL,
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 8192,
  },
});

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateAssessment(data: AssignmentData): Promise<GeneratedPaper> {
  const prompt = buildPrompt(data);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        logger.info(`Gemini retry attempt ${attempt}/${MAX_RETRIES}`);
        await delay(RETRY_DELAY_MS * attempt);
      }

      logger.info(`Calling Gemini API (attempt ${attempt + 1})...`);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response received from Gemini API');
      }

      logger.debug(`Gemini response length: ${text.length} characters`);

      const paper = parseAndValidate(text);

      logger.info('Assessment generated and parsed successfully');
      return paper;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Gemini generation attempt ${attempt + 1} failed: ${lastError.message}`
      );

      if (attempt >= MAX_RETRIES) {
        break;
      }
    }
  }

  throw new Error(
    `Failed to generate assessment after ${MAX_RETRIES + 1} attempts: ${lastError?.message ?? 'Unknown error'}`
  );
}
