import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const CatalogPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_BASE}/categories`);
                const data = await res.json();
                if (data.success) {
                    setCategories(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const toggleCategory = (index) => {
        if (expandedCategory === index) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(index);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#65a30d] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-4 shadow-sm flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Catalog</h1>
                    <p className="text-xs text-gray-500">All Categories</p>
                </div>
            </div>

            <div className="container mx-auto">
                <ul className="divide-y divide-gray-100">
                    {categories.map((category, index) => (
                        <li key={category._id || index} className="bg-white">
                            <div
                                className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleCategory(index)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center p-2 shrink-0">
                                        {category.image ? (
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-xl">📦</span>
                                        )}
                                    </div>
                                    <span className="font-semibold text-gray-800 text-lg">{category.name}</span>
                                </div>
                                {category.subcategories?.length > 0 ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedCategory === index ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                ) : (
                                    <button onClick={(e) => { e.stopPropagation(); handleNavigate(`/category/${category.slug}`); }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Subcategories Accordion */}
                            <div className={`bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${expandedCategory === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <ul className="pl-20 pr-4 py-2 space-y-2">
                                    {/* View All Option */}
                                    <li>
                                        <button
                                            onClick={() => handleNavigate(`/category/${category.slug}`)}
                                            className="w-full flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#65a30d] text-left transition-colors font-medium border-b border-gray-100 last:border-0"
                                        >
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            All {category.name}
                                        </button>
                                    </li>
                                    {category.subcategories?.map((sub, sIdx) => (
                                        <li key={sIdx}>
                                            <button
                                                onClick={() => handleNavigate(`/category/${category.slug}?subCategory=${encodeURIComponent(sub.name)}`)}
                                                className="w-full flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#65a30d] text-left transition-colors font-medium border-b border-gray-100 last:border-0"
                                            >
                                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                                {sub.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CatalogPage;
