import { Router } from 'express';
import multer from 'multer';
import * as assignmentController from '../controllers/assignment.controller.js';

const router = Router();

// Multer config for optional file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = file.originalname.split('.').pop() ?? 'bin';
    cb(null, `${uniqueSuffix}.${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// POST / - Create assignment (with optional file upload)
router.post('/', upload.single('file'), assignmentController.createAssignment);

// GET / - List assignments (query: page, limit, search)
router.get('/', assignmentController.listAssignments);

// GET /:id - Get single assignment
router.get('/:id', assignmentController.getAssignment);

// DELETE /:id - Delete assignment
router.delete('/:id', assignmentController.deleteAssignment);

export default router;
