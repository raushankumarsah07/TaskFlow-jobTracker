/**
 * Reusable Badge component.
 * variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted'
 * dot: show a colored dot before the label
 */
const Badge = ({
  children,
  variant  = 'primary',
  dot      = false,
  size     = 'sm',
  className = '',
  style     = {},
}) => {
  const colorMap = {
    primary:  { bg: 'rgba(99,102,241,0.15)',  color: 'var(--primary-600)' },
    success:  { bg: 'rgba(16,185,129,0.15)',  color: '#059669' },
    warning:  { bg: 'rgba(245,158,11,0.15)',  color: '#d97706' },
    danger:   { bg: 'rgba(239,68,68,0.15)',   color: '#dc2626' },
    info:     { bg: 'rgba(14,165,233,0.15)',  color: '#0284c7' },
    muted:    { bg: 'rgba(148,163,184,0.15)', color: 'var(--text-muted)' },
    orange:   { bg: 'rgba(249,115,22,0.15)',  color: '#ea580c' },
  };
  const { bg, color } = colorMap[variant] ?? colorMap.primary;

  return (
    <span
      className={`tf-badge ${className}`}
      style={{
        background:  bg,
        color:       color,
        fontSize:    size === 'xs' ? '0.65rem' : 'var(--text-xs)',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: color, display: 'inline-block', flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
