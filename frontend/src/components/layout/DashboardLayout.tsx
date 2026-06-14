import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, LogOut, LayoutDashboard, Shield, PlusCircle, ChevronLeft, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps { children: ReactNode; title: string; subtitle?: string; }

const studentNav = [
  { to: '/student',        icon: LayoutDashboard, label: 'Dashboard',             desc: 'Overview & exams' },
  { to: '/student/verify', icon: Shield,           label: 'Identity Verification', desc: 'Face & biometrics' },
];

const teacherNav = [
  { to: '/teacher',              icon: LayoutDashboard, label: 'Dashboard',    desc: 'Overview & analytics' },
  { to: '/teacher/exams/create', icon: PlusCircle,      label: 'Create Exam',  desc: 'Build new exam' },
];

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', desc: 'Platform admin' },
];

const roleColors: Record<string, { bg: string; text: string; dot: string }> = {
  STUDENT: { bg: '#f0f9ff', text: '#0369a1', dot: '#0891b2' },
  TEACHER: { bg: '#fef3c7', text: '#92400e', dot: '#d97706' },
  ADMIN:   { bg: '#f5f3ff', text: '#4c1d95', dot: '#7c3aed' },
};

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'TEACHER' || user?.role === 'ADMIN' ? teacherNav : studentNav;
  const rc = roleColors[user?.role || 'STUDENT'];

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1a1814, #3d3830)' }}>
            <Brain size={17} className="text-amber-300" />
          </div>
          <div className="leading-none">
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>ExamGen</div>
            <div className="gradient-text-gold font-bold text-xs">Nexus</div>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1a1814, #3d3830)', color: '#f5c842' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: rc.dot }} />
              <span className="text-xs capitalize" style={{ color: rc.text }}>{user?.role?.toLowerCase()}</span>
              {user?.isVerified && (
                <span className="badge text-xs ml-1" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0 6px' }}>
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="section-label px-3 mb-3">Navigation</div>
        {navItems.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
              className={clsx('sidebar-link', { active: isActive })}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: isActive ? 'rgba(201,154,14,0.15)' : 'var(--bg-secondary)',
                  border: `1px solid ${isActive ? 'rgba(201,154,14,0.3)' : 'var(--border-light)'}`,
                }}>
                <item.icon size={15} style={{ color: isActive ? 'var(--gold-700)' : 'var(--text-muted)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight">{item.label}</div>
                <div className="text-xs opacity-70 leading-tight mt-0.5">{item.desc}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border-light)' }}>
        <Link to="/" className="sidebar-link w-full mb-1 text-sm">
          <ChevronLeft size={15} />
          Back to Home
        </Link>
        <button onClick={handleLogout}
          className="sidebar-link w-full text-sm"
          style={{ color: 'var(--danger)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-bg)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}>
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-secondary)' }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col sticky top-0 h-screen"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col lg:hidden"
              style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xl)' }}>
              <button onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center gap-4"
          style={{ background: 'rgba(253,252,248,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
          <button onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
            <Menu size={17} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-xl leading-tight truncate" style={{ color: 'var(--text-primary)' }}>{title}</h1>
            {subtitle && <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
