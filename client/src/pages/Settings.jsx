/* ============================================================
   TaskFlow – Settings Page
   ============================================================ */
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiMonitor, FiBell, FiShield, FiDatabase } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext.jsx';
import toast from 'react-hot-toast';

const SettingRow = ({ icon: Icon, title, description, children }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 0',
    borderBottom: '1px solid var(--border-light)',
    gap: 16,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'rgba(99,102,241,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} color="var(--primary-500)" />
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>
      </div>
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button
    onClick={onChange}
    style={{
      width: 48, height: 26, borderRadius: 13,
      background: value ? 'var(--gradient-primary)' : 'var(--border)',
      border: 'none', cursor: 'pointer', position: 'relative',
      transition: 'background 0.3s',
    }}
    aria-checked={value}
    role="switch"
  >
    <div style={{
      position: 'absolute',
      top: 3, left: value ? 25 : 3,
      width: 20, height: 20, borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      transition: 'left 0.3s',
    }} />
  </button>
);

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Customize your TaskFlow experience</p>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '24px 28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', marginBottom: 24 }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 8, fontSize: 'var(--text-base)' }}>Appearance</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 8 }}>Choose your preferred color scheme</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
          {[
            { id: 'light', icon: FiSun,     label: 'Light'  },
            { id: 'dark',  icon: FiMoon,    label: 'Dark'   },
            { id: 'system',icon: FiMonitor, label: 'System' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { if (id !== 'system') { if (theme !== id) toggleTheme(); } }}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${theme === id ? 'var(--primary-500)' : 'var(--border)'}`,
                background: theme === id ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <Icon size={20} color={theme === id ? 'var(--primary-500)' : 'var(--text-muted)'} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: theme === id ? 'var(--primary-500)' : 'var(--text-secondary)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications & Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '24px 28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', marginBottom: 24 }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 0, fontSize: 'var(--text-base)' }}>Preferences</h3>
        <SettingRow icon={FiBell} title="Deadline Reminders" description="Get notified 24h before application deadlines">
          <Toggle value={true} onChange={() => toast('Preference saved!')} />
        </SettingRow>
        <SettingRow icon={FiBell} title="Interview Reminders" description="Get alerts before scheduled interviews">
          <Toggle value={true} onChange={() => toast('Preference saved!')} />
        </SettingRow>
        <SettingRow icon={FiBell} title="Activity Digest" description="Daily summary email at 8:00 AM">
          <Toggle value={false} onChange={() => toast('Preference saved!')} />
        </SettingRow>
        <SettingRow icon={FiShield} title="Two-Factor Authentication" description="Add an extra layer of security (coming soon)">
          <span style={{ fontSize: 'var(--text-xs)', background: 'rgba(99,102,241,0.1)', color: 'var(--primary-500)', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>
            Coming soon
          </span>
        </SettingRow>
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ background: 'rgba(239,68,68,0.04)', borderRadius: 'var(--radius-xl)', padding: '24px 28px', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 8, fontSize: 'var(--text-base)', color: 'var(--danger)' }}>
          Danger Zone
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
          These actions are irreversible. Please be certain.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => toast.error('Export coming soon')}
            style={{
              padding: '10px 20px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', background: 'var(--bg-primary)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <FiDatabase size={14} /> Export My Data
          </button>
          <button
            onClick={() => { if (window.confirm('Delete ALL your data? This cannot be undone.')) toast.error('Data deletion coming soon'); }}
            style={{
              padding: '10px 20px', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)',
              color: 'var(--danger)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500,
            }}
          >
            Delete Account &amp; Data
          </button>
        </div>
      </motion.div>

      {/* ── Keyboard Shortcuts ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)', padding: '24px 28px',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 16, fontSize: 'var(--text-base)' }}>
          ⌨️ Keyboard Shortcuts
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {[
            { keys: ['N'],       desc: 'New task' },
            { keys: ['A'],       desc: 'New application' },
            { keys: ['⌘', 'K'], desc: 'Open command palette' },
            { keys: ['Esc'],     desc: 'Close modal / palette' },
            { keys: ['1'],       desc: 'Go to Dashboard' },
            { keys: ['2'],       desc: 'Go to Applications' },
            { keys: ['3'],       desc: 'Go to Tasks' },
            { keys: ['4'],       desc: 'Go to Calendar' },
            { keys: ['5'],       desc: 'Go to Analytics' },
          ].map(({ keys, desc }) => (
            <div key={desc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{desc}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {keys.map((k) => (
                  <kbd key={k} style={{
                    display: 'inline-block', padding: '2px 8px',
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    borderRadius: 6, fontSize: '0.72rem', fontFamily: 'monospace',
                    fontWeight: 600, color: 'var(--text-primary)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                  }}>{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
