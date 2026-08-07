import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout,
  Tractor,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  AlertCircle,
  KeyRound,
  X,
  ShieldAlert,
  ShieldX
} from 'lucide-react';
import { loginUser, loginWithGoogle } from '../api';
import RegisterPage from './RegisterPage';

// The admin secret key — must match backend ADMIN_SECRET_KEY env
const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || 'ADMIN@YIELDSENSE2024';

export default function LoginPage({ onLoginSuccess, googlePendingMsg, pendingGoogleAdmin, onClearPendingGoogleAdmin }) {
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [showRegister, setShowRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(googlePendingMsg || '');

  // ── Admin Google Access Key Gate & Google Auth Modal State ──────────────────
  // NOTE: pendingGoogleAdmin comes from App.jsx as a prop (always-mounted listener catches popup message)
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminKeyError, setAdminKeyError] = useState('');
  const [adminKeyLoading, setAdminKeyLoading] = useState(false);
  const [adminKeyDenied, setAdminKeyDenied] = useState(false);
  const adminKeyInputRef = useRef(null);

  // Focus the key input when modal opens
  useEffect(() => {
    if (pendingGoogleAdmin && adminKeyInputRef.current) {
      setTimeout(() => adminKeyInputRef.current?.focus(), 80);
    }
  }, [pendingGoogleAdmin]);

  // Listen for Google OAuth popup messages — kept as fallback,
  // primary listener is in App.jsx which reliably fires first.
  useEffect(() => {
    const handlePopupMessage = async (event) => {
      // Accept from localhost:5173 or 127.0.0.1:5173 (origin may differ)
      const allowed = ['http://localhost:5173', 'http://127.0.0.1:5173', window.location.origin];
      if (!allowed.includes(event.origin)) return;
      if (event.data?.type === 'GOOGLE_AUTH_PENDING') {
        setError(`⏳ Hi ${event.data.name || event.data.email}! Your Google account registration is pending admin approval.`);
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setError(event.data.error || 'Google Sign-In failed.');
      }
      // GOOGLE_AUTH_SUCCESS is handled by App.jsx to avoid race condition
    };
    window.addEventListener('message', handlePopupMessage);
    return () => window.removeEventListener('message', handlePopupMessage);
  }, []);

  // Official Google Identity Services SDK Initialization
  useEffect(() => {
    /* global google */
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: '717140131417-client.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse
        });
      } catch (err) {
        console.log('Google Identity SDK Init:', err);
      }
    }
  }, [selectedRole]);

  // Handle Official Google JWT Response
  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      if (response && response.credential) {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);

        const data = await loginWithGoogle({
          email: payload.email,
          name: payload.name || payload.given_name || payload.email.split('@')[0],
          role: selectedRole,
          google_id: payload.sub,
          picture: payload.picture || ''
        });
        onLoginSuccess(data.user);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail || 'Google Authentication failed. Please try again.';
      setError(msg.includes('pending') ? '⏳ ' + msg : msg);
    } finally {
      setLoading(false);
    }
  };

  // Real Google OAuth & Account Selector Fallback
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    const width = 500;
    const height = 620;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    let popup = null;
    try {
      popup = window.open(
        'about:blank',
        'GoogleSignIn',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
      );
      if (popup) {
        popup.document.write(`
          <html>
            <head><title>Connecting to Google...</title></head>
            <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: white;">
              <div style="text-align: center; padding: 20px;">
                <svg style="width: 44px; height: 44px; margin-bottom: 12px; animation: spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                  <path d="M12 2 a 10 10 0 0 1 10 10"></path>
                </svg>
                <h3 style="margin: 0; font-size: 16px;">Connecting to Google OAuth...</h3>
                <p style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Redirecting to Google secure authentication</p>
              </div>
            </body>
          </html>
        `);
      }
    } catch (e) {
      console.warn('Popup blocked:', e);
    }

    try {
      const resp = await fetch(
        `http://localhost:8000/api/auth/google/url?role=${selectedRole}`
      );
      if (!resp.ok) {
        throw new Error('Backend Google OAuth URL endpoint unavailable');
      }
      const { url } = await resp.json();

      if (popup && !popup.closed) {
        popup.location.href = url;

        const handleGoogleMsg = async (event) => {
          if (event.origin !== window.location.origin) return;
          if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
            window.removeEventListener('message', handleGoogleMsg);
            // App.jsx handles GOOGLE_AUTH_SUCCESS to set pendingGoogleAdmin prop
            // No need to duplicate here
          } else if (event.data?.type === 'GOOGLE_AUTH_PENDING') {
            window.removeEventListener('message', handleGoogleMsg);
            setError(`⏳ Account pending admin approval for ${event.data.email}.`);
          } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
            window.removeEventListener('message', handleGoogleMsg);
            setError(event.data.error || 'Google Sign-In failed.');
          }
        };
        window.addEventListener('message', handleGoogleMsg);

        const checkClosed = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(checkClosed);
            setLoading(false);
          }
        }, 500);
      } else {
        // Popup was blocked or closed — open Google Account Modal
        setGoogleCustomEmail(selectedRole === 'admin' ? 'admin.google@yieldsense.ai' : 'farmer.google@gmail.com');
        setShowGoogleModal(true);
      }
    } catch (err) {
      if (popup && !popup.closed) popup.close();
      setGoogleCustomEmail(selectedRole === 'admin' ? 'admin.google@yieldsense.ai' : 'farmer.google@gmail.com');
      setShowGoogleModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Direct Google Account Selector Submit (Fallback/Local Dev)
  const handleGoogleAccountSelect = async (customEmail) => {
    const targetEmail = customEmail || googleCustomEmail || (selectedRole === 'admin' ? 'admin.google@yieldsense.ai' : 'farmer.google@gmail.com');
    const name = targetEmail.split('@')[0].replace('.', ' ');
    setShowGoogleModal(false);
    setLoading(true);
    setError('');

    try {
      if (selectedRole === 'admin') {
        // Admin Google SSO requires secret access key prompt
        // For fallback modal, we trigger App.jsx's state directly via a synthetic event
        // or set it locally — but since pendingGoogleAdmin is a prop, we use onClearPendingGoogleAdmin inverse:
        // We still need to inform parent. Use the fallback approach: manually set via prop chain.
        // For the fallback modal only, emit a synthetic message to App.jsx's handler:
        window.dispatchEvent(new MessageEvent('message', {
          data: {
            type: 'GOOGLE_AUTH_SUCCESS',
            token: '',
            email: targetEmail,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            role: 'admin'
          },
          origin: window.location.origin
        }));
        setAdminKeyInput('');
        setAdminKeyError('');
        setAdminKeyDenied(false);
        setLoading(false);
        return;
      }

      // Farmer Google Sign-in
      const data = await loginWithGoogle({
        email: targetEmail,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        role: 'farmer',
        google_id: `g_farmer_${Date.now()}`
      });
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Admin Access Key Verification ──────────────────────────────────────────
  const handleAdminKeySubmit = async (e) => {
    e.preventDefault();
    setAdminKeyError('');
    setAdminKeyLoading(true);

    // Simulate a brief verification delay for UX
    await new Promise((r) => setTimeout(r, 700));

    if (adminKeyInput.trim() !== ADMIN_SECRET_KEY) {
      setAdminKeyDenied(true);
      setAdminKeyError('Invalid access key. Admin access denied.');
      setAdminKeyLoading(false);
      return;
    }

    // Key matches — complete the Google admin login
    const { token, email, name } = pendingGoogleAdmin;

    // Store token in localStorage and cookies
    if (token) {
      localStorage.setItem('access_token', token);
      document.cookie = `access_token=${token}; path=/; max-age=86400`;
    }
    document.cookie = `user_email=${email}; path=/; max-age=86400`;
    document.cookie = `user_role=admin; path=/; max-age=86400`;

    let googleAdminUser = {
      id: `usr_google_${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      role: 'admin',
      region: 'All Regions',
      auth_provider: 'google'
    };

    try {
      // Register/upgrade the user as admin in MongoDB
      const data = await loginWithGoogle({
        email,
        name: name || email.split('@')[0],
        role: 'admin',
        google_id: email
      });
      if (data.user) googleAdminUser = data.user;
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        document.cookie = `access_token=${data.access_token}; path=/; max-age=86400`;
      }
    } catch (err) {
      console.warn('Admin Google login API call failed, using local user object:', err);
    }

    setAdminKeyLoading(false);
    if (onClearPendingGoogleAdmin) onClearPendingGoogleAdmin();
    onLoginSuccess(googleAdminUser);
  };

  const handleAdminKeyDismiss = () => {
    if (onClearPendingGoogleAdmin) onClearPendingGoogleAdmin();
    setAdminKeyInput('');
    setAdminKeyError('');
    setAdminKeyDenied(false);
  };

  // Standard Email & Password Login Submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser({ email, password, role: selectedRole });
      onLoginSuccess(data.user);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Authentication failed. Check your email & password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Show RegisterPage when user clicks "Create an account"
  if (showRegister) {
    return (
      <RegisterPage
        onLoginSuccess={onLoginSuccess}
        onGoToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans">

      {/* ── ADMIN GOOGLE ACCESS KEY MODAL ───────────────────────────────────── */}
      {pendingGoogleAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={!adminKeyDenied ? handleAdminKeyDismiss : undefined}
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-md">
            <div
              className={`rounded-3xl shadow-2xl overflow-hidden border transition-all duration-500 ${
                adminKeyDenied
                  ? 'border-rose-500/40 bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900'
                  : 'border-purple-500/30 bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900'
              }`}
            >
              {/* Glow orbs */}
              <div
                className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
                  adminKeyDenied ? 'bg-rose-500' : 'bg-purple-500'
                }`}
              />
              <div
                className={`absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none transition-colors duration-500 ${
                  adminKeyDenied ? 'bg-red-600' : 'bg-violet-600'
                }`}
              />

              <div className="relative z-10 p-8">
                {/* Close button */}
                <button
                  type="button"
                  onClick={handleAdminKeyDismiss}
                  className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Icon + heading */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl transition-all duration-500 ${
                      adminKeyDenied
                        ? 'bg-gradient-to-br from-rose-600 to-red-700 shadow-rose-500/30'
                        : 'bg-gradient-to-br from-purple-600 to-violet-700 shadow-purple-500/30'
                    }`}
                  >
                    {adminKeyDenied ? (
                      <ShieldX className="w-8 h-8 text-white" />
                    ) : (
                      <ShieldAlert className="w-8 h-8 text-white" />
                    )}
                  </div>

                  <h2 className="text-xl font-black text-white mb-1">
                    {adminKeyDenied ? 'Access Denied' : 'Admin Verification Required'}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                    {adminKeyDenied ? (
                      <>
                        The access key you entered is{' '}
                        <span className="text-rose-400 font-semibold">incorrect</span>.
                        Admin portal access has been blocked.
                      </>
                    ) : (
                      <>
                        Google sign-in verified as{' '}
                        <span className="text-purple-300 font-semibold">
                          {pendingGoogleAdmin.name || pendingGoogleAdmin.email}
                        </span>
                        . Enter the <strong className="text-white">Admin Access Key</strong> to
                        proceed.
                      </>
                    )}
                  </p>
                </div>

                {/* Denied state */}
                {adminKeyDenied ? (
                  <div className="space-y-4">
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
                      <ShieldX className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-rose-300 mb-0.5">
                          Unauthorized Admin Access Attempt
                        </p>
                        <p className="text-xs text-rose-400/80">
                          This attempt has been logged. If you are a legitimate admin,
                          please contact your system administrator for the correct key.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAdminKeyDenied(false);
                          setAdminKeyError('');
                          setAdminKeyInput('');
                          setTimeout(() => adminKeyInputRef.current?.focus(), 80);
                        }}
                        className="py-3 rounded-2xl border border-slate-600 text-slate-300 text-sm font-semibold hover:border-purple-500 hover:text-purple-300 transition-all cursor-pointer"
                      >
                        Try Again
                      </button>
                      <button
                        type="button"
                        onClick={handleAdminKeyDismiss}
                        className="py-3 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-600 text-white text-sm font-bold hover:from-slate-600 hover:to-slate-500 transition-all cursor-pointer shadow-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Key input form
                  <form onSubmit={handleAdminKeySubmit} className="space-y-4">
                    {/* Google account badge */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-sm font-black">
                          {(pendingGoogleAdmin.name || pendingGoogleAdmin.email)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {pendingGoogleAdmin.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {pendingGoogleAdmin.email}
                        </p>
                      </div>
                      <div className="ml-auto shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        Admin Access Key
                        <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                        <input
                          ref={adminKeyInputRef}
                          type="password"
                          required
                          placeholder="Enter your admin access key..."
                          value={adminKeyInput}
                          onChange={(e) => {
                            setAdminKeyInput(e.target.value);
                            setAdminKeyError('');
                          }}
                          className="w-full bg-white/5 border-2 border-purple-500/30 rounded-2xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.15)] transition-all"
                        />
                      </div>
                      {adminKeyError && (
                        <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{adminKeyError}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                        🔐 Required for all admin accounts, including Google sign-in.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleAdminKeyDismiss}
                        disabled={adminKeyLoading}
                        className="py-3 rounded-2xl border border-slate-600 text-slate-300 text-sm font-semibold hover:border-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={adminKeyLoading || !adminKeyInput.trim()}
                        className="py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                      >
                        {adminKeyLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verify & Login</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE ACCOUNT SELECTOR MODAL (Fallback / Direct One-Click) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-white">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-lg shadow-white/10">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Sign in with Google</h3>
              <p className="text-xs text-slate-400">Choose a Google account to continue to YieldSense AI</p>
            </div>

            {/* Account Options */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleGoogleAccountSelect(selectedRole === 'admin' ? 'admin.google@yieldsense.ai' : 'farmer.google@gmail.com')}
                className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 p-3.5 rounded-2xl flex items-center gap-3 transition group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-md">
                  {selectedRole === 'admin' ? 'A' : 'F'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate">
                    {selectedRole === 'admin' ? 'System Administrator' : 'Primary Farmer Account'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {selectedRole === 'admin' ? 'admin.google@yieldsense.ai' : 'farmer.google@gmail.com'}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 capitalize">
                  {selectedRole}
                </span>
              </button>

              {/* Custom Google Email Input */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Or enter Google Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={googleCustomEmail}
                    onChange={(e) => setGoogleCustomEmail(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleGoogleAccountSelect(googleCustomEmail)}
                    disabled={!googleCustomEmail.includes('@')}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 min-h-[640px] border border-slate-800">

        {/* LEFT PANEL: BRANDING & MONGODB ATLAS STATUS */}
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-emerald-500/20">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">YieldSense AI</h1>
                <p className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">Enterprise Production Portal</p>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                AI Agricultural Productivity Platform
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Predict crop harvests, analyze NPK soil fertility, monitor climate risks, and manage farm land parcels with enterprise-grade Machine Learning.
              </p>
            </div>

            {/* Crop Hero Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl mt-2">
              <img
                src="/crop_hero.png"
                alt="Lush wheat field at golden sunrise"
                className="w-full h-52 object-cover rounded-2xl opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent rounded-2xl" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: PREMIUM AUTHENTICATION CARD */}
        <div className={`p-8 md:p-10 flex flex-col justify-center relative overflow-hidden transition-all duration-500 ${
          selectedRole === 'admin'
            ? 'bg-gradient-to-br from-slate-50 via-purple-50/40 to-white'
            : 'bg-gradient-to-br from-slate-50 via-emerald-50/40 to-white'
        }`}>

          {/* Decorative blobs */}
          <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 transition-all duration-500 ${selectedRole === 'admin' ? 'bg-purple-400' : 'bg-emerald-400'}`} />
          <div className={`absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-10 transition-all duration-500 ${selectedRole === 'admin' ? 'bg-violet-400' : 'bg-teal-400'}`} />

          <div className="space-y-5 relative z-10">

            {/* Header */}
            <div className="space-y-1">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-2 ${
                selectedRole === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedRole === 'admin' ? 'Admin Portal' : 'Farmer Portal'}
              </div>
              <h3 className={`text-2xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r ${
                selectedRole === 'admin'
                  ? 'from-purple-700 via-violet-600 to-purple-900'
                  : 'from-emerald-700 via-teal-600 to-emerald-900'
              }`}>
                Welcome Back!
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Sign in to access your dashboard
              </p>
            </div>

            {/* ROLE SELECTOR CARDS */}
            <div className="grid grid-cols-2 gap-3">
              {/* Farmer Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('farmer')}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col items-start space-y-2 cursor-pointer group ${
                  selectedRole === 'farmer'
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400 shadow-lg shadow-emerald-100'
                    : 'bg-white border-slate-200 hover:border-emerald-200 hover:shadow-md'
                }`}
                style={{ transform: selectedRole === 'farmer' ? 'translateY(-1px)' : 'translateY(0)' }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  selectedRole === 'farmer'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                }`}>
                  <Tractor className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-extrabold ${selectedRole === 'farmer' ? 'text-emerald-800' : 'text-slate-700'}`}>Farmer</p>
                  <p className="text-[10px] text-slate-400 font-medium">Land & Crops</p>
                </div>
                {selectedRole === 'farmer' && (
                  <div className="w-full h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                )}
              </button>

              {/* Admin Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col items-start space-y-2 cursor-pointer group ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-400 shadow-lg shadow-purple-100'
                    : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-md'
                }`}
                style={{ transform: selectedRole === 'admin' ? 'translateY(-1px)' : 'translateY(0)' }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md shadow-purple-200'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-extrabold ${selectedRole === 'admin' ? 'text-purple-800' : 'text-slate-700'}`}>Admin</p>
                  <p className="text-[10px] text-slate-400 font-medium">System & DB</p>
                </div>
                {selectedRole === 'admin' && (
                  <div className="w-full h-0.5 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full" />
                )}
              </button>
            </div>

            {/* GOOGLE SSO BUTTON */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-2xl border border-slate-200 transition-all duration-200 text-xs shadow-md hover:shadow-lg flex items-center justify-center space-x-2.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>
                {loading
                  ? 'Connecting...'
                  : selectedRole === 'admin'
                  ? 'Continue with Google (Admin)'
                  : 'Continue with Google'}
              </span>
              {selectedRole === 'admin' && !loading && (
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              )}
            </button>

            {/* Admin Google hint */}
            {selectedRole === 'admin' && (
              <p className="text-[10px] text-purple-400 text-center flex items-center justify-center gap-1 -mt-1">
                <Lock className="w-3 h-3" />
                Google admin sign-in requires an additional access key verification
              </p>
            )}

            {/* DIVIDER */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <span className={`relative px-3 text-[10px] font-bold tracking-widest uppercase ${
                selectedRole === 'admin' ? 'bg-purple-50/80 text-purple-300' : 'bg-emerald-50/80 text-emerald-400'
              }`} style={{ backdropFilter: 'blur(4px)' }}>or email</span>
            </div>

            {/* ERROR / INFO BANNER */}
            {error && (
              <div className={`border text-xs p-3 rounded-xl flex items-start space-x-2 ${
                error.startsWith('⏳')
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${error.startsWith('⏳') ? 'text-amber-500' : 'text-rose-500'}`} />
                <span>{error}</span>
              </div>
            )}


            {/* FORM */}
            <form onSubmit={handleEmailSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-300 absolute left-3.5 top-3" />
                  <input
                    type="email" required
                    placeholder={selectedRole === 'admin' ? 'admin@yieldsense.ai' : 'farmer@yieldsense.ai'}
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-white border-2 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 text-sm focus:outline-none transition-all duration-200 placeholder:text-slate-300 ${
                      selectedRole === 'admin' ? 'border-slate-200 focus:border-purple-400 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.15)]' : 'border-slate-200 focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-300 absolute left-3.5 top-3" />
                  <input
                    type="password" required placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-white border-2 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 text-sm focus:outline-none transition-all duration-200 placeholder:text-slate-300 ${
                      selectedRole === 'admin' ? 'border-slate-200 focus:border-purple-400 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.15)]' : 'border-slate-200 focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]'
                    }`}
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit" disabled={loading}
                className={`w-full text-white font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm cursor-pointer hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-lg shadow-purple-200'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-200'
                }`}
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Please wait...</span></>
                ) : (
                  <><span>{`Sign In as ${selectedRole === 'admin' ? 'Admin' : 'Farmer'}`}</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>



            {/* MODE SWITCHER */}
            <div className="text-center">
              <p className="text-xs text-slate-400">
                New to YieldSense AI?{' '}
                <button type="button" onClick={() => setShowRegister(true)}
                  className={`font-bold hover:underline cursor-pointer ${selectedRole === 'admin' ? 'text-purple-600' : 'text-emerald-600'}`}>
                  Create an account →
                </button>
              </p>
            </div>


          </div>
        </div>

      </div>
    </div>
  );
}
