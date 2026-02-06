import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'account', title: 'Account Registration' },
    { id: 'products', title: 'Products & Pricing' },
    { id: 'orders', title: 'Orders & Payment' },
    { id: 'shipping', title: 'Shipping & Delivery' },
    { id: 'returns', title: 'Returns & Refunds' },
    { id: 'conduct', title: 'User Conduct' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-white font-medium">Legal Agreement</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using our services. By using FairyTails, you agree to these terms.
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
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/contact" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Have questions?
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <div className="space-y-12">
              {/* Acceptance */}
              <section id="acceptance" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">1</div>
                  <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    By accessing or using FairyTails Pet Shop website, mobile application, or any of our services, you agree to be bound by these Terms of Service.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-800 text-sm flex items-start gap-2">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>If you do not agree to these Terms, please do not use our services. You must be at least 18 years old to use our services.</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Account */}
              <section id="account" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">2</div>
                  <h2 className="text-2xl font-bold text-gray-900">Account Registration</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <p className="text-gray-600 mb-4">When creating an account, you agree to:</p>
                  <div className="space-y-3">
                    {[
                      'Provide accurate and complete information',
                      'Maintain and update your information',
                      'Keep your password confidential',
                      'Notify us of unauthorized access',
                      'Be responsible for all account activities',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Products */}
              <section id="products" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">3</div>
                  <h2 className="text-2xl font-bold text-gray-900">Products & Pricing</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <span className="text-2xl mb-2 block">📸</span>
                      <h3 className="font-semibold text-gray-900 mb-1">Product Images</h3>
                      <p className="text-sm text-gray-600">May vary slightly from actual products</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <span className="text-2xl mb-2 block">💰</span>
                      <h3 className="font-semibold text-gray-900 mb-1">Pricing</h3>
                      <p className="text-sm text-gray-600">Subject to change without notice</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <span className="text-2xl mb-2 block">📦</span>
                      <h3 className="font-semibold text-gray-900 mb-1">Availability</h3>
                      <p className="text-sm text-gray-600">Products may be discontinued anytime</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <span className="text-2xl mb-2 block">❌</span>
                      <h3 className="font-semibold text-gray-900 mb-1">Pricing Errors</h3>
                      <p className="text-sm text-gray-600">We may cancel orders with incorrect prices</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Orders */}
              <section id="orders" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">4</div>
                  <h2 className="text-2xl font-bold text-gray-900">Orders & Payment</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <p className="text-gray-600 mb-6">By placing an order, you are making an offer to purchase. All orders are subject to acceptance and availability.</p>
                  <div className="flex flex-wrap gap-3">
                    {['VISA', 'Mastercard', 'UPI', 'Net Banking', 'COD'].map((method) => (
                      <span key={method} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Shipping */}
              <section id="shipping" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">5</div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipping & Delivery</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white">
                  <div className="grid sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-xl p-4">
                      <span className="text-3xl block mb-2">🚚</span>
                      <h3 className="font-semibold mb-1">Free Delivery</h3>
                      <p className="text-sm text-white/80">Orders above ₹499</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <span className="text-3xl block mb-2">⏱️</span>
                      <h3 className="font-semibold mb-1">Delivery Time</h3>
                      <p className="text-sm text-white/80">3-7 business days</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <span className="text-3xl block mb-2">📍</span>
                      <h3 className="font-semibold mb-1">Tracking</h3>
                      <p className="text-sm text-white/80">Real-time updates</p>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mt-6 text-center">
                    *Delivery times are estimates. We are not responsible for carrier delays.
                  </p>
                </div>
              </section>

              {/* Returns */}
              <section id="returns" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">6</div>
                  <h2 className="text-2xl font-bold text-gray-900">Returns & Refunds</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <span className="text-4xl">↩️</span>
                    <div>
                      <h3 className="font-bold text-green-800 text-lg">7-Day Return Policy</h3>
                      <p className="text-green-700 text-sm">Easy returns on most products</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Items must be unused and in original packaging</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Refunds processed within 5-7 business days</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-600">Perishable items (food, treats) are non-returnable unless defective</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Conduct */}
              <section id="conduct" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">7</div>
                  <h2 className="text-2xl font-bold text-gray-900">User Conduct</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <p className="text-gray-600 mb-4">You agree NOT to:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      'Use services illegally',
                      'Disrupt our systems',
                      'Attempt unauthorized access',
                      'Upload malicious code',
                      'Engage in fraud',
                      'Harass other users',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span className="text-red-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">8</div>
                  <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white">
                  <p className="text-white/90 mb-6">Questions about our terms? We're happy to help.</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <a href="mailto:legal@fairytails.com" className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-colors">
                      <span className="text-2xl block mb-2">📧</span>
                      <span className="text-sm">legal@fairytails.com</span>
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

export default TermsOfService;
