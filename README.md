# ExamGen Nexus

**Secure • Adaptive • Intelligent Examinations**

ExamGen Nexus is a smart examination intelligence platform designed to make online assessments more secure, fair, adaptive, and insightful. It combines identity verification, proctoring, exam creation, adaptive question flow, and post-exam analytics into one unified product.

---

## Team Information

**Team Name:** HackStorm

### Team Members
- **Nithivalavan N** — Team Leader
- **Kathirvel M**
- **SRI DESIYAN V**
- **Navinkumar J**
- **Mohamed Askar S**

> Contact details are intentionally omitted from this README draft for privacy and presentation clarity.

---

## Project Overview

Traditional online exam systems usually focus on only one part of the assessment process, such as question delivery or result submission. ExamGen Nexus improves the complete examination lifecycle by supporting:

- Secure student authentication
- Face-based identity verification
- Typing rhythm verification
- Exam lockdown and monitoring
- Adaptive question delivery
- AI-assisted question creation
- Post-exam skill analysis
- Placement readiness reporting
- Accessibility-friendly exam support

The platform is designed to feel like a premium, modern product while remaining practical for hackathon demonstration and future expansion.

---

## Problem Statement

Online examinations often face the following challenges:

- Cheating during exams
- Weak identity verification
- Limited monitoring
- Same paper for every student
- No adaptive difficulty
- No meaningful feedback after evaluation
- Poor accessibility support
- Lack of analytics for teachers and institutions

ExamGen Nexus addresses these issues by creating a complete examination ecosystem instead of a simple test portal.

---

## Proposed Solution

ExamGen Nexus provides one integrated system that covers:

### Before the Exam
- Student registration and login
- Teacher exam creation
- AI-assisted question generation
- Face and typing-based identity verification
- Exam readiness checks

### During the Exam
- Webcam monitoring
- Screen/tab activity monitoring
- Full-screen enforcement
- Typing pattern verification
- Suspicious activity detection
- Adaptive question flow

### After the Exam
- Automatic scoring
- Risk analysis
- Topic-wise performance breakdown
- Weak area identification
- Placement readiness score
- Personalized improvement suggestions

---

## Key Features

### 1. Secure Authentication
- Role-based login system
- Student, teacher, and admin access
- Password hashing
- JWT-based session handling

### 2. Identity Verification
- Webcam face verification
- Rechecking identity during the exam
- Typing rhythm capture and comparison
- Session integrity validation

### 3. Smart Proctoring
- Tab switch detection
- Full-screen enforcement
- Mouse leave tracking
- Webcam monitoring
- Audio anomaly detection
- Unified risk score generation

### 4. Exam Creation Engine
- Manual exam creation
- Question uploading
- MCQ, short answer, and long answer support
- Topic and difficulty tagging
- Exam scheduling
- Randomized question order

### 5. Adaptive Assessment
- Questions change based on student performance
- Difficulty increases or decreases dynamically
- Personalized exam experience
- Better measurement of student capability

### 6. AI-Assisted Question Generation
- Generate questions from syllabus or text
- Create structured question sets
- Produce answer keys
- Classify questions by topic and difficulty
- Swappable AI service layer

### 7. Skill Gap Analytics
- Topic-wise mastery analysis
- Weak subject detection
- Personalized learning suggestions
- Performance summary after exam completion

### 8. Placement Readiness Insights
- Industry-readiness score
- Key skill evaluation
- Suggestions for improvement
- Useful for college placement preparation

### 9. Accessibility Support
- Text-to-speech support
- Voice-based answers
- Dyslexia-friendly display mode
- Multilingual-friendly design

### 10. Teacher Dashboard
- Create and manage exams
- Monitor active sessions
- View proctoring alerts
- Track student progress
- Export reports

### 11. Student Dashboard
- View upcoming exams
- Complete identity checks
- Take exams in a secure environment
- Review result analytics
- Receive smart feedback

---

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts

### Backend
- Node.js
- Express
- TypeScript

### Database
- SQLite for local development
- PostgreSQL for production

### ORM
- Prisma

### Authentication
- JWT
- bcryptjs

### Proctoring and Verification
- face-api.js
- WebRTC
- Browser APIs
- Keystroke rhythm analysis

### Analytics
- Recharts
- Custom scoring logic
- Risk engine
- Adaptive engine

---

## Project Structure

```text
ExamGen Nexus/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   └── public/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── app.ts
│   └── prisma/
├── shared/
└── README.md
