import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductForm from './ProductForm';
import { getCategoryDataByKey } from './adminProductConfig';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const AdminEditProduct = () => {
  const { categoryKey, id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categoryData = useMemo(() => getCategoryDataByKey(categoryKey), [categoryKey]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/signin');
      return;
    }
    if (!categoryData || !id) {
      setError('Invalid product edit link');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE}/${categoryData.endpoint}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load product');
        }
        setProduct(data.data);
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [categoryData, id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !categoryData || !product) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/my-products')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back to My Products
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full">
      <button
        type="button"
        onClick={() => navigate('/admin/my-products')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={16} />
        Back to My Products
      </button>

      <ProductForm
        categoryData={categoryData}
        existingProduct={product}
        onClose={() => navigate('/admin/my-products')}
        onSuccess={() => navigate('/admin/my-products')}
      />
    </div>
  );
};

export default AdminEditProduct;
