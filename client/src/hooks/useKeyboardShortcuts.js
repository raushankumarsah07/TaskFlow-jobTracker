/**
 * useKeyboardShortcuts – registers global keyboard shortcuts.
 *
 * Usage: call once in AppLayout or App.jsx with a shortcuts map:
 *   useKeyboardShortcuts({
 *     'n': () => openNewTaskModal(),
 *     '/': () => focusSearch(),
 *   });
 */
import { useEffect } from 'react';

const useKeyboardShortcuts = (shortcuts = {}) => {
  useEffect(() => {
    const handler = (e) => {
      // Skip when typing in an input / textarea / select / contenteditable
      const tag = e.target?.tagName?.toLowerCase();
      const isEditable = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable;
      if (isEditable && e.key !== 'Escape') return;

      // Build a key string like "ctrl+k", "shift+n", "escape"
      const parts = [];
      if (e.ctrlKey  || e.metaKey)  parts.push('ctrl');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey)   parts.push('alt');
      parts.push(e.key.toLowerCase());
      const combo = parts.join('+');

      const fn = shortcuts[combo] || shortcuts[e.key.toLowerCase()];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
};

export default useKeyboardShortcuts;
