import { Queue } from 'bullmq';
import { getRedis } from '../config/redis.js';

export interface AssessmentJobData {
  assignmentId: string;
}

export const assessmentQueue = new Queue<AssessmentJobData>('assessment-generation', {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 1,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  },
});
