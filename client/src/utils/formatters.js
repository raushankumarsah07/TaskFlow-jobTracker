// ─────────────────────────────────────────
//  TaskFlow – Value formatters
// ─────────────────────────────────────────

/** Format salary range: { min: 80000, max: 120000, currency: 'USD' } → "$80k – $120k" */
export const formatSalary = (range) => {
  if (!range) return '—';
  const { min, max, currency = 'USD' } = range;
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  const fmt = (n) => (n >= 1000 ? `${symbol}${Math.round(n / 1000)}k` : `${symbol}${n}`);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return '—';
};

/** Format a large number: 1200 → "1.2k" */
export const formatCount = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000)      return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

/** Format a percentage: 0.75 → "75%" or 75 → "75%" */
export const formatPct = (n) => `${Math.round(Number(n) * (n <= 1 ? 100 : 1))}%`;

/** Format relative time: "3 days ago" / "in 2 hours" */
export const timeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const abs  = Math.abs(diff);
  const past = diff > 0;

  const units = [
    [60_000,       'minute',  60_000],
    [3_600_000,    'hour',    3_600_000],
    [86_400_000,   'day',     86_400_000],
    [604_800_000,  'week',    604_800_000],
    [2_592_000_000,'month',   2_592_000_000],
    [Infinity,     'year',    31_536_000_000],
  ];

  for (const [limit, unit, divisor] of units) {
    if (abs < limit) {
      const n = Math.round(abs / divisor);
      const label = `${n} ${unit}${n !== 1 ? 's' : ''}`;
      return past ? `${label} ago` : `in ${label}`;
    }
  }
  return '';
};

/** Capitalize first letter */
export const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);
