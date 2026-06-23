import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearUserSession } from '../auth/session';

const API_BASE = import.meta.env.VITE_BACKEND_API;

/* ── Decorative Paw Icon ─── */
const PawIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C10.5 2 9.5 3.5 9.5 5C9.5 6.5 10.5 8 12 8C13.5 8 14.5 6.5 14.5 5C14.5 3.5 13.5 2 12 2Z" />
    <path d="M4.5 6C3 6 2 7.5 2 9C2 10.5 3 12 4.5 12C6 12 7 10.5 7 9C7 7.5 6 6 4.5 6Z" />
    <path d="M19.5 6C18 6 17 7.5 17 9C17 10.5 18 12 19.5 12C21 12 22 10.5 22 9C22 7.5 21 6 19.5 6Z" />
    <path d="M6 14.5C6 12.567 8.686 11 12 11C15.314 11 18 12.567 18 14.5C18 16.433 15.314 22 12 22C8.686 22 6 16.433 6 14.5Z" />
  </svg>
);

const emptyAddress = { addressType: 'home', firstName: '', lastName: '', phone: '', streetAddress: '', city: '', state: '', pincode: '' };

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ ...emptyAddress });
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [addrMsg, setAddrMsg] = useState('');

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

  // Fetch addresses
  useEffect(() => {
    if (!token) return;
    const fetchAddresses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setAddresses(res.data.data);
      } catch (err) {
        console.error('Fetch addresses error:', err);
      } finally {
        setAddrLoading(false);
      }
    };
    fetchAddresses();
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateError('');
    try {
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

  // Address CRUD
  const openAddAddr = () => {
    setAddrForm({ ...emptyAddress });
    setEditingAddrId(null);
    setShowAddrForm(true);
    setAddrMsg('');
  };

  const openEditAddr = (addr) => {
    setAddrForm({
      addressType: addr.addressType || 'home',
      firstName: addr.firstName || '',
      lastName: addr.lastName || '',
      phone: addr.phone || '',
      streetAddress: addr.streetAddress || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
    });
    setEditingAddrId(addr._id);
    setShowAddrForm(true);
    setAddrMsg('');
  };

  const handleSaveAddr = async (e) => {
    e.preventDefault();
    try {
      if (editingAddrId) {
        const res = await axios.put(`${API_BASE}/addresses/${editingAddrId}`, addrForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setAddresses(prev => prev.map(a => a._id === editingAddrId ? res.data.data : a));
          setAddrMsg('Address updated!');
        }
      } else {
        const res = await axios.post(`${API_BASE}/addresses`, addrForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setAddresses(prev => [...prev, res.data.data]);
          setAddrMsg('Address added!');
        }
      }
      setShowAddrForm(false);
      setTimeout(() => setAddrMsg(''), 3000);
    } catch (err) {
      console.error('Save address error:', err);
      setAddrMsg('Error saving address.');
    }
  };

  const handleDeleteAddr = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await axios.delete(`${API_BASE}/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error('Delete address error:', err);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    navigate('/signin');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* ── Scattered paw decorations ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <PawIcon className="absolute top-16 left-[5%] w-10 h-10 text-gray-300/50 rotate-12" />
        <PawIcon className="absolute top-28 right-[8%] w-12 h-12 text-gray-300/40 -rotate-[25deg]" />
        <PawIcon className="absolute top-[20%] right-[22%] w-8 h-8 text-gray-300/45 rotate-45" />
        <PawIcon className="absolute top-[30%] left-[3%] w-9 h-9 text-gray-300/35 rotate-[60deg]" />
        <PawIcon className="absolute top-[38%] right-[5%] w-11 h-11 text-gray-300/50 -rotate-12" />
        <PawIcon className="absolute top-[48%] left-[12%] w-10 h-10 text-gray-300/40 rotate-[30deg]" />
        <PawIcon className="absolute top-[55%] right-[15%] w-9 h-9 text-gray-300/35 rotate-[70deg]" />
        <PawIcon className="absolute top-[65%] left-[7%] w-11 h-11 text-gray-300/45 -rotate-[40deg]" />
        <PawIcon className="absolute top-[73%] right-[10%] w-8 h-8 text-gray-300/40 rotate-[20deg]" />
        <PawIcon className="absolute top-[82%] left-[20%] w-10 h-10 text-gray-300/35 rotate-[50deg]" />
        <PawIcon className="absolute top-[25%] left-[45%] w-7 h-7 text-gray-300/40 -rotate-[15deg]" />
        <PawIcon className="absolute top-[42%] left-[55%] w-8 h-8 text-gray-300/30 rotate-[80deg]" />
        <PawIcon className="absolute top-[60%] left-[35%] w-9 h-9 text-gray-300/35 rotate-[110deg]" />
        <PawIcon className="absolute top-[90%] right-[30%] w-7 h-7 text-gray-300/40 -rotate-[55deg]" />
        <PawIcon className="absolute top-[15%] left-[65%] w-8 h-8 text-gray-300/30 rotate-[40deg]" />
      </div>

      {/* ── Page Title ─── */}
      <div className="container mx-auto px-4 pt-8 pb-4 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770976442/catt_na3yls.png'} alt="Cat" className="w-14 h-14 object-contain" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage your profile & addresses</p>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ─── */}
      <section className="pb-12 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl space-y-6">

          {/* Success / Error Messages */}
          {updateSuccess && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {updateSuccess}
            </div>
          )}
          {updateError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              {updateError}
            </div>
          )}

          {/* ─── Edit Profile Card ─── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Avatar & Name Header */}
            <div className="bg-gradient-to-r from-[#fefce8] to-[#fff7ed] p-6 flex items-center gap-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-2xl font-bold text-[#205EA9] shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{user.name || 'User'}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

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
                      className="bg-[#2f5a87] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:from-[#1d4f8f] hover:to-[#203D5B] transition-all shadow-md hover:shadow-lg"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-4 focus:ring-[#205EA9]/20 focus:border-[#205EA9] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-4 focus:ring-[#205EA9]/20 focus:border-[#205EA9] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-4 focus:ring-[#205EA9]/20 focus:border-[#205EA9] outline-none transition-all" />
                  </div>
                  <div className="flex gap-3 pt-3">
                    <button type="submit" className="bg-gradient-to-r from-[#205EA9] to-[#1d4f8f] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:from-[#1d4f8f] hover:to-[#203D5B] transition-all shadow-md hover:shadow-lg">
                      Save Changes
                    </button>
                    <button type="button" onClick={() => { setIsEditing(false); setUpdateError(''); }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ─── Addresses Card ─── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">My Addresses</h2>
                <p className="text-xs text-gray-400 mt-0.5">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
              </div>
              <button onClick={openAddAddr}
                className="bg-[#2f5a87] text-white px-4 py-2 rounded-lg font-bold text-xs hover:from-[#1d4f8f] hover:to-[#203D5B] transition-all">
                + Add Address
              </button>
            </div>

            {addrMsg && (
              <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium">
                {addrMsg}
              </div>
            )}

            <div className="p-6">
              {addrLoading ? (
                <p className="text-gray-400 text-sm text-center py-4">Loading...</p>
              ) : addresses.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No addresses saved yet.</p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="border border-gray-100 rounded-xl p-4 group hover:border-gray-200 transition-colors relative">
                      <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mb-2 ${
                        addr.addressType === 'home'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-purple-50 text-purple-600 border border-purple-100'
                      }`}>
                        {addr.addressType === 'home' ? '🏠 Home' : '🏢 Work'}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm">{addr.firstName} {addr.lastName}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mt-1">{addr.streetAddress}</p>
                      <p className="text-xs text-gray-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                      <p className="text-xs text-gray-400 mt-1.5">📞 {addr.phone}</p>

                      {/* Edit / Delete */}
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditAddr(addr)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all" title="Edit">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteAddr(addr._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Delete">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Address Form Modal ─── */}
      {showAddrForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editingAddrId ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => setShowAddrForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveAddr} className="p-5 space-y-3">
              {/* Address Type */}
              <div className="flex gap-3">
                {['home', 'office'].map(t => (
                  <button key={t} type="button" onClick={() => setAddrForm({ ...addrForm, addressType: t })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${addrForm.addressType === t ? 'bg-[#205EA9] border-[#205EA9] text-white' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {t === 'home' ? '🏠 Home' : '🏢 Office'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">First Name</label>
                  <input type="text" required value={addrForm.firstName} onChange={(e) => setAddrForm({ ...addrForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#205EA9]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Last Name</label>
                  <input type="text" required value={addrForm.lastName} onChange={(e) => setAddrForm({ ...addrForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#205EA9]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
                <input type="tel" required value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#205EA9]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Street Address</label>
                <input type="text" required value={addrForm.streetAddress} onChange={(e) => setAddrForm({ ...addrForm, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#205EA9]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
                  <input type="text" required value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#205EA9]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">State</label>
                  <input type="text" required value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#205EA9]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Pincode</label>
                  <input type="text" required value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#205EA9]" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-[#205EA9] to-[#1d4f8f] text-white py-2.5 rounded-lg font-bold text-sm">
                  {editingAddrId ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={() => setShowAddrForm(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsPage;
