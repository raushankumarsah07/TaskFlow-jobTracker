/* ============================================================
   TaskFlow – Bottom navigation bar (mobile only)
   ============================================================ */
import { NavLink } from 'react-router-dom';
import { FiGrid, FiBriefcase, FiCheckSquare, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { ROUTES } from '../../utils/constants.js';

const ITEMS = [
  { to: ROUTES.DASHBOARD,    icon: FiGrid,        label: 'Home'    },
  { to: ROUTES.APPLICATIONS, icon: FiBriefcase,   label: 'Jobs'    },
  { to: ROUTES.TASKS,        icon: FiCheckSquare, label: 'Tasks'   },
  { to: ROUTES.CALENDAR,     icon: FiCalendar,    label: 'Calendar'},
  { to: ROUTES.ANALYTICS,    icon: FiBarChart2,   label: 'Stats'   },
];

const MobileNav = () => (
  <nav
    style={{
      position:    'fixed',
      bottom:      0,
      left:        0,
      right:       0,
      height:      64,
      background:  'var(--glass-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop:   '1px solid var(--border)',
      display:     'flex',
      alignItems:  'center',
      justifyContent: 'space-around',
      zIndex:      200,
    }}
    className="d-flex d-md-none"
  >
    {ITEMS.map(({ to, icon: Icon, label }) => (
      <NavLink
        key={to}
        to={to}
        style={({ isActive }) => ({
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          gap:            2,
          color:          isActive ? 'var(--primary-500)' : 'var(--text-muted)',
          textDecoration: 'none',
          fontSize:       '0.6rem',
          fontWeight:     isActive ? 600 : 400,
          padding:        '6px 12px',
          transition:     'var(--transition-fast)',
        })}
      >
        {({ isActive }) => (
          <>
            <Icon size={isActive ? 22 : 20} />
            <span>{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export default MobileNav;
