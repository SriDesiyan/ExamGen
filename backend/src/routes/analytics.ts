import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/analytics/overview — admin/teacher overview
router.get('/overview', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const whereClause = req.user!.role === 'TEACHER' ? { teacherId: req.user!.id } : {};
  const [totalExams, totalStudents, totalSubmissions, avgScore] = await Promise.all([
    prisma.exam.count({ where: whereClause }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.submission.count(),
    prisma.submission.aggregate({ _avg: { percentage: true } })
  ]);
  res.json({ totalExams, totalStudents, totalSubmissions, avgScore: avgScore._avg.percentage?.toFixed(1) || 0 });
});

// GET /api/analytics/exam/:examId — per-exam analytics
router.get('/exam/:examId', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  const submissions = await prisma.submission.findMany({
    where: { examId: req.params.examId as string, status: { in: ['SUBMITTED', 'FLAGGED'] } },
    include: { student: { select: { name: true, email: true } }, events: true }
  });

  const scores = submissions.map(s => s.percentage || 0);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const passCount = scores.filter(s => s >= 40).length;
  const flaggedCount = submissions.filter(s => s.status === 'FLAGGED').length;
  const avgRisk = submissions.map(s => s.riskScore).reduce((a, b) => a + b, 0) / (submissions.length || 1);

  // Score distribution buckets
  const distribution = [0, 20, 40, 60, 80, 100].map((min, i, arr) => {
    const max = arr[i + 1] || 101;
    return { range: `${min}-${max - 1}%`, count: scores.filter(s => s >= min && s < max).length };
  }).slice(0, 5);

  res.json({ submissions: submissions.length, avgScore: avgScore.toFixed(1), passRate: ((passCount / (submissions.length || 1)) * 100).toFixed(1), flaggedCount, avgRisk: avgRisk.toFixed(1), distribution, students: submissions.map((s: any) => ({ name: s.student.name, score: s.percentage, riskScore: s.riskScore, status: s.status })) });
});

// GET /api/analytics/student/:studentId — student analytics
router.get('/student/:studentId', authenticate, async (req: AuthRequest, res: Response) => {
  // Students can only see their own analytics
  if (req.user!.role === 'STUDENT' && req.user!.id !== req.params.studentId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const submissions = await prisma.submission.findMany({
    where: { studentId: req.params.studentId as string, status: { in: ['SUBMITTED', 'FLAGGED'] } },
    include: { exam: { select: { title: true } } },
    orderBy: { submittedAt: 'desc' }
  });

  const totalExams = submissions.length;
  const avgScore = submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / (totalExams || 1);
  const latestSkillGap = submissions[0]?.skillGapData ? JSON.parse(submissions[0].skillGapData) : null;
  const latestPlacement = submissions[0]?.placementData ? JSON.parse(submissions[0].placementData) : null;

  res.json({ totalExams, avgScore: avgScore.toFixed(1), submissions, latestSkillGap, latestPlacement });
});

// GET /api/analytics/leaderboard/:examId — exam leaderboard
router.get('/leaderboard/:examId', authenticate, async (req: AuthRequest, res: Response) => {
  const submissions = await prisma.submission.findMany({
    where: { examId: req.params.examId as string, status: { in: ['SUBMITTED', 'FLAGGED'] } },
    include: { student: { select: { name: true } } },
    orderBy: { percentage: 'desc' },
    take: 20
  });

  const leaderboard = submissions.map((s: any, i) => ({
    rank: i + 1,
    name: s.student.name,
    score: s.percentage?.toFixed(1),
    riskScore: s.riskScore,
    status: s.status
  }));
  res.json(leaderboard);
});

export default router;
