/* ============================================================
   TaskFlow – 404 Not Found Page
   ============================================================ */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { ROUTES } from '../utils/constants.js';

const NotFound = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 24px',
      background: 'var(--bg-secondary)',
    }}
  >
    {/* Animated 404 number */}
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        fontFamily:  'var(--font-heading)',
        fontWeight:  900,
        fontSize:    'clamp(6rem, 20vw, 12rem)',
        lineHeight:  1,
        background:  'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor:  'transparent',
        marginBottom: 8,
        userSelect: 'none',
      }}
    >
      404
    </motion.div>

    {/* SVG Illustration */}
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{ marginBottom: 32 }}
    >
      <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
        <ellipse cx="100" cy="130" rx="80" ry="8" fill="rgba(99,102,241,0.1)" />
        <rect x="60" y="20" width="80" height="100" rx="8" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="2"/>
        <rect x="72" y="34" width="56" height="6" rx="3" fill="var(--border)" />
        <rect x="72" y="46" width="40" height="4" rx="2" fill="var(--border)" />
        <rect x="72" y="56" width="48" height="4" rx="2" fill="var(--border)" />
        <circle cx="100" cy="90" r="18" fill="rgba(239,68,68,0.15)" />
        <text x="100" y="96" textAnchor="middle" fontSize="20" fill="var(--danger)">?</text>
      </svg>
    </motion.div>

    <motion.h2
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        fontFamily:   'var(--font-heading)',
        fontWeight:   800,
        fontSize:     '1.75rem',
        color:        'var(--text-primary)',
        marginBottom: 12,
      }}
    >
      Page not found
    </motion.h2>

    <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      style={{
        color:        'var(--text-secondary)',
        maxWidth:     380,
        lineHeight:   1.7,
        marginBottom: 36,
        fontSize:     'var(--text-base)',
      }}
    >
      The page you're looking for doesn't exist or has been moved. Let's get you back on track.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
    >
      <button
        onClick={() => window.history.back()}
        className="btn"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          padding: '10px 20px', borderRadius: 'var(--radius-lg)',
          cursor: 'pointer', fontSize: 'var(--text-sm)',
        }}
      >
        <FiArrowLeft size={15} /> Go Back
      </button>
      <Link
        to={ROUTES.DASHBOARD}
        className="btn btn-gradient"
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)' }}
      >
        <FiHome size={15} /> Go to Dashboard
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
