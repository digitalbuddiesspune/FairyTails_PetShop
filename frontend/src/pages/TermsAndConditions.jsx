import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'account', title: 'Your Account' },
    { id: 'products', title: 'Products & Pricing' },
    { id: 'orders', title: 'Orders & Payment' },
    { id: 'ip', title: 'Intellectual Property' },
    { id: 'prohibited', title: 'Prohibited Activities' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'indemnification', title: 'Indemnification' },
    { id: 'governing', title: 'Governing Law' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#65a30d] to-[#84cc16] py-10 md:py-14">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-white font-medium">Legal Agreement</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms & Conditions</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using our website or purchasing any products from FairyTails Pet Shop.
          </p>
          <p className="text-white/90 mt-3 text-sm font-medium">Last updated: February 10, 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">On this page</h3>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="block text-sm text-gray-600 hover:text-[#65a30d] hover:bg-[#65a30d]/5 px-3 py-2 rounded-lg transition-colors">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-10">

              <section id="acceptance">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using the FairyTails Pet Shop website (fairytails.com), mobile application, or any related services (collectively, the "Platform"), you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our Platform. Your continued use constitutes acceptance of any updates to these terms.
                </p>
              </section>

              <section id="account">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Account</h2>
                <p className="text-gray-600 leading-relaxed mb-3">When you create an account with us, you agree to:</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>Provide accurate, current, and complete information during registration.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>Maintain and promptly update your account information.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>Keep your password confidential and not share it with others.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>Be responsible for all activities under your account.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>Notify us immediately if you suspect unauthorized use of your account.</li>
                </ul>
                <p className="text-gray-600 mt-3">
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
                </p>
              </section>

              <section id="products">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Products & Pricing</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>All product descriptions, images, and specifications are provided for informational purposes. Actual products may slightly vary.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>Prices are listed in Indian Rupees (INR) and include 18% GST.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>We reserve the right to modify prices at any time without prior notice. Price changes do not affect already-placed orders.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>In case of a pricing error, we may cancel the order and issue a full refund.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>Product availability is subject to stock levels and may change without notice.</li>
                </ul>
              </section>

              <section id="orders">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders & Payment</h2>
                <p className="text-gray-600 leading-relaxed mb-3">By placing an order, you agree that:</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>You are legally capable of entering into a binding contract.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>All information provided during checkout is accurate.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>We accept Cash on Delivery (COD) and online payments (UPI, credit/debit cards, net banking).</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>An order confirmation does not guarantee acceptance. We reserve the right to reject or cancel orders at any time.</li>
                  <li className="flex gap-3"><span className="text-[#65a30d] font-bold mt-0.5">•</span>For COD orders, failure to accept delivery may result in the address being blocked for future COD orders.</li>
                </ul>
              </section>

              <section id="ip">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed">
                  All content on the Platform — including but not limited to text, graphics, logos ("FairyTails"), icons, images, audio clips, digital downloads, data compilations, and software — is the property of FairyTails Pet Shop or its content suppliers and is protected by Indian and international copyright laws. You may not reproduce, duplicate, copy, sell, resell, or exploit any portion of the Platform without express written permission.
                </p>
              </section>

              <section id="prohibited">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h2>
                <p className="text-gray-600 leading-relaxed mb-3">You agree not to:</p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Use the Platform for any unlawful purpose.</li>
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Impersonate another person or entity.</li>
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Submit false reviews, ratings, or feedback.</li>
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Attempt to gain unauthorized access to our systems or other user accounts.</li>
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Use automated tools (bots, scrapers) to extract data from the Platform.</li>
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Interfere with the proper operation of the Platform.</li>
                  </ul>
                </div>
              </section>

              <section id="liability">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  To the fullest extent permitted by law, FairyTails Pet Shop shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of data, profits, or goodwill. Our total liability for any claim shall not exceed the amount you paid for the specific product or service giving rise to the claim.
                </p>
              </section>

              <section id="indemnification">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree to indemnify and hold harmless FairyTails Pet Shop, its directors, employees, and affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of your use of the Platform, violation of these Terms, or infringement of any third-party rights.
                </p>
              </section>

              <section id="governing">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra, India.
                </p>
              </section>

              <section id="changes">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update these Terms & Conditions from time to time. Changes will be posted on this page with a revised "Last updated" date. We encourage you to review this page periodically. Continued use of the Platform after changes are posted constitutes your acceptance of the revised terms.
                </p>
              </section>

              <section id="contact">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have any questions about these Terms & Conditions, please contact us:
                </p>
                <div className="bg-[#65a30d]/5 border border-[#65a30d]/20 rounded-xl p-5 space-y-2">
                  <p className="text-gray-700"><strong>FairyTails Pet Shop</strong></p>
                  <p className="text-gray-700"><strong>Email:</strong> support@fairytails.com</p>
                  <p className="text-gray-700"><strong>Phone:</strong> +91 98765 43210</p>
                  <p className="text-gray-700"><strong>Address:</strong> Hinjewadi, Pune, Maharashtra – 411057, India</p>
                </div>
              </section>

            </div>

            <div className="mt-8 text-center">
              <Link to="/" className="text-[#65a30d] hover:underline font-medium text-sm">← Back to Home</Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
