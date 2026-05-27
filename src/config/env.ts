import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535)),
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .default('mongodb://localhost:27017/vedaai'),
  REDIS_URL: z
    .string()
    .min(1, 'REDIS_URL is required')
    .default('redis://localhost:6379'),
  GEMINI_API_KEY: z
    .string()
    .min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z
    .string()
    .default('gemini-2.5-flash'),
  FRONTEND_URL: z
    .string()
    .default('http://localhost:3000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    const errorMessages = Object.entries(formatted)
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => {
        const errors = value as { _errors: string[] };
        return `  ${key}: ${errors._errors.join(', ')}`;
      })
      .join('\n');

    console.error('❌ Environment validation failed:\n' + errorMessages);
    process.exit(1);
  }

  return result.data;
}

export const config = validateEnv();
