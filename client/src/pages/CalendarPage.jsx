/* ============================================================
   TaskFlow – Calendar Page (full page wrapper for react-big-calendar)
   ============================================================ */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { tasksAPI }        from '../api/tasks.api.js';
import { applicationsAPI } from '../api/applications.api.js';
import { PRIORITY_COLORS, APPLICATION_STATUS_COLORS } from '../utils/constants.js';
import TaskModal from '../components/forms/TaskModal.jsx';
import toast from 'react-hot-toast';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-US': enUS },
});

const CalendarPage = () => {
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTask,   setEditTask]   = useState(null);
  const [showApps,   setShowApps]   = useState(true);
  const [showTasks,  setShowTasks]  = useState(true);

  const fetchEvents = async () => {
    try {
      const [t, a] = await Promise.all([
        tasksAPI.list({ limit: 200 }),
        applicationsAPI.list({ limit: 200 }),
      ]);

      const taskEvents = showTasks
        ? (t.data.data?.tasks || [])
            .filter((task) => task.dueDate)
            .map((task) => ({
              id:       `task-${task._id}`,
              title:    `📋 ${task.title}`,
              start:    new Date(task.dueDate),
              end:      new Date(task.dueDate),
              resource: { type: 'task', data: task },
              color:    PRIORITY_COLORS[task.priority] || '#6366f1',
            }))
        : [];

      const appEvents = showApps
        ? (a.data.data?.applications || [])
            .filter((app) => app.deadline)
            .map((app) => ({
              id:       `app-${app._id}`,
              title:    `💼 ${app.company} — ${app.role}`,
              start:    new Date(app.deadline),
              end:      new Date(app.deadline),
              resource: { type: 'application', data: app },
              color:    APPLICATION_STATUS_COLORS[app.status] || '#0ea5e9',
            }))
        : [];

      const interviewEvents = (a.data.data?.applications || [])
        .flatMap((app) =>
          (app.interviews || []).map((iv) => ({
            id:       `iv-${app._id}-${iv._id}`,
            title:    `🗓️ Interview: ${app.company}`,
            start:    new Date(iv.scheduledAt),
            end:      new Date(new Date(iv.scheduledAt).getTime() + 3600000),
            resource: { type: 'interview', data: { ...iv, company: app.company, role: app.role } },
            color:    '#f59e0b',
          }))
        );

      setEvents([...taskEvents, ...appEvents, ...interviewEvents]);
    } catch {
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [showApps, showTasks]);

  const handleSelectEvent = (event) => {
    if (event.resource?.type === 'task') {
      setEditTask(event.resource.data);
      setModalOpen(true);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 4 }}>Calendar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Visualize deadlines, interviews, and task due dates</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { id: 'tasks',  label: '📋 Tasks',        value: showTasks,  set: setShowTasks,  color: '#6366f1' },
            { id: 'apps',   label: '💼 Deadlines',    value: showApps,   set: setShowApps,   color: '#0ea5e9' },
          ].map(({ id, label, value, set, color }) => (
            <button
              key={id}
              onClick={() => set((v) => !v)}
              style={{
                padding:      '7px 16px',
                borderRadius: 'var(--radius-full)',
                border:       `2px solid ${value ? color : 'var(--border)'}`,
                background:   value ? `${color}15` : 'var(--bg-tertiary)',
                color:        value ? color : 'var(--text-muted)',
                cursor:       'pointer',
                fontSize:     'var(--text-sm)',
                fontWeight:   value ? 600 : 400,
                transition:   'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background:   'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border:       '1px solid var(--border)',
          boxShadow:    'var(--shadow-card)',
          padding:      '24px',
          overflow:     'hidden',
        }}
      >
        {loading ? (
          <div style={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner-border text-primary" />
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 640 }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={(event) => ({
              style: {
                background:   event.color || 'var(--primary-500)',
                border:       'none',
                borderRadius: 6,
                fontSize:     '0.75rem',
                fontWeight:   600,
                padding:      '2px 8px',
              },
            })}
            views={['month', 'week', 'day', 'agenda']}
            popup
          />
        )}
      </motion.div>

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        initialData={editTask}
        onSave={fetchEvents}
      />
    </div>
  );
};

export default CalendarPage;
