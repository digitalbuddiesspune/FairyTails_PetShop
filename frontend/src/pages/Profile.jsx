import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import dogImage from '../assets/dog.png';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setFormData({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || ''
      });
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab !== 'orders') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/orders`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setOrders(res.data.data);
      } catch (err) { console.error(err); }
      finally { setOrdersLoading(false); }
    };
    fetchOrders();
  }, [activeTab]);

  // Fetch addresses when address tab is active
  useEffect(() => {
    if (activeTab !== 'address') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetchAddresses = async () => {
      setAddressesLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/addresses`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setAddresses(res.data.data);
      } catch (err) { console.error(err); }
      finally { setAddressesLoading(false); }
    };
    fetchAddresses();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateError('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        })
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

  // Helper to get first name only
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.trim().split(/\s+/)[0];
  };

  const menuItems = [
    { id: 'orders', label: 'Orders', icon: <OrdersIcon /> },
    { id: 'address', label: 'Address', icon: <AddressIcon /> },
   
    { id: 'settings', label: 'Account Settings', icon: <SettingsIcon /> },
    { id: 'logout', label: 'Log Out', icon: <LogoutIcon /> },
  ];

  const handleMenuClick = (id) => {
    if (id === 'logout') {
      handleLogout();
    } else {
      setActiveTab(id);
      setMobileMenuOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="animate-fadeIn h-full flex flex-col">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-8">Your Orders</h2>
            {ordersLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-10 text-center max-w-lg w-full shadow-sm">
                  <div className="w-24 h-24 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <span className="text-5xl">📦</span>
                  </div>
                  <p className="text-blue-600 font-bold mb-5 text-lg">No orders yet</p>
                  <Link to="/" className="inline-block bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-7 py-3 rounded-xl transition-colors font-semibold shadow-lg">
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {orders.map((order) => {
                  const statusMap = {
                    placed: { label: 'Confirm', color: 'bg-blue-100 text-blue-700' },
                    processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
                    shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
                    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
                    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
                  };
                  const st = statusMap[order.status] || statusMap.placed;
                  return (
                    <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">Order #{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}>{st.label}</span>
                          <span className="font-bold text-gray-900">₹{order.total.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                              {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-contain p-0.5" /> : <span className="flex items-center justify-center h-full text-sm">🐾</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                              <p className="text-[10px] text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                        {order.paymentMethod === 'cash_on_delivery' ? '💵 Cash on Delivery' : '💳 Online'} · {order.shippingAddress.city}, {order.shippingAddress.state}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'address':
        return (
          <div className="animate-fadeIn h-full flex flex-col">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-8">Your Addresses</h2>
            {addressesLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-10 text-center max-w-lg w-full shadow-sm">
                  <div className="w-24 h-24 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <span className="text-5xl">📍</span>
                  </div>
                  <p className="text-gray-500 font-medium mb-5 text-lg">No addresses saved</p>
                  <Link to="/checkout" className="inline-block bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-7 py-3 rounded-xl transition-colors font-semibold shadow-lg">
                    + Add New Address
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {addresses.map((addr) => (
                  <div key={addr._id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${addr.addressType === 'home' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {addr.addressType === 'home' ? '🏠' : '🏢'} {addr.addressType}
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">{addr.firstName} {addr.lastName}</span>
                    </div>
                    <p className="text-sm text-gray-600">{addr.streetAddress}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                    <p className="text-xs text-gray-400 mt-1">📞 {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'subscription':
        return (
          <div className="animate-fadeIn h-full flex flex-col">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">Subscriptions</h2>
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-10 sm:p-12 text-center max-w-lg w-full shadow-sm">
                <div className="w-28 h-28 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-6xl">🔄</span>
                </div>
                <p className="text-blue-600 font-bold mb-2 text-xl">No active subscriptions</p>
                <p className="text-gray-500 text-sm mb-6">Subscribe for regular pet essentials delivery</p>
                <button className="bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-8 py-3.5 rounded-xl transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Browse Plans
                </button>
              </div>
            </div>
          </div>
        );
      case 'invite':
        return (
          <div className="animate-fadeIn h-full flex flex-col">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">Invite Friends</h2>
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-10 sm:p-12 text-center max-w-lg w-full shadow-sm">
                <div className="w-28 h-28 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-6xl">🎁</span>
                </div>
                <p className="text-gray-700 font-medium mb-4 text-lg">Share your referral code and earn rewards!</p>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center border border-blue-200 mb-6">
                  <span className="font-mono text-2xl font-bold text-[#65a30d]">
                    {user?.name?.toUpperCase().replace(/\s/g, '')?.slice(0, 6) || 'FAIRY'}2024
                  </span>
                </div>
                <button className="bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-8 py-3.5 rounded-xl transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Copy Code
                </button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-fadeIn h-full flex flex-col justify-center items-center py-4">

            {updateSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-xl mb-4 flex items-center justify-center gap-2 text-base max-w-lg mx-auto w-full">
                <span>✓</span> {updateSuccess}
              </div>
            )}

            {updateError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl mb-4 flex items-center justify-center gap-2 text-base max-w-lg mx-auto w-full">
                <span>✕</span> {updateError}
              </div>
            )}

            <div className="w-full flex items-center justify-center">
              <div className="max-w-lg w-full bg-white/60 backdrop-blur-sm border border-white/80 p-6 sm:p-8 rounded-3xl shadow-sm">
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <label className="text-xs text-gray-500 uppercase font-bold tracking-wide">Full Name</label>
                      <p className="text-gray-900 font-bold text-lg mt-0.5">{user?.name || 'Not set'}</p>
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <label className="text-xs text-gray-500 uppercase font-bold tracking-wide">Email Address</label>
                      <p className="text-gray-900 font-bold text-lg mt-0.5 break-all">{user?.email || 'Not set'}</p>
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <label className="text-xs text-gray-500 uppercase font-bold tracking-wide">Phone Number</label>
                      <p className="text-gray-900 font-bold text-lg mt-0.5">{user?.phone || 'Not set'}</p>
                    </div>
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-6 py-2 rounded-xl transition-colors font-bold text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        ✏️ Edit Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-4 focus:ring-[#65a30d]/20 focus:border-[#65a30d] outline-none text-base transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-4 focus:ring-[#65a30d]/20 focus:border-[#65a30d] outline-none text-base transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-4 focus:ring-[#65a30d]/20 focus:border-[#65a30d] outline-none text-base transition-all"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-center">
                      <button
                        type="submit"
                        className="bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-6 py-2 rounded-xl transition-colors font-bold text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setUpdateError('');
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl transition-colors font-bold text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fff7ed] py-4 relative overflow-hidden font-sans">

      <div className="w-full px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Sidebar - Profile Navigation */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-orange-100/50 border border-white/50 overflow-hidden">
              {/* User Header */}
              {/* User Header - Compact */}
              <div className="p-5 text-center bg-gradient-to-b from-white to-[#fefce8]">
                <div className="w-16 h-16 mx-auto mb-3 relative">
                  <div className="absolute inset-0 bg-[#fcd34d] rounded-full blur-md opacity-50"></div>
                  <div className="relative bg-white rounded-full w-full h-full flex items-center justify-center border-2 border-[#fff7ed] shadow-inner text-2xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-[#65a30d] w-4 h-4 rounded-full border border-white"></div>
                </div>
                <h1 className="text-lg font-bold text-gray-800 mb-0.5">Hi, {getFirstName(user.name)}</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pet Lover</p>
              </div>

              {/* Navigation Menu */}
              <div className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === item.id
                      ? 'bg-[#65a30d] text-white shadow-lg shadow-[#65a30d]/30 scale-100'
                      : 'text-gray-600 hover:bg-[#fefce8] hover:text-[#65a30d]'
                      } ${item.id === 'logout' ? 'mt-4 !text-red-500 hover:bg-red-50 hover:!text-red-600' : ''}`}
                  >
                    <span className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-white/20' : 'bg-transparent'}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold text-sm">{item.label}</span>
                    {activeTab === item.id && <ChevronRightIcon className="ml-auto w-4 h-4 text-white/80" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-orange-100/50 border border-white/50 min-h-[80vh] relative overflow-hidden flex flex-col">

              {/* Internal Background Decor - Pet Themed Patterns */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#fcd34d]/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-[#86efac]/20 to-transparent rounded-full blur-3xl -ml-20 -mb-20" />

                {/* Floating Paw Prints (Moved Inside) */}
                <PawPrint className="absolute top-10 right-10 text-[#fcd34d]/30 w-14 h-14 rotate-12 animate-float" />
                <PawPrint className="absolute bottom-20 left-10 text-[#86efac]/30 w-20 h-20 -rotate-12 animate-float-delayed" />
                <BoneIcon className="absolute top-1/2 left-[10%] text-[#fdba74]/20 w-10 h-10 rotate-45 animate-pulse-slow" />
              </div>
              {/* Content Header Image/Banner */}
              <div className="h-32 bg-gradient-to-r from-[#fefce8] to-[#fff7ed] relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#fde047]/20 rounded-full blur-2xl"></div>
                <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23fcd34d\" fill-opacity=\"0.4\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E')" }}></div>
                {/* Dynamic Header Title based on Tab */}
                <div className="absolute bottom-0 left-0 p-8">
                  <h2 className="text-3xl font-bold text-gray-800 capitalize tracking-tight">
                    {menuItems.find(m => m.id === activeTab)?.label}
                  </h2>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-8 flex-1 relative z-10">
                {renderContent()}
              </div>

              {/* Cute decoration at the bottom right */}
              {/* Cute decoration at the bottom right */}
              <div className="absolute bottom-0 right-0 pointer-events-none opacity-90 transition-opacity duration-500">
                <img
                  src={dogImage}
                  alt="Happy Dog"
                  className="w-48 h-auto object-contain -mb-4 -mr-4"
                  style={{ maskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-15px) rotate(-12deg); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};

// --- Custom Icons ---

const PawPrint = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C10.5 2 9.5 3.5 9.5 5C9.5 6.5 10.5 8 12 8C13.5 8 14.5 6.5 14.5 5C14.5 3.5 13.5 2 12 2Z" />
    <path d="M4.5 6C3 6 2 7.5 2 9C2 10.5 3 12 4.5 12C6 12 7 10.5 7 9C7 7.5 6 6 4.5 6Z" />
    <path d="M19.5 6C18 6 17 7.5 17 9C17 10.5 18 12 19.5 12C21 12 22 10.5 22 9C22 7.5 21 6 19.5 6Z" />
    <path d="M6 14.5C6 12.567 8.68615 11 12 11C15.3138 11 18 12.567 18 14.5C18 16.433 15.3138 22 12 22C8.68615 22 6 16.433 6 14.5Z" />
  </svg>
);

const BoneIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.7,6.3c-1.6,0-3,1-3.7,2.4c-0.7-1.4-2.1-2.4-3.7-2.4C8.2,6.3,6.5,8,6.5,10c0,1,0.4,1.9,1.1,2.5l-3,3c-1,1-1,2.6,0,3.5c1,1,2.6,1,3.5,0l3-3c0.6,0.7,1.5,1.1,2.5,1.1c2,0,3.7-1.7,3.7-3.7c0-1.6-1-3-2.4-3.7c1.4-0.7,2.4-2.1,2.4-3.7C19.8,8,19,7.1,17.7,6.3z" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const AddressIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SubscriptionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InviteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronDownIcon = ({ className = '' }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default Profile;
