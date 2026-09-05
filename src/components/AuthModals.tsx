import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'signin' | 'signup';
}

export const AuthModals: React.FC<AuthModalsProps> = ({ isOpen, onClose, initialMode }) => {
  const [mode, setMode] = useState<'signin' | 'rules' | 'signup'>(
    initialMode === 'signup' ? 'rules' : 'signin'
  );

  const { refreshProfile } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'furry'>('other');
  const [pronouns, setPronouns] = useState<'he/him' | 'she/her' | 'they/them' | 'custom'>('they/them');
  const [customPronouns, setCustomPronouns] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanHandle) {
      setError('Invalid handle format.');
      return;
    }

    setLoading(true);
    try {
      // Check handle uniqueness
      const handleDocRef = doc(db, 'handles', cleanHandle);
      const handleDoc = await getDoc(handleDocRef);
      if (handleDoc.exists()) {
        setError('This handle is already taken.');
        setLoading(false);
        return;
      }

      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      // Save handle mapping
      await setDoc(handleDocRef, { uid: user.uid });

      // Save user profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        handle: cleanHandle,
        displayName,
        email: user.email,
        photoURL: '',
        bannerURL: '',
        dob,
        gender,
        pronouns,
        customPronouns: pronouns === 'custom' ? customPronouns : '',
        createdAt: Date.now(),
      });

      await refreshProfile();
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    // Note: User didn't explicitly mention the signin flow in detail,
    // but they mentioned the "Sign in" button. Implementing a basic one.
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
      await refreshProfile();
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-lg font-bold text-white">
            {mode === 'rules' && 'Before you continue'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'signin' && 'Sign in'}
          </h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {mode === 'rules' && (
            <div className="space-y-4">
              <p className="text-zinc-300">
                Welcome to Probably Tweet! Before we get you started, please review our simple guidelines:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 text-sm ml-2">
                <li>Tweet whatever you want.</li>
                <li>No tracking, no invasive telemetry.</li>
                <li>Administrated by: no one.</li>
                <li>Be respectful of other users.</li>
              </ul>
              <button
                onClick={() => setMode('signup')}
                className="w-full mt-6 bg-[#6364ff] hover:bg-[#5253d8] text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Let's get started
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Display Name</label>
                <input required type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-[#1c1c24] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6364ff]" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
                  <input required type="text" value={handle} onChange={(e) => setHandle(e.target.value)} className="w-full bg-[#1c1c24] border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-[#6364ff]" placeholder="jane_doe" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1c1c24] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6364ff]" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1c1c24] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6364ff]" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Date of Birth</label>
                <input required type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-[#1c1c24] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6364ff] [color-scheme:dark]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full bg-[#1c1c24] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6364ff]">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="furry">Furry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Pronouns</label>
                  <select value={pronouns} onChange={(e) => setPronouns(e.target.value as any)} className="w-full bg-[#1c1c24] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6364ff]">
                    <option value="he/him">he/him</option>
                    <option value="she/her">she/her</option>
                    <option value="they/them">they/them</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {pronouns === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Custom Pronouns</label>
                  <input required type="text" value={customPronouns} onChange={(e) => setCustomPronouns(e.target.value)} className="w-full bg-[#1c1c24] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6364ff]" placeholder="xe/xem" />
                </div>
              )}

              <button disabled={loading} type="submit" className="w-full mt-4 bg-[#6364ff] hover:bg-[#5253d8] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              
              <p className="text-xs text-center text-zinc-500 mt-4">
                Already have an account? <button type="button" onClick={() => setMode('signin')} className="text-[#6364ff] hover:underline">Sign in</button>
              </p>
            </form>
          )}

          {mode === 'signin' && (
            <form onSubmit={handleSignin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1c1c24] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6364ff]" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1c1c24] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6364ff]" placeholder="••••••••" />
              </div>

              <button disabled={loading} type="submit" className="w-full mt-4 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              
              <p className="text-xs text-center text-zinc-500 mt-4">
                Don't have an account? <button type="button" onClick={() => setMode('rules')} className="text-[#6364ff] hover:underline">Create one</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
