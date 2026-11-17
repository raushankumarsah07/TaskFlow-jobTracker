// ─────────────────────────────────────────
//  TaskFlow – General helpers
// ─────────────────────────────────────────

/**
 * Get initials from a full name or company name.
 * "Google LLC" → "GL"
 */
export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

/**
 * Format a Date (or ISO string) as "Nov 17, 2026"
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
};

/**
 * Format a Date as "Nov 17, 2026 at 3:45 PM"
 */
export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month:  'short',
    day:    'numeric',
    year:   'numeric',
    hour:   'numeric',
    minute: '2-digit',
  });
};

/**
 * Returns true if the given date is in the past.
 */
export const isOverdue = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Returns the number of days until `date` (negative = overdue).
 */
export const daysUntil = (date) => {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Clamp a number between min and max.
 */
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/**
 * Debounce utility (plain JS, hook version lives in useDebounce).
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Truncate a string to `maxLen` characters with an ellipsis.
 */
export const truncate = (str = '', maxLen = 60) =>
  str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;

/**
 * Convert an array of objects to a CSV string.
 */
export const toCSV = (rows, keys) => {
  const header = keys.join(',');
  const body   = rows
    .map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(','))
    .join('\n');
  return `${header}\n${body}`;
};

/**
 * Download a string as a file.
 */
export const downloadFile = (content, filename, mime = 'text/csv') => {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Generate a deterministic pastel background from a string.
 */
export const stringToColor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 55%)`;
};

/**
 * Map priority → Bootstrap / CSS class name suffix.
 */
export const priorityClass = (priority) =>
  ({ low: 'success', medium: 'warning', high: 'orange', urgent: 'danger' }[priority] ?? 'secondary');

/**
 * Greeting based on the current hour.
 */
export const timeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Sleep for `ms` milliseconds (for demos / stagger).
 */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
