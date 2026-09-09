import { useState } from 'react';
import { registerUser } from '../api';

const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || 'ADMIN@YIELDSENSE2024';

const REGIONS = [
  'North Region',
  'South Region',
  'East Region',
  'West Region',
  'Central Region'
];

export default function RegisterPage({ onLoginSuccess, onGoToLogin }) {
  const [selectedRole, setSelectedRole] = useState('farmer');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [region, setRegion] = useState('North Region');
  const [adminSecretKey, setAdminSecretKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = selectedRole === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPwd) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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
      if (data?.user) {
        onLoginSuccess(data.user);
      } else {
        setSuccess('Registration submitted successfully! Your account is pending Admin approval. You will be able to log in once approved.');
      }
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 202 || detail?.toLowerCase().includes('pending') || detail?.toLowerCase().includes('approval')) {
        setSuccess(detail || 'Registration submitted successfully! Your account is pending Admin approval.');
      } else if (detail?.toLowerCase().includes('already registered')) {
        setError('This email is already registered. If your account is awaiting admin approval, please wait or sign in.');
      } else {
        setError(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      
      {/* Background Liquid Glass Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 min-h-[660px] border border-white/20">

        {/* LEFT PANEL: HERO BANNER (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-8 md:p-11 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div>
              <span className="text-[11px] font-black tracking-widest uppercase text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block mb-3">
                Agricultural Platform
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">YieldSense AI</h1>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-normal pt-1">
              Create your account to access machine learning crop yield forecasts, precision fertilizer plans, and multi-hazard climate risk analytics.
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

        {/* RIGHT PANEL: LIQUID GLASS REGISTRATION FORM (7 cols) */}
        <div className="md:col-span-7 p-8 md:p-11 flex flex-col justify-center space-y-5 bg-white/95 backdrop-blur-xl">

          {/* Heading */}
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">Set up your profile to access your dashboard</p>
          </div>

          {/* Role Toggle Selector - Sleek Glassmorphic Pill */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 backdrop-blur-md">
            {['farmer', 'advisor', 'admin'].map((role) => {
              const isActive = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setSelectedRole(role); setError(''); setSuccess(''); }}
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

          {/* Error / Success Banners */}
          {error && (
            <div className="p-3.5 rounded-2xl text-xs bg-rose-50 border border-rose-200 text-rose-700 shadow-xs">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3.5 rounded-2xl text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold leading-relaxed shadow-xs">
              {success}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Agricultural Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-2xs cursor-pointer font-medium"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            {isAdmin && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Admin Secret Access Key</label>
                <input
                  type="password"
                  required
                  placeholder="Enter secret admin key"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-xs md:text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 hover:scale-[1.005] active:scale-[0.995] cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : `Register as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-xs md:text-sm text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onGoToLogin}
                className="font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer ml-1 underline underline-offset-4"
              >
                Sign In
              </button>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
