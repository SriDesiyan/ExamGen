import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem('examgen_user') || '{}');
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}!`);
      navigate(`/${user.role?.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  const fillDemo = (role: 'teacher' | 'student') => {
    if (role === 'teacher') { setEmail('teacher@examgen.nexus'); setPassword('Teacher@123'); }
    else { setEmail('alice@examgen.nexus'); setPassword('Student@123'); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(160deg, #fdfcf8 0%, #faf8f2 50%, #f5f3eb 100%)' }}>
      {/* Decorative left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a1814 0%, #2d2920 60%, #1a1814 100%)' }}>
        {/* Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f5c842 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #e8b824 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)' }}>
              <Brain size={20} className="text-amber-300" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">ExamGen</span>
              <span className="gradient-text-gold font-bold text-lg ml-1">Nexus</span>
            </div>
          </Link>
        </div>

        {/* Center testimonial */}
        <div className="relative z-10 space-y-6">
          <div className="text-5xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: '#fdfcf8' }}>
            Secure.<br />Adaptive.<br /><span className="gradient-text-gold">Intelligent.</span>
          </div>
          <p style={{ color: '#a8a098', lineHeight: 1.7 }} className="text-sm max-w-sm">
            The examination intelligence platform trusted by educators for AI-powered proctoring, adaptive assessment, and placement analytics.
          </p>
          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['AI Invigilation', 'Face Verification', 'Adaptive Questions', 'Skill Analytics'].map(f => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'rgba(245,200,66,0.12)', color: '#f5c842', border: '1px solid rgba(245,200,66,0.2)' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs" style={{ color: '#7c7468' }}>
          © 2024 ExamGen Nexus · Secure · Adaptive · Intelligent
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1a1814, #3d3830)' }}>
              <Brain size={26} className="text-amber-300" />
            </div>
            <h1 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>ExamGen <span className="gradient-text-gold">Nexus</span></h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sign in to your ExamGen Nexus account
            </p>
          </div>

          {/* Quick demo fill */}
          <div className="mb-6">
            <div className="section-label mb-3">Quick access — demo accounts</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fillDemo('teacher')}
                className="flex items-center gap-2 p-3 rounded-xl text-left transition-all text-sm font-medium"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,154,14,0.4)'; e.currentTarget.style.background = 'var(--gold-50)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
                <span className="text-lg">👩‍🏫</span>
                <span>Teacher Demo</span>
              </button>
              <button onClick={() => fillDemo('student')}
                className="flex items-center gap-2 p-3 rounded-xl text-left transition-all text-sm font-medium"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,154,14,0.4)'; e.currentTarget.style.background = 'var(--gold-50)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
                <span className="text-lg">🎓</span>
                <span>Student Demo</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 divider" />
            <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>or sign in manually</span>
            <div className="flex-1 divider" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                <input type="email" className="nexus-input pl-10" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                <input type={showPw ? 'text' : 'password'} className="nexus-input pl-10 pr-11" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-subtle)')}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" className="btn-gold w-full py-3.5 text-base rounded-xl"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}>
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : <>Sign In <Sparkles size={15} /></>}
            </motion.button>

            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No account?{' '}
              <Link to="/register" className="font-semibold transition-colors" style={{ color: 'var(--gold-700)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-600)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--gold-700)')}>
                Create one free
              </Link>
            </p>
          </form>

          <Link to="/" className="flex items-center justify-center gap-1.5 mt-8 text-sm transition-colors"
            style={{ color: 'var(--text-subtle)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-subtle)')}>
            <ArrowLeft size={14} /> Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
