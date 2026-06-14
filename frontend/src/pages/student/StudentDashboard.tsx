import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, AlertTriangle, Shield, ChevronRight, Trophy, Activity, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { motion } from 'framer-motion';

const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  EASY:   { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  MEDIUM: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  HARD:   { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
};

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/exams'), api.get('/submissions/my')])
      .then(([ex, sub]) => { setExams(ex.data); setSubmissions(sub.data); })
      .finally(() => setLoading(false));
  }, []);

  const submittedExamIds = new Set(submissions.filter(s => s.status !== 'IN_PROGRESS').map((s: any) => s.examId));
  const availableExams = exams.filter(e => !submittedExamIds.has(e.id));
  const completedSubs = submissions.filter(s => s.status === 'SUBMITTED');
  const avgScore = completedSubs.reduce((a: number, s: any) => a + (s.percentage || 0), 0) / (completedSubs.length || 1);

  const stats = [
    { label: 'Available',   value: availableExams.length,          icon: Zap,         iconColor: 'var(--gold-600)',   iconBg: 'var(--gold-50)',   note: 'exams ready' },
    { label: 'Completed',   value: completedSubs.length,            icon: CheckCircle, iconColor: '#15803d',           iconBg: '#f0fdf4',          note: 'finished' },
    { label: 'Avg. Score',  value: completedSubs.length ? `${avgScore.toFixed(1)}%` : '—', icon: Trophy, iconColor: '#0369a1', iconBg: '#f0f9ff', note: 'across exams' },
    { label: 'Identity',    value: user?.isVerified ? 'Verified' : 'Pending', icon: Shield, iconColor: user?.isVerified ? '#15803d' : '#b45309', iconBg: user?.isVerified ? '#f0fdf4' : '#fef3c7', note: user?.isVerified ? 'all clear' : 'action needed' },
  ];

  return (
    <DashboardLayout title={`Welcome back, ${user?.name?.split(' ')[0]}`} subtitle="Your personal exam dashboard and performance overview">

      {/* Identity verification banner */}
      {!user?.isVerified && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="mb-6 p-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap"
          style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid rgba(201,154,14,0.35)', boxShadow: 'var(--shadow-gold)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(201,154,14,0.15)', border: '1px solid rgba(201,154,14,0.3)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--gold-700)' }} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--gold-800)' }}>Identity Verification Required</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--gold-700)' }}>Complete face verification and typing biometrics to unlock exam access</div>
            </div>
          </div>
          <Link to="/student/verify" className="btn-gold text-sm flex items-center gap-1.5 flex-shrink-0">
            Verify Now <ChevronRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="stat-card group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-sm"
              style={{ background: s.iconBg, border: `1px solid ${s.iconColor}20` }}>
              <s.icon size={20} style={{ color: s.iconColor }} />
            </div>
            {loading
              ? <div className="skeleton h-8 w-16 mb-1 rounded-lg" />
              : <div className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            }
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.note}</div>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Available Exams */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-50)', border: '1px solid rgba(201,154,14,0.3)' }}>
                <Zap size={14} style={{ color: 'var(--gold-700)' }} />
              </div>
              Available Exams
            </h2>
            <span className="badge badge-gold">{availableExams.length} Ready</span>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
          ) : availableExams.length === 0 ? (
            <div className="nexus-card p-10 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--bg-secondary)' }}>
                <BookOpen size={24} style={{ color: 'var(--text-subtle)' }} />
              </div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No exams available</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Check back later for new assignments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableExams.map((exam: any, i) => {
                const dc = difficultyColors[exam.difficulty] || difficultyColors.MEDIUM;
                return (
                  <motion.div key={exam.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="nexus-card p-5 flex items-start justify-between gap-4 group"
                    whileHover={{ y: -1 }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{exam.title}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={11} /> {exam.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <BookOpen size={11} /> {exam._count?.questions} Q
                        </span>
                        <span className="badge text-xs" style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                          {exam.difficulty}
                        </span>
                      </div>
                    </div>
                    {user?.isVerified ? (
                      <Link to={`/student/exam/${exam.id}/lobby`}
                        className="btn-gold text-xs px-4 py-2 rounded-lg flex-shrink-0">
                        Start <ArrowRight size={13} />
                      </Link>
                    ) : (
                      <div className="text-xs text-center flex-shrink-0" style={{ color: 'var(--text-subtle)' }}>
                        Verify<br />first
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f0f9ff', border: '1px solid rgba(3,105,161,0.2)' }}>
                <Activity size={14} style={{ color: '#0369a1' }} />
              </div>
              Recent Results
            </h2>
            {completedSubs.length > 0 && (
              <span className="badge text-xs" style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                {completedSubs.length} exams
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
          ) : submissions.length === 0 ? (
            <div className="nexus-card p-10 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--bg-secondary)' }}>
                <Trophy size={24} style={{ color: 'var(--text-subtle)' }} />
              </div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No submissions yet</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Complete an exam to see your results here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 5).map((sub: any, i) => {
                const score = sub.percentage ?? 0;
                const risk = sub.riskScore ?? 0;
                const passed = score >= 40;
                return (
                  <Link key={sub.id} to={`/student/result/${sub.id}`}>
                    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="nexus-card p-5 flex items-start justify-between hover:border-amber-200 transition-colors group"
                      whileHover={{ y: -1 }}>
                      <div>
                        <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{sub.exam?.title}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'In Progress'}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="badge text-xs" style={{
                            background: risk < 30 ? '#f0fdf4' : risk < 60 ? '#fef3c7' : '#fee2e2',
                            color: risk < 30 ? '#15803d' : risk < 60 ? '#b45309' : '#b91c1c',
                            border: `1px solid ${risk < 30 ? '#bbf7d0' : risk < 60 ? '#fde68a' : '#fecaca'}`,
                          }}>
                            Risk: {risk.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: passed ? '#15803d' : '#b91c1c' }}>
                          {score.toFixed(1)}%
                        </div>
                        <div className="text-xs mt-1 font-medium" style={{ color: passed ? '#15803d' : '#b91c1c' }}>
                          {passed ? 'Passed' : 'Failed'}
                        </div>
                        <TrendingUp size={12} className="ml-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--gold-600)' }} />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
