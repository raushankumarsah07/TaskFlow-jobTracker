/* Skeleton loader component */
export const SkeletonLine = ({ width = '100%', height = '1rem', className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius: 'var(--radius-sm)' }}
    aria-hidden="true"
  />
);

export const SkeletonCard = () => (
  <div className="card-tf p-4 mb-3">
    <div className="d-flex gap-3 mb-3">
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="60%" height="1rem" className="mb-2" />
        <SkeletonLine width="40%" height="0.75rem" />
      </div>
    </div>
    <SkeletonLine height="0.75rem" className="mb-2" />
    <SkeletonLine width="80%" height="0.75rem" className="mb-2" />
    <SkeletonLine width="50%" height="0.75rem" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="d-flex gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <SkeletonLine width="25%" height="0.875rem" />
        <SkeletonLine width="20%" height="0.875rem" />
        <SkeletonLine width="15%" height="0.875rem" />
        <SkeletonLine width="15%" height="0.875rem" />
        <SkeletonLine width="10%" height="0.875rem" />
      </div>
    ))}
  </div>
);

export const SkeletonStatCard = () => (
  <div className="card-tf p-4">
    <SkeletonLine width="40%" height="0.75rem" className="mb-3" />
    <SkeletonLine width="55%" height="2rem" className="mb-2" />
    <SkeletonLine width="30%" height="0.75rem" />
  </div>
);

const SkeletonLoader = { SkeletonLine, SkeletonCard, SkeletonTable, SkeletonStatCard };
export default SkeletonLoader;
