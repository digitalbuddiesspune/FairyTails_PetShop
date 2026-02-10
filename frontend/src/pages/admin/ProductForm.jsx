import { useState, useEffect } from 'react';
import { categories } from './AdminCategorySelection';

const API_BASE = import.meta.env.VITE_BACKEND_API;

const ProductForm = ({ categoryData, existingProduct, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        productName: '', brand: '', category: categoryData.id, subCategory: '',
        images: [''], description: '', keyFeatures: [''],
        // Variant arrays
        prices: [{ capacity: '', mrp: '', discountedPrice: '' }], // Food
        sizes: [{ size: '', mrp: '', discountedPrice: '', availableStock: '' }], // Clothes/Acc
        variants: [{ volume: '', mrp: '', discountedPrice: '', availableStock: '' }], // Grooming
        // Single fields
        price: '', mrp: '', discountedPrice: '', availableStock: '', // Toy/House/Health
        // Specifics
        expiryDate: '', nutrients: [''], flavours: [''], healthBenefits: [''], // Food
        material: '', color: [''], // Clothes/Toy/Acc
        dimensions: { height: '', width: '', depth: '', weight: '' }, // House
        usage: { dosage: '', ageGroup: '' }, // Health
        usageInstructions: [''], // Grooming
        isReturnable: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingProduct) {
            // Map existing data to form state
            setFormData(prev => ({
                ...prev,
                ...existingProduct,
                images: existingProduct.images || existingProduct.image ? (Array.isArray(existingProduct.images) ? existingProduct.images : [existingProduct.image]) : [''],
                expiryDate: existingProduct.expiryDate ? new Date(existingProduct.expiryDate).toISOString().split('T')[0] : '',
                // Ensure arrays exist
                prices: existingProduct.prices?.length ? existingProduct.prices : prev.prices,
                sizes: existingProduct.sizes?.length ? existingProduct.sizes : prev.sizes,
                variants: existingProduct.variants?.length ? existingProduct.variants : prev.variants,
                dimensions: existingProduct.dimensions || prev.dimensions,
                usage: existingProduct.usage || prev.usage,
            }));
        }
    }, [existingProduct]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => {
            const arr = [...prev[field]];
            arr[index] = value;
            return { ...prev, [field]: arr };
        });
    };

    const addArrayItem = (field, emptyVal = '') => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], emptyVal] }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    // Generic handler for array of objects (prices, sizes, variants)
    const handleSubArrayChange = (arrayField, index, subField, value) => {
        setFormData(prev => {
            const arr = [...prev[arrayField]];
            arr[index] = { ...arr[index], [subField]: value };
            return { ...prev, [arrayField]: arr };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Clean payload based on category
            const payload = { ...formData };

            // Fix images (some endpoints expect array, some string - standardize to array for UI, adapt for payload if needed)
            if (categoryData.type === 'health' || categoryData.type === 'house') {
                payload.image = payload.images[0]; // These models use 'image' string
                // delete payload.images; // Optional: backend might ignore extra fields
            }

            // Fix dates
            if (payload.expiryDate) payload.expiryDate = new Date(payload.expiryDate);

            // Filter empty strings in arrays
            ['images', 'keyFeatures', 'nutrients', 'flavours', 'healthBenefits', 'color', 'usageInstructions'].forEach(key => {
                if (Array.isArray(payload[key])) payload[key] = payload[key].filter(i => i && i.trim());
            });

            const url = existingProduct
                ? `${API_BASE}/${categoryData.endpoint}/${existingProduct._id}`
                : `${API_BASE}/${categoryData.endpoint}`;

            const method = existingProduct ? 'PUT' : 'POST';
            const token = localStorage.getItem('adminToken');

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                onSuccess();
            } else {
                setError(data.message || 'Operation failed');
            }
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    // --- Render Helpers ---

    const renderCommonFields = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Product Name *" value={formData.productName || formData.name || ''} onChange={e => handleChange(formData.name !== undefined ? 'name' : 'productName', e.target.value)} className="input-field" required />
                <input type="text" placeholder="Brand/Manufacturer *" value={formData.brand} onChange={e => handleChange('brand', e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <select value={formData.subCategory} onChange={e => handleChange('subCategory', e.target.value)} className="input-field">
                    <option value="">Select Sub-Category</option>
                    {categoryData.type === 'food' && ['Dry Food', 'Wet Food', 'Treats'].map(o => <option key={o} value={o}>{o}</option>)}
                    {categoryData.type === 'clothes' && ['Clothing', 'Dresses', 'Winter Wear', 'Rain Wear'].map(o => <option key={o} value={o}>{o}</option>)}
                    {categoryData.type === 'accessory' && ['dog', 'cat'].map(o => <option key={o} value={o}>{o}</option>)}
                    {categoryData.type === 'toy' && ['Dog', 'Cat'].map(o => <option key={o} value={o}>{o}</option>)}
                    {/* Add others as needed */}
                </select>
                {/* Image URL Input */}
                <input type="text" placeholder="Main Image URL *" value={formData.images[0]} onChange={e => handleArrayChange('images', 0, e.target.value)} className="input-field" required />
            </div>
        </div>
    );

    const renderVariantFields = () => {
        if (categoryData.type === 'food') {
            return (
                <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Pricing & Packs (Food)</h3>
                    {formData.prices.map((p, i) => (
                        <div key={i} className="flex gap-2">
                            <input placeholder="Capacity (e.g. 1kg)" value={p.capacity} onChange={e => handleSubArrayChange('prices', i, 'capacity', e.target.value)} className="input-field" />
                            <input placeholder="MRP" type="number" value={p.mrp} onChange={e => handleSubArrayChange('prices', i, 'mrp', e.target.value)} className="input-field w-24" />
                            <input placeholder="Sale Price" type="number" value={p.discountedPrice} onChange={e => handleSubArrayChange('prices', i, 'discountedPrice', e.target.value)} className="input-field w-24" />
                            {i > 0 && <button type="button" onClick={() => removeArrayItem('prices', i)} className="text-red-500">x</button>}
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('prices', { capacity: '', mrp: '', discountedPrice: '' })} className="text-sm text-blue-600">+ Add Variant</button>

                    <h3 className="font-semibold mt-4">Details</h3>
                    <input type="date" value={formData.expiryDate} onChange={e => handleChange('expiryDate', e.target.value)} className="input-field" />
                    <textarea placeholder="Ingredients/Nutrients" value={formData.nutrients.join(', ')} onChange={e => handleChange('nutrients', e.target.value.split(','))} className="input-field" />
                </div>
            );
        }
        if (categoryData.type === 'clothes' || categoryData.type === 'accessory') {
            return (
                <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Sizes & Stock</h3>
                    {formData.sizes.map((s, i) => (
                        <div key={i} className="flex gap-2">
                            <select value={s.size} onChange={e => handleSubArrayChange('sizes', i, 'size', e.target.value)} className="input-field">
                                <option value="">Size</option>
                                {['XS', 'S', 'M', 'L', 'XL', 'One Size'].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                            </select>
                            <input placeholder="MRP" type="number" value={s.mrp} onChange={e => handleSubArrayChange('sizes', i, 'mrp', e.target.value)} className="input-field w-20" />
                            <input placeholder="Price" type="number" value={s.discountedPrice} onChange={e => handleSubArrayChange('sizes', i, 'discountedPrice', e.target.value)} className="input-field w-20" />
                            <input placeholder="Stock" type="number" value={s.availableStock} onChange={e => handleSubArrayChange('sizes', i, 'availableStock', e.target.value)} className="input-field w-20" />
                            {i > 0 && <button type="button" onClick={() => removeArrayItem('sizes', i)} className="text-red-500">x</button>}
                        </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('sizes', { size: '', mrp: '', discountedPrice: '', availableStock: '' })} className="text-sm text-blue-600">+ Add Size</button>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <input placeholder="Material" value={formData.material} onChange={e => handleChange('material', e.target.value)} className="input-field" />
                        <input placeholder="Color (comma separated)" value={formData.color} onChange={e => handleChange('color', Array.isArray(e.target.value) ? e.target.value : e.target.value.split(','))} className="input-field" />
                    </div>
                </div>
            );
        }
        // Single Item types (Toy, House, Health)
        return (
            <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Pricing & Stock</h3>
                <div className="flex gap-4">
                    <input placeholder="MRP" type="number" value={formData.mrp || formData.price} onChange={e => { handleChange('mrp', e.target.value); handleChange('price', e.target.value); }} className="input-field" />
                    <input placeholder="Discount Price" type="number" value={formData.discountedPrice || formData.discountPrice} onChange={e => { handleChange('discountedPrice', e.target.value); handleChange('discountPrice', e.target.value); }} className="input-field" />
                    <input placeholder="Stock" type="number" value={formData.availableStock} onChange={e => handleChange('availableStock', e.target.value)} className="input-field" />
                </div>
                {categoryData.type === 'house' && (
                    <div className="grid grid-cols-4 gap-2">
                        <input placeholder="Height" value={formData.dimensions?.height} onChange={e => setFormData(p => ({ ...p, dimensions: { ...p.dimensions, height: e.target.value } }))} className="input-field" />
                        <input placeholder="Width" value={formData.dimensions?.width} onChange={e => setFormData(p => ({ ...p, dimensions: { ...p.dimensions, width: e.target.value } }))} className="input-field" />
                        <input placeholder="Depth" value={formData.dimensions?.depth} onChange={e => setFormData(p => ({ ...p, dimensions: { ...p.dimensions, depth: e.target.value } }))} className="input-field" />
                        <input placeholder="Weight" value={formData.dimensions?.weight} onChange={e => setFormData(p => ({ ...p, dimensions: { ...p.dimensions, weight: e.target.value } }))} className="input-field" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className={`bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">{existingProduct ? 'Edit' : 'Add'} {categoryData.label.slice(0, -1)}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>}

                    {renderCommonFields()}
                    {renderVariantFields()}

                    {/* Common Array Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Key Features</label>
                            {formData.keyFeatures.map((f, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input value={f} onChange={e => handleArrayChange('keyFeatures', i, e.target.value)} className="input-field" placeholder="Feature..." />
                                    {i > 0 && <button type="button" onClick={() => removeArrayItem('keyFeatures', i)} className="text-red-500">x</button>}
                                </div>
                            ))}
                            <button type="button" onClick={() => addArrayItem('keyFeatures')} className="text-xs text-blue-600">+ Add Feature</button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .input-field {
                    width: 100%;
                    padding: 0.625rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    outline: none;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }
                .input-field:focus {
                    border-color: #9333ea;
                    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.1);
                }
            `}</style>
        </div>
    );
};

export default ProductForm;
