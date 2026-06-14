import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { generateQuestionsFromText } from '../services/aiService';

const router = Router();
const prisma = new PrismaClient();

// GET /api/exams — list all published exams (students) or all exams for teacher
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { user } = req;
  if (user!.role === 'STUDENT') {
    const exams = await prisma.exam.findMany({
      where: { isPublished: true },
      include: { teacher: { select: { name: true } }, course: true, _count: { select: { questions: true, submissions: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(exams);
  }
  if (user!.role === 'TEACHER') {
    const exams = await prisma.exam.findMany({
      where: { teacherId: user!.id },
      include: { course: true, _count: { select: { questions: true, submissions: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(exams);
  }
  // ADMIN
  const exams = await prisma.exam.findMany({
    include: { teacher: { select: { name: true } }, course: true, _count: { select: { questions: true, submissions: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(exams);
});

// GET /api/exams/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const exam = await prisma.exam.findUnique({
    where: { id: req.params.id as string },
    include: {
      teacher: { select: { name: true, email: true } },
      course: true,
      questions: { orderBy: { orderIndex: 'asc' } },
      _count: { select: { submissions: true } }
    }
  });
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json(exam);
});

// POST /api/exams — create exam (teacher/admin only)
router.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const { title, description, courseId, durationMinutes, totalMarks, passingScore, difficulty, shuffleQuestions, scheduledAt, expiresAt } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const exam = await prisma.exam.create({
    data: {
      title,
      description,
      courseId: courseId || null,
      teacherId: req.user!.id,
      durationMinutes: durationMinutes || 60,
      totalMarks: totalMarks || 100,
      passingScore: passingScore || 40,
      difficulty: difficulty || 'MEDIUM',
      shuffleQuestions: shuffleQuestions !== false,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }
  });
  res.status(201).json(exam);
});

// PATCH /api/exams/:id — update exam
router.patch('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const exam = await prisma.exam.findUnique({ where: { id: req.params.id as string } });
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  if (exam.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not your exam' });
  }
  const updated = await prisma.exam.update({ where: { id: req.params.id as string }, data: req.body });
  res.json(updated);
});

// DELETE /api/exams/:id
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const exam = await prisma.exam.findUnique({ where: { id: req.params.id as string } });
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  if (exam.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not your exam' });
  }
  await prisma.exam.delete({ where: { id: req.params.id as string } });
  res.json({ message: 'Exam deleted' });
});

// POST /api/exams/:id/publish
router.post('/:id/publish', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const exam = await prisma.exam.update({ where: { id: req.params.id as string }, data: { isPublished: true } });
  res.json(exam);
});

// POST /api/exams/:id/generate-questions — AI question generation
router.post('/:id/generate-questions', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const { topic, count, difficulty, type } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  const exam = await prisma.exam.findUnique({ where: { id: req.params.id as string } });
  if (!exam) return res.status(404).json({ error: 'Exam not found' });

  const generated = await generateQuestionsFromText(topic, count || 5, difficulty || 'MEDIUM', type || 'MCQ');

  const created = await Promise.all(
    generated.map((q: any, i: number) =>
      prisma.question.create({
        data: {
          examId: req.params.id as string,
          text: q.text,
          type: q.type,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty || difficulty || 'MEDIUM',
          topicTag: q.topicTag || topic,
          marks: q.marks || 1,
          orderIndex: i
        }
      })
    )
  );
  res.json({ generated: created.length, questions: created });
});

export default router;
