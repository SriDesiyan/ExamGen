import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import 'express-async-errors';

dotenv.config();

import authRouter from './routes/auth';
import examsRouter from './routes/exams';
import questionsRouter from './routes/questions';
import submissionsRouter from './routes/submissions';
import sessionsRouter from './routes/sessions';
import analyticsRouter from './routes/analytics';
import biometricsRouter from './routes/biometrics';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'ExamGen Nexus API', version: '1.0.0' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/exams', examsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/biometrics', biometricsRouter);

// Global error handler
app.use(errorHandler);

export default app;
