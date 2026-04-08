import { useState } from 'react';
import AdminCategorySelection from './AdminCategorySelection';
import ProductForm from './ProductForm';

const AdminProducts = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const handleClose = () => {
        setSelectedCategory(null);
    };

    const handleSuccess = () => {
        const label = selectedCategory?.label?.replace(/s$/, '') || 'Product';
        setSelectedCategory(null);
        setSuccessMsg(`${label} added successfully!`);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Add Product</h1>
            </div>

            {/* Success Toast */}
            {successMsg && (
                <div className="fixed top-6 right-6 z-[60] animate-slideIn">
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-5 py-3.5 rounded-xl shadow-lg">
                        <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg shrink-0">✓</span>
                        <span className="font-medium text-sm">{successMsg}</span>
                        <button onClick={() => setSuccessMsg('')} className="text-blue-400 hover:text-blue-600 ml-2 text-lg">×</button>
                    </div>
                </div>
            )}

            <AdminCategorySelection onSelect={handleCategorySelect} />

            {selectedCategory && (
                <ProductForm
                    categoryData={selectedCategory}
                    existingProduct={null}
                    onClose={handleClose}
                    onSuccess={handleSuccess}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(80px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slideIn {
                    animation: slideIn 0.35s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AdminProducts;
