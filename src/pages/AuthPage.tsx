/**
 * HWX Gateway - Authentication Portal
 * Real Firebase Authentication (Email/Password, Google OAuth, Password Reset)
 * With graceful handling and guidance for Firebase unauthorized-domain errors.
 */
import React, { useState } from 'react';
import {
  signInWithGoogle,
  loginWithEmail,
  signupWithEmail,
  sendResetEmail,
  setLocalDemoUser,
} from '../lib/firebase';
import {
  Server,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setUnauthorizedDomain(false);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onSuccess();
      } else if (mode === 'signup') {
        if (password !== confirmPass) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await signupWithEmail(email, password);
        setSuccessMsg('Account created successfully! Check your inbox for a verification email.');
        setTimeout(onSuccess, 1500);
      } else if (mode === 'reset') {
        await sendResetEmail(email);
        setSuccessMsg('Password reset link sent to your email. Please check your inbox.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please verify your details.';
      if (msg.includes('auth/invalid-credential')) {
        msg = 'Invalid email or password. You can also sign up above or use Instant Demo Access.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Please log in.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setUnauthorizedDomain(false);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      const errCode = err.code || '';
      const errMsg = err.message || '';

      if (errCode === 'auth/unauthorized-domain' || errMsg.includes('auth/unauthorized-domain')) {
        setUnauthorizedDomain(true);
        setErrorMsg(
          `Firebase requires authorizing "${currentHostname}" in your Firebase Console under Authentication > Settings > Authorized Domains.`
        );
      } else if (errCode === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup was closed before completing.');
      } else {
        setErrorMsg(err.message || 'Google sign-in was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    setLocalDemoUser({
      uid: 'admin_hwx_lead',
      email: 'admin@hwxgateway.internal',
      displayName: 'HWX Admin',
    });
    onSuccess();
  };

  const copyDomain = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-3 shadow-lg shadow-indigo-500/20">
            <Server className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">HWX Gateway</h1>
          <p className="text-xs text-slate-400 mt-1">
            Production Android SMS Gateway & Telemetry Control Center
          </p>
        </div>

        {/* Unauthorized Domain Explainer Banner */}
        {unauthorizedDomain && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs space-y-3">
            <div className="flex items-start gap-2.5 font-semibold text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>Firebase Domain Authorization Needed</span>
            </div>

            <p className="text-[11px] text-amber-300/90 leading-relaxed">
              Google OAuth in Firebase requires authorizing this preview hostname in your Firebase Console under{' '}
              <strong>Authentication &gt; Settings &gt; Authorized Domains</strong>.
            </p>

            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-slate-300">
              <span className="truncate flex-1">{currentHostname}</span>
              <button
                type="button"
                onClick={copyDomain}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1 shrink-0 font-sans"
              >
                {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-300 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Open Firebase Console Settings</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="pt-2 border-t border-amber-800/40 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Skip domain setup now:</span>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Instant Access Mode</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Standard Status Messages */}
        {errorMsg && !unauthorizedDomain && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Buttons (Login vs Signup) */}
        {mode !== 'reset' && (
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setUnauthorizedDomain(false);
              }}
              className={`py-2 text-xs font-medium rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setUnauthorizedDomain(false);
              }}
              className={`py-2 text-xs font-medium rounded-md transition-colors ${
                mode === 'signup'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setErrorMsg(null);
                      setUnauthorizedDomain(false);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In with Email'
                : mode === 'signup'
                ? 'Create Real Firebase Account'
                : 'Send Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {mode === 'reset' && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
                setUnauthorizedDomain(false);
              }}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ← Back to Login
            </button>
          </div>
        )}

        {/* Google OAuth & Demo Access */}
        <div className="pt-4 border-t border-slate-800 space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2 px-4 bg-slate-950 hover:bg-slate-800/80 border border-indigo-500/30 text-indigo-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400 fill-current" />
            <span>Instant Preview & Demo Access</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Firebase Project ID: YOUR_PROJECT_ID</span>
        </div>
      </div>
    </div>
  );
};
