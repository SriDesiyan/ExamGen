import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/biometrics/enroll — save keystroke profile (adapted from ProctoPro InitiateForm)
router.post('/enroll', authenticate, async (req: AuthRequest, res: Response) => {
  const { keystrokeProfile, faceProfileBase64 } = req.body;
  const updateData: any = { isVerified: true };
  if (keystrokeProfile) updateData.keystrokeProfile = JSON.stringify(keystrokeProfile);
  if (faceProfileBase64) updateData.faceProfileBase64 = faceProfileBase64;

  const user = await prisma.user.update({ where: { id: req.user!.id }, data: updateData });
  res.json({ success: true, isVerified: user.isVerified });
});

// POST /api/biometrics/verify-keystroke — verify typing rhythm during exam
router.post('/verify-keystroke', authenticate, async (req: AuthRequest, res: Response) => {
  const { currentProfile } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user || !user.keystrokeProfile) {
    return res.json({ match: false, score: 0, message: 'No enrolled profile found' });
  }

  const enrolled = JSON.parse(user.keystrokeProfile);
  const score = computeKeystrokeSimilarity(enrolled, currentProfile);
  const match = score >= 0.65;

  res.json({ match, score: Math.round(score * 100), message: match ? 'Identity verified' : 'Typing pattern mismatch detected' });
});

// GET /api/biometrics/status — check verification status
router.get('/status', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { isVerified: true, keystrokeProfile: true, faceProfileBase64: true }
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    isVerified: user.isVerified,
    hasKeystrokeProfile: !!user.keystrokeProfile,
    hasFaceProfile: !!user.faceProfileBase64
  });
});

/**
 * Local biometric engine — no TypingDNA dependency
 * Captures: hold times, inter-key intervals, typing rhythm vectors
 * Computes cosine similarity between enrolled and current profiles
 */
function computeKeystrokeSimilarity(enrolled: any, current: any): number {
  try {
    const e = normalizeProfile(enrolled);
    const c = normalizeProfile(current);
    if (e.length === 0 || c.length === 0) return 0;

    // Align vectors to same length
    const len = Math.min(e.length, c.length);
    const eVec = e.slice(0, len);
    const cVec = c.slice(0, len);

    // Cosine similarity
    const dot = eVec.reduce((sum: number, v: number, i: number) => sum + v * cVec[i], 0);
    const magE = Math.sqrt(eVec.reduce((sum: number, v: number) => sum + v * v, 0));
    const magC = Math.sqrt(cVec.reduce((sum: number, v: number) => sum + v * v, 0));
    if (magE === 0 || magC === 0) return 0;

    const cosine = dot / (magE * magC);
    // Add rhythm variance penalty
    const variance = computeVariancePenalty(eVec, cVec);
    return Math.max(0, Math.min(1, cosine - variance));
  } catch {
    return 0.5; // neutral if error
  }
}

function normalizeProfile(profile: any): number[] {
  if (!profile) return [];
  const holdTimes: number[] = profile.holdTimes || [];
  const intervals: number[] = profile.intervals || [];
  return [...holdTimes, ...intervals].map((v: number) => v / 1000); // normalize to seconds
}

function computeVariancePenalty(a: number[], b: number[]): number {
  const diffs = a.map((v, i) => Math.abs(v - b[i]));
  const mean = diffs.reduce((s, v) => s + v, 0) / diffs.length;
  return Math.min(0.3, mean * 0.5);
}

export default router;
