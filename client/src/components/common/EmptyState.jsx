/**
 * EmptyState – shown when a list/board has no items.
 * Props:
 *  icon      – emoji or React element
 *  title     – heading text
 *  message   – body text
 *  action    – { label, onClick } button
 */
const EmptyState = ({
  icon   = '📭',
  title  = 'Nothing here yet',
  message = 'Get started by creating your first item.',
  action,
  style  = {},
}) => (
  <div
    className="d-flex flex-column align-items-center justify-content-center text-center fade-in"
    style={{ padding: '64px 24px', ...style }}
  >
    <div style={{ fontSize: '4rem', marginBottom: '20px', lineHeight: 1 }}>{icon}</div>
    <h3
      style={{
        fontFamily:   'var(--font-heading)',
        fontWeight:   700,
        fontSize:     'var(--text-xl)',
        color:        'var(--text-primary)',
        marginBottom: '8px',
      }}
    >
      {title}
    </h3>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '340px', marginBottom: action ? '24px' : 0 }}>
      {message}
    </p>
    {action && (
      <button className="btn btn-gradient px-4 py-2" onClick={action.onClick}>
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
