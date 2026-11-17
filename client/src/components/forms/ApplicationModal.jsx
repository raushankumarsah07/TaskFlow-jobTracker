/* ============================================================
   TaskFlow – Application Modal (Create / Edit)
   ============================================================ */
import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FiX, FiSave, FiBriefcase, FiMapPin, FiLink, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { applicationsAPI } from '../../api/applications.api.js';
import { KANBAN_COLUMNS, JOB_TYPES } from '../../utils/constants.js';
import toast from 'react-hot-toast';

const EMPTY = {
  company:    '',
  role:       '',
  location:   '',
  jobType:    'remote',
  jobLink:    '',
  status:     'wishlist',
  priority:   'medium',
  appliedDate:'',
  deadline:   '',
  salaryMin:  '',
  salaryMax:  '',
  notes:      '',
  tags:       '',
};

const ApplicationModal = ({ open, onClose, initialData, onSave }) => {
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        company:     initialData.company    || '',
        role:        initialData.role       || '',
        location:    initialData.location   || '',
        jobType:     initialData.jobType    || 'remote',
        jobLink:     initialData.jobLink    || '',
        status:      initialData.status     || 'wishlist',
        priority:    initialData.priority   || 'medium',
        appliedDate: initialData.appliedDate ? initialData.appliedDate.split('T')[0] : '',
        deadline:    initialData.deadline   ? initialData.deadline.split('T')[0]    : '',
        salaryMin:   initialData.salary?.min  || '',
        salaryMax:   initialData.salary?.max  || '',
        notes:       initialData.notes       || '',
        tags:        (initialData.tags || []).join(', '),
      });
    } else {
      setForm(EMPTY);
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      toast.error('Company and Role are required');
      return;
    }

    setLoading(true);
    const payload = {
      company:     form.company,
      role:        form.role,
      location:    form.location,
      jobType:     form.jobType,
      jobLink:     form.jobLink,
      status:      form.status,
      priority:    form.priority,
      appliedDate: form.appliedDate || undefined,
      deadline:    form.deadline    || undefined,
      notes:       form.notes,
      tags:        form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      salary: {
        min:      form.salaryMin ? Number(form.salaryMin) : undefined,
        max:      form.salaryMax ? Number(form.salaryMax) : undefined,
        currency: 'USD',
      },
    };

    try {
      if (initialData) {
        await applicationsAPI.update(initialData._id, payload);
        toast.success('Application updated!');
      } else {
        await applicationsAPI.create(payload);
        toast.success('Application created! 🎯');
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
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--gradient-primary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiBriefcase color="#fff" size={20} />
            <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', margin: 0, fontSize: '1.1rem' }}>
              {initialData ? 'Edit Application' : 'New Application'}
            </h5>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#fff' }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="row g-3">
              {/* Company */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Company *
                </label>
                <input name="company" value={form.company} onChange={handleChange} className="form-control" placeholder="e.g. Google" required />
              </div>

              {/* Role */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Role / Position *
                </label>
                <input name="role" value={form.role} onChange={handleChange} className="form-control" placeholder="e.g. Senior Engineer" required />
              </div>

              {/* Status */}
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="form-select">
                  {KANBAN_COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="form-select">
                  {['low', 'medium', 'high', 'urgent'].map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Job Type */}
              <div className="col-md-4">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Job Type</label>
                <select name="jobType" value={form.jobType} onChange={handleChange} className="form-select">
                  {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Location */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Location</label>
                <div style={{ position: 'relative' }}>
                  <FiMapPin style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input name="location" value={form.location} onChange={handleChange} className="form-control" placeholder="City, State" style={{ paddingLeft: 36 }} />
                </div>
              </div>

              {/* Job Link */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Job Link</label>
                <div style={{ position: 'relative' }}>
                  <FiLink style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input name="jobLink" value={form.jobLink} onChange={handleChange} className="form-control" placeholder="https://…" style={{ paddingLeft: 36 }} type="url" />
                </div>
              </div>

              {/* Applied Date */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Applied Date</label>
                <div style={{ position: 'relative' }}>
                  <FiCalendar style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input name="appliedDate" value={form.appliedDate} onChange={handleChange} className="form-control" type="date" style={{ paddingLeft: 36 }} />
                </div>
              </div>

              {/* Deadline */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Deadline</label>
                <div style={{ position: 'relative' }}>
                  <FiCalendar style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input name="deadline" value={form.deadline} onChange={handleChange} className="form-control" type="date" style={{ paddingLeft: 36 }} />
                </div>
              </div>

              {/* Salary */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Salary Min</label>
                <div style={{ position: 'relative' }}>
                  <FiDollarSign style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input name="salaryMin" value={form.salaryMin} onChange={handleChange} className="form-control" type="number" placeholder="80000" style={{ paddingLeft: 36 }} />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Salary Max</label>
                <div style={{ position: 'relative' }}>
                  <FiDollarSign style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input name="salaryMax" value={form.salaryMax} onChange={handleChange} className="form-control" type="number" placeholder="120000" style={{ paddingLeft: 36 }} />
                </div>
              </div>

              {/* Tags */}
              <div className="col-12">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                <input name="tags" value={form.tags} onChange={handleChange} className="form-control" placeholder="frontend, react, remote" />
              </div>

              {/* Notes */}
              <div className="col-12">
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} className="form-control" rows={3} placeholder="Add any notes about this application…" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-sm" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-gradient btn-sm px-4" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : <FiSave size={14} />}
              {initialData ? 'Save Changes' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ApplicationModal;
