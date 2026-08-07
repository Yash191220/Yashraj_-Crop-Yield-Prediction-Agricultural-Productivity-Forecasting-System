import React, { useState } from 'react';
import {
  Sprout,
  Tractor,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Eye,
  EyeOff,
  KeyRound,
  Leaf,
  BarChart2,
  CloudSun,
  Cpu
} from 'lucide-react';
import { registerUser } from '../api';

const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || 'ADMIN@YIELDSENSE2024';

const REGIONS = [
  'North Region',
  'South Region',
  'East Region',
  'West Region',
  'Central Region'
];

const FARMER_FEATURES = [
  { icon: BarChart2, label: 'AI Yield Predictions', desc: 'ML-powered crop forecasting' },
  { icon: CloudSun,  label: 'Weather Analytics',    desc: 'Climate risk monitoring'    },
  { icon: Leaf,      label: 'Soil Health Reports',  desc: 'NPK & pH assessment'        },
  { icon: Cpu,       label: 'Smart Recommendations',desc: 'Irrigation & crop advice'   }
];

const ADMIN_FEATURES = [
  { icon: ShieldCheck, label: 'User Management',     desc: 'Approve & manage accounts' },
  { icon: BarChart2,   label: 'System Analytics',    desc: 'Platform-wide insights'    },
  { icon: Cpu,         label: 'ML Model Control',    desc: 'Training & deployment'      },
  { icon: MapPin,      label: 'Region Oversight',    desc: 'All agricultural zones'    }
];

// Password strength calculator
function calcStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)            score++;
  if (/[A-Z]/.test(pwd))          score++;
  if (/[0-9]/.test(pwd))          score++;
  if (/[^A-Za-z0-9]/.test(pwd))   score++;
  return score; // 0-4
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'bg-rose-500', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];
const STRENGTH_TEXT   = ['', 'text-rose-500', 'text-amber-500', 'text-emerald-500', 'text-emerald-600'];

