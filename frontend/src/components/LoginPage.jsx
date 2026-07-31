import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Tractor,
  ShieldCheck,
  Globe,
  Database,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { loginUser, registerUser, loginWithGoogle, setCookie } from '../api';

export default function LoginPage({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('farmer'); // 'farmer' or 'admin'
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('North Region');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Official Google Identity Services SDK Initialization
  useEffect(() => {
    /* global google */
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: "717140131417-client.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse
        });
      } catch (err) {
        console.log("Google Identity SDK Init:", err);
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
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
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
      setError(err.response?.data?.detail || 'Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Real Google OAuth - calls backend to get the real authorization URL
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      // Ask backend for the real Google OAuth URL (backend has the real client_id)
      const resp = await fetch(`http://localhost:8000/api/auth/google/url?role=${selectedRole}`);
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || 'Google OAuth not configured on server.');
      }
      const { url } = await resp.json();

      // Open the REAL Google Sign-In window
      const width = 500;
      const height = 620;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        url,
        'GoogleSignIn',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
      );
      // After popup, Google redirects to backend callback which then redirects to frontend
      // App.jsx handles the ?google_token= params on load
    } catch (err) {
      setError(err.message || 'Google Sign-In failed. Make sure Google OAuth is configured.');
    } finally {
      setLoading(false);
    }
  };

  // Standard Email & Password Registration / Login Submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let data;
      if (authMode === 'login') {
        data = await loginUser({ email, password });
      } else {
        data = await registerUser({
          name: name || email.split('@')[0],
          email,
          password,
          role: selectedRole,
          region
        });
      }
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Check your email & password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword, role) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setSelectedRole(role);
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans">
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

        {/* RIGHT PANEL: PRODUCTION AUTHENTICATION CARD */}
        <div className="p-8 md:p-10 flex flex-col justify-between bg-white text-slate-800 space-y-6">
          <div className="space-y-5">
            
            {/* Header */}
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {authMode === 'login' ? 'Sign In to Your Account' : 'Create New Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Select your access role and sign in below</p>
            </div>

            {/* ROLE SELECTOR CARDS (FARMER vs ADMIN ONLY) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('farmer')}
                className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 cursor-pointer ${
                  selectedRole === 'farmer'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedRole === 'farmer' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  <Tractor className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold">Farmer</p>
                  <p className="text-[10px] text-slate-500 font-normal">Land &amp; Crops</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 text-purple-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedRole === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold">Admin</p>
                  <p className="text-[10px] text-slate-500 font-normal">System &amp; DB</p>
                </div>
              </button>
            </div>

            {/* GOOGLE SSO BUTTON */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-2xl border border-slate-300 transition text-xs shadow-sm flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? 'Connecting Google...' : `Continue with Google (${selectedRole === 'admin' ? 'Admin' : 'Farmer'})`}</span>
            </button>

            {/* DIVIDER */}
            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">Or Email Credentials</span>
            </div>

            {/* ERROR BANNER */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* EMAIL & PASSWORD FORM (ALWAYS VISIBLE) */}
            <form onSubmit={handleEmailSubmit} className="space-y-3 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-500 font-semibold block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder={selectedRole === 'admin' ? 'admin@yieldsense.ai' : 'farmer@yieldsense.ai'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-semibold block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Agricultural Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl transition shadow-sm flex items-center justify-center space-x-2 text-xs cursor-pointer"
              >
                <span>{loading ? 'Saving to MongoDB Atlas...' : authMode === 'login' ? `Sign In as ${selectedRole === 'admin' ? 'Admin' : 'Farmer'}` : 'Register & Save to MongoDB Atlas'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* MODE SWITCHER LINK */}
            <div className="text-center pt-1">
              {authMode === 'login' ? (
                <p className="text-xs text-slate-500">
                  New to YieldSense AI?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>

          </div>

          {/* QUICK DEMO CREDENTIAL SHORTCUTS */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Demo Quick Sign-In Credentials:</p>
            <div className="flex items-center justify-center space-x-3 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('farmer@yieldsense.ai', 'farmer123', 'farmer')}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
              >
                👨‍🌾 farmer@yieldsense.ai
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@yieldsense.ai', 'admin123', 'admin')}
                className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold px-3 py-1.5 rounded-xl border border-purple-200 transition cursor-pointer"
              >
                ⚙️ admin@yieldsense.ai
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
