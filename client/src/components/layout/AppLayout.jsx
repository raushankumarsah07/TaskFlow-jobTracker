/* ============================================================
   TaskFlow – App Layout (Sidebar + Navbar + Page Content)
   Wires: Command Palette, global keyboard shortcuts, keyboard-N modal
   ============================================================ */
import { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence }  from 'framer-motion';
import Sidebar       from './Sidebar.jsx';
import Navbar        from './Navbar.jsx';
import MobileNav     from './MobileNav.jsx';
import CommandPalette from '../common/CommandPalette.jsx';
import ApplicationModal from '../forms/ApplicationModal.jsx';
import TaskModal     from '../forms/TaskModal.jsx';
import useLocalStorage       from '../../hooks/useLocalStorage.js';
import useKeyboardShortcuts  from '../../hooks/useKeyboardShortcuts.js';
import { SIDEBAR_KEY, ROUTES } from '../../utils/constants.js';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const AppLayout = () => {
  const [collapsed] = useLocalStorage(SIDEBAR_KEY, false);
  const navigate    = useNavigate();

  const [paletteOpen,  setPaletteOpen]  = useState(false);
  const [newTaskOpen,  setNewTaskOpen]  = useState(false);
  const [newAppOpen,   setNewAppOpen]   = useState(false);

  /* ── Global keyboard shortcuts ── */
  useKeyboardShortcuts({
    'ctrl+k': () => setPaletteOpen((o) => !o),
    'n':      () => setNewTaskOpen(true),
    'a':      () => setNewAppOpen(true),
    'escape': () => { setPaletteOpen(false); setNewTaskOpen(false); setNewAppOpen(false); },
    '1':      () => navigate(ROUTES.DASHBOARD),
    '2':      () => navigate(ROUTES.APPLICATIONS),
    '3':      () => navigate(ROUTES.TASKS),
    '4':      () => navigate(ROUTES.CALENDAR),
    '5':      () => navigate(ROUTES.ANALYTICS),
  });

  const handleMobileMenu = () => {
    window.dispatchEvent(new CustomEvent('sidebar:toggle'));
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main
        className={`app-main${collapsed ? ' sidebar-collapsed' : ''}`}
        style={{ marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
      >
        <Navbar
          onMobileMenuToggle={handleMobileMenu}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <div className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <MobileNav />

      {/* Global modals */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNewTask={() => { setPaletteOpen(false); setNewTaskOpen(true); }}
        onNewApp={()  => { setPaletteOpen(false); setNewAppOpen(true);  }}
      />
      <TaskModal
        open={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        initialData={null}
        onSave={() => {}}
      />
      <ApplicationModal
        open={newAppOpen}
        onClose={() => setNewAppOpen(false)}
        initialData={null}
        onSave={() => {}}
      />
    </div>
  );
};

export default AppLayout;
