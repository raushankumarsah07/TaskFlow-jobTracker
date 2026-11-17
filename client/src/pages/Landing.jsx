/* ============================================================
   TaskFlow – Landing Page
   ============================================================ */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiZap, FiBriefcase, FiCheckSquare, FiBarChart2,
  FiBell, FiShield, FiArrowRight, FiGithub, FiTwitter,
  FiLinkedin,
} from 'react-icons/fi';
import { ROUTES } from '../utils/constants.js';

/* ── Animation variants ── */
const fadeUp = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
};

/* ── Feature data ── */
const FEATURES = [
  {
    icon:  FiBriefcase,
    color: '#6366f1',
    title: 'Job Application Tracker',
    desc:  'Manage every application from wishlist to offer on a beautiful Kanban board with drag-and-drop.',
  },
  {
    icon:  FiCheckSquare,
    color: '#a855f7',
    title: 'Smart Task Manager',
    desc:  'Create tasks, set priorities, track subtasks, and view them on a calendar — all in one place.',
  },
  {
    icon:  FiBarChart2,
    color: '#ec4899',
    title: 'Analytics & Insights',
    desc:  'Visual charts showing your application trends, success rate, and weekly productivity streaks.',
  },
  {
    icon:  FiBell,
    color: '#f59e0b',
    title: 'Real-time Notifications',
    desc:  'Get live alerts for deadline reminders, interview schedules, and team activity via Socket.IO.',
  },
  {
    icon:  FiZap,
    color: '#10b981',
    title: 'Lightning Fast',
    desc:  'Built with Vite + React for instant page loads. All data updates in real-time without refreshes.',
  },
  {
    icon:  FiShield,
    color: '#0ea5e9',
    title: 'Secure by Default',
    desc:  'JWT auth with httpOnly cookies, rate limiting, Helmet, and MongoDB sanitization baked in.',
  },
];

/* ── Testimonials ── */
const TESTIMONIALS = [
  {
    name:   'Sarah Chen',
    role:   'Software Engineer @ Google',
    avatar: 'SC',
    color:  '#6366f1',
    quote:  'TaskFlow completely transformed my job search. I landed 3 interviews in one week by staying organized!',
  },
  {
    name:   'Marcus Johnson',
    role:   'Product Manager @ Stripe',
    avatar: 'MJ',
    color:  '#a855f7',
    quote:  'The Kanban board is so satisfying to use. Moving my application to "Offer" felt like winning.',
  },
  {
    name:   'Priya Patel',
    role:   'UX Designer @ Figma',
    avatar: 'PP',
    color:  '#ec4899',
    quote:  'Finally a job tracker that actually looks good. The dark mode is stunning and the UI is buttery smooth.',
  },
];

/* ── FAQ ── */
const FAQS = [
  { q: 'Is TaskFlow free to use?', a: 'Yes! TaskFlow is completely open-source and free. Run it locally or deploy on any cloud.' },
  { q: 'Can I import my existing applications?', a: 'You can export from other tools to CSV and bulk-import, or use our seed script to get started quickly with sample data.' },
  { q: 'Does it work on mobile?', a: 'Absolutely. TaskFlow is fully responsive with a dedicated bottom navigation bar on mobile devices.' },
  { q: 'Is my data secure?', a: 'Yes. All passwords are hashed with bcrypt, tokens are stored in httpOnly cookies, and all API routes are protected with JWT.' },
];

/* ── HOW IT WORKS steps ── */
const STEPS = [
  { num: '01', title: 'Create Your Account', desc: 'Register in seconds with just your name and email. Demo credentials available.' },
  { num: '02', title: 'Add Applications',    desc: 'Log your job applications with company, role, deadline, and notes.' },
  { num: '03', title: 'Track & Organize',    desc: 'Drag cards across the Kanban board as your status changes.' },
  { num: '04', title: 'Land the Offer',      desc: 'Get reminders, follow up on time, and celebrate with confetti when you get an offer! 🎉' },
];

/* ── FAQ Item component (accordion) ── */
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = require('react').useState(false);
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '20px 0',
        cursor: 'pointer',
      }}
      onClick={() => setOpen((o) => !o)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
          {q}
        </span>
        <span style={{ fontSize: '1.25rem', color: 'var(--primary-500)', flexShrink: 0 }}>
          {open ? '−' : '+'}
        </span>
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginTop: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}
        >
          {a}
        </motion.div>
      )}
    </div>
  );
};

