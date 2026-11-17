/**
 * useSoftDelete – wraps a delete function with a 5-second undo toast.
 *
 * Usage:
 *   const { softDelete } = useSoftDelete();
 *   softDelete({
 *     label: 'Application deleted',
 *     deleteFn: () => applicationsAPI.delete(id),
 *     onConfirm: () => refetch(),
 *   });
 */
import { useRef } from 'react';
import toast from 'react-hot-toast';

const useSoftDelete = () => {
  const timerRef = useRef(null);

  const softDelete = ({ label = 'Item deleted', deleteFn, onConfirm, onUndo }) => {
    let undone = false;

    const toastId = toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>{label}</span>
          <button
            onClick={() => {
              undone = true;
              toast.dismiss(t.id);
              clearTimeout(timerRef.current);
              onUndo?.();
              toast.success('Undo successful!');
            }}
            style={{
              background: 'var(--gradient-primary)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000, icon: '🗑️' }
    );

    timerRef.current = setTimeout(async () => {
      if (!undone) {
        try {
          await deleteFn();
          onConfirm?.();
        } catch {
          toast.error('Delete failed');
        }
      }
    }, 5100); // slightly after toast duration
  };

  return { softDelete };
};

export default useSoftDelete;
