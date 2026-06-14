import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Camera, Keyboard, CheckCircle, ChevronRight, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Typing biometric phrases (same concept as ProctoPro InitiateForm but refactored)
const BIOMETRIC_PHRASES = [
  "The examination platform ensures academic integrity through continuous monitoring.",
  "Artificial intelligence analyzes behavioral patterns to detect anomalies in real time.",
  "Adaptive assessment dynamically adjusts question difficulty based on your performance."
];

interface KeystrokeEvent {
  key: string;
  holdTime: number;
  interval: number;
}

export default function IdentityVerificationPage() {
  const [step, setStep] = useState<'face' | 'typing' | 'complete'>(
    (() => { const b = JSON.parse(localStorage.getItem('examgen_user') || '{}'); return b.isVerified ? 'complete' : 'face'; })()
  );
  const [faceCapturing, setFaceCapturing] = useState(false);
  const [faceDone, setFaceDone] = useState(false);
  const [typingSamples, setTypingSamples] = useState<string[]>(['', '', '']);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [keystrokeData, setKeystrokeData] = useState<KeystrokeEvent[][]>([[], [], []]);
  const [saving, setSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastKeyTime = useRef<number>(0);
  const keyDownTime = useRef<Record<string, number>>({});
  const navigate = useNavigate();
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  // ─── Face capture ─────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setFaceCapturing(true);
    } catch { toast.error('Camera access denied. Please allow camera access.'); }
  };

  const captureFace = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.7);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setFaceCapturing(false);
    setFaceDone(true);
    localStorage.setItem('examgen_face', base64);
    toast.success('Face captured successfully!');
  };

  // ─── Typing biometrics ────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    keyDownTime.current[e.key] = Date.now();
  };

  const handleKeyUp = (e: React.KeyboardEvent, idx: number) => {
    const now = Date.now();
    const holdTime = now - (keyDownTime.current[e.key] || now);
    const interval = lastKeyTime.current ? now - lastKeyTime.current : 0;
    lastKeyTime.current = now;

    const event: KeystrokeEvent = { key: e.key, holdTime, interval };
    setKeystrokeData(prev => {
      const next = [...prev];
      next[idx] = [...next[idx], event];
      return next;
    });
  };

  const nextPhrase = () => {
    if (typingSamples[currentPhrase].length < 20) {
      toast.error('Please type the full phrase'); return;
    }
    if (currentPhrase < 2) { setCurrentPhrase(c => c + 1); }
    else { submitVerification(); }
  };

  const submitVerification = async () => {
    setSaving(true);
    try {
      const profile = {
        holdTimes: keystrokeData.flat().map(k => k.holdTime),
        intervals: keystrokeData.flat().filter(k => k.interval > 0).map(k => k.interval)
      };
      await api.post('/biometrics/enroll', {
        keystrokeProfile: profile,
        faceProfileBase64: localStorage.getItem('examgen_face')
      });
      await refreshUser();
      setStep('complete');
      toast.success('Identity verified successfully!');
    } catch { toast.error('Verification failed. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Identity Verification" subtitle="Complete biometric verification to unlock exam access">
      <div className="max-w-2xl mx-auto">
        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {(['face', 'typing', 'complete'] as const).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step === s ? 'text-purple-400' : (i < ['face','typing','complete'].indexOf(step)) ? 'text-green-400' : 'text-zinc-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step === s ? 'border-purple-500 bg-purple-500/10' : (i < ['face','typing','complete'].indexOf(step)) ? 'border-green-500 bg-green-500/10' : 'border-zinc-700'}`}>
                  {i < ['face','typing','complete'].indexOf(step) ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{['Face Scan', 'Typing Profile', 'Complete'][i]}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 rounded ${i < ['face','typing','complete'].indexOf(step) ? 'bg-green-500' : 'bg-zinc-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'face' && (
            <motion.div key="face" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="nexus-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center"><Camera size={24} className="text-purple-400" /></div>
                <div><h2 className="font-bold text-lg">Face Verification</h2><p className="text-zinc-400 text-sm">We'll capture your photo for identity verification</p></div>
              </div>

              {!faceCapturing && !faceDone && (
                <div className="text-center py-8">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center mx-auto mb-6">
                    <Camera size={40} className="text-zinc-500" />
                  </div>
                  <button onClick={startCamera} className="btn-primary px-8 py-3">Enable Camera</button>
                </div>
              )}

              {faceCapturing && (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 rounded-full border-2 border-purple-500/50 animate-pulse-glow" />
                    </div>
                  </div>
                  <button onClick={captureFace} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                    <Camera size={18} /> Capture Photo
                  </button>
                </div>
              )}

              {faceDone && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <CheckCircle size={20} className="text-green-400" />
                    <div><div className="font-semibold text-green-300 text-sm">Face captured successfully</div><div className="text-green-400/70 text-xs">Your biometric profile is ready</div></div>
                  </div>
                  <button onClick={() => setStep('typing')} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                    Continue to Typing Profile <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === 'typing' && (
            <motion.div key="typing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="nexus-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center"><Keyboard size={24} className="text-cyan-400" /></div>
                <div>
                  <h2 className="font-bold text-lg">Typing Biometrics</h2>
                  <p className="text-zinc-400 text-sm">Sample {currentPhrase + 1} of 3 — Type the phrase below</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/3 border border-white/10 mb-4">
                <p className="text-zinc-300 text-sm italic leading-relaxed">"{BIOMETRIC_PHRASES[currentPhrase]}"</p>
              </div>

              <textarea
                className="nexus-input h-28 resize-none mb-4 font-mono text-sm"
                placeholder="Type the phrase above exactly..."
                value={typingSamples[currentPhrase]}
                onChange={e => setTypingSamples(prev => { const n = [...prev]; n[currentPhrase] = e.target.value; return n; })}
                onKeyDown={e => handleKeyDown(e, currentPhrase)}
                onKeyUp={e => handleKeyUp(e, currentPhrase)}
              />

              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-500">{typingSamples[currentPhrase].length} chars typed</div>
                <button onClick={nextPhrase} className="btn-primary px-6 py-2 flex items-center gap-2" disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : currentPhrase < 2 ? 'Next Sample' : 'Complete Verification'}
                  {!saving && <ChevronRight size={16} />}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="nexus-card p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6 glow-green">
                <CheckCircle size={40} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Identity Verified!</h2>
              <p className="text-zinc-400 mb-8">Your face scan and typing biometrics are enrolled. You can now take exams.</p>
              <button onClick={() => navigate('/student')} className="btn-primary px-8 py-3">
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
