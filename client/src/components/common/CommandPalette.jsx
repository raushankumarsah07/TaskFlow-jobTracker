/* ============================================================
   TaskFlow – Global Command Palette  (Ctrl+K / ⌘K)
   Renders as a portal modal overlay.
   ============================================================ */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal }  from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiGrid, FiBriefcase, FiCheckSquare,
  FiCalendar, FiBarChart2, FiUser, FiSettings,
  FiPlus, FiMoon, FiSun, FiLogOut,
} from 'react-icons/fi';
import { ROUTES } from '../../utils/constants.js';
import { useAuth }  from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

/* ── Static command palette items ── */
const makeItems = (navigate, logout, toggleTheme, isDark, openNewTask, openNewApp) => [
  {
    group: 'Navigate',
    items: [
      { icon: FiGrid,        label: 'Dashboard',    shortcut: null, action: () => navigate(ROUTES.DASHBOARD)    },
      { icon: FiBriefcase,   label: 'Applications', shortcut: null, action: () => navigate(ROUTES.APPLICATIONS) },
      { icon: FiCheckSquare, label: 'Tasks',         shortcut: null, action: () => navigate(ROUTES.TASKS)        },
      { icon: FiCalendar,    label: 'Calendar',      shortcut: null, action: () => navigate(ROUTES.CALENDAR)     },
      { icon: FiBarChart2,   label: 'Analytics',     shortcut: null, action: () => navigate(ROUTES.ANALYTICS)    },
      { icon: FiUser,        label: 'Profile',       shortcut: null, action: () => navigate(ROUTES.PROFILE)      },
      { icon: FiSettings,    label: 'Settings',      shortcut: null, action: () => navigate(ROUTES.SETTINGS)     },
    ],
  },
  {
    group: 'Create',
    items: [
      { icon: FiPlus, label: 'New Task',        shortcut: 'N', action: openNewTask },
      { icon: FiPlus, label: 'New Application', shortcut: 'A', action: openNewApp  },
    ],
  },
  {
    group: 'Actions',
    items: [
      {
        icon:    isDark ? FiSun : FiMoon,
        label:   isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        shortcut: 'T',
        action:  toggleTheme,
      },
      { icon: FiLogOut, label: 'Logout', shortcut: null, action: logout },
    ],
  },
];

const CommandPalette = ({ open, onClose, onNewTask, onNewApp }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const [query,   setQuery]   = useState('');
  const [cursor,  setCursor]  = useState(0);
  const inputRef  = useRef(null);

  const allItems = makeItems(navigate, logout, toggleTheme, isDark, onNewTask, onNewApp);

  /* Flatten filtered items */
  const filtered = allItems
    .map((group) => ({
      ...group,
      items: group.items.filter((it) =>
        it.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  const flatItems = filtered.flatMap((g) => g.items);

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* Keyboard navigation */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => (c + 1) % flatItems.length); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => (c - 1 + flatItems.length) % flatItems.length); }
      if (e.key === 'Enter')     { e.preventDefault(); flatItems[cursor]?.action(); onClose(); }
      if (e.key === 'Escape')    { onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, flatItems, cursor, onClose]);

  const runItem = useCallback((item) => {
    item.action();
    onClose();
  }, [onClose]);

  if (!open) return null;

  let flatIndex = 0;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 'var(--z-modal)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            style={{
              position:     'fixed',
              top:          '15%',
              left:         '50%',
              transform:    'translateX(-50%)',
              width:        '100%',
              maxWidth:     580,
              zIndex:       'calc(var(--z-modal) + 1)',
              background:   'var(--bg-card)',
              borderRadius: 'var(--radius-2xl)',
              border:       '1px solid var(--border)',
              boxShadow:    'var(--shadow-xl)',
              overflow:     'hidden',
            }}
          >
            {/* Search input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <FiSearch size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
                placeholder="Search pages, actions…"
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 'var(--text-base)', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <kbd style={{
                fontSize: 'var(--text-xs)', background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)', borderRadius: 4,
                padding: '2px 6px', color: 'var(--text-muted)',
              }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  No results for "{query}"
                </div>
              ) : (
                filtered.map((group) => (
                  <div key={group.group}>
                    <div style={{
                      padding: '6px 20px 4px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      {group.group}
                    </div>
                    {group.items.map((item) => {
                      const isActive = flatIndex === cursor;
                      const idx = flatIndex++;
                      return (
                        <button
                          key={item.label}
                          onClick={() => runItem(item)}
                          onMouseEnter={() => setCursor(idx)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            width: '100%', padding: '10px 20px',
                            border: 'none', cursor: 'pointer', textAlign: 'left',
                            background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                            color: isActive ? 'var(--primary-500)' : 'var(--text-primary)',
                            borderLeft: `3px solid ${isActive ? 'var(--primary-500)' : 'transparent'}`,
                            transition: 'all 0.1s',
                            fontSize: 'var(--text-sm)',
                          }}
                        >
                          <item.icon size={15} style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {item.shortcut && (
                            <kbd style={{
                              fontSize: '0.65rem', background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border)', borderRadius: 4,
                              padding: '2px 6px', color: 'var(--text-muted)',
                            }}>
                              {item.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '10px 20px',
              display: 'flex', gap: 16,
              fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
            }}>
              {[['↑↓', 'Navigate'], ['↵', 'Select'], ['Esc', 'Close']].map(([key, label]) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <kbd style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>{key}</kbd>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CommandPalette;
