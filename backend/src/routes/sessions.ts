import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// WebRTC signalling server — adapted & improved from E-proctor
// Rooms keyed by exam+student: proctor offer stored, student answers collected
const rooms: Map<string, { offer: string; answers: string[] }> = new Map();

// POST /api/sessions/create-room — proctor creates room
router.post('/create-room', authenticate, async (req: AuthRequest, res: Response) => {
  const { roomId, sdp } = req.body;
  if (!roomId || !sdp) return res.status(400).json({ error: 'roomId and sdp required' });
  rooms.set(roomId, { offer: sdp, answers: [] });
  res.json({ success: true, roomId });
});

// POST /api/sessions/join-room — student joins room
router.post('/join-room', authenticate, async (req: AuthRequest, res: Response) => {
  const { roomId, sdp } = req.body;
  const room = rooms.get(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  room.answers.push(sdp);
  res.json({ offer: room.offer });
});

// POST /api/sessions/poll-room — proctor polls for new student answers
router.post('/poll-room', authenticate, async (req: AuthRequest, res: Response) => {
  const { roomId } = req.body;
  const room = rooms.get(roomId);
  if (!room) return res.json({ answers: [] });
  const answers = [...room.answers];
  room.answers = [];
  res.json({ answers });
});

// DELETE /api/sessions/room/:roomId — close room
router.delete('/room/:roomId', authenticate, async (req: AuthRequest, res: Response) => {
  rooms.delete(req.params.roomId as string);
  res.json({ success: true });
});

export default router;
