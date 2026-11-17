/* ============================================================
   TaskFlow – Tasks Page (List + Board + Calendar views)
   ============================================================ */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  FiPlus, FiList, FiGrid, FiCalendar as FiCal,
  FiEdit2, FiTrash2, FiCheck, FiCircle, FiClock, FiFlag,
} from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { tasksAPI }     from '../api/tasks.api.js';
import { useSocket }    from '../context/SocketContext.jsx';
import useSoftDelete    from '../hooks/useSoftDelete.jsx';
import {
  TASK_STATUS, TASK_STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
} from '../utils/constants.js';
import { formatDate, isOverdue } from '../utils/helpers.js';
import Badge     from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { SkeletonCard } from '../components/common/SkeletonLoader.jsx';
import TaskModal from '../components/forms/TaskModal.jsx';
import useDebounce from '../hooks/useDebounce.js';

/* ── Date localizer for react-big-calendar ── */
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-US': enUS },
});

/* ── Board column config ── */
const BOARD_COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: '#6366f1' },
  { id: 'in-progress', label: 'In Progress',  color: '#f59e0b' },
  { id: 'done',        label: 'Done',         color: '#10b981' },
];

/* ── Task row (list view) ── */
const TaskRow = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const over = isOverdue(task.dueDate) && task.status !== 'done';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          12,
        padding:      '14px 20px',
        borderBottom: '1px solid var(--border-light)',
        transition:   'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Done toggle */}
      <button
        onClick={() => onToggleStatus(task)}
        style={{
          width: 22, height: 22, borderRadius: '50%',
          border: `2px solid ${task.status === 'done' ? 'var(--success)' : 'var(--border)'}`,
          background: task.status === 'done' ? 'var(--success)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
        }}
        aria-label="Toggle status"
      >
        {task.status === 'done' && <FiCheck size={12} color="#fff" />}
      </button>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize:       'var(--text-sm)',
          fontWeight:     500,
          color:          task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {task.title}
        </div>
        {task.description && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {task.description}
          </div>
        )}
      </div>

      {/* Priority */}
      <span style={{
        fontSize: 'var(--text-xs)', fontWeight: 600,
        color: PRIORITY_COLORS[task.priority],
        display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
      }}>
        <FiFlag size={11} />
        {PRIORITY_LABELS[task.priority]}
      </span>

      {/* Due date */}
      {task.dueDate && (
        <span style={{
          fontSize: 'var(--text-xs)',
          color: over ? 'var(--danger)' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
          fontWeight: over ? 600 : 400,
        }}>
          <FiClock size={11} />
          {formatDate(task.dueDate)}
        </span>
      )}

      {/* Status badge */}
      <Badge
        variant={task.status === 'done' ? 'success' : task.status === 'in-progress' ? 'warning' : 'muted'}
        size="xs"
      >
        {TASK_STATUS_LABELS[task.status]}
      </Badge>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          onClick={() => onEdit(task)}
          style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, padding: '4px 7px', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <FiEdit2 size={12} />
        </button>
        <button
          onClick={() => onDelete(task)}
          style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 6, padding: '4px 7px', cursor: 'pointer', color: 'var(--danger)' }}
        >
          <FiTrash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
};

/* ── Board card (kanban view) ── */
const BoardCard = ({ task, index, onEdit, onDelete }) => (
  <Draggable draggableId={task._id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{
          background:   'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding:      '14px',
          marginBottom: 10,
          border:       '1px solid var(--border)',
          boxShadow:    snapshot.isDragging ? 'var(--shadow-xl)' : 'var(--shadow-xs)',
          cursor:       'grab',
          transform:    snapshot.isDragging ? 'rotate(1.5deg)' : 'none',
          ...provided.draggableProps.style,
        }}
      >
        <div style={{
          fontSize: 'var(--text-sm)', fontWeight: 500,
          color: 'var(--text-primary)', marginBottom: 10,
          lineHeight: 1.4,
        }}>
          {task.title}
        </div>

        {/* Subtask progress */}
        {task.subtasks?.length > 0 && (() => {
          const done = task.subtasks.filter((s) => s.done).length;
          const pct  = Math.round((done / task.subtasks.length) * 100);
          return (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                <span>Subtasks</span>
                <span>{done}/{task.subtasks.length}</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-primary)', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
            </div>
          );
        })()}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: PRIORITY_COLORS[task.priority] }}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
              <FiEdit2 size={11} />
            </button>
            <button onClick={() => onDelete(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 2 }}>
              <FiTrash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    )}
  </Draggable>
);

