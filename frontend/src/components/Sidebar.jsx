import { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, categories }) => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Disable body scroll when sidebar is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    const toggleCategory = (index) => {
        if (expandedCategory === index) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(index);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-full w-4/5 max-w-[300px] bg-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="px-4 mb-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                        </div>
                        <ul className="space-y-1">
                            {categories.map((category, index) => (
                                <li key={category._id || index} className="border-b border-gray-50 last:border-0">
                                    <div
                                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer select-none"
                                        onClick={() => toggleCategory(index)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {category.image && (
                                                <img src={category.image} alt="" className="w-6 h-6 object-contain" />
                                            )}
                                            <span className="font-medium text-gray-700">{category.name}</span>
                                        </div>
                                        {category.subcategories?.length > 0 ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expandedCategory === index ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        ) : (
                                            <button onClick={(e) => { e.stopPropagation(); handleNavigate(`/category/${category.slug}`); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Subcategories Accordion */}
                                    <div className={`bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${expandedCategory === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <ul className="pl-4 py-1">
                                            {/* View All Option */}
                                            <li>
                                                <button
                                                    onClick={() => handleNavigate(`/category/${category.slug}`)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-black hover:bg-black/5 text-left transition-colors font-medium border-l-2 border-transparent hover:border-black/10"
                                                >
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                    All {category.name}
                                                </button>
                                            </li>
                                            {category.subcategories?.map((sub, sIdx) => (
                                                <li key={sIdx}>
                                                    <button
                                                        onClick={() => handleNavigate(`/category/${category.slug}?subCategory=${encodeURIComponent(sub.name)}`)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-black hover:bg-black/5 text-left transition-colors border-l-2 border-transparent hover:border-black/10"
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

                        <div className="px-4 mt-6 mb-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Support</p>
                        </div>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    to="/contact"
                                    onClick={onClose}
                                    className="block px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    onClick={onClose}
                                    className="block px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <Link to="/" onClick={onClose} className="flex items-center justify-center">
                            <img
                                src="https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770288839/LOGO-2_l5wmxs.png"
                                alt="FairyTails"
                                className="h-10 w-auto object-contain grayscale opacity-50"
                            />
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
