import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, Brain, BarChart3, TrendingUp, ArrowLeft, Loader2, Shield, Sparkles, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const DOMAIN_COLORS = ['#e8b824', '#0891b2', '#16a34a', '#9333ea', '#dc2626'];

export default function ResultPage() {
  const { submissionId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scoreVisible, setScoreVisible] = useState(false);

  useEffect(() => {
    api.get(`/submissions/${submissionId}`).then(r => {
      setData(r.data);
      setTimeout(() => setScoreVisible(true), 300);
    }).finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
      <div className="text-center">
        <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: 'var(--gold-600)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your results...</p>
      </div>
    </div>
  );

  if (!data) return null;

  const score = data.percentage ?? 0;
  const riskScore = data.riskScore ?? 0;
  const passed = score >= (data.exam?.passingScore || 40);
  const skillGap = data.skillGapData ? JSON.parse(data.skillGapData) : null;
  const placement = data.placementData ? JSON.parse(data.placementData) : null;
  const invigilator = data.riskExplanation;

  const radarData = skillGap?.topicMastery?.map((t: any) => ({ topic: t.topic, mastery: t.mastery })) || [];

  const riskLabel = riskScore < 30 ? 'Low Risk' : riskScore < 60 ? 'Medium Risk' : 'High Risk';
  const riskBg    = riskScore < 30 ? '#f0fdf4' : riskScore < 60 ? '#fef3c7' : '#fee2e2';
  const riskColor = riskScore < 30 ? '#15803d' : riskScore < 60 ? '#b45309' : '#b91c1c';
  const riskBorder= riskScore < 30 ? '#bbf7d0' : riskScore < 60 ? '#fde68a' : '#fecaca';

  return (
    <div className="min-h-screen py-10 px-6" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/student" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
        </motion.div>

        {/* Hero header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl"
            style={{
              background: passed
                ? 'linear-gradient(135deg, #dcfce7, #f0fdf4)'
                : 'linear-gradient(135deg, #fee2e2, #fef2f2)',
              border: `2px solid ${passed ? '#bbf7d0' : '#fecaca'}`,
            }}>
            {passed
              ? <Trophy size={44} style={{ color: '#15803d' }} />
              : <XCircle size={44} style={{ color: '#b91c1c' }} />
            }
          </motion.div>

          <h1 className="font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: 'var(--text-primary)' }}>
            {passed ? '🎉 Exam Passed!' : 'Exam Complete'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {passed ? 'Excellent work! Here\'s your full performance analysis.' : 'Here\'s your complete performance analysis and recommendations.'}
          </p>
        </motion.div>

        {/* Score cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {/* Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="nexus-card p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
              style={{ background: passed ? '#22c55e' : '#ef4444', transform: 'translate(30%, -30%)' }} />
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Final Score</div>
            <AnimatePresence>
              {scoreVisible && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="font-bold mb-3"
                  style={{ fontSize: '3.5rem', lineHeight: 1, color: passed ? '#15803d' : '#b91c1c', fontFamily: "'Playfair Display', serif" }}>
                  {score.toFixed(1)}%
                </motion.div>
              )}
            </AnimatePresence>
            <span className="badge text-sm px-4 py-1.5"
              style={{
                background: passed ? '#f0fdf4' : '#fee2e2',
                color: passed ? '#15803d' : '#b91c1c',
                border: `1px solid ${passed ? '#bbf7d0' : '#fecaca'}`,
              }}>
              {passed ? <><CheckCircle size={13} className="inline mr-1" />Passed</> : <><XCircle size={13} className="inline mr-1" />Failed</>}
            </span>
          </motion.div>

          {/* Risk */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="nexus-card p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-8"
              style={{ background: riskColor, transform: 'translate(30%, -30%)' }} />
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Integrity Score</div>
            <div className="font-bold mb-3" style={{ fontSize: '3.5rem', lineHeight: 1, color: riskColor, fontFamily: "'Playfair Display', serif" }}>
              {riskScore.toFixed(0)}
            </div>
            <span className="badge text-sm px-4 py-1.5" style={{ background: riskBg, color: riskColor, border: `1px solid ${riskBorder}` }}>
              <Shield size={13} className="inline mr-1" />{riskLabel}
            </span>
          </motion.div>

          {/* Placement */}
          {placement ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="nexus-card p-8 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid rgba(201,154,14,0.3)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gold-700)' }}>Placement Score</div>
              <div className="font-bold mb-3" style={{ fontSize: '3.5rem', lineHeight: 1, color: placement.badgeColor || 'var(--gold-700)', fontFamily: "'Playfair Display', serif" }}>
                {placement.overallScore}
              </div>
              <span className="badge text-sm px-4 py-1.5 badge-gold">
                <Sparkles size={11} className="inline mr-1" />
                {placement.badge}
              </span>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="nexus-card p-8 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Placement</div>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
                <TrendingUp size={24} style={{ color: 'var(--text-subtle)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No placement data available</p>
            </motion.div>
          )}
        </div>

        {/* AI Invigilator Report */}
        {invigilator && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="nexus-card p-6 mb-6"
            style={{ border: `1px solid ${riskBorder}`, background: riskBg === '#f0fdf4' ? '#fafffe' : riskBg === '#fef3c7' ? '#fffef5' : '#fff8f8' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a1814, #3d3830)' }}>
                <Brain size={17} className="text-amber-300" />
              </div>
              <div>
                <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AI Invigilator Analysis</h2>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Automated behavior analysis report</div>
              </div>
              <div className="ml-auto">
                <span className="badge text-xs" style={{ background: riskBg, color: riskColor, border: `1px solid ${riskBorder}` }}>
                  Confidence: {Math.min(98, 40 + (data.events?.length || 0) * 3)}%
                </span>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border-light)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{invigilator}</p>
            </div>
          </motion.div>
        )}

        {/* Charts row */}
        {skillGap && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Topic Mastery Radar */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
              className="nexus-card p-6">
              <h2 className="font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <BarChart3 size={14} style={{ color: '#0369a1' }} />
                </div>
                Topic Mastery
              </h2>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border-light)" />
                    <PolarAngleAxis dataKey="topic" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Radar dataKey="mastery" stroke="var(--gold-600)" fill="var(--gold-500)" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No topic data available</p>}
            </motion.div>

            {/* Placement Domains */}
            {placement?.domains && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="nexus-card p-6">
                <h2 className="font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <TrendingUp size={14} style={{ color: '#15803d' }} />
                  </div>
                  Placement Readiness
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={placement.domains} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="domain" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '10px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)', fontSize: '12px' }}
                      cursor={{ fill: 'rgba(232,184,36,0.05)' }}
                    />
                    <Bar dataKey="score" radius={[0, 5, 5, 0]} background={{ fill: 'var(--bg-secondary)', radius: 5 }}>
                      {placement.domains.map((_: any, i: number) => <Cell key={i} fill={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {skillGap?.recommendations?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="nexus-card p-6 mb-6">
            <h2 className="font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-50)', border: '1px solid rgba(201,154,14,0.3)' }}>
                <Brain size={14} style={{ color: 'var(--gold-700)' }} />
              </div>
              Smart Recommendations
            </h2>
            <div className="space-y-2.5">
              {skillGap.recommendations.map((rec: string, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--gold-100)', border: '1px solid rgba(201,154,14,0.3)' }}>
                    <ArrowRight size={10} style={{ color: 'var(--gold-700)' }} />
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rec}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Career paths */}
        {placement?.careerSuggestions?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="nexus-card p-6 mb-8">
            <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>🚀 Career Path Suggestions</h2>
            <div className="flex flex-wrap gap-2">
              {placement.careerSuggestions.map((c: string, i: number) => (
                <span key={i} className="badge badge-gold text-sm px-4 py-2">{c}</span>
              ))}
            </div>
          </motion.div>
        )}

        <div className="text-center">
          <Link to="/student" className="btn-primary px-10 py-3.5 rounded-xl inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
