/**
 * Risk Engine — Unified Risk Score Computation
 * Inputs: proctoring events from a submission
 * Output: risk score 0-100
 *
 * Weights (must sum to 100):
 *   Face mismatch    30%
 *   Tab switches     25%
 *   Fullscreen exits 15%
 *   Audio anomalies  15%
 *   Mouse leave      10%
 *   Typing anomaly    5%
 */

interface ProctoringEvent {
  type: string;
  severity: string;
  timestamp?: Date;
}

interface RiskBreakdown {
  faceMismatch: number;
  tabSwitch: number;
  fullscreenExit: number;
  audioAnomaly: number;
  mouseLeave: number;
  typingAnomaly: number;
  total: number;
}

const SEVERITY_WEIGHTS: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 5
};

export function computeRiskScore(events: ProctoringEvent[]): number {
  const breakdown = computeRiskBreakdown(events);
  return Math.min(100, Math.round(breakdown.total));
}

export function computeRiskBreakdown(events: ProctoringEvent[]): RiskBreakdown {
  const faceMismatchEvents = events.filter(e => e.type === 'FACE_MISMATCH' || e.type === 'FACE_NOT_DETECTED' || e.type === 'MULTIPLE_FACES');
  const tabSwitchEvents = events.filter(e => e.type === 'TAB_SWITCH');
  const fullscreenEvents = events.filter(e => e.type === 'FULLSCREEN_EXIT');
  const audioEvents = events.filter(e => e.type === 'AUDIO_ANOMALY');
  const mouseEvents = events.filter(e => e.type === 'MOUSE_LEAVE');
  const typingEvents = events.filter(e => e.type === 'TYPING_ANOMALY');

  const faceMismatch = Math.min(30, weightedScore(faceMismatchEvents) * 5);
  const tabSwitch = Math.min(25, tabSwitchEvents.length * 4);
  const fullscreenExit = Math.min(15, fullscreenEvents.length * 5);
  const audioAnomaly = Math.min(15, audioEvents.length * 3);
  const mouseLeave = Math.min(10, mouseEvents.length * 1.5);
  const typingAnomaly = Math.min(5, typingEvents.length * 2.5);

  const total = faceMismatch + tabSwitch + fullscreenExit + audioAnomaly + mouseLeave + typingAnomaly;

  return { faceMismatch, tabSwitch, fullscreenExit, audioAnomaly, mouseLeave, typingAnomaly, total };
}

function weightedScore(events: ProctoringEvent[]): number {
  return events.reduce((sum, e) => sum + (SEVERITY_WEIGHTS[e.severity] || 1), 0);
}

export function getRiskLevel(score: number): { level: string; color: string; badge: string } {
  if (score < 20) return { level: 'Low', color: '#10b981', badge: 'bg-green-500' };
  if (score < 45) return { level: 'Medium', color: '#f59e0b', badge: 'bg-yellow-500' };
  if (score < 70) return { level: 'High', color: '#f97316', badge: 'bg-orange-500' };
  return { level: 'Critical', color: '#ef4444', badge: 'bg-red-500' };
}
