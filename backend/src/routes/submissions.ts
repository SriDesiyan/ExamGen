import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { computeRiskScore } from '../services/riskEngine';
import { analyzeInvigilator } from '../services/agentInvigilator';
import { computeSkillGap } from '../services/skillGap';
import { computePlacementScore } from '../services/placementEngine';
import { selectNextQuestion } from '../services/adaptiveEngine';

const router = Router();
const prisma = new PrismaClient();

// POST /api/submissions/start — begin exam
router.post('/start', authenticate, async (req: AuthRequest, res: Response) => {
  const { examId } = req.body;
  if (!examId) return res.status(400).json({ error: 'examId required' });

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { orderBy: { orderIndex: 'asc' } } }
  });
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  if (!exam.isPublished) return res.status(400).json({ error: 'Exam not published' });

  // Check if already submitted
  const existing = await prisma.submission.findFirst({
    where: { examId, studentId: req.user!.id, status: { in: ['SUBMITTED', 'FLAGGED'] } }
  });
  if (existing) return res.status(400).json({ error: 'You have already submitted this exam' });

  // Create or return in-progress submission
  let submission = await prisma.submission.findFirst({
    where: { examId, studentId: req.user!.id, status: 'IN_PROGRESS' }
  });

  if (!submission) {
    submission = await prisma.submission.create({
      data: { examId, studentId: req.user!.id, status: 'IN_PROGRESS' }
    });
    // Log exam start event
    await prisma.proctoringEvent.create({
      data: { submissionId: submission.id, type: 'EXAM_START', severity: 'LOW' }
    });
  }

  // Shuffle questions if needed
  let questions = [...exam.questions];
  if (exam.shuffleQuestions) {
    questions = questions.sort(() => Math.random() - 0.5);
  }

  // Return questions without correct answers for students
  const safeQuestions = questions.map(q => ({
    id: q.id,
    text: q.text,
    type: q.type,
    options: q.options ? JSON.parse(q.options) : null,
    difficulty: q.difficulty,
    topicTag: q.topicTag,
    marks: q.marks
  }));

  res.json({ submission, questions: safeQuestions, exam: { ...exam, questions: undefined } });
});

// POST /api/submissions/next-question — adaptive next question
router.post('/next-question', authenticate, async (req: AuthRequest, res: Response) => {
  const { examId, currentDifficulty, lastCorrect } = req.body;
  const questions = await prisma.question.findMany({ where: { examId } });
  const next = selectNextQuestion(questions, currentDifficulty, lastCorrect);
  if (!next) return res.json({ done: true });
  const safe = { id: next.id, text: next.text, type: next.type, options: next.options ? JSON.parse(next.options) : null, difficulty: next.difficulty, topicTag: next.topicTag, marks: next.marks };
  res.json({ question: safe });
});

// POST /api/submissions/event — record proctoring event
router.post('/event', authenticate, async (req: AuthRequest, res: Response) => {
  const { submissionId, type, severity, metadata } = req.body;
  const event = await prisma.proctoringEvent.create({
    data: { submissionId, type, severity: severity || 'LOW', metadata: metadata ? JSON.stringify(metadata) : null }
  });
  res.json(event);
});

// POST /api/submissions/submit — finalize exam
router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  const { submissionId, answers, typingMatchScore } = req.body;
  if (!submissionId) return res.status(400).json({ error: 'submissionId required' });

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { exam: { include: { questions: true } }, events: true }
  });
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  if (submission.studentId !== req.user!.id) return res.status(403).json({ error: 'Not your submission' });

  // Score the exam
  const questions = submission.exam.questions;
  const parsedAnswers: { questionId: string; answer: string }[] = answers || [];
  let totalScore = 0;
  let totalMarks = 0;

  const gradedAnswers = questions.map(q => {
    const studentAnswer = parsedAnswers.find((a: any) => a.questionId === q.id);
    const isCorrect = studentAnswer?.answer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    totalMarks += q.marks;
    if (isCorrect) totalScore += q.marks;
    return { questionId: q.id, answer: studentAnswer?.answer || '', correct: isCorrect, topicTag: q.topicTag, difficulty: q.difficulty };
  });

  const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

  // Compute risk score from proctoring events
  const riskScore = computeRiskScore(submission.events);

  // AI Invigilator reasoning
  const invigilatorReport = analyzeInvigilator(submission.events, typingMatchScore || 100);

  // Skill gap analysis
  const skillGapData = computeSkillGap(gradedAnswers);

  // Placement readiness
  const placementData = computePlacementScore(skillGapData);

  // Log submit event
  await prisma.proctoringEvent.create({
    data: { submissionId, type: 'EXAM_SUBMIT', severity: 'LOW' }
  });

  const faceMismatchCount = submission.events.filter(e => e.type === 'FACE_MISMATCH').length;
  const tabSwitchCount = submission.events.filter(e => e.type === 'TAB_SWITCH').length;

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      submittedAt: new Date(),
      answers: JSON.stringify(gradedAnswers),
      score: totalScore,
      percentage,
      riskScore,
      riskExplanation: invigilatorReport.explanation,
      typingMatchScore,
      faceMismatchCount,
      tabSwitchCount,
      status: riskScore > 80 ? 'FLAGGED' : 'SUBMITTED',
      skillGapData: JSON.stringify(skillGapData),
      placementData: JSON.stringify(placementData)
    }
  });

  res.json({ submission: updated, invigilatorReport, skillGapData, placementData });
});

// GET /api/submissions/my — student's submission history
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  const submissions = await prisma.submission.findMany({
    where: { studentId: req.user!.id },
    include: { exam: { select: { title: true, totalMarks: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(submissions);
});

// GET /api/submissions/exam/:examId — teacher view all submissions for exam
router.get('/exam/:examId', authenticate, async (req: AuthRequest, res: Response) => {
  const submissions = await prisma.submission.findMany({
    where: { examId: req.params.examId as string },
    include: {
      student: { select: { name: true, email: true } },
      events: true
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(submissions);
});

// GET /api/submissions/:id — get single submission
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id as string },
    include: {
      exam: { include: { questions: true } },
      student: { select: { name: true, email: true } },
      events: { orderBy: { timestamp: 'asc' } }
    }
  });
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  res.json(submission);
});

export default router;
