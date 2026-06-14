import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { detectLeakage } from '../services/leakageDetection';

const router = Router();
const prisma = new PrismaClient();

// GET /api/questions/exam/:examId
router.get('/exam/:examId', authenticate, async (req: AuthRequest, res: Response) => {
  const questions = await prisma.question.findMany({
    where: { examId: req.params.examId as string },
    orderBy: { orderIndex: 'asc' }
  });
  res.json(questions);
});

// POST /api/questions — add question to exam
router.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const { examId, text, type, options, correctAnswer, explanation, difficulty, topicTag, marks } = req.body;
  if (!examId || !text || !correctAnswer) {
    return res.status(400).json({ error: 'examId, text and correctAnswer are required' });
  }

  // Leakage detection
  const existingQuestions = await prisma.question.findMany({ select: { text: true, id: true, examId: true } });
  const leakageResult = await detectLeakage(text, existingQuestions);

  const count = await prisma.question.count({ where: { examId } });
  const question = await prisma.question.create({
    data: {
      examId,
      text,
      type: type || 'MCQ',
      options: options ? JSON.stringify(options) : null,
      correctAnswer,
      explanation,
      difficulty: difficulty || 'MEDIUM',
      topicTag,
      marks: marks || 1,
      orderIndex: count
    }
  });
  res.status(201).json({ question, leakageWarning: leakageResult });
});

// PATCH /api/questions/:id
router.patch('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const { text, type, options, correctAnswer, explanation, difficulty, topicTag, marks, orderIndex } = req.body;
  const updated = await prisma.question.update({
    where: { id: req.params.id as string },
    data: {
      ...(text && { text }),
      ...(type && { type }),
      ...(options && { options: JSON.stringify(options) }),
      ...(correctAnswer && { correctAnswer }),
      ...(explanation !== undefined && { explanation }),
      ...(difficulty && { difficulty }),
      ...(topicTag !== undefined && { topicTag }),
      ...(marks && { marks }),
      ...(orderIndex !== undefined && { orderIndex })
    }
  });
  res.json(updated);
});

// DELETE /api/questions/:id
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  await prisma.question.delete({ where: { id: req.params.id as string } });
  res.json({ message: 'Question deleted' });
});

export default router;
