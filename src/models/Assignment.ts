import { randomUUID } from 'node:crypto';
import mongoose, { Schema, Document } from 'mongoose';
import type { AssignmentData, AssignmentStatus, GeneratedPaper, QuestionTypeConfig } from '../types/index.js';

export interface IAssignment extends Document {
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
  status: AssignmentStatus;
  generatedPaper?: GeneratedPaper;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionTypeConfigSchema = new Schema<QuestionTypeConfig>(
  {
    id: { type: String, default: () => randomUUID() },
    type: { type: String, required: true },
    numberOfQuestions: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true,
    },
    schoolName: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    dueDate: {
      type: String,
      default: undefined,
    },
    timeAllowed: {
      type: String,
      default: undefined,
    },
    questionTypes: {
      type: [questionTypeConfigSchema],
      required: [true, 'At least one question type is required'],
      validate: {
        validator: (val: QuestionTypeConfig[]) => val.length > 0,
        message: 'At least one question type is required',
      },
    },
    additionalInstructions: {
      type: String,
      default: undefined,
      maxlength: [2000, 'Additional instructions cannot exceed 2000 characters'],
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: [1, 'Total questions must be at least 1'],
    },
    totalMarks: {
      type: Number,
      required: true,
      min: [1, 'Total marks must be at least 1'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    generatedPaper: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    fileUrl: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

assignmentSchema.index({ status: 1 });
assignmentSchema.index({ createdAt: -1 });
assignmentSchema.index({ title: 'text', subject: 'text' });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
