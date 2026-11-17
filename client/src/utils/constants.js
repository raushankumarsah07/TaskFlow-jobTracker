// ─────────────────────────────────────────
//  TaskFlow – App-wide constants
// ─────────────────────────────────────────

export const APP_NAME = 'TaskFlow';

export const ROUTES = {
  HOME:         '/',
  LOGIN:        '/login',
  REGISTER:     '/register',
  DASHBOARD:    '/dashboard',
  APPLICATIONS: '/applications',
  TASKS:        '/tasks',
  CALENDAR:     '/calendar',
  ANALYTICS:    '/analytics',
  PROFILE:      '/profile',
  SETTINGS:     '/settings',
  NOT_FOUND:    '*',
};

export const APPLICATION_STATUS = {
  WISHLIST:  'wishlist',
  APPLIED:   'applied',
  INTERVIEW: 'interview',
  OFFER:     'offer',
  REJECTED:  'rejected',
};

export const APPLICATION_STATUS_LABELS = {
  wishlist:  'Wishlist',
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
};

export const APPLICATION_STATUS_COLORS = {
  wishlist:  'var(--status-wishlist)',
  applied:   'var(--status-applied)',
  interview: 'var(--status-interview)',
  offer:     'var(--status-offer)',
  rejected:  'var(--status-rejected)',
};

export const KANBAN_COLUMNS = [
  { id: 'wishlist',  label: 'Wishlist',  color: 'var(--status-wishlist)' },
  { id: 'applied',   label: 'Applied',   color: 'var(--status-applied)' },
  { id: 'interview', label: 'Interview', color: 'var(--status-interview)' },
  { id: 'offer',     label: 'Offer',     color: 'var(--status-offer)' },
  { id: 'rejected',  label: 'Rejected',  color: 'var(--status-rejected)' },
];

export const PRIORITY_LEVELS = {
  LOW:    'low',
  MEDIUM: 'medium',
  HIGH:   'high',
  URGENT: 'urgent',
};

export const PRIORITY_COLORS = {
  low:    'var(--priority-low)',
  medium: 'var(--priority-medium)',
  high:   'var(--priority-high)',
  urgent: 'var(--priority-urgent)',
};

export const PRIORITY_LABELS = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
  urgent: 'Urgent',
};

export const TASK_STATUS = {
  TODO:        'todo',
  IN_PROGRESS: 'in-progress',
  DONE:        'done',
};

export const TASK_STATUS_LABELS = {
  todo:        'To Do',
  'in-progress': 'In Progress',
  done:        'Done',
};

export const JOB_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

export const RECURRENCE_OPTIONS = [
  { value: 'none',    label: 'None' },
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const PAGE_SIZE = 10;

export const TOKEN_KEY  = 'tf_access_token';
export const THEME_KEY  = 'tf_theme';
export const SIDEBAR_KEY = 'tf_sidebar_collapsed';
