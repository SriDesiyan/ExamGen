import React, { useEffect, useState } from 'react';
import { Shield, Users, BookOpen, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview').then(r => setOverview(r.data)).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Exams', value: overview.totalExams || 0, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Students', value: overview.totalStudents || 0, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Total Submissions', value: overview.totalSubmissions || 0, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Platform Avg Score', value: `${overview.avgScore || 0}%`, icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Platform-wide analytics and management overview">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="nexus-card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon size={20} className={s.color} /></div>
            <div className="text-2xl font-bold">{loading ? <div className="skeleton h-7 w-12" /> : s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="nexus-card p-8 text-center text-zinc-500">
        <Shield size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium mb-1">Admin Panel</p>
        <p className="text-sm">Full platform management coming in next release</p>
      </div>
    </DashboardLayout>
  );
}
