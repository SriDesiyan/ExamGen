import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Monitor, Shield, Maximize, CheckCircle, AlertTriangle, ChevronRight, Loader2, Info } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface CheckItem { id: string; label: string; desc: string; icon: any; status: 'pending' | 'ok' | 'fail'; }

export default function ExamLobby() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [checks, setChecks] = useState<CheckItem[]>([
    { id: 'camera',   label: 'Webcam Access',    desc: 'Required for face verification during exam',              icon: Camera,    status: 'pending' },
    { id: 'screen',   label: 'Screen Sharing',   desc: 'Required for proctoring and integrity monitoring',         icon: Monitor,   status: 'pending' },
    { id: 'fullscreen', label: 'Fullscreen Mode', desc: 'Exam runs in fullscreen to prevent tab switching',        icon: Maximize,  status: 'pending' },
    { id: 'identity', label: 'Identity Verified', desc: 'Biometric profile confirmed for this session',           icon: Shield,    status: 'pending' },
  ]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [allReady, setAllReady] = useState(false);

  useEffect(() => {
    api.get(`/exams/${examId}`).then(r => setExam(r.data)).finally(() => setLoading(false));
    runSystemChecks();
  }, [examId]);

  const setCheck = (id: string, status: 'ok' | 'fail') => {
    setChecks(prev => {
      const next = prev.map(c => c.id === id ? { ...c, status } : c);
      setAllReady(next.every(c => c.status === 'ok'));
      return next;
    });
  };

  const runSystemChecks = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setCheck('camera', 'ok');
    } catch { setCheck('camera', 'fail'); }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setCheck('screen', 'ok');
    } catch { setCheck('screen', 'fail'); toast.error('Screen sharing permission needed'); }

    if (document.fullscreenEnabled) {
      setCheck('fullscreen', 'ok');
    } else { setCheck('fullscreen', 'fail'); }

    try {
      const { data } = await api.get('/biometrics/status');
      setCheck('identity', data.isVerified ? 'ok' : 'fail');
      if (!data.isVerified) toast.error('Complete identity verification first');
    } catch { setCheck('identity', 'fail'); }
  };

  const startExam = async () => {
    setStarting(true);
    try {
      await document.documentElement.requestFullscreen?.();
      navigate(`/student/exam/${examId}/room`);
    } catch (err: any) {
      toast.error('Failed to start exam: ' + (err.message || 'Unknown error'));
      setStarting(false);
    }
  };

  if (loading) return (
    <DashboardLayout title="Exam Lobby" subtitle="Preparing your exam session...">
      <div className="max-w-xl mx-auto nexus-card p-12 text-center">
        <Loader2 size={36} className="animate-spin mx-auto" style={{ color: 'var(--gold-600)' }} />
        <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading exam details...</p>
      </div>
    </DashboardLayout>
  );

  const readyCount = checks.filter(c => c.status === 'ok').length;

  return (
    <DashboardLayout title={exam?.title || 'Exam Lobby'} subtitle="Complete all pre-flight checks before starting your exam">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Exam info strip */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="nexus-card-gold p-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { val: exam?.durationMinutes, unit: 'Minutes',   color: 'var(--gold-700)' },
              { val: exam?._count?.questions || exam?.questions?.length || 0, unit: 'Questions', color: '#0369a1' },
              { val: `${exam?.passingScore}%`, unit: 'Pass Mark', color: '#15803d' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-2xl font-bold mb-0.5" style={{ color: item.color, fontFamily: "'Playfair Display', serif" }}>{item.val}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.unit}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System checks */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="nexus-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Pre-Exam Checks</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{readyCount}/{checks.length} checks passed</p>
            </div>
            <button onClick={runSystemChecks} className="btn-secondary text-xs px-3 py-1.5">Re-run Checks</button>
          </div>

          {/* Progress bar */}
          <div className="progress-track mb-5">
            <div className="progress-fill progress-gold" style={{ width: `${(readyCount / checks.length) * 100}%` }} />
          </div>

          <div className="space-y-3">
            {checks.map((check, i) => {
              const isOk   = check.status === 'ok';
              const isFail = check.status === 'fail';
              return (
                <motion.div key={check.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    border: `1px solid ${isOk ? '#bbf7d0' : isFail ? '#fecaca' : 'var(--border-light)'}`,
                    background: isOk ? '#fafffe' : isFail ? '#fff8f8' : 'var(--bg-secondary)',
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isOk ? '#f0fdf4' : isFail ? '#fee2e2' : 'var(--bg-card)', border: `1px solid ${isOk ? '#bbf7d0' : isFail ? '#fecaca' : 'var(--border-light)'}` }}>
                    <check.icon size={18} style={{ color: isOk ? '#15803d' : isFail ? '#b91c1c' : 'var(--text-muted)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{check.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{check.desc}</div>
                  </div>
                  <div className="flex-shrink-0">
                    {isOk   && <CheckCircle size={20} style={{ color: '#15803d' }} />}
                    {isFail && <AlertTriangle size={20} style={{ color: '#b91c1c' }} />}
                    {check.status === 'pending' && <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Proctoring notice */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: '#fffbeb', border: '1px solid rgba(201,154,14,0.3)' }}>
          <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--gold-700)' }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--gold-800)' }}>
            By starting this exam, you agree to webcam monitoring, screen recording, and typing pattern analysis for academic integrity purposes.
          </p>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={startExam} disabled={!allReady || starting}
          className="btn-gold w-full py-4 text-base rounded-xl flex items-center justify-center gap-2"
          whileHover={allReady ? { scale: 1.01 } : {}}
          whileTap={allReady ? { scale: 0.99 } : {}}
          style={{ opacity: (!allReady && !starting) ? 0.5 : 1 }}>
          {starting
            ? <><Loader2 size={20} className="animate-spin" /> Starting exam...</>
            : allReady
              ? <>Begin Exam <ChevronRight size={20} /></>
              : 'Complete all checks to start'
          }
        </motion.button>
      </div>
    </DashboardLayout>
  );
}
