import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Plus, Eye, BarChart3, CheckCircle, Clock, Zap, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/exams'), api.get('/analytics/overview')])
      .then(([ex, ov]) => { setExams(ex.data); setOverview(ov.data); })
      .finally(() => setLoading(false));
  }, []);

  const publishExam = async (id: string) => {
    try {
      await api.post(`/exams/${id}/publish`);
      setExams(prev => prev.map(e => e.id === id ? { ...e, isPublished: true } : e));
      toast.success('Exam published successfully!');
    } catch { toast.error('Failed to publish'); }
  };

  const stats = [
    { label: 'Total Exams',  value: exams.length,                  icon: BookOpen,    iconColor: 'var(--gold-600)',   iconBg: 'var(--gold-50)',   note: 'created by you' },
    { label: 'Students',     value: overview.totalStudents || 0,    icon: Users,       iconColor: '#0369a1',           iconBg: '#f0f9ff',          note: 'registered' },
    { label: 'Submissions',  value: overview.totalSubmissions || 0, icon: TrendingUp,  iconColor: '#15803d',           iconBg: '#f0fdf4',          note: 'attempts' },
    { label: 'Avg. Score',   value: `${overview.avgScore || 0}%`,   icon: BarChart3,   iconColor: '#9333ea',           iconBg: '#f5f3ff',          note: 'platform wide' },
  ];

  return (
    <DashboardLayout title={`Welcome, ${user?.name?.split(' ')[0]}!`} subtitle="Manage your exams and monitor student performance in real time">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="stat-card">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: s.iconBg, border: `1px solid ${s.iconColor}20` }}>
              <s.icon size={20} style={{ color: s.iconColor }} />
            </div>
            {loading
              ? <div className="skeleton h-8 w-14 mb-1 rounded-lg" />
              : <div className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            }
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.note}</div>
          </motion.div>
        ))}
      </div>

      {/* Exam list header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold flex items-center gap-2 text-lg" style={{ color: 'var(--text-primary)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-50)', border: '1px solid rgba(201,154,14,0.3)' }}>
            <Zap size={14} style={{ color: 'var(--gold-700)' }} />
          </div>
          Your Exams
        </h2>
        <Link to="/teacher/exams/create" className="btn-gold text-sm flex items-center gap-1.5">
          <Plus size={15} /> Create Exam
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : exams.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="nexus-card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'var(--bg-secondary)' }}>
            <BookOpen size={28} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No exams yet</h3>
          <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            Create your first exam with AI-powered question generation and adaptive assessment.
          </p>
          <Link to="/teacher/exams/create" className="btn-gold inline-flex items-center gap-2">
            <Plus size={16} /> Create First Exam
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam: any, i: number) => (
            <motion.div key={exam.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -1 }}
              className="nexus-card p-5 flex items-center gap-5 group">

              {/* Status indicator */}
              <div className="w-1.5 self-stretch rounded-full flex-shrink-0"
                style={{ background: exam.isPublished ? '#22c55e' : 'var(--border-medium)' }} />

              {/* Exam icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: exam.isPublished ? '#f0fdf4' : 'var(--bg-secondary)', border: `1px solid ${exam.isPublished ? '#bbf7d0' : 'var(--border-light)'}` }}>
                <BookOpen size={18} style={{ color: exam.isPublished ? '#15803d' : 'var(--text-muted)' }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{exam.title}</div>
                  <span className="badge text-xs"
                    style={{
                      background: exam.isPublished ? '#f0fdf4' : 'var(--bg-secondary)',
                      color: exam.isPublished ? '#15803d' : 'var(--text-muted)',
                      border: `1px solid ${exam.isPublished ? '#bbf7d0' : 'var(--border-light)'}`,
                    }}>
                    {exam.isPublished ? <><CheckCircle size={10} className="inline mr-0.5" />Published</> : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={11} /> {exam.durationMinutes}m
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <BookOpen size={11} /> {exam._count?.questions || 0} questions
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Users size={11} /> {exam._count?.submissions || 0} submissions
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!exam.isPublished && (
                  <button onClick={() => publishExam(exam.id)} className="btn-secondary text-xs px-3 py-1.5 rounded-lg">
                    Publish
                  </button>
                )}
                <Link to={`/teacher/exams/${exam.id}/reports`}
                  className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <BarChart3 size={13} /> Reports
                </Link>
                <Link to={`/teacher/exams/${exam.id}/monitor`}
                  className="btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Eye size={13} /> Monitor
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
