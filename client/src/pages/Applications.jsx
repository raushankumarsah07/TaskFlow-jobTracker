/* ============================================================
   TaskFlow – Applications Page (Table + Kanban views)
   ============================================================ */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  FiPlus, FiGrid, FiList, FiSearch, FiFilter,
  FiDownload, FiEdit2, FiTrash2, FiExternalLink,
  FiMoreVertical, FiCalendar, FiMapPin, FiBriefcase,
} from 'react-icons/fi';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { applicationsAPI }   from '../api/applications.api.js';
import { useSocket }         from '../context/SocketContext.jsx';
import { useTheme }          from '../context/ThemeContext.jsx';
import useSoftDelete         from '../hooks/useSoftDelete.jsx';
import {
  KANBAN_COLUMNS, APPLICATION_STATUS_COLORS,
  PRIORITY_COLORS, PRIORITY_LABELS, PAGE_SIZE,
} from '../utils/constants.js';
import {
  getInitials, stringToColor, formatDate, isOverdue,
  daysUntil, downloadFile,
} from '../utils/helpers.js';
import Badge     from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { SkeletonCard } from '../components/common/SkeletonLoader.jsx';
import ApplicationModal from '../components/forms/ApplicationModal.jsx';
import useDebounce from '../hooks/useDebounce.js';

