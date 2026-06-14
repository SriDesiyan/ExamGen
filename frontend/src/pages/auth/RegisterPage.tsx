import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, User, GraduationCap, BookOpen, Loader2, ArrowLeft, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created successfully!');
      navigate(`/${form.role.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(160deg, #fdfcf8 0%, #faf8f2 50%, #f5f3eb 100%)' }}>
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a1814 0%, #2d2920 60%, #1a1814 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f5c842 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #e8b824 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)' }}>
            <Brain size={20} className="text-amber-300" />
          </div>
          <div>
            <span className="font-bold text-white text-lg">ExamGen</span>
            <span className="gradient-text-gold font-bold text-lg ml-1">Nexus</span>
          </div>
        </Link>

        <div className="relative z-10 space-y-6">
          <div className="text-4xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: '#fdfcf8' }}>
            Join the future<br />of <span className="gradient-text-gold">examinations</span>
          </div>
          <div className="space-y-4">
            {[
              { title: 'AI-powered proctoring', desc: 'Automated incident detection with confidence scores' },
              { title: 'Adaptive question flow', desc: 'Questions adjust to your real-time performance' },
              { title: 'Placement analytics', desc: 'Map your scores to industry readiness domains' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(232,184,36,0.2)', border: '1px solid rgba(232,184,36,0.4)' }}>
                  <Check size={11} style={{ color: '#f5c842' }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#fdfcf8' }}>{item.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#7c7468' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs" style={{ color: '#7c7468' }}>
          © 2024 ExamGen Nexus · Secure · Adaptive · Intelligent
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
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

          <div className="mb-8">
            <h2 className="font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>
              Create account
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Join ExamGen Nexus — free demo access, no credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'STUDENT', label: 'Student',  icon: GraduationCap, desc: 'Take exams & view analytics' },
                  { value: 'TEACHER', label: 'Teacher',  icon: BookOpen,      desc: 'Create & monitor exams' },
                ].map(r => (
                  <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className="p-4 rounded-xl text-left transition-all relative"
                    style={{
                      border: `2px solid ${form.role === r.value ? 'rgba(201,154,14,0.6)' : 'var(--border-light)'}`,
                      background: form.role === r.value ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : 'var(--bg-card)',
                      boxShadow: form.role === r.value ? 'var(--shadow-gold)' : 'var(--shadow-xs)',
                    }}>
                    {form.role === r.value && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--gold-500)' }}>
                        <Check size={11} style={{ color: '#1a1814' }} />
                      </div>
                    )}
                    <r.icon size={20} style={{ color: form.role === r.value ? 'var(--gold-700)' : 'var(--text-muted)' }} className="mb-2" />
                    <div className="font-semibold text-sm" style={{ color: form.role === r.value ? 'var(--gold-800)' : 'var(--text-primary)' }}>{r.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                <input type="text" className="nexus-input pl-10" placeholder="Your full name"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                <input type="email" className="nexus-input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                <input type="password" className="nexus-input pl-10" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
            </div>

            <motion.button type="submit" className="btn-gold w-full py-3.5 text-base rounded-xl"
              disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account →'}
            </motion.button>

            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--gold-700)' }}>Sign In</Link>
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
