import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, User, TrendingUp, Eye, RefreshCw, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { motion } from 'framer-motion';

export default function LiveMonitorPage() {
  const { examId } = useParams();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = () => {
    api.get(`/submissions/exam/${examId}`).then(r => setSubmissions(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    let interval: any;
    if (autoRefresh) interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [examId, autoRefresh]);

  const active = submissions.filter(s => s.status === 'IN_PROGRESS');
  const completed = submissions.filter(s => s.status !== 'IN_PROGRESS');

  return (
    <DashboardLayout title="Live Monitor" subtitle={`Real-time exam session monitoring — auto-refresh every 5s`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4 text-sm">
          <span className="badge risk-low">{active.length} Active</span>
          <span className="badge badge-light">{completed.length} Completed</span>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn-secondary text-xs flex items-center gap-1 ${autoRefresh ? 'border-green-500/30' : ''}`}>
            <RefreshCw size={13} className={autoRefresh ? 'animate-spin text-green-400' : ''} />
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </button>
          <button onClick={load} className="btn-secondary text-xs">Refresh Now</button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="nexus-card p-12 text-center text-zinc-500">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p>No students have started this exam yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissions.map((sub: any, i: number) => {
            const risk = sub.riskScore ?? 0;
            const tabSwitches = sub.tabSwitchCount ?? 0;
            const faceMismatches = sub.faceMismatchCount ?? 0;
            const status = sub.status;
            return (
              <motion.div key={sub.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className={`nexus-card p-5 border transition-all ${risk > 60 ? 'border-red-500/30 bg-red-50/10' : risk > 30 ? 'border-yellow-500/20 bg-yellow-50/10' : 'border-[var(--border-light)]'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{sub.student?.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub.student?.email}</div>
                  </div>
                  <div className={`badge text-xs ${status === 'IN_PROGRESS' ? 'risk-low' : status === 'FLAGGED' ? 'risk-critical' : 'badge-light'}`}>
                    {status === 'IN_PROGRESS' ? '● Live' : status}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Risk Score</span>
                    <span className={`font-bold ${risk > 60 ? 'text-red-600' : risk > 30 ? 'text-amber-600' : 'text-green-600'}`}>{risk.toFixed(0)}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                    <div className={`h-full rounded-full transition-all ${risk > 60 ? 'bg-red-500' : risk > 30 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, risk)}%` }} />
                  </div>

                  {tabSwitches > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle size={11} /> {tabSwitches} tab switch{tabSwitches > 1 ? 'es' : ''}
                    </div>
                  )}
                  {faceMismatches > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle size={11} /> {faceMismatches} face mismatch{faceMismatches > 1 ? 'es' : ''}
                    </div>
                  )}
                  {sub.percentage != null && (
                    <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <TrendingUp size={11} /> Score: {sub.percentage?.toFixed(1)}%
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
