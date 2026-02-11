import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cattImage from '../assets/catt.png';

const API_BASE = import.meta.env.VITE_BACKEND_API;

/* ── Decorative SVG icons ────────────────────────────────────────────────── */
const PawIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C10.5 2 9.5 3.5 9.5 5C9.5 6.5 10.5 8 12 8C13.5 8 14.5 6.5 14.5 5C14.5 3.5 13.5 2 12 2Z" />
    <path d="M4.5 6C3 6 2 7.5 2 9C2 10.5 3 12 4.5 12C6 12 7 10.5 7 9C7 7.5 6 6 4.5 6Z" />
    <path d="M19.5 6C18 6 17 7.5 17 9C17 10.5 18 12 19.5 12C21 12 22 10.5 22 9C22 7.5 21 6 19.5 6Z" />
    <path d="M6 14.5C6 12.567 8.686 11 12 11C15.314 11 18 12.567 18 14.5C18 16.433 15.314 22 12 22C8.686 22 6 16.433 6 14.5Z" />
  </svg>
);

const BoneIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
    <path d="M50.4 6.8a8 8 0 0 0-11.3 0L13.6 32.3a8 8 0 0 0 0 11.3 8 8 0 0 0 0 11.3 8 8 0 0 0 11.3 0 8 8 0 0 0 11.3 0L61.7 29.4a8 8 0 0 0 0-11.3 8 8 0 0 0 0-11.3z" />
  </svg>
);

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setFormData({ name: parsed.name || '', email: parsed.email || '', phone: parsed.phone || '' });
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/auth/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone }),
      });
      const data = await response.json();
      if (data.success) {
        const updatedUser = { ...user, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        setUpdateSuccess('Profile updated successfully!');
        setTimeout(() => setUpdateSuccess(''), 3000);
      } else {
        setUpdateError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      setUpdateError('Server error. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* ── Scattered paw & bone decorations ───────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <PawIcon className="absolute top-16 left-[5%] w-10 h-10 text-gray-200/60 rotate-12" />
        <BoneIcon className="absolute top-32 right-[8%] w-12 h-12 text-gray-200/50 -rotate-[25deg]" />
        <PawIcon className="absolute top-[22%] right-[18%] w-8 h-8 text-gray-100/80 rotate-45" />
        <BoneIcon className="absolute top-[35%] left-[3%] w-9 h-9 text-gray-200/40 rotate-[60deg]" />
        <PawIcon className="absolute top-[45%] right-[5%] w-11 h-11 text-gray-100/70 -rotate-12" />
        <BoneIcon className="absolute top-[55%] left-[12%] w-10 h-10 text-gray-200/50 rotate-[30deg]" />
        <PawIcon className="absolute top-[65%] right-[15%] w-9 h-9 text-gray-200/40 rotate-[70deg]" />
        <BoneIcon className="absolute top-[75%] left-[7%] w-11 h-11 text-gray-100/60 -rotate-[40deg]" />
        <PawIcon className="absolute top-[85%] right-[10%] w-8 h-8 text-gray-200/50 rotate-[20deg]" />
        <BoneIcon className="absolute top-[90%] left-[20%] w-10 h-10 text-gray-100/50 rotate-[50deg]" />
        <PawIcon className="absolute top-[28%] left-[45%] w-7 h-7 text-gray-100/60 -rotate-[15deg]" />
        <BoneIcon className="absolute top-[50%] left-[55%] w-8 h-8 text-gray-200/30 rotate-[80deg]" />
      </div>

      {/* ── Page Title with cat image ──────────────────────────────────────── */}
      <div className="container mx-auto px-4 pt-8 pb-4 relative z-10">
        <div className="flex items-center gap-4">
          <img src={cattImage} alt="Cat" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your profile information</p>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <section className="pb-12 relative z-10">
        <div className="container mx-auto px-4 max-w-xl">
          {/* Success / Error Messages */}
          {updateSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm font-medium">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {updateSuccess}
            </div>
          )}
          {updateError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm font-medium">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              {updateError}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Avatar & Name Header */}
            <div className="bg-gradient-to-r from-[#fefce8] to-[#fff7ed] p-6 flex items-center gap-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-2xl font-bold text-[#65a30d] shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{user.name || 'User'}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* Profile Info / Edit Form */}
            <div className="p-6">
              {!isEditing ? (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                    <p className="text-gray-900 font-semibold text-base mt-1">{user.name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                    <p className="text-gray-900 font-semibold text-base mt-1 break-all">{user.email || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                    <p className="text-gray-900 font-semibold text-base mt-1">{user.phone || 'Not set'}</p>
                  </div>
                  <div className="pt-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:from-[#4d7c0f] hover:to-[#3f6212] transition-all shadow-md hover:shadow-lg"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-4 focus:ring-[#65a30d]/20 focus:border-[#65a30d] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-4 focus:ring-[#65a30d]/20 focus:border-[#65a30d] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-4 focus:ring-[#65a30d]/20 focus:border-[#65a30d] outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-3">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-[#65a30d] to-[#4d7c0f] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:from-[#4d7c0f] hover:to-[#3f6212] transition-all shadow-md hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setUpdateError(''); }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountSettingsPage;
