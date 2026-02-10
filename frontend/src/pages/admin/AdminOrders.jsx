const AdminOrders = () => {
    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <span className="text-5xl mb-4 block">📦</span>
                <p className="text-gray-500 text-lg font-medium">No orders yet</p>
                <p className="text-gray-400 text-sm mt-1">Orders will appear here when customers place them</p>
            </div>
            <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default AdminOrders;
