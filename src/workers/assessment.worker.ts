import { Worker, type Job } from 'bullmq';
import type { Server as SocketIOServer } from 'socket.io';
import { getRedis } from '../config/redis.js';
import { Assignment } from '../models/Assignment.js';
import { generateAssessment } from '../services/gemini.service.js';
import { logger } from '../utils/logger.js';
import type { AssessmentJobData } from '../queues/assessment.queue.js';
import type { AssignmentData } from '../types/index.js';

export function initWorker(io: SocketIOServer): Worker<AssessmentJobData> {
  const worker = new Worker<AssessmentJobData>(
    'assessment-generation',
    async (job: Job<AssessmentJobData>) => {
      const { assignmentId } = job.data;
      logger.info(`Processing assessment generation for: ${assignmentId}`);

      // Fetch the assignment from MongoDB
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      // Update status to processing
      assignment.status = 'processing';
      await assignment.save();

      // Emit generation started event
      io.to(assignmentId).emit('generation_started', {
        assignmentId,
        status: 'processing',
        message: 'Assessment generation has started',
      });

      logger.info(`Generation started for: ${assignmentId}`);

      // Build the assignment data for the AI service
      const assignmentData: AssignmentData = {
        title: assignment.title,
        subject: assignment.subject,
        grade: assignment.grade,
        schoolName: assignment.schoolName,
        dueDate: assignment.dueDate,
        timeAllowed: assignment.timeAllowed,
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions,
        totalQuestions: assignment.totalQuestions,
        totalMarks: assignment.totalMarks,
      };

      // Emit progress at 50%
      io.to(assignmentId).emit('generation_progress', {
        assignmentId,
        progress: 50,
        message: 'Generating questions with AI...',
      });

      // Call the Gemini AI service
      const generatedPaper = await generateAssessment(assignmentData);

      // Save the generated paper to MongoDB
      assignment.generatedPaper = generatedPaper;
      assignment.status = 'completed';
      await assignment.save();
      const assignmentPayload = assignment.toObject();

      logger.info(`Assessment generation completed for: ${assignmentId}`);

      // Emit completion event
      io.to(assignmentId).emit('generation_completed', {
        assignmentId,
        status: 'completed',
        message: 'Assessment has been generated successfully',
        assignment: assignmentPayload,
      });

      return { assignmentId, status: 'completed' };
    },
    {
      connection: getRedis(),
      concurrency: 3,
      limiter: {
        max: 5,
        duration: 60000,
      },
    }
  );

  worker.on('completed', (job: Job<AssessmentJobData>) => {
    logger.info(`Job ${job.id} completed for assignment: ${job.data.assignmentId}`);
  });

  worker.on('failed', async (job: Job<AssessmentJobData> | undefined, err: Error) => {
    if (!job) {
      logger.error(`A job failed with no job reference: ${err.message}`);
      return;
    }

    const { assignmentId } = job.data;
    logger.error(`Job ${job.id} failed for assignment ${assignmentId}: ${err.message}`);

    try {
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'failed',
      });

      io.to(assignmentId).emit('generation_failed', {
        assignmentId,
        status: 'failed',
        message: `Assessment generation failed: ${err.message}`,
          error: err.message,
      });
    } catch (updateError) {
      const updateErr = updateError instanceof Error ? updateError.message : String(updateError);
      logger.error(`Failed to update assignment status on failure: ${updateErr}`);
    }
  });

  worker.on('error', (err: Error) => {
    logger.error(`Worker error: ${err.message}`);
  });

  logger.info('Assessment generation worker initialized');

  return worker;
}
