import { useState } from 'react';
import AdminCategorySelection from './AdminCategorySelection';
import AdminProductList from './AdminProductList';
import ProductForm from './ProductForm';

const AdminProducts = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'list'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Navigate to category list
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setView('list');
    };

    // Open Add Form
    const handleAddProduct = () => {
        if (selectedCategory) {
            setEditingProduct(null);
            setShowAddModal(true);
        } else {
            alert("Please select a category first to add a product.");
        }
    };

    // Open Edit Form
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowAddModal(true);
    };

    const handleBackToDashboard = () => {
        setSelectedCategory(null);
        setView('dashboard');
    };

    return (
        <div className="p-6">
            {view === 'dashboard' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                    </div>
                    <AdminCategorySelection onSelect={handleCategorySelect} />
                </div>
            )}

            {view === 'list' && selectedCategory && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div />
                        <button
                            onClick={handleAddProduct}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
                        >
                            <span className="text-xl">+</span> Add {selectedCategory.label.slice(0, -1)}
                        </button>
                    </div>

                    <AdminProductList
                        categoryData={selectedCategory}
                        onBack={handleBackToDashboard}
                        onEdit={handleEditProduct}
                    />
                </div>
            )}

            {showAddModal && selectedCategory && (
                <ProductForm
                    categoryData={selectedCategory}
                    existingProduct={editingProduct}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        // Refresh logic: temporarily unset category to unmount/remount list
                        const currentCat = selectedCategory;
                        setSelectedCategory(null);
                        setTimeout(() => setSelectedCategory(currentCat), 50);
                    }}
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
            `}</style>
        </div>
    );
};

export default AdminProducts;
