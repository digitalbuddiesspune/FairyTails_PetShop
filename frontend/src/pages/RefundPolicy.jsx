import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type } from '../styles/typography';

const RefundPolicy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'eligibility', title: 'Eligibility for Returns' },
    { id: 'non-returnable', title: 'Non-Returnable Items' },
    { id: 'process', title: 'Return Process' },
    { id: 'refund-timeline', title: 'Refund Timeline' },
    { id: 'cancellation', title: 'Order Cancellation' },
    { id: 'exchange', title: 'Exchanges' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#205EA9] to-[#205EA9] py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
            <span className={`text-white ${type.nav}`}>Hassle-Free Returns</span>
          </div>
          <h1 className={`${type.hero} text-white mb-4`}>Refund & Cancellation Policy</h1>
          <p className={`text-white/80 ${type.body} max-w-2xl mx-auto`}>
            We want you and your pets to be completely satisfied. Here's everything you need to know about returns, refunds, and cancellations.
          </p>
          <p className={`text-white/90 mt-3 ${type.captionMedium}`}>Last updated: February 10, 2026</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className={`${type.caption} font-bold text-gray-400 uppercase tracking-wider mb-4`}>On this page</h3>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className={`block text-gray-600 hover:text-[#205EA9] hover:bg-[#205EA9]/5 px-3 py-2 rounded-lg transition-colors ${type.nav}`}>
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-10">

              <section id="overview">
                <h2 className={`${type.h3} text-gray-900 mb-4`}>Overview</h2>
                <p className={`text-gray-600 ${type.body}`}>
                  At FairyTails Pet Shop, customer satisfaction is our top priority. If you're not completely happy with your purchase, we offer a straightforward return and refund process. Please read this policy carefully to understand your rights and the procedures involved.
                </p>
              </section>

              <section id="eligibility">
                <h2 className={`${type.h3} text-gray-900 mb-4`}>Eligibility for Returns</h2>
                <p className={`text-gray-600 ${type.body} mb-4`}>You may return a product if:</p>
                <ul className={`space-y-2 text-gray-600 ${type.body}`}>
                  <li className="flex gap-3"><span className="text-[#205EA9] font-bold mt-0.5">•</span>The product is unused, unopened, and in its original packaging.</li>
                  <li className="flex gap-3"><span className="text-[#205EA9] font-bold mt-0.5">•</span>The return request is raised within <strong>7 days</strong> of delivery.</li>
                  <li className="flex gap-3"><span className="text-[#205EA9] font-bold mt-0.5">•</span>The product received is damaged, defective, or different from what was ordered.</li>
                  <li className="flex gap-3"><span className="text-[#205EA9] font-bold mt-0.5">•</span>The product has not expired (for food, health supplements, and grooming products).</li>
                </ul>
              </section>

              <section id="non-returnable">
                <h2 className={`${type.h3} text-gray-900 mb-4`}>Non-Returnable Items</h2>
                <p className={`text-gray-600 ${type.body} mb-4`}>The following items cannot be returned or refunded:</p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <ul className={`space-y-2 text-gray-700 ${type.body}`}>
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Opened pet food, treats, or health supplements.</li>
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Used grooming products or accessories.</li>
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Personalized or customized items.</li>
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Items purchased during clearance sales (unless defective).</li>
                    <li className="flex gap-3"><span className="text-red-400 font-bold mt-0.5">✕</span>Products with missing tags, labels, or original packaging.</li>
                  </ul>
                </div>
              </section>

              <section id="process">
                <h2 className={`${type.h3} text-gray-900 mb-4`}>Return Process</h2>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Initiate a Return', desc: 'Go to your Orders page, select the order, and click "Request Return". Provide a reason and upload photos if applicable.' },
                    { step: '2', title: 'Approval', desc: 'Our team will review your request within 24–48 hours and notify you via email/SMS.' },
                    { step: '3', title: 'Ship the Product', desc: 'Once approved, a pickup will be scheduled or you can ship the item using the prepaid return label provided.' },
                    { step: '4', title: 'Quality Check', desc: 'After we receive the returned item, our team inspects it to ensure it meets the return conditions.' },
                    { step: '5', title: 'Refund Processed', desc: 'Once verified, the refund is initiated to your original payment method.' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-[#205EA9] text-white flex items-center justify-center text-sm font-bold shrink-0">{item.step}</div>
                      <div>
                        <h4 className={`${type.h4} text-gray-900`}>{item.title}</h4>
                        <p className={`text-gray-600 ${type.small}`}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="refund-timeline">
                <h2 className={`${type.h3} text-gray-900 mb-4`}>Refund Timeline</h2>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <table className={`w-full ${type.small}`}>
                    <thead>
                      <tr className="bg-gray-100">
                        <th className={`text-left px-5 py-3 ${type.label} text-gray-700`}>Payment Method</th>
                        <th className={`text-left px-5 py-3 ${type.label} text-gray-700`}>Refund Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr><td className={`px-5 py-3 text-gray-600 ${type.small}`}>UPI / Wallet</td><td className={`px-5 py-3 text-gray-600 ${type.small}`}>1–3 business days</td></tr>
                      <tr><td className={`px-5 py-3 text-gray-600 ${type.small}`}>Credit / Debit Card</td><td className={`px-5 py-3 text-gray-600 ${type.small}`}>5–7 business days</td></tr>
                      <tr><td className={`px-5 py-3 text-gray-600 ${type.small}`}>Net Banking</td><td className={`px-5 py-3 text-gray-600 ${type.small}`}>5–10 business days</td></tr>
                      <tr><td className={`px-5 py-3 text-gray-600 ${type.small}`}>Cash on Delivery</td><td className={`px-5 py-3 text-gray-600 ${type.small}`}>Refunded to bank account within 7–10 business days</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="cancellation">
                <h2 className={`${type.h3} text-gray-900 mb-4`}>Order Cancellation</h2>
                <p className={`text-gray-600 ${type.body} mb-3`}>
                  You can cancel your order under the following conditions:
                </p>
                <ul className={`space-y-2 text-gray-600 ${type.body}`}>
                  <li className="flex gap-3"><span className="text-[#205EA9] font-bold mt-0.5">•</span><strong>Before shipment:</strong> Full cancellation is allowed. Refund will be processed within 3–5 business days.</li>
                  <li className="flex gap-3"><span className="text-[#205EA9] font-bold mt-0.5">•</span><strong>After shipment:</strong> Cancellation is not possible. You may request a return once delivered.</li>
                  <li className="flex gap-3"><span className="text-[#205EA9] font-bold mt-0.5">•</span><strong>Partial cancellation:</strong> If you ordered multiple items, individual items can be cancelled before they are shipped.</li>
                </ul>
              </section>

              <section id="exchange">
                <h2 className={`${type.h3} text-gray-900 mb-4`}>Exchanges</h2>
                <p className={`text-gray-600 ${type.body}`}>
                  Currently, we do not offer direct exchanges. If you'd like a different product or size, please return the original item for a refund and place a new order. This ensures the fastest turnaround for you.
                </p>
              </section>

              <section id="contact">
                <h2 className={`${type.h3} text-gray-900 mb-4`}>Contact Us</h2>
                <p className={`text-gray-600 ${type.body} mb-4`}>
                  If you have questions about a return, refund, or cancellation, reach out to our support team:
                </p>
                <div className="bg-[#205EA9]/5 border border-[#205EA9]/20 rounded-xl p-5 space-y-2">
                  <p className={`text-gray-700 ${type.body}`}><strong>Email:</strong> support@fairytails.com</p>
                  <p className={`text-gray-700 ${type.body}`}><strong>Phone:</strong> +91 90217 85257</p>
                  <p className={`text-gray-700 ${type.body}`}><strong>Hours:</strong> Mon–Sat, 9:00 AM – 7:00 PM IST</p>
                </div>
              </section>

            </div>

            <div className="mt-8 text-center">
              <Link to="/" className={`text-[#205EA9] hover:underline ${type.nav}`}>← Back to Home</Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
