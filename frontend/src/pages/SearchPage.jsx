import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { formatRupee } from '../utils/formatPrice';

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {results.map((product) => {
              const displayName = product.productName || product.name || 'Unnamed Product';
              const displayImage = product.images?.[0] || product.image || null;
              const endpoint = PRODUCT_TYPE_TO_ENDPOINT[product._productType] || 'food';
              const productUrl = `/product/${product._id}?type=${endpoint}`;

              let discountedPrice, mrp;
              if (product.prices?.length) {
                const p = product.prices[0];
                discountedPrice = p.discountedPrice;
                mrp = p.mrp;
              } else if (product.sizes?.length) {
                const s = product.sizes[0];
                discountedPrice = s.discountedPrice;
                mrp = s.mrp;
              } else if (product.variants?.length) {
                const v = product.variants[0];
                discountedPrice = v.discountedPrice;
                mrp = v.mrp;
              } else {
                discountedPrice = product.discountedPrice || product.discountPrice || product.price;
                mrp = product.price || product.mrp;
              }
              const discountPercent = mrp ? Math.round(((mrp - discountedPrice) / mrp) * 100) : 0;

              return (
                <Link
                  key={`${product._productType}-${product._id}`}
                  to={productUrl}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className="aspect-square flex items-center justify-center p-4 bg-gray-50">
                    {displayImage ? (
                      <img src={displayImage} alt={displayName} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-5xl text-gray-300">🐾</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-gray-900 text-sm line-clamp-2">{displayName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-[#205EA9]">{discountedPrice != null ? formatRupee(discountedPrice) : '—'}</span>
                      {discountPercent > 0 && (
                        <span className="text-xs text-gray-400 line-through">{formatRupee(mrp)}</span>
                      )}
                      {discountPercent > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                          {discountPercent}% off
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
