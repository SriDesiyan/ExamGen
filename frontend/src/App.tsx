import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ExamLobby from './pages/student/ExamLobby';
import ExamRoom from './pages/student/ExamRoom';
import ResultPage from './pages/student/ResultPage';
import CreateExamPage from './pages/teacher/CreateExamPage';
import LiveMonitorPage from './pages/teacher/LiveMonitorPage';
import ReportsPage from './pages/teacher/ReportsPage';
import IdentityVerificationPage from './pages/student/IdentityVerificationPage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1a1814',
            border: '1px solid rgba(200,185,160,0.35)',
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(26,24,20,0.1), 0 2px 8px rgba(26,24,20,0.06)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <RegisterPage />} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/verify" element={<ProtectedRoute roles={['STUDENT']}><IdentityVerificationPage /></ProtectedRoute>} />
        <Route path="/student/exam/:examId/lobby" element={<ProtectedRoute roles={['STUDENT']}><ExamLobby /></ProtectedRoute>} />
        <Route path="/student/exam/:examId/room" element={<ProtectedRoute roles={['STUDENT']}><ExamRoom /></ProtectedRoute>} />
        <Route path="/student/result/:submissionId" element={<ProtectedRoute roles={['STUDENT']}><ResultPage /></ProtectedRoute>} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/exams/create" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><CreateExamPage /></ProtectedRoute>} />
        <Route path="/teacher/exams/:examId/monitor" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><LiveMonitorPage /></ProtectedRoute>} />
        <Route path="/teacher/exams/:examId/reports" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><ReportsPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