/* ───────────────────────────────────────────
   KANBAN CARD
─────────────────────────────────────────── */
const KanbanCard = ({ app, index, onEdit, onDelete }) => {
  const days = daysUntil(app.deadline);
  const over = days !== null && days < 0;

  return (
    <Draggable draggableId={app._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            background:    'var(--bg-card)',
            borderRadius:  'var(--radius-lg)',
            padding:       '16px',
            marginBottom:  12,
            border:        '1px solid var(--border)',
            boxShadow:     snapshot.isDragging ? 'var(--shadow-xl)' : 'var(--shadow-sm)',
            cursor:        'grab',
            transition:    'box-shadow 0.2s, transform 0.2s',
            transform:     snapshot.isDragging ? 'rotate(2deg)' : 'none',
            ...provided.draggableProps.style,
          }}
        >
          {/* Priority bar */}
          <div
            style={{
              height: 3, borderRadius: 2,
              background: PRIORITY_COLORS[app.priority] || 'var(--border)',
              marginBottom: 12,
            }}
          />

          {/* Company + role */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: stringToColor(app.company),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                color: '#fff', fontWeight: 700, fontSize: 'var(--text-xs)',
              }}
            >
              {getInitials(app.company)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {app.role}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {app.company}
              </div>
            </div>
          </div>

          {/* Tags row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            <Badge variant="muted" size="xs">{app.jobType}</Badge>
            {app.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <FiMapPin size={10} /> {app.location}
              </span>
            )}
          </div>

          {/* Deadline badge */}
          {app.deadline && (
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: over ? 'var(--danger)' : days <= 3 ? 'var(--warning)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12,
              }}
            >
              <FiCalendar size={11} />
              {over ? `Overdue by ${Math.abs(days)}d` : `Due in ${days}d`}
            </div>
          )}

          {/* Quick action buttons (shown on hover via CSS – simplified) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            {app.jobLink && (
              <a
                href={app.jobLink}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 'var(--text-xs)', cursor: 'pointer', textDecoration: 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink size={12} />
              </a>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(app); }}
              style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
            >
              <FiEdit2 size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(app); }}
              style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
            >
              <FiTrash2 size={12} />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

/* ───────────────────────────────────────────
   KANBAN COLUMN
─────────────────────────────────────────── */
const KanbanColumn = ({ column, apps, onEdit, onDelete }) => (
  <div style={{ flex: '0 0 280px', minWidth: 0 }}>
    {/* Column header */}
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        background: `${column.color}12`,
        border: `1px solid ${column.color}30`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: column.color }} />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          {column.label}
        </span>
      </div>
      <span
        style={{
          background: column.color, color: '#fff',
          borderRadius: 99, padding: '2px 8px',
          fontSize: '0.65rem', fontWeight: 700,
        }}
      >
        {apps.length}
      </span>
    </div>

    <Droppable droppableId={column.id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            minHeight: 200,
            background: snapshot.isDraggingOver ? `${column.color}08` : 'transparent',
            borderRadius: 'var(--radius-lg)',
            transition: 'background 0.2s',
            padding: snapshot.isDraggingOver ? '4px' : 0,
          }}
        >
          {apps.map((app, i) => (
            <KanbanCard key={app._id} app={app} index={i} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

/* ───────────────────────────────────────────
   MAIN COMPONENT
─────────────────────────────────────────── */
const Applications = () => {
  const { on } = useSocket();
  const { softDelete } = useSoftDelete();

  const [view,         setView]         = useState('kanban'); // 'kanban' | 'table'
  const [apps,         setApps]         = useState([]);
  const [kanban,       setKanban]       = useState({});
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filters,      setFilters]      = useState({ status: '', priority: '' });
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingApp,   setEditingApp]   = useState(null);
  const [selectedIds,  setSelectedIds]  = useState([]);

  const debouncedSearch = useDebounce(search, 400);

  /* ── Fetch (table view) ── */
  const fetchApps = useCallback(async () => {
    if (view !== 'table') return;
    setLoading(true);
    try {
      const { data } = await applicationsAPI.list({
        search: debouncedSearch, page, limit: PAGE_SIZE,
        status: filters.status, priority: filters.priority,
      });
      setApps(data.data.applications);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [view, debouncedSearch, page, filters]);

  /* ── Fetch (kanban view) ── */
  const fetchKanban = useCallback(async () => {
    if (view !== 'kanban') return;
    setLoading(true);
    try {
      const { data } = await applicationsAPI.kanban();
      setKanban(data.data || {});
    } catch (err) {
      toast.error('Failed to load Kanban');
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => { fetchApps(); fetchKanban(); }, [fetchApps, fetchKanban]);

  /* ── Socket live updates ── */
  useEffect(() => {
    const c1 = on('application:created',       () => { fetchApps(); fetchKanban(); });
    const c2 = on('application:updated',       () => { fetchApps(); fetchKanban(); });
    const c3 = on('application:status_changed',() => { fetchApps(); fetchKanban(); });
    const c4 = on('application:deleted',       () => { fetchApps(); fetchKanban(); });
    return () => { c1?.(); c2?.(); c3?.(); c4?.(); };
  }, [on, fetchApps, fetchKanban]);

  /* ── Drag & drop handler ── */
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const srcCol  = source.droppableId;
    const destCol = destination.droppableId;

    // Optimistic update
    const srcApps  = [...(kanban[srcCol]  || [])];
    const destApps = srcCol === destCol ? srcApps : [...(kanban[destCol] || [])];
    const [moved]  = srcApps.splice(source.index, 1);
    destApps.splice(destination.index, 0, { ...moved, status: destCol });

    setKanban((prev) => ({
      ...prev,
      [srcCol]:  srcApps,
      [destCol]: destApps,
    }));

    // Confetti on "offer"
    if (destCol === 'offer') {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      toast.success('🎉 Congratulations! You got an offer!');
    }

    try {
      await applicationsAPI.status(draggableId, { status: destCol });
    } catch {
      toast.error('Failed to update status');
      fetchKanban(); // revert
    }
  };

  /* ── Delete ── */
  const handleDelete = (app) => {
    // Optimistically remove from local state
    setApps((prev) => prev.filter((a) => a._id !== app._id));
    setKanban((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((col) => {
        updated[col] = updated[col].filter((a) => a._id !== app._id);
      });
      return updated;
    });

    softDelete({
      label: `Deleted: ${app.role} at ${app.company}`,
      deleteFn: () => applicationsAPI.delete(app._id),
      onConfirm: () => { fetchApps(); fetchKanban(); },
      onUndo: () => { fetchApps(); fetchKanban(); },
    });
  };

  /* ── CSV Export ── */
  const handleExport = async () => {
    try {
      const { data } = await applicationsAPI.exportCSV();
      const url  = URL.createObjectURL(data);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'applications.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 4 }}>
            Applications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Track and manage your job applications
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={handleExport} className="btn btn-sm" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <FiDownload size={14} style={{ marginRight: 6 }} /> Export CSV
          </button>
          <button
            onClick={() => { setEditingApp(null); setModalOpen(true); }}
            className="btn btn-gradient btn-sm px-4"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FiPlus size={16} /> New Application
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search company, role…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 38 }}
          />
        </div>

        {/* Status filter */}
        <select
          className="form-select"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          style={{ width: 'auto' }}
        >
          <option value="">All Statuses</option>
          {KANBAN_COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        {/* Priority filter */}
        <select
          className="form-select"
          value={filters.priority}
          onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
          style={{ width: 'auto' }}
        >
          <option value="">All Priorities</option>
          {['low', 'medium', 'high', 'urgent'].map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </select>

        {/* View toggle */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            border: '1px solid var(--border)',
          }}
        >
          {[
            { id: 'kanban', icon: FiGrid,  label: 'Kanban' },
            { id: 'table',  icon: FiList,  label: 'Table'  },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                padding:      '6px 14px',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                border:       'none',
                background:   view === id ? 'var(--bg-primary)' : 'transparent',
                color:        view === id ? 'var(--primary-500)' : 'var(--text-muted)',
                fontWeight:   view === id ? 600 : 400,
                fontSize:     'var(--text-sm)',
                cursor:       'pointer',
                boxShadow:    view === id ? 'var(--shadow-sm)' : 'none',
                transition:   'all 0.2s',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KANBAN VIEW ── */}
      {view === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
            {KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                apps={kanban[col.id] || []}
                onEdit={(app) => { setEditingApp(app); setModalOpen(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {/* ── TABLE VIEW ── */}
      {view === 'table' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: 24 }}>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : apps.length === 0 ? (
            <EmptyState
              icon="💼"
              title="No applications found"
              message="Start tracking your job applications to see them here."
              action={{ label: '+ New Application', onClick: () => { setEditingApp(null); setModalOpen(true); } }}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 20 }}>
                      <input
                        type="checkbox"
                        onChange={(e) => setSelectedIds(e.target.checked ? apps.map((a) => a._id) : [])}
                        checked={selectedIds.length === apps.length && apps.length > 0}
                      />
                    </th>
                    <th>Company / Role</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Applied</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => {
                    const over = isOverdue(app.deadline);
                    return (
                      <tr key={app._id}>
                        <td style={{ paddingLeft: 20, width: 44 }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(app._id)}
                            onChange={(e) => {
                              setSelectedIds((p) =>
                                e.target.checked ? [...p, app._id] : p.filter((i) => i !== app._id)
                              );
                            }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10,
                              background: stringToColor(app.company),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 700, fontSize: 'var(--text-xs)',
                              flexShrink: 0,
                            }}>
                              {getInitials(app.company)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{app.role}</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{app.company}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge
                            variant={
                              app.status === 'offer' ? 'success' :
                              app.status === 'rejected' ? 'danger' :
                              app.status === 'interview' ? 'warning' :
                              app.status === 'applied' ? 'info' : 'primary'
                            }
                            dot
                          >
                            {app.status}
                          </Badge>
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: PRIORITY_COLORS[app.priority] }}>
                            {PRIORITY_LABELS[app.priority]}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                          {formatDate(app.appliedDate)}
                        </td>
                        <td>
                          {app.deadline ? (
                            <span style={{ fontSize: 'var(--text-sm)', color: over ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: over ? 600 : 400 }}>
                              {over && '⚠️ '}{formatDate(app.deadline)}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {app.jobLink && (
                              <a href={app.jobLink} target="_blank" rel="noreferrer"
                                style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', textDecoration: 'none' }}>
                                <FiExternalLink size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => { setEditingApp(app); setModalOpen(true); }}
                              style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}
                            >
                              <FiEdit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(app)}
                              style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: 36, height: 36, borderRadius: 'var(--radius-md)',
                        border: 'none', cursor: 'pointer',
                        background: p === page ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                        color: p === page ? '#fff' : 'var(--text-secondary)',
                        fontWeight: p === page ? 600 : 400,
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Application Modal ── */}
      <ApplicationModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingApp(null); }}
        initialData={editingApp}
        onSave={() => { fetchApps(); fetchKanban(); }}
      />
    </div>
  );
};

export default Applications;
