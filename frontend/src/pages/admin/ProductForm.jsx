import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_API;

/* ─── Schema-aware initial states ─────────────────────────────────────────── */

const INITIAL = {
  food: {
    productName: '', brand: '',
    category: 'Dog', subCategory: 'Dry Food',
    prices: [{ capacity: '', mrp: '', discountedPrice: '' }],
    availableStock: '',
    details: [''], keyFeatures: [''],
    expiryDate: '',
    images: [''],
    flavours: [''], nutrients: [''], healthBenefits: [''],
  },
  clothes: {
    productName: '', brand: '',
    category: 'Dog', subCategory: 'Clothing',
    sizes: [{ size: 'M', mrp: '', discountedPrice: '', availableStock: '' }],
    material: '', color: [''],
    productDetails: [''], keyFeatures: [''], careInstructions: [''],
    images: [''],
    isReturnable: true, expectedDeliveryDays: '',
  },
  toy: {
    productName: '', brand: '',
    category: 'Toy', subCategory: 'Dog',
    price: '', discountedPrice: '', discountPercentage: '',
    size: 'One Size', availableStock: '',
    material: '', color: [''],
    productDetails: [''], keyFeatures: [''],
    suitableFor: 'All',
    images: [''],
    isReturnable: true,
  },
  accessory: {
    category: 'accessories', subCategory: 'dog',
    productName: '', brand: '',
    sizes: [{ size: 'One Size', mrp: '', discountedPrice: '', availableStock: '' }],
    material: '', color: [''],
    productDetails: [''], keyFeatures: [''],
    images: [''],
    isReturnable: true,
  },
  grooming: {
    category: 'grooming-essentials', subCategory: 'dog',
    productName: '', brand: '',
    variants: [{ volume: '', mrp: '', discountedPrice: '', discountPercentage: '', availableStock: '' }],
    description: '', keyFeatures: [''],
    suitableFor: 'Both',
    usageInstructions: [''],
    images: [''],
    isReturnable: true,
  },
  health: {
    category: 'health-supplement', subCategory: 'dog',
    name: '',
    price: '', discountPrice: '', discountPercentage: '',
    highlights: [''], description: '',
    usage: { dosage: '', ageGroup: '' },
    expiryDate: '', availableStock: '',
    image: '',
  },
  house: {
    category: 'house', subCategory: 'dog',
    name: '',
    price: '', discountPrice: '', discountPercentage: '',
    highlights: [''], description: '',
    dimensions: { height: '', width: '', depth: '', weight: '' },
    availableStock: '',
    image: '',
  },
};

/* ─── Subcategory options per type ────────────────────────────────────────── */

const SUB_CATEGORIES = {
  food: ['Dry Food', 'Wet Food', 'Treats'],
  clothes: ['Clothing', 'Dresses', 'Winter Wear', 'Rain Wear'],
  toy: ['Dog', 'Cat'],
  accessory: ['dog', 'cat'],
  grooming: ['dog', 'cat'],
  health: ['dog', 'cat'],
  house: ['dog', 'cat'],
};

/* ─── Category field for food & clothes (Dog/Cat) ─────────────────────────── */

const PET_CATEGORIES_FOOD = ['Dog', 'Cat', 'Bird', 'Fish', 'Other'];
const PET_CATEGORIES_CLOTHES = ['Dog', 'Cat'];

/* ─── Component ───────────────────────────────────────────────────────────── */

