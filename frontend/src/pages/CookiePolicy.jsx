import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'what-are-cookies', title: 'What Are Cookies?' },
    { id: 'types', title: 'Types of Cookies' },
    { id: 'specific', title: 'Cookies We Use' },
    { id: 'third-party', title: 'Third-Party Cookies' },
    { id: 'manage', title: 'Managing Cookies' },
    { id: 'contact', title: 'Contact Us' },
  ];

  const cookieTypes = [
    {
      name: 'Essential',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: '🔐',
      description: 'Required for basic website functionality like navigation and cart features.',
    },
    {
      name: 'Performance',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: '📊',
      description: 'Help us understand how visitors interact with our website anonymously.',
    },
    {
      name: 'Functionality',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      icon: '⚙️',
      description: 'Remember your preferences like language and region settings.',
    },
    {
      name: 'Marketing',
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      icon: '📢',
      description: 'Track visitors to display relevant advertisements across websites.',
    },
  ];

  const cookies = [
    { name: 'session_id', purpose: 'Maintains session and cart', duration: 'Session', type: 'Essential' },
    { name: 'auth_token', purpose: 'Keeps you logged in', duration: '30 days', type: 'Essential' },
    { name: 'preferences', purpose: 'Stores site preferences', duration: '1 year', type: 'Functionality' },
    { name: '_ga', purpose: 'Google Analytics tracking', duration: '2 years', type: 'Performance' },
    { name: '_fbp', purpose: 'Facebook advertising', duration: '3 months', type: 'Marketing' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <span className="text-2xl">🍪</span>
            <span className="text-white font-medium">Cookie Information</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Cookie Policy</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Learn how we use cookies to enhance your browsing experience and keep our site running smoothly.
          </p>
          <p className="text-white/60 mt-4 text-sm">Last updated: February 2, 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Navigation</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/privacy-policy" className="flex items-center gap-2 text-sm text-amber-600 hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Privacy Policy
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <div className="space-y-12">
              {/* What Are Cookies */}
              <section id="what-are-cookies" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🍪</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">What Are Cookies?</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-6xl">🍪</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Cookies are small text files stored on your device when you visit websites. They help sites remember your preferences, keep you logged in, and understand how you use the site. Cookies are essential for making websites work efficiently and providing a better user experience.
                    </p>
                  </div>
                </div>
              </section>

              {/* Types of Cookies */}
              <section id="types" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📑</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {cookieTypes.map((type) => (
                    <div key={type.name} className={`${type.bgColor} border ${type.borderColor} rounded-2xl p-6`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 ${type.color} rounded-full`}></div>
                          <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{type.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Specific Cookies */}
              <section id="specific" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Cookies We Use</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cookie</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Purpose</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Duration</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cookies.map((cookie) => (
                          <tr key={cookie.name} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-800">{cookie.name}</code>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{cookie.purpose}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{cookie.duration}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                cookie.type === 'Essential' ? 'bg-green-100 text-green-700' :
                                cookie.type === 'Functionality' ? 'bg-purple-100 text-purple-700' :
                                cookie.type === 'Performance' ? 'bg-blue-100 text-blue-700' :
                                'bg-pink-100 text-pink-700'
                              }`}>
                                {cookie.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Third-Party Cookies */}
              <section id="third-party" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔗</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Third-Party Cookies</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <p className="text-gray-600 mb-6">We use trusted third-party services that may set their own cookies:</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { name: 'Google Analytics', icon: '📊', desc: 'Website traffic analysis' },
                      { name: 'Facebook Pixel', icon: '📘', desc: 'Advertising & retargeting' },
                      { name: 'Razorpay', icon: '💳', desc: 'Payment processing' },
                      { name: 'Intercom', icon: '💬', desc: 'Customer support chat' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                          <p className="text-gray-500 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Managing Cookies */}
              <section id="manage" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🎛️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Managing Cookies</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <p className="text-gray-600 mb-6">You can control cookies through your browser settings:</p>
                  <div className="space-y-3">
                    {[
                      { browser: 'Chrome', path: 'Settings → Privacy → Cookies' },
                      { browser: 'Firefox', path: 'Settings → Privacy → Cookies' },
                      { browser: 'Safari', path: 'Preferences → Privacy → Cookies' },
                      { browser: 'Edge', path: 'Settings → Cookies and permissions' },
                    ].map((item) => (
                      <div key={item.browser} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-900">{item.browser}</span>
                        <code className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg">{item.path}</code>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 text-sm flex items-start gap-2">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Note: Blocking essential cookies may affect website functionality and your shopping experience.</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📬</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                </div>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 md:p-8 text-white">
                  <p className="text-white/90 mb-6">Questions about our cookie policy? Get in touch!</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <a href="mailto:privacy@fairytails.com" className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-colors">
                      <span className="text-2xl block mb-2">📧</span>
                      <span className="text-sm">privacy@fairytails.com</span>
                    </a>
                    <a href="tel:+919876543210" className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-colors">
                      <span className="text-2xl block mb-2">📞</span>
                      <span className="text-sm">+91 98765 43210</span>
                    </a>
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <span className="text-2xl block mb-2">📍</span>
                      <span className="text-sm">Mumbai, India</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
