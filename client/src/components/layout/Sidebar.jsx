/* ============================================================
   TaskFlow – Sidebar Component
   ============================================================ */
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiBriefcase, FiCheckSquare, FiCalendar, FiBarChart2,
  FiUser, FiSettings, FiLogOut, FiChevronLeft, FiChevronRight,
  FiZap, FiActivity,
} from 'react-icons/fi';
import { useAuth }  from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { ROUTES, SIDEBAR_KEY } from '../../utils/constants.js';
import { getInitials, stringToColor } from '../../utils/helpers.js';
import useLocalStorage from '../../hooks/useLocalStorage.js';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD,    icon: FiGrid,       label: 'Dashboard',    shortcut: '1' },
  { to: ROUTES.APPLICATIONS, icon: FiBriefcase,  label: 'Applications', shortcut: '2' },
  { to: ROUTES.TASKS,        icon: FiCheckSquare,label: 'Tasks',        shortcut: '3' },
  { to: ROUTES.CALENDAR,     icon: FiCalendar,   label: 'Calendar',     shortcut: '4' },
  { to: ROUTES.ANALYTICS,    icon: FiBarChart2,  label: 'Analytics',    shortcut: '5' },
  { to: '/activity',         icon: FiActivity,   label: 'Activity',     shortcut: null },
];

const BOTTOM_ITEMS = [
  { to: ROUTES.PROFILE,  icon: FiUser,     label: 'Profile'  },
  { to: ROUTES.SETTINGS, icon: FiSettings, label: 'Settings' },
];

const Sidebar = () => {
  const { user, logout }     = useAuth();
  const { isDark }           = useTheme();
  const [collapsed, setCollapsed] = useLocalStorage(SIDEBAR_KEY, false);
  const location = useLocation();

  /* Close sidebar on mobile nav (via custom event) */
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const handler = () => setMobileOpen((o) => !o);
    window.addEventListener('sidebar:toggle', handler);
    return () => window.removeEventListener('sidebar:toggle', handler);
  }, []);

  /* Close on route change (mobile) */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const width = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 299,
          }}
          className="d-md-none"
        />
      )}

      <motion.aside
        animate={{ width }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={mobileOpen ? '' : 'd-none d-md-flex'}
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          height:          '100vh',
          width,
          background:      'var(--sidebar-bg)',
          borderRight:     '1px solid rgba(255,255,255,0.06)',
          display:         'flex',
          flexDirection:   'column',
          zIndex:          300,
          overflow:        'hidden',
          boxShadow:       '4px 0 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '20px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            minHeight: 'var(--navbar-height)',
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FiZap color="#fff" size={18} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily:  'var(--font-heading)',
                  fontWeight:  800,
                  fontSize:    '1.25rem',
                  color:       '#fff',
                  whiteSpace:  'nowrap',
                  background:  'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TaskFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label, shortcut }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display:        'flex',
                alignItems:     'center',
                gap:            '12px',
                padding:        '10px 12px',
                borderRadius:   'var(--radius-md)',
                color:          isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                background:     isActive ? 'var(--gradient-primary)' : 'transparent',
                boxShadow:      isActive ? 'var(--shadow-primary)' : 'none',
                marginBottom:   4,
                textDecoration: 'none',
                fontSize:       'var(--text-sm)',
                fontWeight:     isActive ? 600 : 400,
                transition:     'all 0.2s ease',
                whiteSpace:     'nowrap',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.style.background.includes('gradient'))
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.className.includes('active')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Bottom items */}
        <div style={{ padding: '8px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display:      'flex',
                alignItems:   'center',
                gap:          '12px',
                padding:      '10px 12px',
                borderRadius: 'var(--radius-md)',
                color:        isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                background:   isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                marginBottom: 4,
                textDecoration: 'none',
                fontSize:     'var(--text-sm)',
                whiteSpace:   'nowrap',
                transition:   'all 0.2s ease',
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}

          {/* User avatar + name */}
          <div
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         '10px',
              padding:     '10px 12px',
              marginTop:   8,
              borderRadius:'var(--radius-md)',
              cursor:      'pointer',
            }}
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: stringToColor(user?.name || 'U'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.75rem', fontWeight: 700, color: '#fff',
              }}
            >
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : getInitials(user?.name || 'User')}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ overflow: 'hidden', flex: 1 }}
                >
                  <div style={{ color: '#fff', fontSize: 'var(--text-sm)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         '12px',
              padding:     '10px 12px',
              borderRadius:'var(--radius-md)',
              color:       'rgba(255,255,255,0.45)',
              background:  'transparent',
              border:      'none',
              width:       '100%',
              cursor:      'pointer',
              fontSize:    'var(--text-sm)',
              whiteSpace:  'nowrap',
              transition:  'all 0.2s ease',
              marginBottom:8,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <FiLogOut size={18} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              display:     'flex',
              alignItems:  'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap:         '12px',
              padding:     '10px 12px',
              borderRadius:'var(--radius-md)',
              color:       'rgba(255,255,255,0.35)',
              background:  'transparent',
              border:      'none',
              width:       '100%',
              cursor:      'pointer',
              fontSize:    'var(--text-sm)',
              transition:  'all 0.2s ease',
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
            {!collapsed && <span style={{ opacity: 0.5 }}>Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