export default function RegisterPage({ onLoginSuccess, onGoToLogin }) {
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [step, setStep]                 = useState(1); // 1 = role+basic, 2 = details+submit

  // Form fields
  const [name,           setName]           = useState('');
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [confirmPwd,     setConfirmPwd]     = useState('');
  const [region,         setRegion]         = useState('North Region');
  const [adminSecretKey, setAdminSecretKey] = useState('');

  const [showPwd,        setShowPwd]        = useState(false);
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [showAdminKey,   setShowAdminKey]   = useState(false);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const pwdStrength = calcStrength(password);
  const isAdmin     = selectedRole === 'admin';

  // Step 1 validation
  const step1Valid = name.trim().length >= 2 && email.includes('@') && email.includes('.');

  // Step 2 validation
  const step2Valid =
    password.length >= 6 &&
    password === confirmPwd &&
    region &&
    (!isAdmin || adminSecretKey.trim().length > 0);

  const handleNext = (e) => {
    e.preventDefault();
    if (!step1Valid) return;
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPwd) {
      setError('Passwords do not match.');
      return;
    }
    if (isAdmin && adminSecretKey.trim() !== ADMIN_SECRET_KEY) {
      setError('Invalid Admin Access Key. Contact your system administrator.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        region,
        admin_secret_key: isAdmin ? adminSecretKey.trim() : undefined
      });
      onLoginSuccess(data.user);
    } catch (err) {
      if (err.response?.status === 202) {
        setSuccess(
          err.response?.data?.detail ||
            '⏳ Registration submitted! Awaiting admin approval. You will be notified once approved.'
        );
      } else {
        setError(
          err.response?.data?.detail || 'Registration failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-500 ${
        isAdmin ? 'bg-slate-950' : 'bg-slate-950'
      }`}
    >
      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div
        className={`hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10 relative overflow-hidden transition-all duration-500 ${
          isAdmin
            ? 'bg-gradient-to-br from-violet-950 via-slate-900 to-purple-950'
            : 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950'
        }`}
      >
        {/* Ambient glows */}
        <div
          className={`absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none ${
            isAdmin ? 'bg-violet-600' : 'bg-emerald-500'
          }`}
        />
        <div
          className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none ${
            isAdmin ? 'bg-purple-700' : 'bg-teal-500'
          }`}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl ${
                isAdmin
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              }`}
            >
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">YieldSense AI</h1>
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isAdmin ? 'text-violet-400' : 'text-emerald-400'
                }`}
              >
                Agricultural Intelligence
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isAdmin
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {isAdmin ? 'Admin Portal' : 'Farmer Portal'}
            </div>
            <h2 className="text-3xl font-black text-white leading-tight">
              {isAdmin ? 'Admin\nControl Hub' : 'Start Your\nFarm Journey'}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isAdmin
                ? 'Gain full system access to manage users, approve registrations, and oversee the entire platform.'
                : 'Access AI-powered crop predictions, soil analysis, weather insights and smart farming recommendations.'}
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {(isAdmin ? ADMIN_FEATURES : FARMER_FEATURES).map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-sm transition-all ${
                  isAdmin
                    ? 'bg-violet-500/5 border-violet-500/15 hover:bg-violet-500/10'
                    : 'bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/10'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isAdmin
                      ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20'
                      : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
                  }`}
                >
                  <Icon
                    className={`w-4.5 h-4.5 ${isAdmin ? 'text-violet-300' : 'text-emerald-300'}`}
                    size={18}
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{label}</p>
                  <p className="text-[10px] text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div
            className={`border-l-2 pl-4 ${
              isAdmin ? 'border-violet-500/50' : 'border-emerald-500/50'
            }`}
          >
            <p className="text-xs text-slate-300 italic leading-relaxed">
              {isAdmin
                ? '"Empowering administrators to build smarter, more productive agricultural communities."'
                : '"From soil to harvest — AI-driven insights that maximize every hectare\'s potential."'}
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Back to Login */}
          <button
            type="button"
            onClick={onGoToLogin}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold mb-8 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Login
          </button>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Create Account</h2>
            <p className="text-sm text-slate-400">
              Set up your YieldSense AI account in just a few steps.
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* Farmer */}
            <button
              type="button"
              onClick={() => { setSelectedRole('farmer'); setError(''); }}
              className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer overflow-hidden group ${
                !isAdmin
                  ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/4 border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5'
              }`}
            >
              {!isAdmin && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              )}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-all ${
                  !isAdmin
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30'
                    : 'bg-slate-800 group-hover:bg-emerald-500/10'
                }`}
              >
                <Tractor className={`w-5 h-5 ${!isAdmin ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
              </div>
              <p className={`text-sm font-black mb-0.5 ${!isAdmin ? 'text-emerald-300' : 'text-slate-300'}`}>
                Farmer
              </p>
              <p className="text-[10px] text-slate-500">Land & crop management</p>
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setError(''); }}
              className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer overflow-hidden group ${
                isAdmin
                  ? 'bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500 shadow-lg shadow-violet-500/10'
                  : 'bg-white/4 border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/5'
              }`}
            >
              {isAdmin && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              )}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-all ${
                  isAdmin
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30'
                    : 'bg-slate-800 group-hover:bg-violet-500/10'
                }`}
              >
                <ShieldCheck className={`w-5 h-5 ${isAdmin ? 'text-white' : 'text-slate-400 group-hover:text-violet-400'}`} />
              </div>
              <p className={`text-sm font-black mb-0.5 ${isAdmin ? 'text-violet-300' : 'text-slate-300'}`}>
                Admin
              </p>
              <p className="text-[10px] text-slate-500">System & DB control</p>
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                      step === s
                        ? isAdmin
                          ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/30'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                        : step > s
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span
                    className={`text-xs font-semibold transition-colors ${
                      step === s ? 'text-white' : step > s ? 'text-emerald-400' : 'text-slate-600'
                    }`}
                  >
                    {s === 1 ? 'Your Info' : 'Security'}
                  </span>
                </div>
                {s < 2 && (
                  <div
                    className={`h-px w-12 transition-all duration-500 ${
                      step > 1 ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── STEP 1: Basic Info ───────────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    placeholder={isAdmin ? 'e.g. Dr. Priya Sharma' : 'e.g. Ramesh Patel'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-slate-900 border rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all duration-200 ${
                      isAdmin
                        ? 'border-slate-700 focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]'
                        : 'border-slate-700 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder={isAdmin ? 'admin@yieldsense.ai' : 'farmer@domain.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-slate-900 border rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all duration-200 ${
                      isAdmin
                        ? 'border-slate-700 focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]'
                        : 'border-slate-700 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
                    }`}
                  />
                </div>
              </div>

              {/* Region */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Agricultural Region <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className={`w-full bg-slate-900 border rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm appearance-none focus:outline-none transition-all duration-200 cursor-pointer ${
                      isAdmin
                        ? 'border-slate-700 focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]'
                        : 'border-slate-700 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
                    }`}
                  >
                    {(isAdmin ? ['All Regions', ...REGIONS] : REGIONS).map((r) => (
                      <option key={r} value={r} className="bg-slate-900">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Farmer note */}
              {!isAdmin && (
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300/80 leading-relaxed">
                    Farmer accounts require admin approval after registration. You will be
                    notified once your account is activated.
                  </p>
                </div>
              )}

              {/* Admin info */}
              {isAdmin && (
                <div className="bg-violet-500/8 border border-violet-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-violet-300/80 leading-relaxed">
                    Admin accounts are activated immediately with a valid access key. You
                    will need the Admin Secret Key on the next step.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!step1Valid}
                className={`w-full text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed ${
                  isAdmin
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20'
                }`}
              >
                Continue to Security
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ── STEP 2: Security / Password ──────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Summary card */}
              <div
                className={`flex items-center gap-3 p-4 rounded-2xl border ${
                  isAdmin
                    ? 'bg-violet-500/6 border-violet-500/20'
                    : 'bg-emerald-500/6 border-emerald-500/20'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                    isAdmin
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                  }`}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="ml-auto text-[10px] font-bold text-slate-500 hover:text-white transition-colors shrink-0 cursor-pointer underline"
                >
                  Edit
                </button>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-slate-900 border rounded-2xl pl-11 pr-12 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all duration-200 ${
                      isAdmin
                        ? 'border-slate-700 focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]'
                        : 'border-slate-700 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= pwdStrength ? STRENGTH_COLORS[pwdStrength] : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-semibold ${STRENGTH_TEXT[pwdStrength]}`}>
                      {STRENGTH_LABELS[pwdStrength]} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className={`w-full bg-slate-900 border rounded-2xl pl-11 pr-12 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all duration-200 ${
                      confirmPwd.length > 0
                        ? confirmPwd === password
                          ? 'border-emerald-500 focus:border-emerald-500'
                          : 'border-rose-500 focus:border-rose-500'
                        : isAdmin
                        ? 'border-slate-700 focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]'
                        : 'border-slate-700 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPwd.length > 0 && confirmPwd !== password && (
                  <p className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Passwords don't match
                  </p>
                )}
                {confirmPwd.length > 0 && confirmPwd === password && (
                  <p className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              {/* Admin Secret Key */}
              {isAdmin && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-2 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    Admin Access Key <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-violet-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showAdminKey ? 'text' : 'password'}
                      required
                      placeholder="Enter your admin access key..."
                      value={adminSecretKey}
                      onChange={(e) => setAdminSecretKey(e.target.value)}
                      className="w-full bg-violet-500/5 border-2 border-violet-500/30 rounded-2xl pl-11 pr-12 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminKey(!showAdminKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                    >
                      {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                    🔐 Contact your system administrator for the access key.
                  </p>
                </div>
              )}

              {/* Error / Success Banner */}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-300">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">{success}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  disabled={loading}
                  className="flex-none px-5 py-4 rounded-2xl border border-slate-700 text-slate-300 text-sm font-semibold hover:border-slate-500 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={loading || !step2Valid || !!success}
                  className={`flex-1 text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed ${
                    isAdmin
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
                      Create {isAdmin ? 'Admin' : 'Farmer'} Account
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="text-xs text-slate-600 text-center mt-8">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className={`font-bold cursor-pointer hover:underline ${
                isAdmin ? 'text-violet-400' : 'text-emerald-400'
              }`}
            >
              Sign in →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
