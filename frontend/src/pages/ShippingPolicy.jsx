import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'delivery-areas', title: 'Delivery Areas' },
    { id: 'delivery-time', title: 'Estimated Delivery Time' },
    { id: 'shipping-charges', title: 'Shipping Charges' },
    { id: 'tracking', title: 'Order Tracking' },
    { id: 'delays', title: 'Delays & Issues' },
    { id: 'damaged', title: 'Damaged in Transit' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#205EA9] to-[#205EA9] py-10 md:py-14">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <span className="text-white font-medium">Fast & Reliable Delivery</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Shipping Policy</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Everything you need to know about how we deliver your pet products safely and on time.
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
                  <a key={s.id} href={`#${s.id}`} className="block text-sm text-gray-600 hover:text-[#205EA9] hover:bg-[#205EA9]/5 px-3 py-2 rounded-lg transition-colors">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-10">

              <section id="overview">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-600 leading-relaxed">
                  FairyTails Pet Shop partners with trusted logistics providers to ensure your pet products reach you in perfect condition. We aim to deliver every order as quickly and safely as possible, treating each package as if it were our own pet's goodies.
                </p>
              </section>

              <section id="delivery-areas">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Areas</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We currently ship across India. Delivery is available to all serviceable pin codes, including:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { area: 'Metro Cities', time: '2–4 business days', icon: '🏙️' },
                    { area: 'Tier-2 Cities', time: '4–6 business days', icon: '🌆' },
                    { area: 'Tier-3 & Rural Areas', time: '6–9 business days', icon: '🏡' },
                    { area: 'Remote / Hilly Regions', time: '7–12 business days', icon: '⛰️' },
                  ].map((item) => (
                    <div key={item.area} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-lg mb-1">{item.icon}</p>
                      <p className="font-semibold text-gray-900 text-sm">{item.area}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="delivery-time">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Estimated Delivery Time</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Once your order is confirmed:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-3"><span className="text-[#205EA9] font-bold mt-0.5">•</span><strong>Processing:</strong> 1–2 business days to pack and dispatch your order.</li>
                  <li className="flex gap-3"><span className="text-[#205EA9] font-bold mt-0.5">•</span><strong>Transit:</strong> 2–9 business days depending on your location (see delivery areas above).</li>
                  <li className="flex gap-3"><span className="text-[#205EA9] font-bold mt-0.5">•</span><strong>Sundays & Holidays:</strong> Orders placed on weekends or public holidays are processed the next business day.</li>
                </ul>
                <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <p className="text-sm text-yellow-800"><strong>Note:</strong> Delivery times may vary during festive seasons or extreme weather conditions.</p>
                </div>
              </section>

              <section id="shipping-charges">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Charges</h2>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left px-5 py-3 font-semibold text-gray-700">Order Value</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-700">Shipping Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr><td className="px-5 py-3 text-gray-600">Above ₹499</td><td className="px-5 py-3 text-blue-600 font-semibold">FREE</td></tr>
                      <tr><td className="px-5 py-3 text-gray-600">Below ₹499</td><td className="px-5 py-3 text-gray-600">₹50</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  All prices shown on the website are inclusive of 18% GST. No hidden charges at checkout.
                </p>
              </section>

              <section id="tracking">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Tracking</h2>
                <p className="text-gray-600 leading-relaxed">
                  Once your order is dispatched, you will receive an email and SMS with a tracking number and a link to track your shipment in real-time. You can also check the status of your order from the <strong>Orders</strong> section of your profile.
                </p>
              </section>

              <section id="delays">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delays & Issues</h2>
                <p className="text-gray-600 leading-relaxed mb-3">While we strive for on-time delivery, delays may occur due to:</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-3"><span className="text-orange-400 font-bold mt-0.5">!</span>Incorrect or incomplete delivery address.</li>
                  <li className="flex gap-3"><span className="text-orange-400 font-bold mt-0.5">!</span>Recipient not available at the delivery address.</li>
                  <li className="flex gap-3"><span className="text-orange-400 font-bold mt-0.5">!</span>Natural disasters, strikes, or other force majeure events.</li>
                  <li className="flex gap-3"><span className="text-orange-400 font-bold mt-0.5">!</span>High order volume during festive seasons.</li>
                </ul>
                <p className="text-gray-600 mt-3">
                  If your order is significantly delayed, please contact us and we'll investigate immediately.
                </p>
              </section>

              <section id="damaged">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Damaged in Transit</h2>
                <p className="text-gray-600 leading-relaxed">
                  If your package arrives damaged, please take photos of the damaged packaging and product, and contact us within <strong>48 hours</strong> of delivery. We will arrange a free replacement or full refund at no extra cost. Do not discard the damaged product or packaging until the claim is resolved.
                </p>
              </section>

              <section id="contact">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  For any shipping-related queries, reach out to our team:
                </p>
                <div className="bg-[#205EA9]/5 border border-[#205EA9]/20 rounded-xl p-5 space-y-2">
                  <p className="text-gray-700"><strong>Email:</strong> support@fairytails.com</p>
                  <p className="text-gray-700"><strong>Phone:</strong> +91 90217 85257</p>
                  <p className="text-gray-700"><strong>Hours:</strong> Mon–Sat, 9:00 AM – 7:00 PM IST</p>
                </div>
              </section>

            </div>

            <div className="mt-8 text-center">
              <Link to="/" className="text-[#205EA9] hover:underline font-medium text-sm">← Back to Home</Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
