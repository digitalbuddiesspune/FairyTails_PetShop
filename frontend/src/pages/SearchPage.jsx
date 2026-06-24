import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(q);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  useEffect(() => {
    const trimmed = inputValue.trim();
    const timer = setTimeout(() => {
      if (trimmed !== q) {
        if (trimmed.length >= 2) {
          setSearchParams({ q: trimmed }, { replace: true });
        } else if (!trimmed) {
          setSearchParams({}, { replace: true });
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, q, setSearchParams]);

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
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg shrink-0"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <form
            className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white"
            onSubmit={(e) => e.preventDefault()}
          >
            <span className="pl-3 text-gray-400 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search products, brands, categories..."
              className={`flex-1 px-3 py-2.5 ${type.input} text-gray-900 placeholder-gray-400 focus:outline-none`}
              autoFocus
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="px-3 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </form>
        </div>

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
