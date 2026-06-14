import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, Send, Loader2, Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface Question { id: string; text: string; type: string; options?: string[]; difficulty: string; topicTag?: string; marks: number; }
interface Answer { questionId: string; answer: string; }

// Accessibility: TTS
function speakText(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }
}

export default function ExamRoom() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submissionId, setSubmissionId] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [riskWarning, setRiskWarning] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);

  // Keystroke biometrics capture
  const keyTimings = useRef<{ holdTimes: number[]; intervals: number[] }>({ holdTimes: [], intervals: [] });
  const keyDownMap = useRef<Record<string, number>>({});
  const lastKeyUp = useRef<number>(0);

  // Proctoring refs
  const timerRef = useRef<any>(null);
  const proctoringRef = useRef<any>(null);

  useEffect(() => {
    startExam();
    setupProctoring();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(proctoringRef.current);
      document.exitFullscreen?.().catch(() => {});
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startExam = async () => {
    try {
      const { data } = await api.post('/submissions/start', { examId });
      setSubmissionId(data.submission.id);
      setExam(data.exam);
      setQuestions(data.questions);
      setAnswers(data.questions.map((q: Question) => ({ questionId: q.id, answer: '' })));
      const dur = (data.exam.durationMinutes || 60) * 60;
      setTimeLeft(dur);
      startTimer(dur, data.submission.id);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start exam');
      navigate('/student');
    } finally { setLoading(false); }
  };

  const startTimer = (dur: number, subId: string) => {
    let remaining = dur;
    timerRef.current = setInterval(() => {
      remaining--;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        toast('⏰ Time\'s up! Submitting automatically...', { icon: '⏰' });
        submitExam(subId);
      }
    }, 1000);
  };

  // ─── Proctoring (tab switch, fullscreen, periodic face check) ─────────────
  const setupProctoring = () => {
    // Tab switch detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Fullscreen exit detection
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    // Mouse leave detection
    document.addEventListener('mouseleave', handleMouseLeave);
  };

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setTabWarnings(w => w + 1);
      setRiskWarning(true);
      setTimeout(() => setRiskWarning(false), 3000);
      if (submissionId) {
        api.post('/submissions/event', { submissionId, type: 'TAB_SWITCH', severity: tabWarnings > 3 ? 'HIGH' : 'MEDIUM' });
      }
      toast.error('⚠️ Tab switch detected! This has been recorded.', { duration: 4000 });
    }
  }, [submissionId, tabWarnings]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && submissionId) {
      api.post('/submissions/event', { submissionId, type: 'FULLSCREEN_EXIT', severity: 'MEDIUM' });
      toast.error('⚠️ Fullscreen exit recorded. Please return to fullscreen.', { duration: 4000 });
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, [submissionId]);

  const handleMouseLeave = useCallback(() => {
    if (submissionId) api.post('/submissions/event', { submissionId, type: 'MOUSE_LEAVE', severity: 'LOW' });
  }, [submissionId]);

  // ─── Keystroke capture ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => { keyDownMap.current[e.key] = Date.now(); };
  const handleKeyUp = (e: React.KeyboardEvent) => {
    const now = Date.now();
    const hold = now - (keyDownMap.current[e.key] || now);
    const interval = lastKeyUp.current ? now - lastKeyUp.current : 0;
    keyTimings.current.holdTimes.push(hold);
    if (interval > 0) keyTimings.current.intervals.push(interval);
    lastKeyUp.current = now;
  };

  // ─── Navigation ───────────────────────────────────────────────────────────
  const setAnswer = (value: string) => {
    setAnswers(prev => prev.map((a, i) => i === currentIdx ? { ...a, answer: value } : a));
  };

  const submitExam = async (subId?: string) => {
    const sid = subId || submissionId;
    if (!sid) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('mouseleave', handleMouseLeave);
    document.exitFullscreen?.().catch(() => {});

    try {
      const typingMatchScore = Math.max(60, 100 - keyTimings.current.holdTimes.length * 0.5); // simplified
      await api.post('/submissions/submit', { submissionId: sid, answers, typingMatchScore });
      navigate(`/student/result/${sid}`);
    } catch (err: any) {
      toast.error('Submission failed: ' + (err.response?.data?.error || 'Unknown error'));
      setSubmitting(false);
    }
  };

  // Timer display
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerColor = timeLeft < 300 ? '#b91c1c' : timeLeft < 600 ? '#b45309' : '#15803d';
  const timerBg    = timeLeft < 300 ? '#fee2e2' : timeLeft < 600 ? '#fef3c7' : '#f0fdf4';
  const timerBorder= timeLeft < 300 ? '#fecaca' : timeLeft < 600 ? '#fde68a' : '#bbf7d0';

  const currentQuestion = questions[currentIdx];
  const currentAnswer = answers[currentIdx]?.answer || '';

  if (loading) return (
    <div className="exam-fullscreen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
      <div className="text-center">
        <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: 'var(--gold-600)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading exam...</p>
      </div>
    </div>
  );

  if (submitting) return (
    <div className="exam-fullscreen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl"
          style={{ background: 'linear-gradient(135deg, #1a1814, #3d3830)' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#f5c842' }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>Submitting Exam...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Analyzing your performance. Please wait.</p>
      </div>
    </div>
  );

  return (
    <div className={`exam-fullscreen ${dyslexiaMode ? 'dyslexia-mode' : ''}`}
      style={{ background: 'var(--bg-primary)' }}
      onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>

      {/* Risk warning flash */}
      <AnimatePresence>
        {riskWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 rounded-none"
            style={{ border: '4px solid rgba(220,38,38,0.5)', boxShadow: '0 0 40px rgba(220,38,38,0.15) inset' }} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(253,252,248,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1814, #3d3830)' }}>
            <Eye size={14} style={{ color: '#f5c842' }} />
          </div>
          <div className="font-semibold text-sm truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{exam?.title}</div>
          {tabWarnings > 0 && (
            <div className="badge risk-high text-xs">
              <AlertTriangle size={11} className="inline mr-1" /> {tabWarnings} violation{tabWarnings > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setTtsEnabled(!ttsEnabled); if (!ttsEnabled && currentQuestion) speakText(currentQuestion.text); }}
            className="p-2 rounded-lg transition-all"
            style={{ background: ttsEnabled ? '#fef3c7' : 'var(--bg-secondary)', color: ttsEnabled ? 'var(--gold-700)' : 'var(--text-muted)', border: '1px solid var(--border-light)' }}
            title="Text to Speech">
            {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={() => setDyslexiaMode(!dyslexiaMode)}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
            style={{ background: dyslexiaMode ? '#f0f9ff' : 'var(--bg-secondary)', color: dyslexiaMode ? '#0369a1' : 'var(--text-muted)', border: `1px solid ${dyslexiaMode ? '#bae6fd' : 'var(--border-light)'}` }}>
            Aa
          </button>
          {/* Timer */}
          <div className="font-mono font-bold tabular-nums px-4 py-2 rounded-xl text-lg"
            style={{ background: timerBg, color: timerColor, border: `1px solid ${timerBorder}` }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1" style={{ background: 'var(--bg-secondary)' }}>
        <div className="h-full transition-all duration-700"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, var(--gold-600), var(--gold-400))' }} />
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto p-6 lg:p-8">

        {/* Question nav pills */}
        <div className="flex flex-wrap gap-2 mb-7">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentIdx(i)}
              className="w-9 h-9 rounded-lg text-sm font-bold transition-all"
              style={{
                background: i === currentIdx ? 'linear-gradient(135deg, #1a1814, #3d3830)' : answers[i]?.answer ? '#f0fdf4' : 'var(--bg-secondary)',
                color: i === currentIdx ? '#f5c842' : answers[i]?.answer ? '#15803d' : 'var(--text-muted)',
                border: `1px solid ${i === currentIdx ? 'transparent' : answers[i]?.answer ? '#bbf7d0' : 'var(--border-light)'}`,
              }}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="nexus-card p-7 mb-6">

            {/* Question meta */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-dark text-xs">Q{currentIdx + 1} / {questions.length}</span>
                <span className={`badge text-xs ${currentQuestion?.difficulty === 'EASY' ? 'risk-low' : currentQuestion?.difficulty === 'HARD' ? 'risk-high' : 'risk-medium'}`}>
                  {currentQuestion?.difficulty}
                </span>
                {currentQuestion?.topicTag && (
                  <span className="badge badge-gold text-xs">{currentQuestion?.topicTag}</span>
                )}
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {currentQuestion?.marks} mark{currentQuestion?.marks > 1 ? 's' : ''}
                </span>
              </div>
              {ttsEnabled && (
                <button onClick={() => currentQuestion && speakText(currentQuestion.text)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-600)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  <Volume2 size={16} />
                </button>
              )}
            </div>

            <p className="text-lg font-medium leading-relaxed mb-6" style={{ color: 'var(--text-primary)' }}>
              {currentQuestion?.text}
            </p>

            {/* MCQ Options */}
            {currentQuestion?.type === 'MCQ' && currentQuestion?.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = currentAnswer === opt;
                  return (
                    <button key={i} onClick={() => setAnswer(opt)}
                      className="w-full text-left p-4 rounded-xl transition-all"
                      style={{
                        border: `2px solid ${isSelected ? 'rgba(201,154,14,0.6)' : 'var(--border-light)'}`,
                        background: isSelected ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : 'var(--bg-secondary)',
                        boxShadow: isSelected ? 'var(--shadow-gold)' : 'none',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-gold)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-light)'; }}>
                      <span className="font-bold mr-3 text-sm" style={{ color: isSelected ? 'var(--gold-700)' : 'var(--text-muted)' }}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className="text-sm" style={{ color: isSelected ? 'var(--gold-800)' : 'var(--text-primary)' }}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short/Long Answer */}
            {(currentQuestion?.type === 'SHORT' || currentQuestion?.type === 'LONG') && (
              <textarea
                className="nexus-input resize-none"
                rows={currentQuestion?.type === 'LONG' ? 8 : 4}
                placeholder={`Type your ${currentQuestion?.type === 'SHORT' ? 'short' : 'detailed'} answer here...`}
                value={currentAnswer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
            className="btn-secondary px-6">
            ← Previous
          </button>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{answers.filter(a => a.answer).length}</span>
            /{questions.length} answered
          </div>
          {currentIdx < questions.length - 1 ? (
            <button onClick={() => setCurrentIdx(i => i + 1)} className="btn-primary px-6">Next →</button>
          ) : (
            <button onClick={() => submitExam()} disabled={submitting}
              className="btn-gold px-6 py-2.5 rounded-xl flex items-center gap-2">
              <Send size={15} /> Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
