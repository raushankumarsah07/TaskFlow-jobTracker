/* ============================================================
   TaskFlow – Login Page (split-screen)
   ============================================================ */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/constants.js';
import toast from 'react-hot-toast';

const Login = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const [form,     setForm]     = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: 'demo@taskflow.com', password: 'Demo@1234' });
    setErrors({});
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── LEFT: Animated Illustration Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="d-none d-lg-flex"
        style={{
          width: '50%',
          background: 'var(--gradient-hero)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.3)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(236,72,153,0.25)', filter: 'blur(60px)' }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 32, left: 40, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiZap color="#fff" size={18} />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>TaskFlow</span>
        </div>

        {/* Illustration – mock Kanban card stack */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Mock cards */}
          {[
            { label: '🎯 Applied to Google', status: 'Interview', color: '#f59e0b', offset: 32 },
            { label: '💼 Stripe — Senior SWE', status: 'Applied',   color: '#0ea5e9', offset: 16 },
            { label: '🚀 Figma — Product Lead', status: 'Offer',   color: '#10b981', offset: 0 },
          ].map(({ label, status, color, offset }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 16,
                padding: '16px 20px',
                marginBottom: 12,
                width: 300,
                transform: `translateX(${i % 2 === 0 ? offset : -offset}px)`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 8 }}>{label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-xs)' }}>{status}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ textAlign: 'center', marginTop: 48, position: 'relative', zIndex: 1 }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', color: '#fff', marginBottom: 12 }}>
            Land your dream job
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'var(--text-sm)', maxWidth: 320, lineHeight: 1.7 }}>
            Track applications, manage tasks, and stay ahead of deadlines — all in one beautiful workspace.
          </p>
        </motion.div>
      </motion.div>

      {/* ── RIGHT: Login Form ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          background: 'var(--bg-primary)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <div className="d-flex d-lg-none align-items-center gap-2 mb-5">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiZap color="#fff" size={16} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TaskFlow</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Demo fill button */}
          <button
            onClick={fillDemo}
            type="button"
            style={{
              width: '100%', padding: '12px', marginBottom: 24,
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 'var(--text-sm)',
              transition: 'var(--transition-fast)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            ✨ Fill demo credentials
          </button>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 6, color: 'var(--text-primary)' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="you@example.com"
                  style={{ paddingLeft: 42 }}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{errors.email}</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-500)' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="••••••••"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{errors.password}</div>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gradient w-100 py-3"
              style={{ fontSize: 'var(--text-base)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm" /> Signing in…</>
              ) : (
                <>Sign In <FiArrowRight /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} style={{ color: 'var(--primary-500)', fontWeight: 600 }}>
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
