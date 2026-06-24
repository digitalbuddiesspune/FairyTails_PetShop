import React from 'react';
import { type } from '../../styles/typography';

const categories = [
    { id: 'Food', label: 'Foods', icon: '🍖', color: 'bg-orange-100 text-orange-600', endpoint: 'food', type: 'food' },
    { id: 'Clothes', label: 'Clothes', icon: '👕', color: 'bg-blue-100 text-blue-600', endpoint: 'clothes', type: 'clothes' },
    { id: 'Acc', label: 'Accessories', icon: '🎀', color: 'bg-pink-100 text-pink-600', endpoint: 'accessories', type: 'accessory' },
    { id: 'Toy', label: 'Toys', icon: '🎾', color: 'bg-blue-100 text-blue-600', endpoint: 'toys', type: 'toy' },
    { id: 'House', label: 'Houses', icon: '🏠', color: 'bg-purple-100 text-purple-600', endpoint: 'houses', type: 'house' },
    { id: 'Grooming', label: 'Grooming', icon: '🛁', color: 'bg-cyan-100 text-cyan-600', endpoint: 'grooming-essentials', type: 'grooming' },
    { id: 'Health', label: 'Health', icon: '💊', color: 'bg-red-100 text-red-600', endpoint: 'health-supplements', type: 'health' },
];

const AdminCategorySelection = ({ onSelect }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat)}
                    className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
                >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                        {cat.icon}
                    </div>
                    <h3 className={`${type.h4} text-gray-800`}>{cat.label}</h3>
                    <p className={`${type.bodySm} text-gray-500 mt-1`}>Manage {cat.label}</p>
                </button>
            ))}
        </div>
    );
};

export default AdminCategorySelection;
export { categories };
