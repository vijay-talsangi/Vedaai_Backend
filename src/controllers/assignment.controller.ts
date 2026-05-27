import type { Request, Response, NextFunction } from 'express';
import * as assignmentService from '../services/assignment.service.js';
import { logger } from '../utils/logger.js';
import type { AssignmentData } from '../types/index.js';

function getStringValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return undefined;
}

export async function createAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as AssignmentData;

    if (!body.title || !body.subject || !body.grade || !body.schoolName) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: title, subject, grade, schoolName',
      });
      return;
    }

    if (!body.questionTypes || !Array.isArray(body.questionTypes) || body.questionTypes.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one question type is required',
      });
      return;
    }

    // Compute totals if not provided
    if (!body.totalQuestions) {
      body.totalQuestions = body.questionTypes.reduce(
        (sum, qt) => sum + qt.numberOfQuestions,
        0
      );
    }

    if (!body.totalMarks) {
      body.totalMarks = body.questionTypes.reduce(
        (sum, qt) => sum + qt.numberOfQuestions * qt.marksPerQuestion,
        0
      );
    }

    const assignment = await assignmentService.createAssignment(body);

    res.status(201).json({
      success: true,
      message: 'Assignment created and generation queued',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getStringValue(req.params.id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Assignment ID is required',
      });
      return;
    }

    const assignment = await assignmentService.getAssignment(id);

    res.status(200).json({
      success: true,
      message: 'Assignment retrieved successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}

export async function listAssignments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(getStringValue(req.query.page) ?? '', 10) || 1;
    const limit = parseInt(getStringValue(req.query.limit) ?? '', 10) || 10;
    const search = getStringValue(req.query.search);

    const result = await assignmentService.listAssignments(page, limit, search);

    res.status(200).json({
      success: true,
      message: 'Assignments retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getStringValue(req.params.id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Assignment ID is required',
      });
      return;
    }

    await assignmentService.deleteAssignment(id);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
