import { useState, useEffect, useRef } from 'react';
import { loginUser, loginWithGoogle } from '../api';
import RegisterPage from './RegisterPage';

const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || 'ADMIN@YIELDSENSE2024';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '937316566103-59d2qauoe0m8usnhgouk59lfa49ikll4.apps.googleusercontent.com';

export default function LoginPage({ onLoginSuccess, googlePendingMsg, pendingGoogleAdmin, onClearPendingGoogleAdmin }) {
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [showRegister, setShowRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(googlePendingMsg || '');

  // Admin Google Key verification & Google modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminKeyError, setAdminKeyError] = useState('');
  const [adminKeyLoading, setAdminKeyLoading] = useState(false);
  // adminKeyDenied state kept for future admin key rejection UI
  const [adminKeyDenied, setAdminKeyDenied] = useState(false); // eslint-disable-line no-unused-vars
  const adminKeyInputRef = useRef(null);

  useEffect(() => {
    if (pendingGoogleAdmin && adminKeyInputRef.current) {
      setTimeout(() => adminKeyInputRef.current?.focus(), 80);
    }
  }, [pendingGoogleAdmin]);

  useEffect(() => {
    const handlePopupMessage = async (event) => {
      const allowed = ['http://localhost:5173', 'http://127.0.0.1:5173', window.location.origin];
      if (!allowed.includes(event.origin)) return;
      if (event.data?.type === 'GOOGLE_AUTH_PENDING') {
        setError(`Hi ${event.data.name || event.data.email}! Your registration is pending admin approval.`);
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setError(event.data.error || 'Google Sign-In failed.');
      }
    };
    window.addEventListener('message', handlePopupMessage);
    return () => window.removeEventListener('message', handlePopupMessage);
  }, []);

  // Note: Google SDK useEffect moved to after handleGoogleCredentialResponse declaration below

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
      const msg = err.response?.data?.detail || 'Google Authentication failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google Identity Services SDK initialization
  // Placed here (after handleGoogleCredentialResponse is declared) to avoid TDZ errors
  useEffect(() => {
    /* global google */
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse
        });
      } catch (err) {
        console.log('Google Identity SDK Init:', err);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole]);

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
                <div style="width:40px;height:40px;border:3px solid #334155;border-top-color:#10b981;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div>
                <h3 id="msg" style="margin: 0; font-size: 16px;">Waking up server...</h3>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 6px;">This may take up to 30 seconds on first use</p>
                <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
              </div>
            </body>
          </html>
        `);
      }
    } catch (e) {
      console.warn('Popup blocked:', e);
    }

    try {
      // Step 1: Pre-warm the backend — poll until DB is ready (max 45s)
      let dbReady = false;
      const warmupStart = Date.now();
      while (!dbReady && Date.now() - warmupStart < 45000) {
        try {
          const warmResp = await fetch(`${API_BASE}/api/warmup`, { signal: AbortSignal.timeout(10000) });
          if (warmResp.ok) {
            const warmData = await warmResp.json();
            if (warmData.db === 'connected') {
              dbReady = true;
              break;
            }
          }
        } catch (_) { /* still waking up */ }
        await new Promise(r => setTimeout(r, 3000));
      }

      if (!dbReady) {
        if (popup && !popup.closed) popup.close();
        setError('Server is taking too long to wake up. Please try again in 30 seconds.');
        setLoading(false);
        return;
      }

      // Step 2: Update popup message to show connecting to Google
      try {
        if (popup && !popup.closed) {
          popup.document.getElementById('msg').textContent = 'Connecting to Google...';
        }
      } catch (_) {}

      // Step 3: Fetch the real Google OAuth URL
      const resp = await fetch(`${API_BASE}/api/auth/google/url?role=${selectedRole}`);
      if (!resp.ok) {
        throw new Error('Backend Google OAuth endpoint unavailable');
      }
      const { url } = await resp.json();

      if (popup && !popup.closed) {
        popup.location.href = url;

        const handleGoogleMsg = async (event) => {
          if (event.origin !== window.location.origin) return;
          if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
            window.removeEventListener('message', handleGoogleMsg);
          } else if (event.data?.type === 'GOOGLE_AUTH_PENDING') {
            window.removeEventListener('message', handleGoogleMsg);
            setError(`Account pending approval for ${event.data.email}.`);
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
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
      }
    } catch (err) {
      if (popup && !popup.closed) popup.close();
      setError('Google Sign-In is not available right now. Please use email/password or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAccountSelect = async (customEmail) => {
    const targetEmail = customEmail || googleCustomEmail;
    if (!targetEmail) return;
    const name = targetEmail.split('@')[0].replace('.', ' ');
    setShowGoogleModal(false);
    setLoading(true);
    setError('');

    try {
      if (selectedRole === 'admin') {
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

  const handleAdminKeySubmit = async (e) => {
    e.preventDefault();
    setAdminKeyError('');
    setAdminKeyLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    if (adminKeyInput.trim() !== ADMIN_SECRET_KEY) {
      setAdminKeyDenied(true);
      setAdminKeyError('Invalid access key. Access denied.');
      setAdminKeyLoading(false);
      return;
    }

    const { token, email, name } = pendingGoogleAdmin;

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
      console.warn('Admin Google login fallback:', err);
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
          'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return (
      <RegisterPage
        onLoginSuccess={onLoginSuccess}
        onGoToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">

      {/* Background Liquid Glass Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ADMIN KEY VERIFICATION MODAL */}
      {pendingGoogleAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Admin Verification</h3>
              <button
                onClick={handleAdminKeyDismiss}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Google Account: <strong className="text-slate-900">{pendingGoogleAdmin.email}</strong>. Enter your Admin Secret Key to proceed.
            </p>

            <form onSubmit={handleAdminKeySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Admin Access Key</label>
                <input
                  ref={adminKeyInputRef}
                  type="password"
                  required
                  placeholder="Enter access key..."
                  value={adminKeyInput}
                  onChange={(e) => {
                    setAdminKeyInput(e.target.value);
                    setAdminKeyError('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
                {adminKeyError && (
                  <p className="text-rose-600 text-xs font-medium mt-1">{adminKeyError}</p>
                )}
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleAdminKeyDismiss}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminKeyLoading || !adminKeyInput.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {adminKeyLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GOOGLE SELECTOR MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-700">Enter your Google Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your.name@gmail.com"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => handleGoogleAccountSelect(googleCustomEmail)}
                  disabled={!googleCustomEmail.includes('@')}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LIQUID GLASS LOGIN CARD (5 cols + 7 cols) */}
      <div className="relative z-10 bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 min-h-[660px] border border-white/20">

        {/* LEFT PANEL: HERO BANNER (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-8 md:p-11 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div>
              <span className="text-[11px] font-black tracking-widest uppercase text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block mb-3">
                Agricultural Platform
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">YieldSense AI</h1>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-normal pt-1">
              Predict crop harvests, calculate fertilizer requirements, and assess climate risks with data-driven machine learning models.
            </p>
          </div>

          <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
            <img
              src="/crop_hero.png"
              alt="Lush wheat field"
              className="w-full h-52 object-cover opacity-90 transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
        </div>

        {/* RIGHT PANEL: LIQUID GLASS LOGIN FORM (7 cols) */}
        <div className="md:col-span-7 p-8 md:p-11 flex flex-col justify-center space-y-5 bg-white/95 backdrop-blur-xl">

          {/* Heading */}
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">Select your role to access your account</p>
          </div>

          {/* Role Toggle Selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 backdrop-blur-md">
            {['farmer', 'advisor', 'admin'].map((role) => {
              const isActive = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-950 shadow-sm ring-1 ring-slate-200/80 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl border border-slate-300 transition text-xs md:text-sm shadow-xs flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 hover:shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign In with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Or with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl text-xs bg-rose-50 border border-rose-200 text-rose-700 shadow-xs">
              {error}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-xs md:text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 hover:scale-[1.005] active:scale-[0.995] cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-2">
            <p className="text-xs md:text-sm text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer ml-1 underline underline-offset-4"
              >
                Sign Up
              </button>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
