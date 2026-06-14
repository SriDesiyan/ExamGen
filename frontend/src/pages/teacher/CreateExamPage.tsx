import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Trash2, Loader2, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Question { text: string; type: string; options?: string[]; correctAnswer: string; explanation?: string; difficulty: string; topicTag?: string; marks: number; leakageWarning?: any; }

export default function CreateExamPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'questions'>('details');
  const [examId, setExamId] = useState('');
  const [creating, setCreating] = useState(false);
  const [details, setDetails] = useState({ title: '', description: '', durationMinutes: 60, totalMarks: 100, passingScore: 40, difficulty: 'MEDIUM', shuffleQuestions: true });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiForm, setAiForm] = useState({ topic: '', count: 5, difficulty: 'MEDIUM', type: 'MCQ' });
  const [generating, setGenerating] = useState(false);
  const [newQ, setNewQ] = useState<Question>({ text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '', explanation: '', difficulty: 'MEDIUM', topicTag: '', marks: 2 });
  const [addingManual, setAddingManual] = useState(false);

  const createExam = async () => {
    if (!details.title) { toast.error('Title required'); return; }
    setCreating(true);
    try {
      const { data } = await api.post('/exams', details);
      setExamId(data.id);
      setStep('questions');
      toast.success('Exam created! Now add questions.');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to create'); }
    finally { setCreating(false); }
  };

  const generateWithAI = async () => {
    if (!aiForm.topic) { toast.error('Enter a topic'); return; }
    setGenerating(true);
    try {
      const { data } = await api.post(`/exams/${examId}/generate-questions`, aiForm);
      setQuestions(prev => [...prev, ...data.questions.map((q: any) => ({
        text: q.text, type: q.type, options: q.options ? JSON.parse(q.options) : undefined,
        correctAnswer: q.correctAnswer, explanation: q.explanation, difficulty: q.difficulty, topicTag: q.topicTag, marks: q.marks
      }))]);
      toast.success(`Generated ${data.generated} questions!`);
    } catch { toast.error('AI generation failed'); }
    finally { setGenerating(false); }
  };

  const addManualQuestion = async () => {
    if (!newQ.text || !newQ.correctAnswer) { toast.error('Question text and correct answer required'); return; }
    setCreating(true);
    try {
      const { data } = await api.post('/questions', { ...newQ, examId, options: newQ.type === 'MCQ' ? newQ.options : undefined });
      setQuestions(prev => [...prev, data.question]);
      if (data.leakageWarning?.hasDuplicates) {
        toast(`⚠️ Possible duplicate detected (${data.leakageWarning.highestSimilarity}% similar)`, { icon: '⚠️', duration: 5000 });
      } else { toast.success('Question added!'); }
      setNewQ({ text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '', explanation: '', difficulty: 'MEDIUM', topicTag: '', marks: 2 });
      setAddingManual(false);
    } catch { toast.error('Failed to add question'); }
    finally { setCreating(false); }
  };

  const finish = async () => {
    navigate('/teacher');
    toast.success('Exam saved! Publish from dashboard when ready.');
  };

  return (
    <DashboardLayout title="Create Exam" subtitle="Build your exam with manual questions or AI generation">
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Exam Details */}
        {step === 'details' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nexus-card p-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">Exam Title *</label>
              <input type="text" className="nexus-input" placeholder="e.g. Data Structures Midterm" value={details.title} onChange={e => setDetails(d => ({ ...d, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">Description</label>
              <textarea className="nexus-input h-24 resize-none" placeholder="What this exam covers..." value={details.description} onChange={e => setDetails(d => ({ ...d, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Duration (min)', key: 'durationMinutes', type: 'number' },
                { label: 'Total Marks', key: 'totalMarks', type: 'number' },
                { label: 'Passing Score (%)', key: 'passingScore', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">{f.label}</label>
                  <input type={f.type} className="nexus-input" value={(details as any)[f.key]} onChange={e => setDetails(d => ({ ...d, [f.key]: Number(e.target.value) }))} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Difficulty</label>
                <select className="nexus-input" value={details.difficulty} onChange={e => setDetails(d => ({ ...d, difficulty: e.target.value }))}>
                  <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-7">
                <input type="checkbox" id="shuffle" checked={details.shuffleQuestions} onChange={e => setDetails(d => ({ ...d, shuffleQuestions: e.target.checked }))} className="w-4 h-4 accent-purple-600" />
                <label htmlFor="shuffle" className="text-sm text-zinc-300">Shuffle question order</label>
              </div>
            </div>
            <button onClick={createExam} disabled={creating} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {creating ? <Loader2 size={18} className="animate-spin" /> : 'Create Exam & Add Questions →'}
            </button>
          </motion.div>
        )}

        {/* Step 2: Questions */}
        {step === 'questions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* AI Panel */}
            <div className="nexus-card p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><Sparkles size={20} className="text-purple-400" /></div>
                <div><h2 className="font-bold">AI Question Generator</h2><p className="text-zinc-400 text-xs">Generate questions from any topic instantly</p></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <input type="text" className="nexus-input col-span-2" placeholder="Topic (e.g. Data Structures, DBMS)" value={aiForm.topic} onChange={e => setAiForm(f => ({ ...f, topic: e.target.value }))} />
                <input type="number" className="nexus-input" placeholder="Count" min={1} max={20} value={aiForm.count} onChange={e => setAiForm(f => ({ ...f, count: Number(e.target.value) }))} />
                <select className="nexus-input" value={aiForm.difficulty} onChange={e => setAiForm(f => ({ ...f, difficulty: e.target.value }))}>
                  <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <select className="nexus-input" value={aiForm.type} onChange={e => setAiForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="MCQ">Multiple Choice</option><option value="SHORT">Short Answer</option><option value="LONG">Long Answer</option>
                </select>
                <button onClick={generateWithAI} disabled={generating} className="btn-primary flex items-center justify-center gap-2">
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={16} /> Generate</>}
                </button>
              </div>
            </div>

            {/* Manual add toggle */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{questions.length} Question{questions.length !== 1 ? 's' : ''} Added</h2>
              <button onClick={() => setAddingManual(!addingManual)} className="btn-secondary text-sm flex items-center gap-2">
                <Plus size={16} /> Add Manually
              </button>
            </div>

            {/* Manual question form */}
            <AnimatePresence>
              {addingManual && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="nexus-card p-6 space-y-4 overflow-hidden">
                  <textarea className="nexus-input h-20 resize-none" placeholder="Question text..." value={newQ.text} onChange={e => setNewQ(q => ({ ...q, text: e.target.value }))} />
                  <div className="grid grid-cols-3 gap-3">
                    <select className="nexus-input" value={newQ.type} onChange={e => setNewQ(q => ({ ...q, type: e.target.value }))}>
                      <option value="MCQ">MCQ</option><option value="SHORT">Short</option><option value="LONG">Long</option>
                    </select>
                    <select className="nexus-input" value={newQ.difficulty} onChange={e => setNewQ(q => ({ ...q, difficulty: e.target.value }))}>
                      <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                    </select>
                    <input type="number" className="nexus-input" placeholder="Marks" value={newQ.marks} onChange={e => setNewQ(q => ({ ...q, marks: Number(e.target.value) }))} />
                  </div>
                  {newQ.type === 'MCQ' && (
                    <div className="space-y-2">
                      {['A', 'B', 'C', 'D'].map((l, i) => (
                        <input key={i} type="text" className="nexus-input" placeholder={`Option ${l}`}
                          value={newQ.options?.[i] || ''} onChange={e => setNewQ(q => { const opts = [...(q.options || ['','','',''])]; opts[i] = e.target.value; return { ...q, options: opts }; })} />
                      ))}
                    </div>
                  )}
                  <input type="text" className="nexus-input" placeholder="Correct answer (or option text for MCQ)" value={newQ.correctAnswer} onChange={e => setNewQ(q => ({ ...q, correctAnswer: e.target.value }))} />
                  <input type="text" className="nexus-input" placeholder="Topic tag (e.g. Data Structures)" value={newQ.topicTag} onChange={e => setNewQ(q => ({ ...q, topicTag: e.target.value }))} />
                  <div className="flex gap-3">
                    <button onClick={addManualQuestion} disabled={creating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      {creating ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Add Question</>}
                    </button>
                    <button onClick={() => setAddingManual(false)} className="btn-secondary px-4">Cancel</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question list */}
            {questions.length > 0 && (
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="nexus-card p-4 flex items-start gap-3">
                    <span className="text-purple-400 font-bold text-sm w-6 flex-shrink-0">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{q.text}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="badge bg-white/5 text-zinc-400 text-xs">{q.type}</span>
                        <span className={`badge text-xs ${q.difficulty === 'EASY' ? 'risk-low' : q.difficulty === 'HARD' ? 'risk-high' : 'risk-medium'}`}>{q.difficulty}</span>
                        {q.topicTag && <span className="badge bg-purple-500/10 text-purple-400 text-xs">{q.topicTag}</span>}
                        <span className="text-xs text-zinc-600">{q.marks}m</span>
                      </div>
                      {q.leakageWarning?.hasDuplicates && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-yellow-400">
                          <AlertTriangle size={11} /> Possible duplicate ({q.leakageWarning.highestSimilarity}% similar)
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <button onClick={finish} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <CheckCircle size={18} /> Done — Save & Return to Dashboard
            </button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
