import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Target,
  ArrowRight,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  isDark: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  isDark,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(currentUser.name || 'Maitrey');
  const [dreamCollege, setDreamCollege] = useState(
    currentUser.dreamCollege || 'IIT Bombay (Computer Science)'
  );
  const [targetPercentile, setTargetPercentile] = useState(
    currentUser.targetPercentile || '99.85 %ile'
  );
  const [resetSent, setResetSent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const updatedUser: UserProfile = {
      ...currentUser,
      email,
      name: name || email.split('@')[0],
      isLoggedIn: true,
    };
    onUpdateUser(updatedUser);
    setNotice('Welcome back, Aspirant!');
    setTimeout(() => {
      setNotice(null);
      onClose();
    }, 800);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      dreamCollege: dreamCollege || 'IIT Bombay',
      targetPercentile: targetPercentile || '99.5+ %ile',
      targetYear: 2027,
      isLoggedIn: true,
    };
    onUpdateUser(newUser);
    setNotice('JEE Mission 2027 Account Created!');
    setTimeout(() => {
      setNotice(null);
      onClose();
    }, 800);
  };

  const handleGoogleLogin = () => {
    const googleUser: UserProfile = {
      ...currentUser,
      name: currentUser.name || 'Maitrey Aspirant',
      email: currentUser.email || 'maitreyongay@gmail.com',
      isLoggedIn: true,
    };
    onUpdateUser(googleUser);
    setNotice('Signed in with Google!');
    setTimeout(() => {
      setNotice(null);
      onClose();
    }, 800);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all relative ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-indigo-950/30'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200/50'
        }`}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">JEE Mission 2027</h3>
              <p className="text-[11px] text-zinc-400">
                Aspirant Authentication & Target Setup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 border-b border-zinc-800/50 text-xs font-semibold text-center">
            <button
              onClick={() => setTab('signin')}
              className={`py-3 border-b-2 transition-colors ${
                tab === 'signin'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`py-3 border-b-2 transition-colors ${
                tab === 'signup'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Notice alert */}
        {notice && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notice}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5">
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="aspirant@iitjee.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] text-indigo-400 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-400">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0"
                  />
                  <span>Stay logged in on this tablet/PC</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold">
                  <span className={`px-2 ${isDark ? 'bg-zinc-900 text-zinc-500' : 'bg-white text-zinc-400'}`}>
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200'
                    : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-800'
                }`}
              >
                {/* SVG Google G */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Maitrey"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="aspirant@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Dream College</label>
                  <input
                    type="text"
                    placeholder="IIT Bombay CSE"
                    value={dreamCollege}
                    onChange={(e) => setDreamCollege(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Target %ile</label>
                  <input
                    type="text"
                    placeholder="99.85 %ile"
                    value={targetPercentile}
                    onChange={(e) => setTargetPercentile(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-9 pr-9 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-3"
              >
                <span>Start Mission 2027</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-xs font-medium text-zinc-300 hover:bg-zinc-800 flex items-center justify-center gap-2 mt-2"
              >
                <span>Or Sign Up with Google</span>
              </button>
            </form>
          )}

          {tab === 'forgot' && (
            <div className="space-y-4">
              {resetSent ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm">Password Reset Link Sent</h4>
                  <p className="text-xs text-zinc-400">
                    We sent password reset instructions to <strong>{email}</strong>. Check your inbox and follow the steps.
                  </p>
                  <button
                    onClick={() => {
                      setResetSent(false);
                      setTab('signin');
                    }}
                    className="text-xs font-semibold text-indigo-400 hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <p className="text-xs text-zinc-400">
                    Enter the email address associated with your JEE Mission account, and we will send a password reset link.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="aspirant@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    Send Reset Link
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setTab('signin')}
                      className="text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
