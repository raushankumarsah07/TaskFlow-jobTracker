/* ============================================================
   TaskFlow – Dashboard Page
   ============================================================ */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend,
  FunnelChart, Funnel, LabelList,
} from 'recharts';
import {
  FiBriefcase, FiCalendar, FiCheckSquare, FiTrendingUp,
  FiClock, FiAlertCircle, FiArrowRight, FiActivity,
} from 'react-icons/fi';
import { dashboardAPI }   from '../api/dashboard.api.js';
import { useAuth }        from '../context/AuthContext.jsx';
import { useSocket }      from '../context/SocketContext.jsx';
import { useTheme }       from '../context/ThemeContext.jsx';
import { timeGreeting, formatDate } from '../utils/helpers.js';
import { timeAgo }        from '../utils/formatters.js';
import { ROUTES }         from '../utils/constants.js';
import { SkeletonStatCard } from '../components/common/SkeletonLoader.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

/* ── Animated counter ── */
const AnimatedNumber = ({ value, duration = 1200 }) => {
  const [displayed, setDisplayed] = useState(0);
  const start = useRef(null);

  useEffect(() => {
    if (!value) return;
    start.current = null;
    const animate = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      setDisplayed(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayed(value);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayed}</span>;
};

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, suffix = '', color, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    style={{
      background:   'var(--bg-card)',
      borderRadius: 'var(--radius-xl)',
      padding:      '22px 20px',
      border:       '1px solid var(--border)',
      boxShadow:    'var(--shadow-card)',
      position:     'relative',
      overflow:     'hidden',
      cursor:       'default',
    }}
  >
    {/* Colored top bar */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, ${color}, ${color}88)`,
      borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
    }} />

    {/* Background glow */}
    <div style={{
      position: 'absolute', bottom: -30, right: -20,
      width: 120, height: 120, borderRadius: '50%',
      background: `${color}12`, filter: 'blur(30px)',
      pointerEvents: 'none',
    }} />

    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${color}20`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={19} color={color} />
      </div>
      {trend !== undefined && (
        <span style={{
          fontSize: 'var(--text-xs)', fontWeight: 700,
          color: trend >= 0 ? '#10b981' : '#ef4444',
          background: trend >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${trend >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          padding: '3px 8px', borderRadius: 99,
        }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>

    <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, position: 'relative' }}>
      <AnimatedNumber value={value} />{suffix}
    </div>
    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>{label}</div>

    {/* Accent line */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
    }} />
  </motion.div>
);

/* ── Custom tooltip for charts ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ fontSize: 'var(--text-sm)', color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const STATUS_COLORS = {
  wishlist:  '#6366f1',
  applied:   '#0ea5e9',
  interview: '#f59e0b',
  offer:     '#10b981',
  rejected:  '#ef4444',
};

const Dashboard = () => {
  const { user }   = useAuth();
  const { on }     = useSocket();
  const { isDark } = useTheme();

  const [stats,    setStats]    = useState(null);
  const [charts,   setCharts]   = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);

  /* ── Fetch dashboard data ── */
  const fetchData = async () => {
    try {
      const [s, c, a] = await Promise.all([
        dashboardAPI.stats(),
        dashboardAPI.charts(),
        dashboardAPI.activity(),
      ]);
      setStats(s.data.data);
      setCharts(c.data.data);
      setActivity(a.data.data?.recentActivity || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Live updates via socket ── */
  useEffect(() => {
    const cleanup1 = on('application:updated', fetchData);
    const cleanup2 = on('task:updated', fetchData);
    return () => { cleanup1?.(); cleanup2?.(); };
  }, [on]);

  const axisStyle = { fill: 'var(--text-muted)', fontSize: 11 };
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  /* ── Stat card definitions ── */
  const statCards = stats
    ? [
        { icon: FiBriefcase,   label: 'Total Applications', value: stats.totalApplications,  color: '#6366f1', delay: 0.0 },
        { icon: FiCalendar,    label: 'Interviews',          value: stats.interviews,          color: '#f59e0b', delay: 0.1 },
        { icon: FiTrendingUp,  label: 'Offers Received',     value: stats.offers,             color: '#10b981', delay: 0.2 },
        { icon: FiCheckSquare, label: 'Tasks Due Today',      value: stats.tasksDueToday,      color: '#a855f7', delay: 0.3 },
        { icon: FiClock,       label: 'Overdue Tasks',        value: stats.overdueTasks,       color: '#ef4444', delay: 0.4 },
        { icon: FiActivity,    label: 'Success Rate',         value: stats.successRate ?? 0,   color: '#0ea5e9', suffix: '%', delay: 0.5 },
      ]
    : [];

  return (
    <div>
      {/* ── Greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 4 }}>
          {timeGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Here's what's happening with your job search today.
        </p>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonStatCard key={i} />)
          : statCards.map((card) => <StatCard key={card.label} {...card} />)
        }
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 24 }}>

        {/* Applications over time */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 20 }}>
            Applications Over Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={charts?.applicationsByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} name="Applications" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status distribution donut */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 20 }}>
            Status Breakdown
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie
                  data={charts?.statusDistribution || []}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  dataKey="count"
                  paddingAngle={3}
                >
                  {(charts?.statusDistribution || []).map((entry) => (
                    <Cell key={entry._id} fill={STATUS_COLORS[entry._id] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(charts?.statusDistribution || []).map((entry) => (
                <div key={entry._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLORS[entry._id] || '#94a3b8' }} />
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{entry._id}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Weekly activity bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 20 }}>
            Weekly Activity
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts?.weeklyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="applications" fill="url(#barGrad)" radius={[6, 6, 0, 0]} name="Apps" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Conversion funnel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 20 }}>
            Conversion Funnel
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Applied',   value: stats?.totalApplications ?? 0,  color: '#0ea5e9' },
              { label: 'Interview', value: stats?.interviews ?? 0,          color: '#f59e0b' },
              { label: 'Offer',     value: stats?.offers ?? 0,              color: '#10b981' },
            ].map(({ label, value, color }, i, arr) => {
              const pct = arr[0].value > 0 ? Math.round((value / arr[0].value) * 100) : 0;
              const width = i === 0 ? 100 : Math.max(10, pct);
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                  <div style={{ height: 28, background: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      style={{ height: '100%', background: color, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}
                    >
                      <span style={{ fontSize: 'var(--text-xs)', color: '#fff', fontWeight: 600 }}>
                        {i > 0 ? `${pct}%` : ''}
                      </span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Activity ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', margin: 0 }}>
            Recent Activity
          </h3>
          <Link to={ROUTES.APPLICATIONS} style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {activity.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No recent activity"
            message="Your activity feed will appear here once you start tracking applications."
            style={{ padding: '32px' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activity.slice(0, 8).map((item, i) => (
              <div
                key={item._id || i}
                style={{
                  display:      'flex',
                  alignItems:   'flex-start',
                  gap:          14,
                  padding:      '12px 0',
                  borderBottom: i < activity.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}
              >
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    flexShrink: 0,
                  }} />
                  {i < activity.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 20, background: 'var(--border)', marginTop: 4 }} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 2 }}>
                    <strong style={{ fontWeight: 600 }}>{item.action || 'Updated'}</strong>
                    {item.target && ` — ${item.target}`}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {timeAgo(item.createdAt || item.timestamp)}
                  </div>
                </div>

                {item.metadata?.status && (
                  <Badge variant={item.metadata.status === 'offer' ? 'success' : item.metadata.status === 'rejected' ? 'danger' : 'primary'}>
                    {item.metadata.status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
