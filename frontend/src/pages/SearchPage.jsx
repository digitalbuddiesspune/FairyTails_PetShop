import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { type } from '../styles/typography';

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

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">

        {(!q || q.trim().length < 2) && (
          <p className={`text-center text-gray-500 ${type.bodySm} py-12`}>
            Type at least 2 characters to search products
          </p>
        )}

        {q && q.trim().length >= 2 && loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#205EA9] border-t-transparent" />
          </div>
        )}

        {q && q.trim().length >= 2 && !loading && error && (
          <p className={`text-red-500 py-4 ${type.bodySm}`}>{error}</p>
        )}

        {q && q.trim().length >= 2 && !loading && !error && results.length === 0 && (
          <p className={`text-gray-500 py-8 ${type.bodySm} text-center`}>No products found. Try different keywords.</p>
        )}

        {q && q.trim().length >= 2 && !loading && !error && results.length > 0 && (
          <>
            <p className={`${type.bodySm} text-gray-600 mb-3`}>
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {results.map((product) => {
                const endpoint = PRODUCT_TYPE_TO_ENDPOINT[product._productType] || 'food';
                return (
                  <ProductCard
                    key={`${product._productType}-${product._id}`}
                    product={product}
                    productUrl={`/product/${product._id}?type=${endpoint}`}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
