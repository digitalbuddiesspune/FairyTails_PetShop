import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import cattImage from '../assets/catt.png';
import { type } from '../styles/typography';

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

const AddressPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/signin'); return; }
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setAddresses(res.data.data);
      } catch (err) {
        console.error('Fetch addresses error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [token, navigate]);

  const handleDelete = async (id) => {
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

  if (!token) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#205EA9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`${type.body} text-gray-500`}>Loading your addresses...</p>
        </div>
      </div>
    );
  }

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
            <h1 className={`${type.hero} md:text-3xl text-gray-900`}>My Addresses</h1>
            <p className={`${type.bodySm} text-gray-400 mt-0.5`}>{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <section className="pb-12 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {addresses.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className={`${type.hero}`}>📍</span>
              </div>
              <h3 className={`${type.h3} text-gray-800 mb-2`}>No addresses saved</h3>
              <p className="text-gray-500 mb-6">Add an address during checkout to see it here.</p>
              <Link to="/checkout" className={`${type.button} inline-block bg-gradient-to-r from-[#205EA9] to-[#1d4f8f] text-white py-3 px-8 rounded-xl hover:from-[#1d4f8f] hover:to-[#203D5B] transition-all`}>
                + Add New Address
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div key={addr._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative group hover:shadow-md transition-shadow">
                  {/* Type Badge */}
                  <span className={`inline-block text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg mb-3 ${
                    addr.addressType === 'home'
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-purple-50 text-purple-600 border border-purple-100'
                  }`}>
                    {addr.addressType === 'home' ? '🏠 Home' : '🏢 Work'}
                  </span>

                  <h3 className={`${type.input} text-gray-900 mb-1`}>{addr.firstName} {addr.lastName}</h3>
                  <p className={`${type.body} text-gray-600`}>{addr.streetAddress}</p>
                  <p className={`${type.bodySm} text-gray-600`}>{addr.city}, {addr.state} — {addr.pincode}</p>
                  <p className={`${type.bodySm} text-gray-400 mt-2 flex items-center gap-1.5`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {addr.phone}
                  </p>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete address"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AddressPage;
