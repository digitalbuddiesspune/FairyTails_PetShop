import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { formatRupee } from '../utils/formatPrice';
import { type } from '../styles/typography';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const formatDateTime = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return (
    date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' +
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
};

// Convert number to words (e.g. 3103 -> "three thousand one hundred and three")
const numberToWords = (num) => {
  if (num === 0) return 'zero';

  const belowTwenty = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];

  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const toWordsUnderThousand = (n) => {
    let result = '';
    const hundred = Math.floor(n / 100);
    const rem = n % 100;

    if (hundred > 0) {
      result += belowTwenty[hundred] + ' hundred';
      if (rem > 0) result += ' and ';
    }

    if (rem > 0) {
      if (rem < 20) {
        result += belowTwenty[rem];
      } else {
        const t = Math.floor(rem / 10);
        const u = rem % 10;
        result += tens[t];
        if (u > 0) result += ' ' + belowTwenty[u];
      }
    }
    return result;
  };

  let n = Math.abs(Math.trunc(num));
  const parts = [];

  const billions = Math.floor(n / 1_000_000_000);
  if (billions > 0) {
    parts.push(toWordsUnderThousand(billions) + ' billion');
    n %= 1_000_000_000;
  }

  const millions = Math.floor(n / 1_000_000);
  if (millions > 0) {
    parts.push(toWordsUnderThousand(millions) + ' million');
    n %= 1_000_000;
  }

  const thousands = Math.floor(n / 1_000);
  if (thousands > 0) {
    parts.push(toWordsUnderThousand(thousands) + ' thousand');
    n %= 1_000;
  }

  if (n > 0) {
    parts.push(toWordsUnderThousand(n));
  }

  const words = parts.join(' ');
  return num < 0 ? 'minus ' + words : words;
};

