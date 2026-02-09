import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const SignUp = () => {
  const baseUrl = import.meta.env.VITE_BACKEND_API;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Password strength indicators
  const passwordChecks = {
    length: formData.password.length >= 6,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
    
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation: must be at least 2 words
    const nameParts = formData.name.trim().split(/\s+/);
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (nameParts.length < 2) {
      errors.name = 'Please enter both first name and surname';
    } else if (nameParts.some(part => part.length < 2)) {
      errors.name = 'Each name must be at least 2 characters';
    }

    // Phone validation: starts with 6/7/8/9, exactly 10 digits
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      if (!/^[6-9]/.test(formData.phone.trim())) {
        errors.phone = 'Invalid number';
      } else if (formData.phone.trim().length !== 10) {
        errors.phone = 'Number must be exactly 10 digits';
      } else {
        errors.phone = 'Enter a valid 10-digit phone number';
      }
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    // Password validation: 6+ chars, uppercase, lowercase, number, special char
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const missing = [];
      if (!passwordChecks.length) missing.push('at least 6 characters');
      if (!passwordChecks.uppercase) missing.push('an uppercase letter');
      if (!passwordChecks.lowercase) missing.push('a lowercase letter');
      if (!passwordChecks.number) missing.push('a number');
      if (!passwordChecks.special) missing.push('a special character');
      if (missing.length > 0) {
        errors.password = `Password needs ${missing.join(', ')}`;
      }
    }

    // Confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const PasswordStrengthBar = () => {
    const checks = Object.values(passwordChecks);
    const passed = checks.filter(Boolean).length;
    const percentage = (passed / checks.length) * 100;
    
    let color = 'bg-red-400';
    if (percentage >= 80) color = 'bg-green-500';
    else if (percentage >= 60) color = 'bg-yellow-400';
    else if (percentage >= 40) color = 'bg-orange-400';

    if (!formData.password) return null;

    return (
      <div className="mt-2 space-y-2">
        {/* Strength bar */}
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Checklist */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <CheckItem label="6+ characters" passed={passwordChecks.length} />
          <CheckItem label="Uppercase (A-Z)" passed={passwordChecks.uppercase} />
          <CheckItem label="Lowercase (a-z)" passed={passwordChecks.lowercase} />
          <CheckItem label="Number (0-9)" passed={passwordChecks.number} />
          <CheckItem label="Special (!@#$)" passed={passwordChecks.special} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Blurred Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat  scale-105"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770381893/ChatGPT_Image_Feb_6_2026_06_13_42_PM_z4quyf.png')`
        }}
      />
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20" />

      {/* White Form Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo/Header */}
        <div className="text-center mb-6">
          
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border ${fieldErrors.name ? 'border-red-400' : 'border-gray-300'} rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none transition-all text-sm`}
                placeholder="Name Surname"
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                name="phone"
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => {
                  // Only allow digits
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, phone: val });
                  if (fieldErrors.phone) {
                    setFieldErrors(prev => ({ ...prev, phone: '' }));
                  }
                }}
                className={`w-full px-4 py-2.5 bg-gray-50 border ${fieldErrors.phone ? 'border-red-400' : 'border-gray-300'} rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none transition-all text-sm`}
                placeholder="9876543210"
              />
              {fieldErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-gray-50 border ${fieldErrors.email ? 'border-red-400' : 'border-gray-300'} rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none transition-all text-sm`}
              placeholder="Enter your email"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border ${fieldErrors.password ? 'border-red-400' : 'border-gray-300'} rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none transition-all text-sm pr-12`}
                placeholder="Create password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
            )}
            <PasswordStrengthBar />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-gray-50 border ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'} rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none transition-all text-sm`}
              placeholder="Confirm password"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#65a30d] hover:bg-[#4d7c0f] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mt-2"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Creating...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-gray-600 mt-5">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-[#65a30d] hover:text-[#4d7c0f]">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

const CheckItem = ({ label, passed }) => (
  <div className={`flex items-center gap-1 text-xs ${passed ? 'text-green-600' : 'text-gray-400'}`}>
    <span>{passed ? '✓' : '○'}</span>
    <span>{label}</span>
  </div>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default SignUp;
