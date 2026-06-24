import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type } from '../styles/typography';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'information-collect', title: 'Information We Collect' },
    { id: 'how-we-use', title: 'How We Use Information' },
    { id: 'sharing', title: 'Information Sharing' },
    { id: 'security', title: 'Data Security' },
    { id: 'rights', title: 'Your Rights' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#205EA9] to-[#205EA9] py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className={`text-white ${type.nav}`}>Your Privacy Matters</span>
          </div>
          <h1 className={`${type.hero} text-white mb-4`}>Privacy Policy</h1>
          <p className={`text-white/80 ${type.body} max-w-2xl mx-auto`}>
            We're committed to protecting your personal information and being transparent about how we use it.
          </p>
          <p className={`text-white/90 mt-3 ${type.captionMedium}`}>Last updated: February 10, 2026</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className={`${type.h4} text-gray-900 mb-4`}>Quick Navigation</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`block px-3 py-2 text-gray-600 hover:text-[#205EA9] hover:bg-[#eff6ff] rounded-lg transition-colors ${type.nav}`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/contact" className={`flex items-center gap-2 text-[#205EA9] hover:underline ${type.nav}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Have questions?
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl">
            <div className="space-y-12">
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#eff6ff] rounded-xl flex items-center justify-center">
                    <span className="text-xl">👋</span>
                  </div>
                  <h2 className={`${type.h3} text-gray-900`}>Introduction</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <p className={`text-gray-600 ${type.body}`}>
                    At FairyTails Pet Shop, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, mobile application, or make a purchase from us.
                  </p>
                </div>
              </section>

              {/* Information We Collect */}
              <section id="information-collect" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#fef3c7] rounded-xl flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                  <h2 className={`${type.h3} text-gray-900`}>Information We Collect</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`${type.h4} text-gray-900 mb-2`}>Personal Information</h3>
                      <p className={`text-gray-600 ${type.small} mb-3`}>We collect information when you:</p>
                      <ul className="space-y-2">
                        {['Create an account', 'Make a purchase', 'Subscribe to newsletter', 'Contact support', 'Participate in promotions'].map((item) => (
                          <li key={item} className={`flex items-center gap-2 text-gray-600 ${type.small}`}>
                            <svg className="w-4 h-4 text-[#205EA9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-6 flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`${type.h4} text-gray-900 mb-2`}>Automatic Information</h3>
                      <p className={`text-gray-600 ${type.small}`}>
                        We automatically collect IP address, browser type, device info, operating system, and browsing behavior to improve your experience.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section id="how-we-use" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#dbeafe] rounded-xl flex items-center justify-center">
                    <span className="text-xl">⚙️</span>
                  </div>
                  <h2 className={`${type.h3} text-gray-900`}>How We Use Your Information</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: '📦', title: 'Order Processing', desc: 'Fulfilling and delivering your orders' },
                    { icon: '💬', title: 'Customer Support', desc: 'Managing your account and providing help' },
                    { icon: '📧', title: 'Communications', desc: 'Sending promotional offers (with consent)' },
                    { icon: '📊', title: 'Improvements', desc: 'Enhancing our products and services' },
                    { icon: '🛡️', title: 'Security', desc: 'Preventing fraud and ensuring safety' },
                    { icon: '⚖️', title: 'Legal Compliance', desc: 'Meeting our legal obligations' },
                  ].map((item) => (
                    <div key={item.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                      <span className="text-xl mb-3 block">{item.icon}</span>
                      <h3 className={`${type.h4} text-gray-900 mb-1`}>{item.title}</h3>
                      <p className={`text-gray-600 ${type.small}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Information Sharing */}
              <section id="sharing" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#fce7f3] rounded-xl flex items-center justify-center">
                    <span className="text-xl">🤝</span>
                  </div>
                  <h2 className={`${type.h3} text-gray-900`}>Information Sharing</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4 mb-6">
                    <p className={`text-[#1e3a8a] ${type.nav} flex items-center gap-2`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      We never sell, trade, or rent your personal information
                    </p>
                  </div>
                  <p className="text-gray-600 mb-4">We may share your information with:</p>
                  <div className="space-y-4">
                    {[
                      { title: 'Service Providers', desc: 'Payment processors, shipping partners, and other third parties that help us operate' },
                      { title: 'Legal Requirements', desc: 'When required by law or to protect our rights and safety' },
                      { title: 'Business Transfers', desc: 'In connection with a merger, acquisition, or sale of assets' },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3">
                        <div className="w-2 h-2 bg-[#205EA9] rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className={`${type.nav} text-gray-900`}>{item.title}:</span>
                          <span className="text-gray-600 ml-1">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section id="security" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#e0e7ff] rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                  <h2 className={`${type.h3} text-gray-900`}>Data Security</h2>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white">
                  <p className={`text-gray-300 ${type.body} mb-6`}>
                    We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { icon: '🔐', title: 'Encryption' },
                      { icon: '🖥️', title: 'Secure Servers' },
                      { icon: '🔍', title: 'Regular Audits' },
                    ].map((item) => (
                      <div key={item.title} className="bg-white/10 rounded-xl p-4 text-center">
                        <span className="text-xl block mb-2">{item.icon}</span>
                        <span className={`${type.small} font-medium`}>{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section id="rights" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#ccfbf1] rounded-xl flex items-center justify-center">
                    <span className="text-xl">✋</span>
                  </div>
                  <h2 className={`${type.h3} text-gray-900`}>Your Rights</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { icon: '👁️', title: 'Access', desc: 'Request a copy of your data' },
                      { icon: '✏️', title: 'Correction', desc: 'Fix inaccurate information' },
                      { icon: '🗑️', title: 'Deletion', desc: 'Request data removal' },
                      { icon: '🚫', title: 'Opt-out', desc: 'Unsubscribe from marketing' },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <h3 className={`${type.h4} text-gray-900`}>{item.title}</h3>
                          <p className={`${type.small} text-gray-600`}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#fed7aa] rounded-xl flex items-center justify-center">
                    <span className="text-xl">📬</span>
                  </div>
                  <h2 className={`${type.h3} text-gray-900`}>Contact Us</h2>
                </div>
                <div className="bg-gradient-to-r from-[#205EA9] to-[#205EA9] rounded-2xl p-6 md:p-8 text-white">
                  <p className={`text-white/90 mb-6 ${type.body}`}>Have questions about our privacy practices? We're here to help.</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <a href="mailto:privacy@fairytails.com" className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-colors">
                      <span className="text-xl block mb-2">📧</span>
                      <span className={`${type.small} block`}>privacy@fairytails.com</span>
                    </a>
                    <a href="tel:+919021785257" className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-colors">
                      <span className="text-xl block mb-2">📞</span>
                      <span className={`${type.small} block`}>+91 90217 85257</span>
                    </a>
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <span className="text-xl block mb-2">📍</span>
                      <span className={`${type.small} block`}>Mumbai, India</span>
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

export default PrivacyPolicy;