const InvoicePage = () => {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_BASE}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setOrder(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrder();
  }, [id, token]);

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`${type.nav} text-gray-600`}>Loading invoice...</p>
        </div>
      </div>
    );
  }

  const displayOrderId = order.orderNumber || parseInt(order._id.slice(-8), 16);
  const invoiceNo = `INV-${new Date().getFullYear()}-${displayOrderId}`;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:py-0 print:px-0 print:bg-white">
      <div className="max-w-4xl mx-auto invoice-print-root">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .invoice-print-root, .invoice-print-root * { visibility: visible; }
            .invoice-print-root { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; margin: 0; padding: 0.5in; background: white; }
            .no-print { display: none !important; }
            @page { margin: 0.5in; size: A4; }
            .invoice-print-root { box-shadow: none !important; }
            .break-inside-avoid { break-inside: avoid; }
          }
        `}</style>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 print:rounded-none print:shadow-none print:border-0">
          {/* Header - centred, no Tax Invoice / INV on top */}
          <div className="bg-gray-800 text-white px-6 py-6 text-center print:py-5">
            <div className="flex flex-col items-center gap-1">
              <div className="bg-white rounded-full p-3 mb-2">
                <img 
                  src="https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770288839/LOGO-2_l5wmxs.png" 
                  alt="FairyTails Pet Shop" 
                  className="h-16 w-auto object-contain"
                />
              </div>
              <h1 className={`${type.h3}`}>FairyTails Pet Shop</h1>
              <p className={`${type.bodySm} text-gray-300`}>Your Trusted Pet Care Partner | support@fairytails.com | GST: 27DNIPM1264G1ZX | +91 90217 85257</p>
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Invoice & Bill To - grey/white */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 break-inside-avoid">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className={`${type.caption} text-gray-700 uppercase tracking-wide mb-3`}>Invoice & Order</h3>
                <dl className={`${type.bodySm} space-y-2.5`}>
                  <div className="flex justify-between"><dt className="text-gray-600">Invoice Date</dt><dd className={`${type.nav} text-gray-900`}>{formatDateTime(new Date())}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Order No</dt><dd className={`${type.nav} text-gray-900`}>#{displayOrderId}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Invoice No.</dt><dd className={`${type.nav} text-gray-900`}>{invoiceNo}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Order Date</dt><dd className={`${type.nav} text-gray-900`}>{formatDateTime(order.createdAt)}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Order Status</dt><dd className={`${type.nav} capitalize text-gray-900`}>{order.status}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Payment status</dt><dd className={`${type.nav} capitalize text-gray-900`}>{order.paymentStatus}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Payment Mode</dt><dd className={`${type.nav} text-gray-900`}>{order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online'}</dd></div>
                </dl>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className={`${type.caption} text-gray-700 uppercase tracking-wide mb-3`}>Bill To</h3>
                <dl className={`${type.bodySm} space-y-2.5`}>
                  <div><dt className={`${type.caption} text-gray-500`}>Name</dt><dd className={`${type.nav} text-gray-900`}>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</dd></div>
                  <div><dt className={`${type.caption} text-gray-500`}>Email</dt><dd className="text-gray-900">{order.user?.email || '—'}</dd></div>
                  <div><dt className={`${type.caption} text-gray-500`}>Phone</dt><dd className="text-gray-900">{order.shippingAddress?.phone}</dd></div>
                  <div><dt className={`${type.caption} text-gray-500`}>Address</dt><dd className={`${type.bodySm} text-gray-900`}>{order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</dd></div>
                </dl>
              </div>
            </div>

            {/* Order items table - grey header */}
            <div className="mb-6 break-inside-avoid">
              <h3 className={`${type.caption} text-gray-700 uppercase tracking-wide mb-3`}>Order Details</h3>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className={`${type.bodySm} w-full`}>
                  <thead>
                    <tr className="bg-gray-700 text-white">
                      <th className={`${type.button} py-3 px-3 text-left`}>Sr. No.</th>
                      <th className={`${type.button} py-3 px-3 text-left`}>Item Name</th>
                      <th className={`${type.button} py-3 px-3 text-center`}>Category</th>
                      <th className={`${type.button} py-3 px-3 text-center`}>Qty</th>
                      <th className={`${type.button} py-3 px-3 text-right`}>Rate</th>
                      <th className={`${type.button} py-3 px-3 text-right`}>GST %</th>
                      <th className={`${type.button} py-3 px-3 text-right`}>GST Amt</th>
                      <th className={`${type.button} py-3 px-3 text-right`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => {
                      const totalAmount = item.price * item.quantity;
                      const gstPercent = 18;
                      const rateBeforeGst = totalAmount / (1 + gstPercent / 100);
                      const gstAmount = totalAmount - rateBeforeGst;
                      const ratePerUnit = rateBeforeGst / item.quantity;
                      const category = (item.productType && ['Food', 'Toy', 'Accessory', 'Clothes', 'House', 'GroomingEssential', 'HealthSupplement'].includes(item.productType)) ? item.productType : 'General';
                      const itemName = (item.productName && String(item.productName).trim()) ? item.productName : `Item ${index + 1}`;
                      return (
                        <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="py-2.5 px-3 text-gray-600">{index + 1}</td>
                          <td className={`${type.nav} py-2.5 px-3 text-gray-900`}>{itemName}</td>
                          <td className="py-2.5 px-3 text-center text-gray-600">{category}</td>
                          <td className={`${type.label} py-2.5 px-3 text-center`}>{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right">{formatRupee(ratePerUnit)}</td>
                          <td className="py-2.5 px-3 text-right">{gstPercent}%</td>
                          <td className="py-2.5 px-3 text-right">{formatRupee(gstAmount)}</td>
                          <td className={`${type.button} py-2.5 px-3 text-right text-gray-900`}>{formatRupee(totalAmount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals: amount in words left, mini table right */}
            {(() => {
              const subtotal = Number(order.subtotal) || 0;
              const delivery = Number(order.deliveryCharge) || 0;
              const total = Number(order.total) || subtotal + delivery;
              return (
                <div className="flex flex-wrap items-start justify-between gap-6 mb-5 break-inside-avoid">
                  <div className={`${type.bodySm} text-gray-500`}>
                    <p>
                      <span className={`${type.label} text-gray-600`}>Amount in words:</span>{' '}
                      Rupees {numberToWords(Math.round(total))} only.
                    </p>
                    <p className={`${type.caption} italic mt-1`}>Valid without signature and stamp.</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 overflow-hidden shrink-0">
                    <table className={`${type.bodySm} min-w-[240px]`}>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-4 text-gray-600">Subtotal</td>
                          <td className={`${type.nav} py-2 px-4 text-right text-gray-900`}>{formatRupee(subtotal)}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-4 text-gray-600">18% GST</td>
                          <td className={`${type.caption} py-2 px-4 text-right text-gray-500`}>Included</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-4 text-gray-600">Delivery Charges</td>
                          <td className={`${type.nav} py-2 px-4 text-right text-gray-900`}>
                            {subtotal >= 500 ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className={`${type.caption} text-gray-400 line-through`}>₹50.00</span>
                                <span className={`${type.nav} text-blue-600`}>Free</span>
                              </div>
                            ) : (
                              delivery === 0 ? 'Free' : formatRupee(delivery)
                            )}
                          </td>
                        </tr>
                        <tr className="bg-gray-800 text-white">
                          <td className={`${type.button} py-3 px-4`}>Total Amount</td>
                          <td className={`${type.button} py-3 px-4 text-right`}>{formatRupee(total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Actions - hidden when printing */}
          <div className="no-print px-6 pb-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => window.print()}
              className={`${type.button} inline-flex items-center gap-2 px-5 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 shadow-lg transition-all`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-4-0H9a2 2 0 00-2 2v4a2 2 0 002 2h2z" /></svg>
              Print / Save PDF
            </button>
            <button
              onClick={() => window.close()}
              className={`${type.label} inline-flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
