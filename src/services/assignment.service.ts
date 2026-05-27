import { Assignment, type IAssignment } from '../models/Assignment.js';
import { assessmentQueue } from '../queues/assessment.queue.js';
import { logger } from '../utils/logger.js';
import type { AssignmentData, PaginatedResult } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export async function createAssignment(data: AssignmentData): Promise<IAssignment> {
  const assignment = new Assignment({
    title: data.title,
    subject: data.subject,
    grade: data.grade,
    schoolName: data.schoolName,
    dueDate: data.dueDate,
    timeAllowed: data.timeAllowed,
    questionTypes: data.questionTypes,
    additionalInstructions: data.additionalInstructions,
    totalQuestions: data.totalQuestions,
    totalMarks: data.totalMarks,
    status: 'pending',
  });

  const saved = await assignment.save();
  logger.info(`Assignment created: ${saved._id}`);

  // Add job to the BullMQ queue
  await assessmentQueue.add(
    'generate-assessment',
    { assignmentId: saved._id.toString() },
    {
      attempts: 1,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    }
  );
  logger.info(`Assessment generation job queued for: ${saved._id}`);

  return saved;
}

export async function getAssignment(id: string): Promise<IAssignment> {
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  return assignment;
}

export async function listAssignments(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PaginatedResult<IAssignment>> {
  const skip = (page - 1) * limit;
  const sanitizedLimit = Math.min(Math.max(limit, 1), 100);

  const query: Record<string, unknown> = {};
  if (search && search.trim().length > 0) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query['$or'] = [
      { title: searchRegex },
      { subject: searchRegex },
      { schoolName: searchRegex },
    ];
  }

  const [data, total] = await Promise.all([
    Assignment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(sanitizedLimit)
      .lean<IAssignment[]>(),
    Assignment.countDocuments(query),
  ]);

  return {
    data,
    total,
    page,
    limit: sanitizedLimit,
    totalPages: Math.ceil(total / sanitizedLimit),
  };
}

export async function deleteAssignment(id: string): Promise<IAssignment> {
  const assignment = await Assignment.findByIdAndDelete(id);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  logger.info(`Assignment deleted: ${id}`);
  return assignment;
}

export async function updateAssignment(
  id: string,
  data: Partial<AssignmentData>
): Promise<IAssignment> {
  const assignment = await Assignment.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  logger.info(`Assignment updated: ${id}`);
  return assignment;
}
