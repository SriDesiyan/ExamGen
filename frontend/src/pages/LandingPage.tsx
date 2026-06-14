import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Brain, Zap, BarChart3, Lock, Eye, ChevronRight, Star, Users, CheckCircle, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const features = [
  { icon: Brain,     title: 'AI Invigilator',      desc: 'Reasons over behavior patterns to generate confidence-scored incident reports, not just alerts.',               color: '#c99a0e', bg: 'rgba(201,154,14,0.08)',  num: '01' },
  { icon: Eye,       title: 'Face Verification',    desc: 'Client-side face recognition verifies identity at entry and rechecks at random intervals during the exam.',     color: '#0369a1', bg: 'rgba(3,105,161,0.07)',   num: '02' },
  { icon: Zap,       title: 'Adaptive Assessment',  desc: 'Questions dynamically adjust difficulty based on each student\'s real-time performance trajectory.',            color: '#16a34a', bg: 'rgba(22,163,74,0.07)',   num: '03' },
  { icon: BarChart3, title: 'Skill Gap Analysis',   desc: 'Post-exam topic mastery breakdown with personalized AI-powered learning recommendations.',                       color: '#9333ea', bg: 'rgba(147,51,234,0.07)',  num: '04' },
  { icon: Lock,      title: 'Typing Biometrics',    desc: 'Local keystroke rhythm engine with no external API verifies typing identity throughout every exam session.',     color: '#dc2626', bg: 'rgba(220,38,38,0.07)',   num: '05' },
  { icon: Shield,    title: 'Placement Readiness',  desc: 'Maps exam scores to industry domain scores and classifies students by career readiness and placement potential.', color: '#0891b2', bg: 'rgba(8,145,178,0.07)',   num: '06' },
];

const stats = [
  { label: 'Detection Accuracy', value: '94%',    suffix: '' },
  { label: 'Risk Analysis Points', value: '6',   suffix: '+' },
  { label: 'Adaptive Levels',   value: '3',       suffix: 'x' },
  { label: 'Analytics Modules', value: '8',       suffix: '' },
];

const testimonials = [
  { role: 'Exam Coordinator', name: 'Dr. Priya Sharma', quote: 'ExamGen Nexus transformed how we run assessments. The AI invigilation is remarkably accurate.' },
  { role: 'Student', name: 'Arjun Mehta', quote: 'The adaptive questioning made the exam feel fair and personalized. The result analytics are incredibly detailed.' },
  { role: 'Institution Head', name: 'Prof. Rajan', quote: 'The placement readiness insights alone make this platform worth it for our students.' },
];

function AnimatedCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const observed = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !observed.current) {
        observed.current = true;
        let start = 0;
        const duration = 1800;
        const step = to / (duration / 16);
        const timer = setInterval(() => {
          start = Math.min(start + step, to);
          setCount(Math.round(start));
          if (start >= to) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return <div ref={ref}>{count}{suffix}</div>;
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.7]);

  return (
    <div className="bg-hero min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(160deg, #fdfcf8 0%, #faf8f2 50%, #f5f3eb 100%)' }}>

      {/* Decorative orbs */}
      <div className="orb orb-gold" style={{ width: 600, height: 600, top: -120, right: -100, opacity: 0.7 }} />
      <div className="orb orb-warm" style={{ width: 400, height: 400, top: 300, left: -150 }} />

      {/* ─── Navigation ─────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass-warm"
        style={{ borderBottom: '1px solid rgba(200,180,140,0.25)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #1a1814, #3d3830)' }}>
              <Brain size={18} className="text-amber-300" />
            </div>
            <div className="leading-none">
              <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>ExamGen</span>
              <span className="gradient-text-gold font-bold text-base ml-1">Nexus</span>
            </div>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {['Features', 'How it Works', 'Analytics'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="nav-pill">{item}</a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-gold text-sm">
              Get Started <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero ────────────────────────────────────────────── */}
      <motion.section ref={heroRef} style={{ y: heroY, opacity: heroOpacity }}
        className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Badge pill */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 text-sm font-medium"
              style={{
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: '1px solid rgba(201,154,14,0.4)',
                color: 'var(--gold-700)',
                boxShadow: '0 2px 12px rgba(232,184,36,0.15)'
              }}>
              {/* Custom geometric brand mark — thin diamond ring */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <polygon points="7,1 13,7 7,13 1,7" stroke="currentColor" strokeWidth="1.4" fill="none" />
                <polygon points="7,3.5 10.5,7 7,10.5 3.5,7" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5" />
              </svg>
              AI-Powered Examination Intelligence Platform
              <span className="w-1.5 h-1.5 rounded-full animate-gold-pulse" style={{ background: 'var(--gold-500)' }} />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="serif font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', color: 'var(--text-primary)' }}>
            Examinations,{' '}
            <span className="gradient-text-gold">Reimagined</span>
            <br />
            <span style={{ fontSize: '0.7em', fontWeight: 600, color: 'var(--text-secondary)' }}>
              for the Intelligence Era
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-muted)' }}>
            ExamGen Nexus combines AI invigilation, adaptive assessments, biometric identity
            verification, and placement readiness analytics — all in one unified, elegant platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 flex-wrap mb-14">
            <Link to="/register" className="btn-gold text-base px-8 py-3.5 rounded-xl" style={{ fontSize: '0.95rem' }}>
              Start Free Demo <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5 rounded-xl" style={{ fontSize: '0.95rem' }}>
              Sign In
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 text-sm flex-wrap" style={{ color: 'var(--text-muted)' }}>
            {['No credit card', 'Demo accounts ready', 'Full feature access'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle size={14} style={{ color: 'var(--gold-600)' }} />
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Hero visual — mock dashboard card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto mt-16 relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl border"
            style={{ borderColor: 'rgba(200,180,140,0.3)', background: '#fff', boxShadow: '0 40px 100px rgba(26,24,20,0.12), 0 0 0 1px rgba(200,180,140,0.2)' }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: '#fbbf24' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#f87171' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#4ade80' }} />
              </div>
              <div className="flex-1 mx-4">
                <div className="h-5 rounded-md px-3 text-xs flex items-center gap-2 max-w-xs mx-auto"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                  <Lock size={10} style={{ color: 'var(--gold-600)' }} /> examgen.nexus/student
                </div>
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="p-6 grid grid-cols-4 gap-4" style={{ background: '#fafaf8' }}>
              {[
                { label: 'Available Exams', val: '3',        Icon: Zap,       iconColor: '#c99a0e', iconBg: 'rgba(201,154,14,0.1)'  },
                { label: 'Avg Score',       val: '84%',      Icon: BarChart3, iconColor: '#16a34a', iconBg: 'rgba(22,163,74,0.1)'   },
                { label: 'Completed',       val: '7',        Icon: CheckCircle,iconColor: '#0369a1', iconBg: 'rgba(3,105,161,0.1)'  },
                { label: 'Identity',        val: 'Verified', Icon: Shield,    iconColor: '#9333ea', iconBg: 'rgba(147,51,234,0.1)'  },
              ].map((item, i) => (
                <div key={i} className="nexus-card p-4 text-center animate-fade-in-up" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                  <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ background: item.iconBg, border: `1px solid ${item.iconColor}22` }}>
                    <item.Icon size={16} style={{ color: item.iconColor }} />
                  </div>
                  <div className="font-bold text-base" style={{ color: item.iconColor }}>{item.val}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 grid grid-cols-3 gap-3">
              {['Introduction to Algorithms', 'Data Structures Final', 'System Design'].map((title, i) => (
                <div key={i} className="nexus-card p-4 animate-fade-in-up" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>{title}</div>
                    <span className="badge risk-low text-xs">Live</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill progress-gold" style={{ width: `${60 + i * 15}%` }} /></div>
                  <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-subtle)' }}>
                    <span>45 min</span><span>{15 + i * 5} Q</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Floating badge */}
          <div className="absolute -top-4 -right-4 nexus-card-gold px-4 py-3 rounded-2xl shadow-lg animate-float hidden md:block">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>AI Invigilator Active</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 nexus-card px-4 py-3 rounded-2xl shadow-lg animate-float hidden md:block" style={{ animationDelay: '1.5s' }}>
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: 'var(--gold-600)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Risk Score: 12/100</span>
              <span className="badge risk-low text-xs">Safe</span>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ─── Stats Strip ─────────────────────────────────────── */}
      <section className="py-16 px-6 relative overflow-hidden" id="features">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="serif font-bold mb-1 gradient-text-gold" style={{ fontSize: '2.8rem', lineHeight: 1 }}>
                  <AnimatedCounter to={parseInt(s.value)} suffix={s.suffix || (s.value.includes('%') ? '%' : '')} />
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-gold max-w-5xl mx-auto" />

      {/* ─── Features Grid ───────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mb-4">Platform Modules</div>
            <h2 className="serif font-bold mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text-primary)' }}>
              Every module, one platform
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              From exam creation to placement readiness — complete end-to-end intelligence in a single, unified product.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -4 }}>
                <div className="nexus-card p-7 h-full group cursor-default">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="feature-icon" style={{ background: f.bg }}>
                      <f.icon size={24} style={{ color: f.color }} />
                    </div>
                    <div className="section-label mt-1.5" style={{ color: 'var(--border-medium)' }}>{f.num}</div>
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                  <div className="mt-5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--gold-700)' }}>
                    Learn more <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mb-4">Process</div>
            <h2 className="serif font-bold" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}>
              From registration to results
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            {[
              { step: '01', title: 'Register & Verify',  desc: 'Create account, complete face verification and typing biometrics enrolment.',  icon: Users },
              { step: '02', title: 'Enter Exam Lobby',   desc: 'System checks webcam, screen share, and fullscreen mode before exam starts.', icon: Eye },
              { step: '03', title: 'Adaptive Exam',      desc: 'Questions adapt in real-time to your performance. AI monitors throughout.',     icon: Brain },
              { step: '04', title: 'Results & Insights', desc: 'Receive detailed analytics, skill gap maps, and placement readiness score.',    icon: BarChart3 },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-sm"
                  style={{ background: i === 1 ? 'linear-gradient(135deg, #c99a0e, #e8b824)' : 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                  <s.icon size={22} style={{ color: i === 1 ? '#1a1814' : 'var(--gold-600)' }} />
                </div>
                <div className="section-label mb-2" style={{ color: 'var(--gold-600)' }}>Step {s.step}</div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label mb-4">Testimonials</div>
            <h2 className="serif font-bold" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}>
              What educators say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="nexus-card p-7 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} size={13} fill="var(--gold-400)" style={{ color: 'var(--gold-400)' }} />)}
                  </div>
                  <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--text-secondary)' }}>"{t.quote}"</p>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Demo CTA ─────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="nexus-card-elevated p-12 relative overflow-hidden">
            {/* Gold accent */}
            <div className="orb orb-gold" style={{ width: 300, height: 300, top: -100, right: -80, opacity: 0.4 }} />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a1814, #3d3830)', boxShadow: '0 8px 24px rgba(26,24,20,0.2)' }}>
                <Brain size={30} className="text-amber-300" />
              </div>

              <h2 className="serif font-bold mb-4" style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
                Ready to experience ExamGen Nexus?
              </h2>
              <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
                Demo accounts are pre-loaded with exams, results, and analytics. No setup required.
              </p>

              {/* Demo credentials */}
              <div className="rounded-xl p-5 mb-8 text-left" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                <div className="section-label mb-3">Demo Access</div>
                <div className="space-y-2">
                  {[
                    { role: 'Teacher', email: 'teacher@examgen.nexus', pw: 'Teacher@123', icon: BookOpen },
                    { role: 'Student', email: 'alice@examgen.nexus',   pw: 'Student@123', icon: TrendingUp },
                  ].map(cred => (
                    <div key={cred.role} className="flex items-center gap-3 text-sm">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-100)', border: '1px solid var(--border-gold)' }}>
                        <cred.icon size={14} style={{ color: 'var(--gold-700)' }} />
                      </div>
                      <span className="font-semibold w-16" style={{ color: 'var(--text-secondary)' }}>{cred.role}:</span>
                      <span className="mono text-xs" style={{ color: 'var(--text-muted)' }}>{cred.email} / {cred.pw}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/login" className="btn-gold text-base px-10 py-4 rounded-xl inline-flex items-center gap-2">
                Launch Demo <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="py-10 px-6 text-center" style={{ borderTop: '1px solid var(--border-light)', background: 'var(--bg-primary)' }}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1814, #3d3830)' }}>
            <Brain size={14} className="text-amber-300" />
          </div>
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>ExamGen <span className="gradient-text-gold">Nexus</span></span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
          Secure · Adaptive · Intelligent Examinations
        </p>
      </footer>
    </div>
  );
}
