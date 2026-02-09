const AdminCategories = () => {
    return (
        <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg">
                    + Add Category
                </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <span className="text-5xl mb-4 block">📂</span>
                <p className="text-gray-500 text-lg font-medium">No categories yet</p>
                <p className="text-gray-400 text-sm mt-1">Organize your products into categories</p>
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

export default AdminCategories;
