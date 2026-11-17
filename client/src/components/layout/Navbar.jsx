/* ============================================================
   TaskFlow – Top Navbar
   ============================================================ */
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiSearch, FiSun, FiMoon, FiMenu,
  FiUser, FiSettings, FiLogOut, FiCheck, FiTrash2,
} from 'react-icons/fi';
import { useAuth }          from '../../context/AuthContext.jsx';
import { useTheme }         from '../../context/ThemeContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { ROUTES }           from '../../utils/constants.js';
import { getInitials, stringToColor } from '../../utils/helpers.js';
import { timeAgo } from '../../utils/formatters.js';

const Navbar = ({ onMobileMenuToggle }) => {
  const { user, logout }                                    = useAuth();
  const { theme, toggleTheme, isDark }                      = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const [showNotifs,  setShowNotifs]  = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifsRef  = useRef(null);
  const profileRef = useRef(null);
  const searchRef  = useRef(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (!notifsRef.current?.contains(e.target))   setShowNotifs(false);
      if (!profileRef.current?.contains(e.target))  setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Keyboard shortcut: Ctrl+K = open search */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.APPLICATIONS}?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      style={{
        position:    'fixed',
        top:         0,
        right:       0,
        left:        0,
        height:      'var(--navbar-height)',
        background:  'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom:'1px solid var(--border)',
        display:     'flex',
        alignItems:  'center',
        padding:     '0 24px',
        gap:         '12px',
        zIndex:      'var(--z-sticky)',
        transition:  'background 0.3s ease',
      }}
    >
      {/* Mobile hamburger */}
      <button
        className="btn btn-sm d-md-none"
        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: '8px' }}
        onClick={onMobileMenuToggle}
        aria-label="Toggle menu"
      >
        <FiMenu size={22} />
      </button>

      {/* Search bar */}
      <div style={{ flex: 1, maxWidth: 460, position: 'relative' }}>
        {searchOpen ? (
          <form onSubmit={handleSearch}>
            <div style={{ position: 'relative' }}>
              <FiSearch
                style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }}
              />
              <input
                ref={searchRef}
                type="text"
                className="form-control"
                placeholder="Search applications, tasks…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 38, paddingRight: 60 }}
                autoFocus
              />
              <span
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.7rem', color: 'var(--text-muted)',
                  background: 'var(--bg-tertiary)',
                  padding: '2px 6px', borderRadius: 4,
                }}
              >
                ESC
              </span>
            </div>
          </form>
        ) : (
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         8,
              background:  'var(--bg-tertiary)',
              border:      '1px solid var(--border)',
              borderRadius:'var(--radius-md)',
              padding:     '8px 14px',
              color:       'var(--text-muted)',
              cursor:      'pointer',
              fontSize:    'var(--text-sm)',
              width:       '100%',
              textAlign:   'left',
              transition:  'var(--transition-fast)',
            }}
            aria-label="Open search (Ctrl+K)"
          >
            <FiSearch size={16} />
            <span>Search…</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.7rem',
                background: 'var(--bg-primary)',
                padding: '2px 6px',
                borderRadius: 4,
                border: '1px solid var(--border)',
              }}
            >
              ⌘K
            </span>
          </button>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-secondary)',
          transition: 'var(--transition-fast)',
          flexShrink: 0,
        }}
        aria-label="Toggle theme"
      >
        {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
      </button>

      {/* Notifications */}
      <div ref={notifsRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowNotifs((s) => !s); setShowProfile(false); }}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
            position: 'relative', flexShrink: 0,
          }}
          aria-label="Notifications"
        >
          <FiBell size={16} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute', top: -2, right: -2,
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--danger)',
                color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-primary)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                width: 360, maxHeight: 480, overflowY: 'auto',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 'var(--z-dropdown)',
              }}
            >
              <div
                style={{
                  padding: '16px 20px 12px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)' }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span
                      style={{
                        marginLeft: 8,
                        background: 'rgba(99,102,241,0.15)', color: 'var(--primary-500)',
                        fontSize: '0.7rem', fontWeight: 700,
                        padding: '1px 7px', borderRadius: 99,
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ background: 'none', border: 'none', fontSize: 'var(--text-xs)', color: 'var(--primary-500)', cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                  <div>All caught up!</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    style={{
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--border-light)',
                      background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: n.read ? 'transparent' : 'var(--primary-500)',
                        marginTop: 6, flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 2 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {!n.read && (
                        <button
                          onClick={() => markRead(n._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                          aria-label="Mark read"
                        >
                          <FiCheck size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                        aria-label="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile dropdown */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowProfile((s) => !s); setShowNotifs(false); }}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: stringToColor(user?.name || 'U'),
            border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
            fontWeight: 700, fontSize: '0.75rem',
            overflow: 'hidden', flexShrink: 0,
          }}
          aria-label="Profile menu"
        >
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : getInitials(user?.name || 'U')}
        </button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                width: 240,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 'var(--z-dropdown)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              {[
                { icon: FiUser,     label: 'Profile',  to: ROUTES.PROFILE  },
                { icon: FiSettings, label: 'Settings', to: ROUTES.SETTINGS },
              ].map(({ icon: Icon, label, to }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setShowProfile(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 20px', fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)', textDecoration: 'none',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <button
                onClick={() => { logout(); setShowProfile(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 20px', fontSize: 'var(--text-sm)',
                  color: 'var(--danger)', background: 'none', border: 'none',
                  width: '100%', cursor: 'pointer', textAlign: 'left',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <FiLogOut size={15} />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
