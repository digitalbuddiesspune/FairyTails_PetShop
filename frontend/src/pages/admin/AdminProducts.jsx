import { useNavigate } from 'react-router-dom';
import AdminCategorySelection from './AdminCategorySelection';
import { TYPE_TO_CATEGORY_KEY } from './adminProductConfig';

const AdminProducts = () => {
  const navigate = useNavigate();

  const handleCategorySelect = (category) => {
    const categoryKey = TYPE_TO_CATEGORY_KEY[category.type];
    if (categoryKey) {
      navigate(`/admin/products/new/${categoryKey}`);
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
        <p className="text-sm text-gray-500 mt-1">Choose a category to create a new product</p>
      </div>

      <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <AdminCategorySelection onSelect={handleCategorySelect} />
      </div>

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
