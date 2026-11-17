/* ============================================================
   TaskFlow – Register Page (split-screen)
   ============================================================ */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/constants.js';
import toast from 'react-hot-toast';

/* Password strength checker */
const checkStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8)       score++;
  if (/[A-Z]/.test(pw))     score++;
  if (/[a-z]/.test(pw))     score++;
  if (/\d/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–5
};

const STRENGTH_LABELS = ['', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981'];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const score = checkStrength(password);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= score ? STRENGTH_COLORS[score] : 'var(--border)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: STRENGTH_COLORS[score] || 'var(--text-muted)' }}>
        {STRENGTH_LABELS[score]}
      </div>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'Name is required';
    if (!form.email)          errs.email   = 'Email is required';
    if (!form.password)       errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (checkStrength(form.password) < 3) errs.password = 'Password is too weak';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Welcome to TaskFlow 🎉');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
      else setErrors({ name: msg });
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { label: 'At least 8 characters', met: form.password.length >= 8 },
    { label: 'One uppercase letter',  met: /[A-Z]/.test(form.password) },
    { label: 'One number',            met: /\d/.test(form.password) },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── LEFT: Illustration Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="d-none d-lg-flex flex-column align-items-center justify-content-center"
        style={{
          width: '45%',
          background: 'var(--gradient-hero)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(168,85,247,0.3)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(99,102,241,0.25)', filter: 'blur(60px)' }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 32, left: 40, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiZap color="#fff" size={18} />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>TaskFlow</span>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 48, position: 'relative', zIndex: 1 }}>
          {[
            { num: '10k+', label: 'Job seekers' },
            { num: '50k+', label: 'Applications tracked' },
            { num: '95%',  label: 'User satisfaction' },
            { num: '3×',   label: 'Faster job search' },
          ].map(({ num, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 16,
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', color: '#fff' }}>{num}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', color: '#fff', marginBottom: 12 }}>
            Start your journey today
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 300 }}>
            Join thousands of professionals who use TaskFlow to organize their job search and land offers faster.
          </p>
        </motion.div>
      </motion.div>

      {/* ── RIGHT: Register Form ── */}
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
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile logo */}
          <div className="d-flex d-lg-none align-items-center gap-2 mb-5">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiZap color="#fff" size={16} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TaskFlow</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              Create account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Free forever — no credit card required
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 6, color: 'var(--text-primary)' }}>Full name</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Alex Johnson"
                  style={{ paddingLeft: 42 }}
                />
              </div>
              {errors.name && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{errors.name}</div>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 6, color: 'var(--text-primary)' }}>Email address</label>
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
                />
              </div>
              {errors.email && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{errors.email}</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 6, color: 'var(--text-primary)' }}>Password</label>
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
                />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
              {errors.password && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{errors.password}</div>}

              {/* Requirements */}
              {form.password && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {requirements.map(({ label, met }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: met ? 'var(--success)' : 'var(--text-muted)' }}>
                      <FiCheck size={12} />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 6, color: 'var(--text-primary)' }}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="••••••••"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowConfirm((s) => !s)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gradient w-100 py-3"
              style={{ fontSize: 'var(--text-base)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm" /> Creating account…</>
              ) : (
                <>Create Account <FiArrowRight /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} style={{ color: 'var(--primary-500)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
