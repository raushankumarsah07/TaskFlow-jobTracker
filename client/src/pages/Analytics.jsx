/* ============================================================
   TaskFlow – Analytics Page
   ============================================================ */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { dashboardAPI }   from '../api/dashboard.api.js';
import { applicationsAPI } from '../api/applications.api.js';
import { tasksAPI }        from '../api/tasks.api.js';
import { useTheme }        from '../context/ThemeContext.jsx';
import { SkeletonStatCard } from '../components/common/SkeletonLoader.jsx';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9'];

const SectionCard = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
      padding: '24px', border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)',
    }}
  >
    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 20 }}>
      {title}
    </h3>
    {children}
  </motion.div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ fontSize: 'var(--text-sm)', color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const { isDark } = useTheme();
  const [appStats,  setAppStats]  = useState(null);
  const [taskStats, setTaskStats] = useState(null);
  const [charts,    setCharts]    = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.charts(),
      applicationsAPI.stats(),
      tasksAPI.stats(),
    ]).then(([c, a, t]) => {
      setCharts(c.data.data);
      setAppStats(a.data.data);
      setTaskStats(t.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const axisStyle = { fill: 'var(--text-muted)', fontSize: 11 };
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  const STATUS_COLORS = {
    wishlist: '#6366f1', applied: '#0ea5e9',
    interview: '#f59e0b', offer: '#10b981', rejected: '#ef4444',
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Insights into your job search performance</p>
      </motion.div>

      {/* Top KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Apps',  value: appStats?.total      ?? 0, color: '#6366f1' },
          { label: 'Interviews',  value: appStats?.interviews ?? 0, color: '#f59e0b' },
          { label: 'Offers',      value: appStats?.offers     ?? 0, color: '#10b981' },
          { label: 'Rejection Rate', value: `${appStats?.rejectionRate ?? 0}%`, color: '#ef4444' },
          { label: 'Total Tasks', value: taskStats?.total     ?? 0, color: '#a855f7' },
          { label: 'Completed',   value: taskStats?.done      ?? 0, color: '#0ea5e9' },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
              padding: '20px', border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: `${color}15`, filter: 'blur(16px)' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)' }}>{value}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
            <div style={{ height: 3, background: color, borderRadius: 2, marginTop: 12, width: '40%' }} />
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>

        {/* Applications over time */}
        <SectionCard title="Applications Over Time" delay={0.1}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={charts?.applicationsByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Applications" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Status distribution */}
        <SectionCard title="Status Distribution" delay={0.15}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={charts?.statusDistribution || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" paddingAngle={3}>
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
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: STATUS_COLORS[entry._id] }} />
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{entry._id}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Weekly activity */}
        <SectionCard title="Weekly Activity" delay={0.2}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts?.weeklyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="applications" fill="url(#anaGrad)" radius={[6, 6, 0, 0]} name="Applications" />
              <defs>
                <linearGradient id="anaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Task priority breakdown */}
        <SectionCard title="Task Priority Breakdown" delay={0.25}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart layout="vertical" data={[
              { name: 'Low',    value: taskStats?.byPriority?.low    ?? 0, fill: '#22c55e' },
              { name: 'Medium', value: taskStats?.byPriority?.medium ?? 0, fill: '#f59e0b' },
              { name: 'High',   value: taskStats?.byPriority?.high   ?? 0, fill: '#f97316' },
              { name: 'Urgent', value: taskStats?.byPriority?.urgent ?? 0, fill: '#ef4444' },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {[
                  { fill: '#22c55e' }, { fill: '#f59e0b' },
                  { fill: '#f97316' }, { fill: '#ef4444' },
                ].map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );
};

export default Analytics;
