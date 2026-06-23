import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const PRODUCT_TYPE_TO_ENDPOINT = {
  Food: 'food',
  Clothes: 'clothes',
  Toy: 'toys',
  Accessory: 'accessories',
  GroomingEssential: 'grooming-essentials',
  HealthSupplement: 'health-supplements',
  House: 'houses',
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const fetchSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/search`, { params: { q: q.trim() } });
        if (res.data.success) {
          setResults(res.data.data || []);
        } else {
          setError(res.data.message || 'Search failed');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to search');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [q]);

  if (!q || q.trim().length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500">Enter at least 2 characters to search for products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          Search results for &quot;{q}&quot;
        </h1>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#205EA9] border-t-transparent" />
          </div>
        )}

        {error && (
          <p className="text-red-500 py-4">{error}</p>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="text-gray-500 py-8">No products found. Try different keywords.</p>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {results.map((product) => {
              const endpoint = PRODUCT_TYPE_TO_ENDPOINT[product._productType] || 'food';
              const productUrl = `/product/${product._id}?type=${endpoint}`;

              return (
                <ProductCard
                  key={`${product._productType}-${product._id}`}
                  product={product}
                  productUrl={productUrl}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
