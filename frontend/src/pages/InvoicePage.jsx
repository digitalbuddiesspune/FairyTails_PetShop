import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_API;

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
        if (res.data.success) {
          setOrder(res.data.data);
          setTimeout(() => window.print(), 500);
        }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </div>
    );
  }

  const displayOrderId = order.orderNumber || parseInt(order._id.slice(-8), 16);
  const invoiceNo = `INV-${new Date().getFullYear()}-${displayOrderId}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
        <style>{`
          @media print {
            body { margin: 0; background: white; }
            @page { margin: 1cm; }
            .print-hidden { display: none !important; }
          }
        `}</style>

        <div className="text-center border-b-4 border-gray-900 pb-4 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FAIRYTAILS PET SHOP</h1>
          <p className="text-base text-gray-700 mb-2">Your Trusted Pet Care Partner</p>
          <p className="text-sm text-gray-600">
            Email: support@fairytails.com | GST No: 09AHCPC5752E1ZM | State Code: 09
          </p>
        </div>

        <h2 className="text-3xl font-bold text-center border-y-4 border-gray-900 py-4 mb-6">TAX INVOICE</h2>

        <div className="bg-gray-800 text-white p-4 mb-6">
          <h3 className="font-bold text-lg mb-3">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span>Invoice No:</span>
              <span className="font-semibold">{invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Order No:</span>
              <span className="font-semibold">#{displayOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Status:</span>
              <span className="font-semibold capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-semibold">{order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}</span>
            </div>
            <div className="flex justify-between">
              <span>Invoice Date:</span>
              <span className="font-semibold">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Date:</span>
              <span className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between col-span-2">
              <span>Payment Status:</span>
              <span className="font-semibold capitalize">{order.paymentStatus}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 text-white p-4 mb-6">
          <h3 className="font-bold text-lg mb-3">Bill To</h3>
          <div className="text-sm space-y-1">
            <p><span className="font-semibold">Customer Name:</span> {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            <p><span className="font-semibold">Phone:</span> {order.shippingAddress?.phone}</p>
            <p><span className="font-semibold">Address:</span> {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p><span className="font-semibold">GST No:</span> URP</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-lg bg-gray-800 text-white p-3 mb-0">Order Details</h3>
          <table className="w-full border-collapse border-2 border-gray-900 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border-2 border-gray-900 p-2 text-left font-bold">Sr No</th>
                <th className="border-2 border-gray-900 p-2 text-left font-bold">Item Name</th>
                <th className="border-2 border-gray-900 p-2 text-left font-bold">Category</th>
                <th className="border-2 border-gray-900 p-2 text-center font-bold">Quantity</th>
                <th className="border-2 border-gray-900 p-2 text-right font-bold">Rate</th>
                <th className="border-2 border-gray-900 p-2 text-right font-bold">GST %</th>
                <th className="border-2 border-gray-900 p-2 text-right font-bold">GST Amt</th>
                <th className="border-2 border-gray-900 p-2 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const itemSubtotal = item.price * item.quantity;
                const gstPercent = 18;
                const gstAmount = Math.round(itemSubtotal * 0.18);
                const totalAmount = itemSubtotal + gstAmount;
                const category = ['Food', 'Toy', 'Accessory'].includes(item.productType) ? 'Dog' : 'Cat';
                
                return (
                  <tr key={index}>
                    <td className="border-2 border-gray-900 p-2 text-center">{index + 1}</td>
                    <td className="border-2 border-gray-900 p-2">{item.productName}</td>
                    <td className="border-2 border-gray-900 p-2">{category}</td>
                    <td className="border-2 border-gray-900 p-2 text-center font-semibold">{item.quantity}</td>
                    <td className="border-2 border-gray-900 p-2 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="border-2 border-gray-900 p-2 text-right">{gstPercent}%</td>
                    <td className="border-2 border-gray-900 p-2 text-right">₹{gstAmount.toFixed(2)}</td>
                    <td className="border-2 border-gray-900 p-2 text-right font-bold">₹{totalAmount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-6">
          <div className="w-80">
            <div className="flex justify-between py-2 border-b-2 border-gray-300 text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-gray-300 text-sm">
              <span>Total GST (18%):</span>
              <span className="font-semibold">₹{order.gst?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-gray-300 text-sm">
              <span>Delivery Charges:</span>
              <span className="font-semibold">{order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge?.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between py-3 bg-gray-900 text-white px-3 font-bold text-lg">
              <span>Total Amount:</span>
              <span>₹{order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mb-8 text-sm">
          <p><span className="font-semibold">Amount in Words:</span> Rupees {order.total?.toFixed(0)} Only</p>
        </div>

        <div className="text-center mt-8 print-hidden space-x-4">
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-base"
          >
            Print Invoice
          </button>
          <button
            onClick={() => window.close()}
            className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
