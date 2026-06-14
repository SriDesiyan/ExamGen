/**
 * AI Invigilator Agent — ExamGen Nexus's Biggest Innovation
 *
 * Traditional: single-event alerts (face mismatch → alert)
 * ExamGen Nexus: reasoning agent that looks at patterns across ALL events
 * and generates a human-readable explanation + confidence score
 */

interface ProctoringEvent {
  type: string;
  severity: string;
  timestamp?: Date;
}

interface InvigilatorReport {
  riskScore: number;
  confidence: number;
  verdict: string;
  explanation: string;
  incidents: IncidentDetail[];
  recommendations: string[];
}

interface IncidentDetail {
  category: string;
  count: number;
  severity: string;
  contribution: string;
}

export function analyzeInvigilator(events: ProctoringEvent[], typingMatchScore: number = 100): InvigilatorReport {
  const faceMismatches = events.filter(e => ['FACE_MISMATCH', 'FACE_NOT_DETECTED', 'MULTIPLE_FACES'].includes(e.type)).length;
  const tabSwitches = events.filter(e => e.type === 'TAB_SWITCH').length;
  const fullscreenExits = events.filter(e => e.type === 'FULLSCREEN_EXIT').length;
  const audioAnomalies = events.filter(e => e.type === 'AUDIO_ANOMALY').length;
  const mouseLeaves = events.filter(e => e.type === 'MOUSE_LEAVE').length;
  const typingAnomalies = events.filter(e => e.type === 'TYPING_ANOMALY').length;

  const total = events.filter(e => !['EXAM_START', 'EXAM_SUBMIT'].includes(e.type)).length;

  // Weighted risk score
  let riskScore = 0;
  riskScore += Math.min(30, faceMismatches * 5);
  riskScore += Math.min(25, tabSwitches * 4);
  riskScore += Math.min(15, fullscreenExits * 5);
  riskScore += Math.min(15, audioAnomalies * 3);
  riskScore += Math.min(10, mouseLeaves * 1.5);
  riskScore += Math.min(5, typingAnomalies * 2.5);
  if (typingMatchScore < 60) riskScore += 15;
  else if (typingMatchScore < 75) riskScore += 8;
  riskScore = Math.min(100, Math.round(riskScore));

  // Confidence based on event volume
  const confidence = Math.min(98, Math.max(40, 40 + total * 3 + (riskScore > 50 ? 15 : 0)));

  // Generate natural language explanation
  const incidents: IncidentDetail[] = [];
  const flags: string[] = [];

  if (faceMismatches > 0) {
    incidents.push({ category: 'Face Verification', count: faceMismatches, severity: faceMismatches > 3 ? 'Critical' : 'High', contribution: `+${Math.min(30, faceMismatches * 5)} risk points` });
    flags.push(faceMismatches === 1 ? 'Face mismatch detected once' : `Face mismatch or absence detected ${faceMismatches} times`);
  }
  if (tabSwitches > 0) {
    incidents.push({ category: 'Tab/Window Switching', count: tabSwitches, severity: tabSwitches > 5 ? 'Critical' : tabSwitches > 2 ? 'High' : 'Medium', contribution: `+${Math.min(25, tabSwitches * 4)} risk points` });
    flags.push(`Switched tabs or windows ${tabSwitches} time${tabSwitches > 1 ? 's' : ''}`);
  }
  if (audioAnomalies > 0) {
    incidents.push({ category: 'Audio Anomaly', count: audioAnomalies, severity: audioAnomalies > 2 ? 'High' : 'Medium', contribution: `+${Math.min(15, audioAnomalies * 3)} risk points` });
    flags.push(`Unusual audio detected ${audioAnomalies} time${audioAnomalies > 1 ? 's' : ''}`);
  }
  if (typingMatchScore < 75) {
    incidents.push({ category: 'Typing Biometrics', count: 1, severity: typingMatchScore < 60 ? 'High' : 'Medium', contribution: typingMatchScore < 60 ? '+15 risk points' : '+8 risk points' });
    flags.push(`Typing rhythm mismatch (${typingMatchScore}% similarity with enrolled profile)`);
  }
  if (fullscreenExits > 0) {
    incidents.push({ category: 'Fullscreen Violation', count: fullscreenExits, severity: 'Medium', contribution: `+${Math.min(15, fullscreenExits * 5)} risk points` });
    flags.push(`Exited fullscreen mode ${fullscreenExits} time${fullscreenExits > 1 ? 's' : ''}`);
  }

  // Generate verdict
  let verdict: string;
  if (riskScore < 20) verdict = 'Likely Genuine — No significant anomalies detected.';
  else if (riskScore < 40) verdict = 'Low Concern — Minor anomalies observed, likely unintentional.';
  else if (riskScore < 65) verdict = 'Moderate Concern — Multiple anomalies suggest possible policy violations.';
  else if (riskScore < 80) verdict = 'High Suspicion — Pattern of behavior indicates high probability of academic dishonesty.';
  else verdict = 'Critical Alert — Strong evidence of examination fraud. Manual review strongly recommended.';

  // Build explanation
  let explanation = '';
  if (flags.length === 0) {
    explanation = 'The student completed the exam with no significant behavioral anomalies. Risk profile is clean.';
  } else {
    explanation = `AI analysis detected the following patterns: ${flags.join('; ')}. `;
    if (riskScore > 50) {
      explanation += `The combination of these signals suggests a ${confidence}% probability of external assistance or identity fraud. `;
    }
    explanation += verdict;
  }

  const recommendations: string[] = [];
  if (riskScore > 60) recommendations.push('Manually review submission and proctoring footage');
  if (faceMismatches > 3) recommendations.push('Verify student identity against enrollment photo');
  if (tabSwitches > 3) recommendations.push('Check browser history for exam-related searches');
  if (typingMatchScore < 60) recommendations.push('Conduct an oral viva to confirm knowledge');
  if (riskScore < 20) recommendations.push('No action required — submission appears authentic');

  return { riskScore, confidence, verdict, explanation, incidents, recommendations };
}