const Landing = () => (
  <div style={{ background: 'var(--bg-primary)', overflowX: 'hidden' }}>

    {/* ── HEADER ── */}
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 48px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiZap color="#fff" size={16} />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TaskFlow
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to={ROUTES.LOGIN} className="btn btn-sm" style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}>
          Log in
        </Link>
        <Link to={ROUTES.REGISTER} className="btn btn-sm btn-gradient px-4">
          Get Started Free
        </Link>
      </div>
    </header>

    {/* ── HERO ── */}
    <section
      className="animated-gradient"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.3)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(236,72,153,0.25)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6 }}
        >
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 99,
              padding: '6px 20px',
              color: '#fff',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              marginBottom: 24,
            }}
          >
            🚀 Open-source · Self-hostable · Blazing fast
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          Your Job Search,
          <br />
          <span style={{ background: 'linear-gradient(90deg,#fbbf24,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Supercharged.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            maxWidth: 560,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}
        >
          Track every job application, manage tasks, schedule interviews, and get
          real-time reminders — all in one beautiful workspace.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link
            to={ROUTES.REGISTER}
            className="btn btn-lg"
            style={{
              background: '#fff',
              color: 'var(--primary-600)',
              fontWeight: 700,
              borderRadius: 'var(--radius-lg)',
              padding: '14px 32px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              fontSize: '1rem',
              transition: 'var(--transition-base)',
            }}
          >
            Start Free — No Credit Card
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="btn btn-lg"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontWeight: 600,
              borderRadius: 'var(--radius-lg)',
              padding: '14px 32px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: '1rem',
              transition: 'var(--transition-base)',
            }}
          >
            Try Demo ✨
          </Link>
        </motion.div>

        {/* Demo credentials hint */}
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'var(--text-sm)', marginTop: 20 }}
        >
          Demo: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>demo@taskflow.com</code>{' '}
          / <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>Demo@1234</code>
        </motion.p>
      </div>
    </section>

    {/* ── FEATURES ── */}
    <section style={{ padding: '100px 48px', background: 'var(--bg-secondary)', maxWidth: '100%' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <span style={{ color: 'var(--primary-500)', fontWeight: 600, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Everything you need
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 8, color: 'var(--text-primary)' }}>
            Built for serious job seekers
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card-hover"
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 10, color: 'var(--text-primary)' }}>
                {title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-sm)' }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── HOW IT WORKS ── */}
    <section style={{ padding: '100px 48px', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span style={{ color: 'var(--primary-500)', fontWeight: 600, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Simple process
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 8, marginBottom: 60, color: 'var(--text-primary)' }}>
            How it works
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
          {STEPS.map(({ num, title, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div
                style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontFamily: 'var(--font-heading)', fontWeight: 800,
                  fontSize: 'var(--text-sm)', color: '#fff',
                  boxShadow: 'var(--shadow-primary)',
                }}
              >
                {num}
              </div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 8, color: 'var(--text-primary)' }}>
                {title}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── TESTIMONIALS ── */}
    <section style={{ padding: '100px 48px', background: 'var(--bg-secondary)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: 'var(--text-primary)' }}>
            Loved by job seekers
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {TESTIMONIALS.map(({ name, role, avatar, color, quote }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 16 }}>⭐⭐⭐⭐⭐</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, fontSize: 'var(--text-sm)' }}>
                "{quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 'var(--text-sm)',
                }}>
                  {avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── FAQ ── */}
    <section style={{ padding: '100px 48px', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: 'var(--text-primary)' }}>
            Frequently asked questions
          </h2>
        </motion.div>
        {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
      </div>
    </section>

    {/* ── CTA BANNER ── */}
    <section
      className="animated-gradient"
      style={{ padding: '80px 48px', textAlign: 'center' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', marginBottom: 16 }}>
          Ready to land your dream job?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: 40 }}>
          Join thousands of job seekers who stay organized and get hired faster.
        </p>
        <Link
          to={ROUTES.REGISTER}
          className="btn btn-lg"
          style={{
            background: '#fff', color: 'var(--primary-600)',
            fontWeight: 700, borderRadius: 'var(--radius-lg)',
            padding: '14px 40px', fontSize: '1rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          Get Started — It's Free <FiArrowRight style={{ marginLeft: 8 }} />
        </Link>
      </motion.div>
    </section>

    {/* ── FOOTER ── */}
    <footer style={{ background: 'var(--sidebar-bg)', padding: '48px', color: 'rgba(255,255,255,0.5)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiZap color="#fff" size={14} />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>TaskFlow</span>
          <span style={{ marginLeft: 8 }}>© 2026</span>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 'var(--text-sm)' }}>
          <span>Built with ❤️ using React + Node.js</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
            <FiGithub size={20} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
            <FiTwitter size={20} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>
            <FiLinkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;
