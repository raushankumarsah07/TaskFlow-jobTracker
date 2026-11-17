/* ============================================================
   TaskFlow – Activity Log Page (audit trail)
   ============================================================ */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI } from '../api/dashboard.api.js';
import { timeAgo } from '../utils/formatters.js';
import { SkeletonLine } from '../components/common/SkeletonLoader.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const ACTION_ICONS = {
  created:  { icon: '✨', color: '#10b981' },
  updated:  { icon: '✏️', color: '#6366f1' },
  deleted:  { icon: '🗑️', color: '#ef4444' },
  status_changed: { icon: '🔄', color: '#f59e0b' },
  completed:{ icon: '✅', color: '#10b981' },
  default:  { icon: '📋', color: '#94a3b8' },
};

const ActivityItem = ({ item, index }) => {
  const actionKey = item.action?.toLowerCase().includes('creat') ? 'created'
    : item.action?.toLowerCase().includes('delet') ? 'deleted'
    : item.action?.toLowerCase().includes('status') ? 'status_changed'
    : item.action?.toLowerCase().includes('complet') ? 'completed'
    : item.action?.toLowerCase().includes('updat') ? 'updated'
    : 'default';

  const { icon, color } = ACTION_ICONS[actionKey];

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      style={{
        display: 'flex',
        gap: 14,
        padding: '14px 0',
        borderBottom: '1px solid var(--border-light)',
        alignItems: 'flex-start',
      }}
    >
      {/* Timeline column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
        }}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>{item.action || 'Activity'}</span>
          {item.target && (
            <span style={{ color: 'var(--text-secondary)' }}> — {item.target}</span>
          )}
        </div>
        {item.metadata?.from && item.metadata?.to && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>
            Status: <Badge variant="muted" size="xs">{item.metadata.from}</Badge>
            {' → '}
            <Badge
              variant={item.metadata.to === 'offer' ? 'success' : item.metadata.to === 'rejected' ? 'danger' : 'primary'}
              size="xs"
            >
              {item.metadata.to}
            </Badge>
          </div>
        )}
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {timeAgo(item.createdAt || item.timestamp)}
        </div>
      </div>

      {/* Entity type badge */}
      <Badge
        variant={item.entityType === 'JobApplication' ? 'primary' : item.entityType === 'Task' ? 'info' : 'muted'}
        size="xs"
      >
        {item.entityType === 'JobApplication' ? '💼 Application' : item.entityType === 'Task' ? '✅ Task' : item.entityType || 'Event'}
      </Badge>
    </motion.div>
  );
};

const ActivityLog = () => {
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(true);

  const fetchActivity = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await dashboardAPI.activity({ page: p, limit: 20 });
      const items = data.data?.recentActivity || data.data?.activity || [];
      if (p === 1) {
        setActivity(items);
      } else {
        setActivity((prev) => [...prev, ...items]);
      }
      setHasMore(items.length === 20);
    } catch (err) {
      console.error('Activity fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivity(1); }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivity(nextPage);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 4 }}>
          Activity Log
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          A full audit trail of your TaskFlow activity
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px',
        }}
      >
        {loading && activity.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <SkeletonLine width="55%" height="0.875rem" className="mb-2" />
                  <SkeletonLine width="30%" height="0.75rem" />
                </div>
              </div>
            ))}
          </div>
        ) : activity.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No activity yet"
            message="Your activity will appear here as you use TaskFlow."
            style={{ padding: '48px 24px' }}
          />
        ) : (
          <>
            {activity.map((item, i) => (
              <ActivityItem key={item._id || i} item={item} index={i} />
            ))}

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  onClick={loadMore}
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: 'var(--text-sm)',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {loading ? <span className="spinner-border spinner-border-sm" /> : null}
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ActivityLog;
