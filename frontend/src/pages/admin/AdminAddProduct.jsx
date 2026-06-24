import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductForm from './ProductForm';
import { getCategoryDataByKey } from './adminProductConfig';
import { type } from '../../styles/typography';

const AdminAddProduct = () => {
  const { categoryKey } = useParams();
  const navigate = useNavigate();

  const categoryData = useMemo(() => getCategoryDataByKey(categoryKey), [categoryKey]);

  if (!categoryData) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-red-600 mb-4">Invalid product category</p>
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back to Add Product
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full">
      <button
        type="button"
        onClick={() => navigate('/admin/products')}
        className={`${type.bodySm} inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6`}
      >
        <ArrowLeft size={16} />
        Back to Categories
      </button>

      <ProductForm
        categoryData={categoryData}
        existingProduct={null}
        onClose={() => navigate('/admin/products')}
        onSuccess={() => navigate('/admin/my-products')}
      />
    </div>
  );
};

export default AdminAddProduct;
