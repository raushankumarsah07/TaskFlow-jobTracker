/* ============================================================
   TaskFlow – Profile Page
   ============================================================ */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiSave, FiCamera } from 'react-icons/fi';
import { usersAPI }  from '../api/users.api.js';
import { useAuth }   from '../context/AuthContext.jsx';
import { getInitials, stringToColor } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm,      setPwForm]      = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurr,    setShowCurr]    = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await usersAPI.update({ name: profileForm.name });
      updateUser({ name: data.data.user.name });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      await usersAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    try {
      const { data } = await usersAPI.uploadAvatar(form);
      updateUser({ avatar: data.data.avatar });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Avatar upload failed');
    }
  };

  const SectionCard = ({ title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
        padding: '28px', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)', marginBottom: 24,
      }}
    >
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        {title}
      </h3>
      {children}
    </motion.div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', marginBottom: 4 }}>Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Manage your personal information</p>
      </motion.div>

      {/* Avatar card */}
      <SectionCard title="Profile Picture">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: stringToColor(user?.name || 'U'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '2rem',
              overflow: 'hidden',
              border: '4px solid var(--border)',
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(user?.name || 'U')}
            </div>
            <label
              htmlFor="avatar-upload"
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid var(--bg-primary)',
              }}
            >
              <FiCamera size={14} color="#fff" />
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </label>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
              {user?.name}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{user?.email}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4, textTransform: 'capitalize' }}>
              Role: {user?.role}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Profile info */}
      <SectionCard title="Personal Information">
        <form onSubmit={handleProfileSave}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
            <div className="col-12">
              <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" className="form-control" value={profileForm.email} disabled style={{ paddingLeft: 38, opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</div>
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={savingProfile} className="btn btn-gradient px-4"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {savingProfile ? <span className="spinner-border spinner-border-sm" /> : <FiSave size={14} />}
              Save Changes
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Change password */}
      <SectionCard title="Change Password">
        <form onSubmit={handlePasswordSave}>
          <div className="row g-3">
            {[
              { label: 'Current Password', key: 'currentPassword', show: showCurr, toggle: setShowCurr },
              { label: 'New Password',     key: 'newPassword',     show: showNew,  toggle: setShowNew  },
              { label: 'Confirm New Password', key: 'confirmPassword', show: showNew, toggle: setShowNew },
            ].map(({ label, key, show, toggle }) => (
              <div className="col-12" key={key}>
                <label className="form-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={show ? 'text' : 'password'}
                    className="form-control"
                    value={pwForm[key]}
                    onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder="••••••••"
                    style={{ paddingLeft: 38, paddingRight: 38 }}
                  />
                  <button type="button" onClick={() => toggle((s) => !s)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                    {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={savingPw} className="btn btn-gradient px-4"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {savingPw ? <span className="spinner-border spinner-border-sm" /> : <FiLock size={14} />}
              Change Password
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default Profile;