const ProductForm = ({ categoryData, existingProduct, onClose, onSuccess }) => {
  const type = categoryData.type;
  const [formData, setFormData] = useState({ ...INITIAL[type] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (existingProduct) {
      const init = { ...INITIAL[type] };
      const merged = { ...init, ...existingProduct };

      // Normalise images → always array for UI
      if (type === 'health' || type === 'house') {
        merged.image = existingProduct.image || '';
      } else {
        merged.images = Array.isArray(existingProduct.images)
          ? (existingProduct.images.length ? existingProduct.images : [''])
          : [existingProduct.image || ''];
      }

      // Normalise date
      if (merged.expiryDate) {
        merged.expiryDate = new Date(merged.expiryDate).toISOString().split('T')[0];
      }

      // Ensure sub-arrays exist
      ['prices', 'sizes', 'variants'].forEach((k) => {
        if (init[k] && (!merged[k] || !merged[k].length)) merged[k] = init[k];
      });
      ['details', 'keyFeatures', 'productDetails', 'careInstructions', 'flavours', 'nutrients', 'healthBenefits', 'highlights', 'usageInstructions', 'color'].forEach((k) => {
        if (init[k] !== undefined) {
          merged[k] = Array.isArray(merged[k]) && merged[k].length ? merged[k] : (init[k] || ['']);
        }
      });

      merged.dimensions = existingProduct.dimensions || init.dimensions;
      merged.usage = existingProduct.usage || init.usage;

      setFormData(merged);
    }
  }, [existingProduct, type]);

  /* ─── Generic helpers ─────────────────────────────────────────────────── */

  const set = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const setNested = (parent, field, value) =>
    setFormData((p) => ({ ...p, [parent]: { ...p[parent], [field]: value } }));

  const arrSet = (field, idx, value) =>
    setFormData((p) => {
      const arr = [...p[field]];
      arr[idx] = value;
      return { ...p, [field]: arr };
    });

  const arrAdd = (field, empty = '') =>
    setFormData((p) => ({ ...p, [field]: [...p[field], empty] }));

  const arrRemove = (field, idx) =>
    setFormData((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));

  const subArrSet = (arrField, idx, subField, value) =>
    setFormData((p) => {
      const arr = [...p[arrField]];
      arr[idx] = { ...arr[idx], [subField]: value };
      return { ...p, [arrField]: arr };
    });

  const subArrAdd = (arrField, empty) =>
    setFormData((p) => ({ ...p, [arrField]: [...p[arrField], empty] }));

  const subArrRemove = (arrField, idx) =>
    setFormData((p) => ({ ...p, [arrField]: p[arrField].filter((_, i) => i !== idx) }));

  /* ─── Submit ──────────────────────────────────────────────────────────── */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { ...formData };

      // Convert number fields
      ['price', 'discountedPrice', 'discountPrice', 'discountPercentage', 'availableStock', 'expectedDeliveryDays'].forEach((k) => {
        if (payload[k] !== undefined && payload[k] !== '') payload[k] = Number(payload[k]);
      });

      // Convert sub-array numbers
      if (payload.prices) {
        payload.prices = payload.prices.map((p) => ({
          ...p, mrp: Number(p.mrp), discountedPrice: Number(p.discountedPrice),
        }));
      }
      if (payload.sizes) {
        payload.sizes = payload.sizes.map((s) => ({
          ...s, mrp: Number(s.mrp), discountedPrice: Number(s.discountedPrice), availableStock: Number(s.availableStock),
        }));
      }
      if (payload.variants) {
        payload.variants = payload.variants.map((v) => ({
          ...v, mrp: Number(v.mrp), discountedPrice: Number(v.discountedPrice),
          discountPercentage: v.discountPercentage ? Number(v.discountPercentage) : undefined,
          availableStock: Number(v.availableStock),
        }));
      }

      // Fix date
      if (payload.expiryDate) payload.expiryDate = new Date(payload.expiryDate);

      // Strip empty strings from string arrays
      ['images', 'keyFeatures', 'details', 'productDetails', 'careInstructions',
        'flavours', 'nutrients', 'healthBenefits', 'highlights', 'usageInstructions', 'color',
      ].forEach((k) => {
        if (Array.isArray(payload[k])) payload[k] = payload[k].filter((v) => v && v.toString().trim());
      });

      const url = existingProduct
        ? `${API_BASE}/${categoryData.endpoint}/${existingProduct._id}`
        : `${API_BASE}/${categoryData.endpoint}`;

      const method = existingProduct ? 'PUT' : 'POST';
      const token = localStorage.getItem('adminToken');

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
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

  /* ─── Reusable UI helpers ─────────────────────────────────────────────── */

  const Label = ({ children, required }) => (
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {children} {required && <span className="text-red-400">*</span>}
    </label>
  );

  const SectionTitle = ({ icon, children }) => (
    <div className="flex items-center gap-2 pt-5 pb-2 border-t border-gray-100">
      <span className="text-lg">{icon}</span>
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{children}</h3>
    </div>
  );

  const renderStringArrayField = (field, label, placeholder, required = false) => (
    <div>
      <Label required={required}>{label}</Label>
      {(formData[field] || ['']).map((val, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            value={val}
            onChange={(e) => arrSet(field, i, e.target.value)}
            placeholder={placeholder}
            className="input-field"
          />
          {i > 0 && (
            <button type="button" onClick={() => arrRemove(field, i)} className="text-red-400 hover:text-red-600 text-lg px-1">×</button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => arrAdd(field)} className="text-xs text-purple-600 hover:text-purple-800 font-medium">
        + Add {label.replace(/s$/, '')}
      </button>
    </div>
  );

  /* ─── FOOD FORM ───────────────────────────────────────────────────────── */

  const renderFoodForm = () => (
    <>
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.productName} onChange={(e) => set('productName', e.target.value)} placeholder="e.g. Royal Canin Adult" required />
        </div>
        <div>
          <Label required>Brand</Label>
          <input className="input-field" value={formData.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Royal Canin" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Pet Category</Label>
          <select className="input-field" value={formData.category} onChange={(e) => set('category', e.target.value)}>
            {PET_CATEGORIES_FOOD.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label required>Sub-Category</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
            {SUB_CATEGORIES.food.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing Packs */}
      <SectionTitle icon="💰">Pricing Packs</SectionTitle>
      {formData.prices.map((p, i) => (
        <div key={i} className="flex gap-2 items-end">
          <div className="flex-1">
            {i === 0 && <Label required>Capacity</Label>}
            <input className="input-field" placeholder="e.g. 1kg" value={p.capacity} onChange={(e) => subArrSet('prices', i, 'capacity', e.target.value)} />
          </div>
          <div className="w-24">
            {i === 0 && <Label required>MRP</Label>}
            <input className="input-field" type="number" placeholder="MRP" value={p.mrp} onChange={(e) => subArrSet('prices', i, 'mrp', e.target.value)} />
          </div>
          <div className="w-28">
            {i === 0 && <Label required>Sale Price</Label>}
            <input className="input-field" type="number" placeholder="Sale Price" value={p.discountedPrice} onChange={(e) => subArrSet('prices', i, 'discountedPrice', e.target.value)} />
          </div>
          {i > 0 && <button type="button" onClick={() => subArrRemove('prices', i)} className="text-red-400 hover:text-red-600 text-lg pb-2">×</button>}
        </div>
      ))}
      <button type="button" onClick={() => subArrAdd('prices', { capacity: '', mrp: '', discountedPrice: '' })} className="text-xs text-purple-600 hover:text-purple-800 font-medium">+ Add Pack</button>

      {/* Stock & Expiry */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Available Stock</Label>
          <input className="input-field" type="number" min="0" value={formData.availableStock} onChange={(e) => set('availableStock', e.target.value)} placeholder="e.g. 100" />
        </div>
        <div>
          <Label required>Expiry Date</Label>
          <input className="input-field" type="date" value={formData.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
        </div>
      </div>

      {/* Arrays */}
      <SectionTitle icon="📋">Details</SectionTitle>
      {renderStringArrayField('details', 'Details', 'Product detail...', true)}
      {renderStringArrayField('keyFeatures', 'Key Features', 'Feature...', true)}
      {renderStringArrayField('flavours', 'Flavours', 'e.g. Chicken', true)}
      {renderStringArrayField('nutrients', 'Nutrients', 'e.g. Protein 28%')}
      {renderStringArrayField('healthBenefits', 'Health Benefits', 'e.g. Strong muscles')}

      {/* Images */}
      <SectionTitle icon="🖼️">Images</SectionTitle>
      {renderStringArrayField('images', 'Image URLs', 'https://...', true)}
    </>
  );

  /* ─── CLOTHES FORM ────────────────────────────────────────────────────── */

  const renderClothesForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.productName} onChange={(e) => set('productName', e.target.value)} placeholder="e.g. Cozy Dog Hoodie" required />
        </div>
        <div>
          <Label required>Brand</Label>
          <input className="input-field" value={formData.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. PetStyle" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Pet Category</Label>
          <select className="input-field" value={formData.category} onChange={(e) => set('category', e.target.value)}>
            {PET_CATEGORIES_CLOTHES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label required>Sub-Category</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
            {SUB_CATEGORIES.clothes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Sizes */}
      <SectionTitle icon="📏">Sizes & Pricing</SectionTitle>
      {formData.sizes.map((s, i) => (
        <div key={i} className="flex gap-2 items-end">
          <div className="w-24">
            {i === 0 && <Label required>Size</Label>}
            <select className="input-field" value={s.size} onChange={(e) => subArrSet('sizes', i, 'size', e.target.value)}>
              {['XS', 'S', 'M', 'L', 'XL'].map((sz) => <option key={sz} value={sz}>{sz}</option>)}
            </select>
          </div>
          <div className="w-24">
            {i === 0 && <Label required>MRP</Label>}
            <input className="input-field" type="number" placeholder="MRP" value={s.mrp} onChange={(e) => subArrSet('sizes', i, 'mrp', e.target.value)} />
          </div>
          <div className="w-24">
            {i === 0 && <Label required>Price</Label>}
            <input className="input-field" type="number" placeholder="Price" value={s.discountedPrice} onChange={(e) => subArrSet('sizes', i, 'discountedPrice', e.target.value)} />
          </div>
          <div className="w-24">
            {i === 0 && <Label required>Stock</Label>}
            <input className="input-field" type="number" placeholder="Stock" value={s.availableStock} onChange={(e) => subArrSet('sizes', i, 'availableStock', e.target.value)} />
          </div>
          {i > 0 && <button type="button" onClick={() => subArrRemove('sizes', i)} className="text-red-400 hover:text-red-600 text-lg pb-2">×</button>}
        </div>
      ))}
      <button type="button" onClick={() => subArrAdd('sizes', { size: 'M', mrp: '', discountedPrice: '', availableStock: '' })} className="text-xs text-purple-600 hover:text-purple-800 font-medium">+ Add Size</button>

      {/* Appearance */}
      <SectionTitle icon="🎨">Appearance</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Material</Label>
          <input className="input-field" value={formData.material} onChange={(e) => set('material', e.target.value)} placeholder="e.g. Cotton Blend" />
        </div>
        <div>
          <Label required>Colors (comma separated)</Label>
          <input className="input-field" value={(formData.color || []).join(', ')} onChange={(e) => set('color', e.target.value.split(',').map((c) => c.trim()))} placeholder="Red, Blue" />
        </div>
      </div>

      {/* Details */}
      <SectionTitle icon="📋">Details</SectionTitle>
      {renderStringArrayField('productDetails', 'Product Details', 'Detail...', true)}
      {renderStringArrayField('keyFeatures', 'Key Features', 'Feature...', true)}
      {renderStringArrayField('careInstructions', 'Care Instructions', 'e.g. Machine wash cold')}

      {/* Delivery */}
      <SectionTitle icon="🚚">Delivery & Returns</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Expected Delivery (days)</Label>
          <input className="input-field" type="number" min="1" value={formData.expectedDeliveryDays} onChange={(e) => set('expectedDeliveryDays', e.target.value)} placeholder="e.g. 5" />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isReturnable} onChange={(e) => set('isReturnable', e.target.checked)} className="w-4 h-4 accent-purple-600" />
            <span className="text-sm text-gray-700">Returnable</span>
          </label>
        </div>
      </div>

      {/* Images */}
      <SectionTitle icon="🖼️">Images</SectionTitle>
      {renderStringArrayField('images', 'Image URLs', 'https://...', true)}
    </>
  );

  /* ─── TOY FORM ────────────────────────────────────────────────────────── */

  const renderToyForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.productName} onChange={(e) => set('productName', e.target.value)} placeholder="e.g. Squeaky Ball" required />
        </div>
        <div>
          <Label required>Brand</Label>
          <input className="input-field" value={formData.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. PawPlay" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Sub-Category (Pet)</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
            {SUB_CATEGORIES.toy.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <Label>Suitable For</Label>
          <select className="input-field" value={formData.suitableFor} onChange={(e) => set('suitableFor', e.target.value)}>
            {['Puppy', 'Adult', 'All'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing */}
      <SectionTitle icon="💰">Pricing & Stock</SectionTitle>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <Label required>Price (MRP)</Label>
          <input className="input-field" type="number" value={formData.price} onChange={(e) => set('price', e.target.value)} placeholder="₹" />
        </div>
        <div>
          <Label>Discounted Price</Label>
          <input className="input-field" type="number" value={formData.discountedPrice} onChange={(e) => set('discountedPrice', e.target.value)} placeholder="₹" />
        </div>
        <div>
          <Label>Discount %</Label>
          <input className="input-field" type="number" min="0" max="100" value={formData.discountPercentage} onChange={(e) => set('discountPercentage', e.target.value)} placeholder="%" />
        </div>
        <div>
          <Label required>Stock</Label>
          <input className="input-field" type="number" min="0" value={formData.availableStock} onChange={(e) => set('availableStock', e.target.value)} placeholder="Qty" />
        </div>
      </div>

      {/* Physical */}
      <SectionTitle icon="🎨">Physical Details</SectionTitle>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Size</Label>
          <input className="input-field" value={formData.size} onChange={(e) => set('size', e.target.value)} placeholder="e.g. One Size" />
        </div>
        <div>
          <Label>Material</Label>
          <input className="input-field" value={formData.material} onChange={(e) => set('material', e.target.value)} placeholder="e.g. Rubber" />
        </div>
        <div>
          <Label>Colors (comma sep.)</Label>
          <input className="input-field" value={(formData.color || []).join(', ')} onChange={(e) => set('color', e.target.value.split(',').map((c) => c.trim()))} placeholder="Red, Blue" />
        </div>
      </div>

      {/* Details */}
      <SectionTitle icon="📋">Details</SectionTitle>
      {renderStringArrayField('productDetails', 'Product Details', 'Detail...', true)}
      {renderStringArrayField('keyFeatures', 'Key Features', 'Feature...', true)}

      <div className="flex items-center gap-2 pt-2">
        <input type="checkbox" checked={formData.isReturnable} onChange={(e) => set('isReturnable', e.target.checked)} className="w-4 h-4 accent-purple-600" />
        <span className="text-sm text-gray-700">Returnable</span>
      </div>

      {/* Images */}
      <SectionTitle icon="🖼️">Images</SectionTitle>
      {renderStringArrayField('images', 'Image URLs', 'https://...', true)}
    </>
  );

  /* ─── ACCESSORY FORM ──────────────────────────────────────────────────── */

  const renderAccessoryForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.productName} onChange={(e) => set('productName', e.target.value)} placeholder="e.g. Nylon Dog Collar" required />
        </div>
        <div>
          <Label required>Brand</Label>
          <input className="input-field" value={formData.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. PawGear" required />
        </div>
      </div>
      <div>
        <Label required>Sub-Category (Pet)</Label>
        <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
          {SUB_CATEGORIES.accessory.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Sizes */}
      <SectionTitle icon="📏">Sizes & Pricing</SectionTitle>
      {formData.sizes.map((s, i) => (
        <div key={i} className="flex gap-2 items-end">
          <div className="w-28">
            {i === 0 && <Label required>Size</Label>}
            <select className="input-field" value={s.size} onChange={(e) => subArrSet('sizes', i, 'size', e.target.value)}>
              {['XS', 'S', 'M', 'L', 'XL', 'One Size'].map((sz) => <option key={sz} value={sz}>{sz}</option>)}
            </select>
          </div>
          <div className="w-24">
            {i === 0 && <Label required>MRP</Label>}
            <input className="input-field" type="number" placeholder="MRP" value={s.mrp} onChange={(e) => subArrSet('sizes', i, 'mrp', e.target.value)} />
          </div>
          <div className="w-24">
            {i === 0 && <Label required>Price</Label>}
            <input className="input-field" type="number" placeholder="Price" value={s.discountedPrice} onChange={(e) => subArrSet('sizes', i, 'discountedPrice', e.target.value)} />
          </div>
          <div className="w-24">
            {i === 0 && <Label required>Stock</Label>}
            <input className="input-field" type="number" placeholder="Stock" value={s.availableStock} onChange={(e) => subArrSet('sizes', i, 'availableStock', e.target.value)} />
          </div>
          {i > 0 && <button type="button" onClick={() => subArrRemove('sizes', i)} className="text-red-400 hover:text-red-600 text-lg pb-2">×</button>}
        </div>
      ))}
      <button type="button" onClick={() => subArrAdd('sizes', { size: 'One Size', mrp: '', discountedPrice: '', availableStock: '' })} className="text-xs text-purple-600 hover:text-purple-800 font-medium">+ Add Size</button>

      {/* Appearance */}
      <SectionTitle icon="🎨">Appearance</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Material</Label>
          <input className="input-field" value={formData.material} onChange={(e) => set('material', e.target.value)} placeholder="e.g. Stainless Steel" />
        </div>
        <div>
          <Label required>Colors (comma separated)</Label>
          <input className="input-field" value={(formData.color || []).join(', ')} onChange={(e) => set('color', e.target.value.split(',').map((c) => c.trim()))} placeholder="Silver, Black" />
        </div>
      </div>

      {/* Details */}
      <SectionTitle icon="📋">Details</SectionTitle>
      {renderStringArrayField('productDetails', 'Product Details', 'Detail...', true)}
      {renderStringArrayField('keyFeatures', 'Key Features', 'Feature...', true)}

      <div className="flex items-center gap-2 pt-2">
        <input type="checkbox" checked={formData.isReturnable} onChange={(e) => set('isReturnable', e.target.checked)} className="w-4 h-4 accent-purple-600" />
        <span className="text-sm text-gray-700">Returnable</span>
      </div>

      {/* Images */}
      <SectionTitle icon="🖼️">Images</SectionTitle>
      {renderStringArrayField('images', 'Image URLs', 'https://...', true)}
    </>
  );

  /* ─── GROOMING FORM ───────────────────────────────────────────────────── */

  const renderGroomingForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.productName} onChange={(e) => set('productName', e.target.value)} placeholder="e.g. Aloe Vera Shampoo" required />
        </div>
        <div>
          <Label required>Brand</Label>
          <input className="input-field" value={formData.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. PetFresh" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Sub-Category (Pet)</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
            {SUB_CATEGORIES.grooming.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <Label>Suitable For</Label>
          <select className="input-field" value={formData.suitableFor} onChange={(e) => set('suitableFor', e.target.value)}>
            {['Dogs', 'Cats', 'Both'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Variants */}
      <SectionTitle icon="💰">Variants (Volume & Pricing)</SectionTitle>
      {formData.variants.map((v, i) => (
        <div key={i} className="flex gap-2 items-end flex-wrap">
          <div className="w-28">
            {i === 0 && <Label required>Volume</Label>}
            <input className="input-field" placeholder="e.g. 250ml" value={v.volume} onChange={(e) => subArrSet('variants', i, 'volume', e.target.value)} />
          </div>
          <div className="w-24">
            {i === 0 && <Label required>MRP</Label>}
            <input className="input-field" type="number" placeholder="MRP" value={v.mrp} onChange={(e) => subArrSet('variants', i, 'mrp', e.target.value)} />
          </div>
          <div className="w-24">
            {i === 0 && <Label required>Price</Label>}
            <input className="input-field" type="number" placeholder="Price" value={v.discountedPrice} onChange={(e) => subArrSet('variants', i, 'discountedPrice', e.target.value)} />
          </div>
          <div className="w-20">
            {i === 0 && <Label>Disc %</Label>}
            <input className="input-field" type="number" min="0" max="100" placeholder="%" value={v.discountPercentage} onChange={(e) => subArrSet('variants', i, 'discountPercentage', e.target.value)} />
          </div>
          <div className="w-24">
            {i === 0 && <Label required>Stock</Label>}
            <input className="input-field" type="number" placeholder="Stock" value={v.availableStock} onChange={(e) => subArrSet('variants', i, 'availableStock', e.target.value)} />
          </div>
          {i > 0 && <button type="button" onClick={() => subArrRemove('variants', i)} className="text-red-400 hover:text-red-600 text-lg pb-2">×</button>}
        </div>
      ))}
      <button type="button" onClick={() => subArrAdd('variants', { volume: '', mrp: '', discountedPrice: '', discountPercentage: '', availableStock: '' })} className="text-xs text-purple-600 hover:text-purple-800 font-medium">+ Add Variant</button>

      {/* Description & Features */}
      <SectionTitle icon="📋">Details</SectionTitle>
      <div>
        <Label required>Description</Label>
        <textarea className="input-field" rows={3} value={formData.description} onChange={(e) => set('description', e.target.value)} placeholder="Product description..." />
      </div>
      {renderStringArrayField('keyFeatures', 'Key Features', 'Feature...', true)}
      {renderStringArrayField('usageInstructions', 'Usage Instructions', 'Step...')}

      <div className="flex items-center gap-2 pt-2">
        <input type="checkbox" checked={formData.isReturnable} onChange={(e) => set('isReturnable', e.target.checked)} className="w-4 h-4 accent-purple-600" />
        <span className="text-sm text-gray-700">Returnable</span>
      </div>

      {/* Images */}
      <SectionTitle icon="🖼️">Images</SectionTitle>
      {renderStringArrayField('images', 'Image URLs', 'https://...', true)}
    </>
  );

  /* ─── HEALTH SUPPLEMENT FORM ──────────────────────────────────────────── */

  const renderHealthForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Joint Care Tablets" required />
        </div>
        <div>
          <Label required>Sub-Category (Pet)</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
            {SUB_CATEGORIES.health.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing */}
      <SectionTitle icon="💰">Pricing & Stock</SectionTitle>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <Label required>Price (MRP)</Label>
          <input className="input-field" type="number" value={formData.price} onChange={(e) => set('price', e.target.value)} placeholder="₹" />
        </div>
        <div>
          <Label required>Discount Price</Label>
          <input className="input-field" type="number" value={formData.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} placeholder="₹" />
        </div>
        <div>
          <Label required>Discount %</Label>
          <input className="input-field" type="number" min="0" max="100" value={formData.discountPercentage} onChange={(e) => set('discountPercentage', e.target.value)} placeholder="%" />
        </div>
        <div>
          <Label required>Stock</Label>
          <input className="input-field" type="number" min="0" value={formData.availableStock} onChange={(e) => set('availableStock', e.target.value)} placeholder="Qty" />
        </div>
      </div>

      {/* Usage */}
      <SectionTitle icon="💊">Usage</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Dosage</Label>
          <input className="input-field" value={formData.usage?.dosage || ''} onChange={(e) => setNested('usage', 'dosage', e.target.value)} placeholder="e.g. 2 tablets daily" />
        </div>
        <div>
          <Label required>Age Group</Label>
          <input className="input-field" value={formData.usage?.ageGroup || ''} onChange={(e) => setNested('usage', 'ageGroup', e.target.value)} placeholder="e.g. Adults (1-7 years)" />
        </div>
      </div>

      {/* Details */}
      <SectionTitle icon="📋">Details</SectionTitle>
      <div>
        <Label required>Description</Label>
        <textarea className="input-field" rows={3} value={formData.description} onChange={(e) => set('description', e.target.value)} placeholder="Product description..." />
      </div>
      {renderStringArrayField('highlights', 'Highlights', 'Highlight...', true)}

      <div>
        <Label required>Expiry Date</Label>
        <input className="input-field" type="date" value={formData.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
      </div>

      {/* Image (single) */}
      <SectionTitle icon="🖼️">Image</SectionTitle>
      <div>
        <Label required>Image URL</Label>
        <input className="input-field" value={formData.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." />
      </div>
    </>
  );

  /* ─── HOUSE FORM ──────────────────────────────────────────────────────── */

  const renderHouseForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Cozy Pet Bed" required />
        </div>
        <div>
          <Label required>Sub-Category (Pet)</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
            {SUB_CATEGORIES.house.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing */}
      <SectionTitle icon="💰">Pricing & Stock</SectionTitle>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <Label required>Price (MRP)</Label>
          <input className="input-field" type="number" value={formData.price} onChange={(e) => set('price', e.target.value)} placeholder="₹" />
        </div>
        <div>
          <Label required>Discount Price</Label>
          <input className="input-field" type="number" value={formData.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} placeholder="₹" />
        </div>
        <div>
          <Label required>Discount %</Label>
          <input className="input-field" type="number" min="0" max="100" value={formData.discountPercentage} onChange={(e) => set('discountPercentage', e.target.value)} placeholder="%" />
        </div>
        <div>
          <Label required>Stock</Label>
          <input className="input-field" type="number" min="0" value={formData.availableStock} onChange={(e) => set('availableStock', e.target.value)} placeholder="Qty" />
        </div>
      </div>

      {/* Dimensions */}
      <SectionTitle icon="📐">Dimensions</SectionTitle>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <Label required>Height</Label>
          <input className="input-field" value={formData.dimensions?.height || ''} onChange={(e) => setNested('dimensions', 'height', e.target.value)} placeholder="e.g. 45cm" />
        </div>
        <div>
          <Label required>Width</Label>
          <input className="input-field" value={formData.dimensions?.width || ''} onChange={(e) => setNested('dimensions', 'width', e.target.value)} placeholder="e.g. 60cm" />
        </div>
        <div>
          <Label required>Depth</Label>
          <input className="input-field" value={formData.dimensions?.depth || ''} onChange={(e) => setNested('dimensions', 'depth', e.target.value)} placeholder="e.g. 20cm" />
        </div>
        <div>
          <Label required>Weight</Label>
          <input className="input-field" value={formData.dimensions?.weight || ''} onChange={(e) => setNested('dimensions', 'weight', e.target.value)} placeholder="e.g. 2.5kg" />
        </div>
      </div>

      {/* Details */}
      <SectionTitle icon="📋">Details</SectionTitle>
      <div>
        <Label required>Description</Label>
        <textarea className="input-field" rows={3} value={formData.description} onChange={(e) => set('description', e.target.value)} placeholder="Product description..." />
      </div>
      {renderStringArrayField('highlights', 'Highlights', 'Highlight...', true)}

      {/* Image (single) */}
      <SectionTitle icon="🖼️">Image</SectionTitle>
      <div>
        <Label required>Image URL</Label>
        <input className="input-field" value={formData.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." />
      </div>
    </>
  );

  /* ─── Form picker ─────────────────────────────────────────────────────── */

  const FORM_RENDERERS = {
    food: renderFoodForm,
    clothes: renderClothesForm,
    toy: renderToyForm,
    accessory: renderAccessoryForm,
    grooming: renderGroomingForm,
    health: renderHealthForm,
    house: renderHouseForm,
  };

  /* ─── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {existingProduct ? 'Edit' : 'Add'} {categoryData.label.replace(/s$/, '')}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl">✕</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {FORM_RENDERERS[type]?.()}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 text-sm font-semibold transition-colors">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          outline: none;
          transition: all 0.2s;
          font-size: 0.875rem;
          background: #fff;
        }
        .input-field:focus {
          border-color: #9333ea;
          box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
        }
        .input-field::placeholder {
          color: #9ca3af;
        }
        select.input-field {
          appearance: auto;
        }
        textarea.input-field {
          resize: vertical;
        }
      `}</style>
    </div>
  );
};

export default ProductForm;
