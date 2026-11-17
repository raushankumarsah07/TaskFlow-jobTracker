/* ============================================================
   TaskFlow – Task Modal (Create / Edit)
   ============================================================ */
import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FiX, FiSave, FiCheckSquare, FiPlus, FiTrash2 } from 'react-icons/fi';
import { tasksAPI } from '../../api/tasks.api.js';
import { applicationsAPI } from '../../api/applications.api.js';
import { TASK_STATUS, TASK_STATUS_LABELS, RECURRENCE_OPTIONS } from '../../utils/constants.js';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '', description: '', dueDate: '',
  priority: 'medium', status: 'todo',
  labels: '', recurrence: 'none', linkedApplication: '',
};

const TaskModal = ({ open, onClose, initialData, onSave }) => {
  const [form,         setForm]         = useState(EMPTY);
  const [subtasks,     setSubtasks]     = useState([]);
  const [newSubtask,   setNewSubtask]   = useState('');
  const [loading,      setLoading]      = useState(false);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (open) {
      applicationsAPI.list({ limit: 100 })
        .then(({ data }) => setApplications(data.data?.applications || []))
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setForm({
        title:             initialData.title       || '',
        description:       initialData.description || '',
        dueDate:           initialData.dueDate     ? initialData.dueDate.split('T')[0] : '',
        priority:          initialData.priority    || 'medium',
        status:            initialData.status      || 'todo',
        labels:            (initialData.labels || []).join(', '),
        recurrence:        initialData.recurrence  || 'none',
        linkedApplication: initialData.linkedApplication?._id || initialData.linkedApplication || '',
      });
      setSubtasks(initialData.subtasks || []);
    } else {
      setForm(EMPTY);
      setSubtasks([]);
    }
    setNewSubtask('');
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks((p) => [...p, { title: newSubtask.trim(), done: false }]);
    setNewSubtask('');
  };

  const toggleSubtask = (i) => {
    setSubtasks((p) => p.map((s, idx) => idx === i ? { ...s, done: !s.done } : s));
  };

  const removeSubtask = (i) => {
    setSubtasks((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }

    setLoading(true);
    const payload = {
      title:             form.title,
      description:       form.description,
      dueDate:           form.dueDate || undefined,
      priority:          form.priority,
      status:            form.status,
      labels:            form.labels ? form.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
      recurrence:        form.recurrence,
      subtasks,
      linkedApplication: form.linkedApplication || undefined,
    };

    try {
      if (initialData) {
        await tasksAPI.update(initialData._id, payload);
        toast.success('Task updated!');
      } else {
        await tasksAPI.create(payload);
        toast.success('Task created! ✅');
      }
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onHide={onClose} size="lg" centered>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiCheckSquare color="#fff" size={20} />
            <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', margin: 0, fontSize: '1.1rem' }}>
              {initialData ? 'Edit Task' : 'New Task'}
            </h5>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#fff' }}>
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="row g-3">
              {/* Title */}
              <div className="col-12">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} className="form-control" placeholder="Task title…" required autoFocus />
              </div>

              {/* Description */}
              <div className="col-12">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-control" rows={2} placeholder="Add more details…" />
              </div>

              {/* Status + Priority */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="form-select">
                  {Object.entries(TASK_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="form-select">
                  {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>

              {/* Due Date */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Due Date</label>
                <input name="dueDate" value={form.dueDate} onChange={handleChange} className="form-control" type="date" />
              </div>

              {/* Recurrence */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Recurrence</label>
                <select name="recurrence" value={form.recurrence} onChange={handleChange} className="form-select">
                  {RECURRENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Labels */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Labels <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                <input name="labels" value={form.labels} onChange={handleChange} className="form-control" placeholder="bug, feature, urgent" />
              </div>

              {/* Link to Application */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Link to Application</label>
                <select name="linkedApplication" value={form.linkedApplication} onChange={handleChange} className="form-select">
                  <option value="">None</option>
                  {applications.map((a) => (
                    <option key={a._id} value={a._id}>{a.company} — {a.role}</option>
                  ))}
                </select>
              </div>

              {/* Subtasks */}
              <div className="col-12">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Subtasks</label>
                {subtasks.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <button type="button" onClick={() => toggleSubtask(i)}
                      style={{
                        width: 20, height: 20, borderRadius: '50%',
                        border: `2px solid ${s.done ? 'var(--success)' : 'var(--border)'}`,
                        background: s.done ? 'var(--success)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      {s.done && <FiCheckSquare size={10} color="#fff" />}
                    </button>
                    <span style={{
                      flex: 1, fontSize: 'var(--text-sm)',
                      color: s.done ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: s.done ? 'line-through' : 'none',
                    }}>
                      {s.title}
                    </span>
                    <button type="button" onClick={() => removeSubtask(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 2 }}>
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                    className="form-control"
                    placeholder="Add subtask…"
                    style={{ fontSize: 'var(--text-sm)' }}
                  />
                  <button type="button" onClick={addSubtask}
                    style={{
                      background: 'var(--gradient-primary)', color: '#fff',
                      border: 'none', borderRadius: 'var(--radius-md)',
                      padding: '8px 16px', cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)',
                    }}
                  >
                    <FiPlus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-sm"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-gradient btn-sm px-4"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : <FiSave size={14} />}
              {initialData ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TaskModal;
