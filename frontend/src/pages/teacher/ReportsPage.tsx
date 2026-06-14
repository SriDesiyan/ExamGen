import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, Download, Users, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { examId } = useParams();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/analytics/exam/${examId}`).then(r => setAnalytics(r.data)).finally(() => setLoading(false));
  }, [examId]);

  const exportCSV = () => {
    if (!analytics?.students) return;
    const header = 'Name,Score (%),Risk Score,Status';
    const rows = analytics.students.map((s: any) => `${s.name},${s.score},${s.riskScore},${s.status}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `exam-report-${examId}.csv`; a.click();
    toast.success('CSV exported!');
  };

  if (loading) return <DashboardLayout title="Reports" subtitle="Loading..."><div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-purple-400" /></div></DashboardLayout>;

  const summaryCards = [
    { label: 'Submissions', value: analytics?.submissions || 0, icon: Users, color: 'text-purple-400' },
    { label: 'Avg Score', value: `${analytics?.avgScore || 0}%`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Pass Rate', value: `${analytics?.passRate || 0}%`, icon: BarChart3, color: 'text-cyan-400' },
    { label: 'Flagged', value: analytics?.flaggedCount || 0, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Avg Risk', value: analytics?.avgRisk || 0, icon: AlertTriangle, color: 'text-yellow-400' },
  ];

  return (
    <DashboardLayout title="Exam Reports" subtitle="Detailed analytics and integrity summary for this exam">
      {/* Export */}
      <div className="flex justify-end mb-6">
        <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-2"><Download size={16} /> Export CSV</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="nexus-card p-4 text-center">
            <c.icon size={20} className={`${c.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-zinc-500">{c.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Score distribution */}
      {analytics?.distribution && (
        <div className="nexus-card p-6 mb-6">
          <h2 className="font-bold mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.distribution}>
              <XAxis dataKey="range" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fafafa' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {analytics.distribution.map((_: any, i: number) => <Cell key={i} fill={['#ef4444', '#f97316', '#f59e0b', '#10b981', '#7c3aed'][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Student table */}
      {analytics?.students?.length > 0 && (
        <div className="nexus-card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-bold">Student Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-zinc-400">
                  <th className="text-left p-4 font-medium">Student</th>
                  <th className="text-center p-4 font-medium">Score</th>
                  <th className="text-center p-4 font-medium">Risk</th>
                  <th className="text-center p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.students.map((s: any, i: number) => (
                  <tr key={i} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4 text-center">
                      <span className={`font-bold ${Number(s.score) >= 40 ? 'text-green-400' : 'text-red-400'}`}>{s.score}%</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`badge text-xs ${s.riskScore < 30 ? 'risk-low' : s.riskScore < 60 ? 'risk-medium' : 'risk-high'}`}>{s.riskScore}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`badge text-xs ${s.status === 'FLAGGED' ? 'risk-critical' : s.status === 'SUBMITTED' ? 'risk-low' : 'bg-zinc-800 text-zinc-400'}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