/* ── Main component ── */
const Tasks = () => {
  const { on } = useSocket();
  const { softDelete } = useSoftDelete();

  const [view,       setView]       = useState('list');
  const [tasks,      setTasks]      = useState([]);
  const [board,      setBoard]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState({ status: '', priority: '' });
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTask,   setEditTask]   = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  /* ── Fetch list ── */
  const fetchTasks = useCallback(async () => {
    if (view === 'board') return;
    setLoading(true);
    try {
      const { data } = await tasksAPI.list({
        search:   debouncedSearch,
        status:   filter.status,
        priority: filter.priority,
        limit:    50,
      });
      setTasks(data.data.tasks);
    } catch { toast.error('Failed to load tasks'); }
    finally  { setLoading(false); }
  }, [view, debouncedSearch, filter]);

  /* ── Fetch board ── */
  const fetchBoard = useCallback(async () => {
    if (view !== 'board') return;
    setLoading(true);
    try {
      const { data } = await tasksAPI.board();
      setBoard(data.data || {});
    } catch { toast.error('Failed to load board'); }
    finally  { setLoading(false); }
  }, [view]);

  useEffect(() => { fetchTasks(); fetchBoard(); }, [fetchTasks, fetchBoard]);

  /* ── Socket live updates ── */
  useEffect(() => {
    const c1 = on('task:created', () => { fetchTasks(); fetchBoard(); });
    const c2 = on('task:updated', () => { fetchTasks(); fetchBoard(); });
    const c3 = on('task:deleted', () => { fetchTasks(); fetchBoard(); });
    return () => { c1?.(); c2?.(); c3?.(); };
  }, [on, fetchTasks, fetchBoard]);

  const handleDelete = (task) => {
    // Optimistically remove
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
    setBoard((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((col) => {
        updated[col] = updated[col].filter((t) => t._id !== task._id);
      });
      return updated;
    });

    softDelete({
      label: `Deleted: "${task.title}"`,
      deleteFn: () => tasksAPI.delete(task._id),
      onConfirm: () => { fetchTasks(); fetchBoard(); },
      onUndo: () => { fetchTasks(); fetchBoard(); },
    });
  };

  const handleToggleStatus = async (task) => {
    const next = task.status === 'done' ? 'todo' : 'done';
    try {
      await tasksAPI.status(task._id, { status: next });
      setTasks((prev) => prev.map((t) => t._id === task._id ? { ...t, status: next } : t));
      if (next === 'done') toast.success('Task completed! ✅');
    } catch { toast.error('Failed to update status'); }
  };

  /* ── Board drag end ── */
  const handleDragEnd = async ({ destination, source, draggableId }) => {
    if (!destination || destination.droppableId === source.droppableId) return;
    const srcCol  = [...(board[source.droppableId]      || [])];
    const destCol = [...(board[destination.droppableId] || [])];
    const [moved] = srcCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, { ...moved, status: destination.droppableId });
    setBoard((p) => ({ ...p, [source.droppableId]: srcCol, [destination.droppableId]: destCol }));
    try {
      await tasksAPI.status(draggableId, { status: destination.droppableId });
    } catch {
      toast.error('Failed to update status');
      fetchBoard();
    }
  };

  /* ── Calendar events ── */
  const calendarEvents = tasks
    .filter((t) => t.dueDate)
    .map((t) => ({
      id:    t._id,
      title: t.title,
      start: new Date(t.dueDate),
      end:   new Date(t.dueDate),
      resource: t,
    }));

  /* ── Filtered tasks (list) ── */
  const filteredTasks = tasks.filter((t) => {
    if (filter.status   && t.status   !== filter.status)   return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 4 }}>Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Manage your to-dos and work items</p>
        </div>
        <button
          onClick={() => { setEditTask(null); setModalOpen(true); }}
          className="btn btn-gradient btn-sm px-4"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FiPlus size={16} /> New Task
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180 }}
        />
        <select className="form-select" style={{ width: 'auto' }} value={filter.status} onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {Object.entries(TASK_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filter.priority} onChange={(e) => setFilter((p) => ({ ...p, priority: e.target.value }))}>
          <option value="">All Priorities</option>
          {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
        </select>

        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 4, border: '1px solid var(--border)' }}>
          {[
            { id: 'list',  icon: FiList,  label: 'List'     },
            { id: 'board', icon: FiGrid,  label: 'Board'    },
            { id: 'cal',   icon: FiCal,   label: 'Calendar' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', border: 'none', cursor: 'pointer',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                background: view === id ? 'var(--bg-primary)' : 'transparent',
                color:      view === id ? 'var(--primary-500)' : 'var(--text-muted)',
                fontWeight: view === id ? 600 : 400,
                fontSize:   'var(--text-sm)',
                boxShadow:  view === id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}
        >
          {loading ? (
            <div style={{ padding: 24 }}>{Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon="✅"
              title="No tasks yet"
              message="Create your first task to get started."
              action={{ label: '+ New Task', onClick: () => { setEditTask(null); setModalOpen(true); } }}
            />
          ) : (
            filteredTasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onEdit={(t) => { setEditTask(t); setModalOpen(true); }}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </motion.div>
      )}

      {/* ── BOARD VIEW ── */}
      {view === 'board' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
            {BOARD_COLUMNS.map((col) => (
              <div key={col.id} style={{ flex: '0 0 280px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 14, padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: `${col.color}12`, border: `1px solid ${col.color}30`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{col.label}</span>
                  </div>
                  <span style={{ background: col.color, color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700 }}>
                    {(board[col.id] || []).length}
                  </span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ minHeight: 160, background: snapshot.isDraggingOver ? `${col.color}08` : 'transparent', borderRadius: 'var(--radius-lg)', transition: 'background 0.2s' }}
                    >
                      {(board[col.id] || []).map((task, i) => (
                        <BoardCard
                          key={task._id}
                          task={task}
                          index={i}
                          onEdit={(t) => { setEditTask(t); setModalOpen(true); }}
                          onDelete={handleDelete}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* ── CALENDAR VIEW ── */}
      {view === 'cal' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)',
            padding: 24,
            '--rbc-today-bg': 'rgba(99,102,241,0.08)',
          }}
        >
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={(event) => { setEditTask(event.resource); setModalOpen(true); }}
            eventPropGetter={(event) => ({
              style: {
                background: PRIORITY_COLORS[event.resource?.priority] || 'var(--primary-500)',
                border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
              },
            })}
          />
        </motion.div>
      )}

      {/* Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        initialData={editTask}
        onSave={() => { fetchTasks(); fetchBoard(); }}
      />
    </div>
  );
};

export default Tasks;
