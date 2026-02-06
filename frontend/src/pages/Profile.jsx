import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dogImage from '../assets/dog.png';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
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
      
      const response = await fetch('http://localhost:3000/api/auth/update', {
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
          <div className="animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Your Orders</h2>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 sm:p-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl sm:text-3xl">📦</span>
              </div>
              <p className="text-blue-600 font-medium mb-3 text-sm sm:text-base">No orders available</p>
              <button className="bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-4 sm:px-5 py-2 rounded-lg transition-colors font-medium text-xs sm:text-sm">
                Start Shopping
              </button>
            </div>
          </div>
        );
      case 'address':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Your Addresses</h2>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 sm:p-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl sm:text-3xl">📍</span>
              </div>
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No addresses saved</p>
              <button className="bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-4 sm:px-5 py-2 rounded-lg transition-colors font-medium text-xs sm:text-sm">
                + Add New Address
              </button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Account Settings</h2>
            
            {updateSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-3 sm:px-4 py-2 rounded-lg mb-3 flex items-center gap-2 text-xs sm:text-sm">
                <span>✓</span> {updateSuccess}
              </div>
            )}
            
            {updateError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 rounded-lg mb-3 flex items-center gap-2 text-xs sm:text-sm">
                <span>✕</span> {updateError}
              </div>
            )}

            {!isEditing ? (
              <div className="space-y-2">
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <label className="text-xs text-gray-500 uppercase font-medium">Full Name</label>
                  <p className="text-gray-900 font-semibold text-sm sm:text-base">{user?.name || 'Not set'}</p>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <label className="text-xs text-gray-500 uppercase font-medium">Email Address</label>
                  <p className="text-gray-900 font-semibold text-sm sm:text-base break-all">{user?.email || 'Not set'}</p>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <label className="text-xs text-gray-500 uppercase font-medium">Phone Number</label>
                  <p className="text-gray-900 font-semibold text-sm sm:text-base">{user?.phone || 'Not set'}</p>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-5 sm:px-6 py-2 rounded-lg transition-colors font-semibold text-xs sm:text-sm mt-3"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button 
                    type="submit"
                    className="bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-5 py-2 rounded-lg transition-colors font-semibold text-xs sm:text-sm"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setUpdateError('');
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition-colors font-semibold text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-10">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 xl:w-72 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
            {/* User Greeting - Inside Sidebar */}
            <div className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Hi {user.name} 👋</h1>
            </div>
            
            {/* Menu Items - Desktop */}
            <div className="hidden lg:block">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-100 transition-all ${
                    activeTab === item.id 
                      ? 'bg-blue-100/60 border-l-4 border-l-blue-500 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  } ${item.id === 'logout' ? 'text-red-500 hover:bg-red-50' : ''}`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`${activeTab === item.id ? 'text-blue-500' : item.id === 'logout' ? 'text-red-500' : 'text-gray-500'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-xs sm:text-sm">{item.label}</span>
                  </div>
                  <ChevronRightIcon />
                </button>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-full flex items-center justify-between px-3 sm:px-4 py-3 text-gray-700"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500">
                  {menuItems.find(m => m.id === activeTab)?.icon}
                </span>
                <span className="font-medium text-xs sm:text-sm">{menuItems.find(m => m.id === activeTab)?.label}</span>
              </div>
              <ChevronDownIcon className={`transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Menu Dropdown - Inline */}
            {mobileMenuOpen && (
              <div className="lg:hidden border-t border-gray-100 animate-slideDown">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-100 transition-all ${
                      activeTab === item.id 
                        ? 'bg-blue-100/60 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    } ${item.id === 'logout' ? 'text-red-500 hover:bg-red-50' : ''}`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`${activeTab === item.id ? 'text-blue-500' : item.id === 'logout' ? 'text-red-500' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium text-xs sm:text-sm">{item.label}</span>
                    </div>
                    {activeTab === item.id && <span className="text-blue-500 text-sm">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Content with Dog Image */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px] sm:min-h-[350px]">
            <div className="flex h-full">
              {/* Content Area */}
              <div className="flex-1 p-3 sm:p-4 md:p-5">
                {renderContent()}
              </div>
              
              {/* Dog Image - Right Side */}
              <div className="hidden lg:flex items-end justify-center px-2 sm:px-4 pb-4 bg-gradient-to-t from-blue-50/30 to-transparent">
                <img 
                  src={dogImage} 
                  alt="Cute Dog" 
                  className="w-32 xl:w-40 h-auto object-contain opacity-90"
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
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

// Icons
const OrdersIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const AddressIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronDownIcon = ({ className = '' }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default Profile;
