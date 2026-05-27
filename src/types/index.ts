export interface QuestionTypeConfig {
  id?: string;
  type: string;
  numberOfQuestions: number;
  marksPerQuestion: number;
}

export interface Question {
  question: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  marks: number;
  options?: string[];
  answer?: string;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  sections: Section[];
  answerKey?: Section[];
}

export interface AssignmentData {
  title: string;
  subject: string;
  grade: string;
  schoolName: string;
  dueDate?: string;
  timeAllowed?: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  totalQuestions: number;
  totalMarks: number;
}

export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
