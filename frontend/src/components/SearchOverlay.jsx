import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { type } from '../styles/typography';
import ProductCard from './ProductCard';

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

const SearchOverlay = ({ isOpen, onClose, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    setQuery(initialQuery);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = '';
    };
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/search`, { params: { q: trimmed } });
        if (res.data.success) {
          setResults(res.data.data || []);
        } else {
          setError(res.data.message || 'Search failed');
          setResults([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to search');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim();

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3">
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
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, categories..."
              className={`flex-1 px-3 py-2.5 ${type.input} text-gray-900 placeholder-gray-400 focus:outline-none`}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-3 text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </form>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg shrink-0"
            aria-label="Close search"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
          {trimmed.length < 2 && (
            <p className={`text-center text-gray-500 ${type.bodySm} py-12`}>
              Type at least 2 characters to search products
            </p>
          )}

          {trimmed.length >= 2 && loading && (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-2 border-[#205EA9] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {trimmed.length >= 2 && !loading && error && (
            <p className={`text-center text-red-500 ${type.bodySm} py-8`}>{error}</p>
          )}

          {trimmed.length >= 2 && !loading && !error && results.length === 0 && (
            <p className={`text-center text-gray-500 ${type.bodySm} py-12`}>
              No products found for &ldquo;{trimmed}&rdquo;
            </p>
          )}

          {trimmed.length >= 2 && !loading && !error && results.length > 0 && (
            <>
              <p className={`${type.bodySm} text-gray-600 mb-3`}>
                {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{trimmed}&rdquo;
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
                {results.map((product) => {
                  const endpoint = PRODUCT_TYPE_TO_ENDPOINT[product._productType] || 'food';
                  return (
                    <div key={`${product._productType}-${product._id}`} onClick={onClose}>
                      <ProductCard
                        product={product}
                        productUrl={`/product/${product._id}?type=${endpoint}`}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
