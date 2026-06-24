import { useState, useEffect, useMemo } from 'react';
import { type } from '../../styles/typography';
import {
  isImageUrl,
  MAX_IMAGE_UPLOAD_MB,
  MAX_IMAGE_UPLOAD_BYTES,
  uploadAdminImageFile,
} from '@/utils/adminImageUpload';

const API_BASE = import.meta.env.VITE_BACKEND_API;

/* ─── Schema-aware initial states ─────────────────────────────────────────── */

const INITIAL = {
  food: {
    productName: '',
    category: 'Dog',
    subCategory: 'Dry Food',
    prices: [{ capacity: '', mrp: '', discountedPrice: '', availableStock: '' }],
    discountType: '',
    expiryDate: '',
    baseUnit: 'pieces',
    taxes: 18,
    images: [''],
    // Optional fields
    itemCode: '',
    hsn: '',
    brand: '',
    details: [''],
    keyFeatures: [''],
    flavours: [''],
    nutrients: [''],
    healthBenefits: [''],
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
    productName: '', subCategory: 'Dog',
    category: 'Toy',
    mrp: '', discountPrice: '', discountType: '',
    availableStock: '', baseUnit: 'pieces', taxes: 18,
    // Optional fields
    itemCode: '', hsn: '', brand: '', size: '',
    material: '', color: [''],
    productDetails: [''], keyFeatures: [''],
    suitableFor: 'All',
    images: [''],
    isReturnable: true,
  },
  accessory: {
    category: 'accessories',
    subCategory: 'dog',
    productType: '',
    subSubCategory: '',
    productName: '',
    mrp: '',
    discountPrice: '',
    discountType: '',
    availableStock: '',
    baseUnit: 'pieces',
    taxes: 18,
    images: [''],
    // Optional fields
    itemCode: '',
    hsn: '',
    size: '',
    brand: '',
    material: '',
    color: [''],
    productDetails: [''],
    keyFeatures: [''],
    isReturnable: true,
  },
  grooming: {
    category: 'grooming-essentials',
    subCategory: 'dog',
    productName: '',
    mrp: '',
    discountPrice: '',
    discountType: '',
    availableStock: '',
    baseUnit: 'pieces',
    taxes: 18,
    images: [''],
    // Optional fields
    itemCode: '',
    hsn: '',
    size: '',
    expiryDate: '',
    brand: '',
    description: '',
    keyFeatures: [''],
    suitableFor: 'Both',
    usageInstructions: [''],
    isReturnable: true,
  },
  health: {
    category: 'health-supplement',
    subCategory: 'dog',
    productName: '',
    mrp: '',
    discountPrice: '',
    discountType: '',
    availableStock: '',
    expiryDate: '',
    baseUnit: 'pieces',
    taxes: 18,
    images: [''],
    // Optional fields
    itemCode: '',
    hsn: '',
    size: '',
    description: '',
    highlights: [''],
    usage: { dosage: '', ageGroup: '' },
  },
  house: {
    category: 'house',
    subCategory: 'dog',
    productName: '',
    mrp: '',
    discountPrice: '',
    discountType: '',
    availableStock: '',
    baseUnit: 'pieces',
    taxes: 18,
    images: [''],
    // Optional fields
    itemCode: '',
    hsn: '',
    description: '',
    highlights: [''],
    dimensions: { height: '', width: '', depth: '', weight: '' },
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

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizePetName = (value, mode = 'title') => {
  const singular = String(value || '').trim().replace(/s$/i, '').toLowerCase();
  if (!singular) return '';
  return mode === 'lower' ? singular : singular.charAt(0).toUpperCase() + singular.slice(1);
};

/* ─── Component ───────────────────────────────────────────────────────────── */

const ProductForm = ({ categoryData, existingProduct, onClose, onSuccess }) => {
  const type = categoryData.type;
  const [formData, setFormData] = useState({ ...INITIAL[type] });
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategoryTree(Array.isArray(data.data) ? data.data : []);
        }
      } catch {
        setCategoryTree([]);
      }
    };
    fetchCategories();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (existingProduct) {
      const init = { ...INITIAL[type] };
      const merged = { ...init, ...existingProduct };

      // Normalise images → always array for UI
      if (type === 'house') {
        merged.image = existingProduct.image || '';
      } else {
        merged.images = Array.isArray(existingProduct.images)
          ? (existingProduct.images.length ? existingProduct.images : [''])
          : (existingProduct.image ? [existingProduct.image] : ['']);
      }

      // Normalise date
      if (merged.expiryDate) {
        merged.expiryDate = new Date(merged.expiryDate).toISOString().split('T')[0];
      }

      // Ensure sub-arrays exist
      if (type === 'food') {
        if (existingProduct.prices?.length) {
          merged.prices = existingProduct.prices.map((row) => ({
            capacity: row.capacity || '',
            mrp: row.mrp ?? '',
            discountedPrice: row.discountedPrice ?? row.discountPrice ?? '',
            availableStock: row.availableStock ?? '',
          }));
        } else if (existingProduct.capacity) {
          merged.prices = [{
            capacity: existingProduct.capacity || '',
            mrp: existingProduct.mrp ?? '',
            discountedPrice: existingProduct.discountPrice ?? '',
            availableStock: existingProduct.availableStock ?? '',
          }];
        } else if (!merged.prices?.length) {
          merged.prices = init.prices;
        }
      } else if (type !== 'accessory' && type !== 'health' && type !== 'grooming') {
        ['sizes', 'variants'].forEach((k) => {
          if (init[k] && (!merged[k] || !merged[k].length)) merged[k] = init[k];
        });
      }
      
      // Handle accessory sizes migration (if old format exists)
      if (type === 'accessory' && existingProduct.sizes && Array.isArray(existingProduct.sizes) && existingProduct.sizes.length > 0) {
        const firstSize = existingProduct.sizes[0];
        merged.mrp = firstSize.mrp || '';
        merged.discountPrice = firstSize.discountedPrice || '';
        merged.availableStock = firstSize.availableStock || '';
      }
      
      // Handle toy price migration (if old format exists)
      if (type === 'toy' && existingProduct.price !== undefined && !existingProduct.mrp) {
        merged.mrp = existingProduct.price || '';
        merged.discountPrice = existingProduct.discountedPrice || '';
        // Calculate discount type from discountPercentage if available
        if (existingProduct.discountPercentage) {
          merged.discountType = `${existingProduct.discountPercentage}%`;
        }
      }
      
      // Handle health supplement migration (if old format exists)
      if (type === 'health') {
        if (existingProduct.name && !merged.productName) merged.productName = existingProduct.name;
        if (existingProduct.price !== undefined && !merged.mrp) merged.mrp = existingProduct.price;
        if (existingProduct.discountPercentage && !merged.discountType) {
          merged.discountType = `${existingProduct.discountPercentage}%`;
        }
        if (existingProduct.image && (!merged.images || merged.images.length === 0)) {
          merged.images = [existingProduct.image];
        }
      }
      
      // Handle grooming variants migration (if old format exists)
      if (type === 'grooming' && existingProduct.variants && Array.isArray(existingProduct.variants) && existingProduct.variants.length > 0) {
        const firstVariant = existingProduct.variants[0];
        merged.mrp = firstVariant.mrp || '';
        merged.discountPrice = firstVariant.discountedPrice || '';
        merged.availableStock = firstVariant.availableStock || '';
        merged.size = firstVariant.volume || '';
        // Calculate discount type from discountPercentage if available
        if (firstVariant.discountPercentage) {
          merged.discountType = `${firstVariant.discountPercentage}%`;
        }
      }
      
      // Handle house migration (if old format exists)
      if (type === 'house') {
        if (existingProduct.name && !merged.productName) merged.productName = existingProduct.name;
        if (existingProduct.price !== undefined && !merged.mrp) merged.mrp = existingProduct.price;
        if (existingProduct.discountPercentage && !merged.discountType) {
          merged.discountType = `${existingProduct.discountPercentage}%`;
        }
        if (existingProduct.image && (!merged.images || merged.images.length === 0)) {
          merged.images = [existingProduct.image];
        }
      }
      
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

  const handleImageUpload = async (field, idx, file) => {
    if (!file) return;

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      setError(`Image must be ${MAX_IMAGE_UPLOAD_MB} MB or smaller. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`);
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Admin token missing. Please sign in again.');
      return;
    }

    const uploadKey = `${field}-${idx}`;
    setUploadingImageIndex(uploadKey);
    setError('');
    setUploadSuccess('');
    try {
      const url = await uploadAdminImageFile(file, API_BASE);
      arrSet(field, idx, url);
      setUploadSuccess('Image uploaded directly to storage.');
      setTimeout(() => setUploadSuccess(''), 2500);
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed');
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const fixedCategoryMeta = useMemo(() => {
    const byType = {
      toy: ['toys'],
      accessory: ['accessories'],
      grooming: ['grooming-and-essential', 'grooming-essentials'],
      health: ['health-and-supplement', 'health-supplement'],
      house: ['beds-and-house', 'house'],
    };
    const slugs = byType[type] || [];
    const matched = categoryTree.find((cat) => slugs.includes(slugify(cat?.slug || cat?.name)));
    return {
      label: matched?.name || categoryData?.label || '',
      subcategories: Array.isArray(matched?.subcategories) ? matched.subcategories : [],
    };
  }, [categoryData?.label, categoryTree, type]);

  const categoryOptions = useMemo(() => {
    if (type === 'food') {
      const optionsFromApi = categoryTree
        .map((cat) => normalizePetName(cat?.name, 'title'))
        .filter((name) => PET_CATEGORIES_FOOD.includes(name));
      return optionsFromApi.length ? [...new Set(optionsFromApi)] : PET_CATEGORIES_FOOD;
    }
    if (type === 'clothes') {
      const optionsFromApi = categoryTree
        .map((cat) => normalizePetName(cat?.name, 'title'))
        .filter((name) => PET_CATEGORIES_CLOTHES.includes(name));
      return optionsFromApi.length ? [...new Set(optionsFromApi)] : PET_CATEGORIES_CLOTHES;
    }
    if (['toy', 'accessory', 'grooming', 'health', 'house'].includes(type)) {
      return [fixedCategoryMeta.label || formData.category || categoryData?.label || ''];
    }
    return [];
  }, [categoryData?.label, categoryTree, fixedCategoryMeta.label, formData.category, type]);

  const subCategoryOptions = useMemo(() => {
    if (type === 'food') {
      const selectedPet = normalizePetName(formData.category, 'title');
      const matchedPet = categoryTree.find((cat) => normalizePetName(cat?.name, 'title') === selectedPet);
      const optionsFromApi = (matchedPet?.subcategories || []).map((sub) => sub?.name).filter(Boolean);
      return optionsFromApi.length ? [...new Set(optionsFromApi)] : SUB_CATEGORIES.food;
    }
    if (type === 'clothes') return SUB_CATEGORIES.clothes;
    if (['toy', 'accessory', 'grooming', 'health', 'house'].includes(type)) {
      const values = fixedCategoryMeta.subcategories
        .map((sub) => normalizePetName(sub?.name, 'lower'))
        .filter((name) => SUB_CATEGORIES[type]?.includes(name));
      return values.length ? [...new Set(values)] : SUB_CATEGORIES[type];
    }
    return [];
  }, [categoryTree, fixedCategoryMeta.subcategories, formData.category, type]);

  const accessorySubSubCategoryOptions = useMemo(() => {
    if (type !== 'accessory') return [];
    const selectedSub = normalizePetName(formData.subCategory, 'title');
    const selectedNode = fixedCategoryMeta.subcategories.find(
      (sub) => normalizePetName(sub?.name, 'title') === selectedSub
    );
    const dynamic = (selectedNode?.subSubCategories || []).map((entry) => slugify(entry)).filter(Boolean);
    return [...new Set([...dynamic, 'collar-leash'])];
  }, [fixedCategoryMeta.subcategories, formData.subCategory, type]);

  useEffect(() => {
    if (!categoryOptions.length || !formData.category) return;
    if (!categoryOptions.includes(formData.category) && (type === 'food' || type === 'clothes')) {
      set('category', categoryOptions[0]);
    }
  }, [categoryOptions, formData.category, type]);

  useEffect(() => {
    if (!subCategoryOptions.length) return;
    if (!subCategoryOptions.includes(formData.subCategory)) {
      set('subCategory', subCategoryOptions[0]);
    }
  }, [subCategoryOptions, formData.subCategory]);

  useEffect(() => {
    if (type !== 'accessory') return;
    if (!formData.subSubCategory) return;
    if (!accessorySubSubCategoryOptions.includes(formData.subSubCategory)) {
      set('subSubCategory', '');
    }
  }, [accessorySubSubCategoryOptions, formData.subSubCategory, type]);

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

      // Convert food, accessory, toy, health, grooming, and house pricing fields to numbers
      if (type === 'food' || type === 'accessory' || type === 'toy' || type === 'health' || type === 'grooming' || type === 'house') {
        if (payload.mrp !== undefined && payload.mrp !== '') payload.mrp = Number(payload.mrp);
        if (payload.discountPrice !== undefined && payload.discountPrice !== '') payload.discountPrice = Number(payload.discountPrice);
        if (payload.taxes !== undefined && payload.taxes !== '') payload.taxes = Number(payload.taxes);
        if (payload.availableStock !== undefined && payload.availableStock !== '') payload.availableStock = Number(payload.availableStock);
      }
      
      // Convert food capacity variants
      if (type === 'food' && payload.prices) {
        payload.prices = payload.prices
          .map((row) => ({
            capacity: String(row.capacity || '').trim(),
            mrp: row.mrp !== '' && row.mrp !== undefined ? Number(row.mrp) : NaN,
            discountedPrice:
              row.discountedPrice !== '' && row.discountedPrice !== undefined
                ? Number(row.discountedPrice)
                : NaN,
            availableStock:
              row.availableStock !== '' && row.availableStock !== undefined
                ? Number(row.availableStock)
                : 0,
          }))
          .filter((row) => row.capacity && Number.isFinite(row.mrp) && Number.isFinite(row.discountedPrice));

        if (!payload.prices.length) {
          setError('Please add at least one capacity variant with MRP and sale price');
          setLoading(false);
          return;
        }

        delete payload.capacity;
        delete payload.mrp;
        delete payload.discountPrice;
        delete payload.availableStock;
      }

      // Convert sub-array numbers
      if (payload.prices && type !== 'food') {
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

      // Remove empty optional string fields
      if (type === 'food') {
        ['brand', 'itemCode', 'hsn'].forEach((k) => {
          if (payload[k] === '' || payload[k] === undefined) delete payload[k];
        });
      }
      if (type === 'accessory') {
        ['size', 'brand', 'material', 'itemCode', 'hsn', 'productType', 'subSubCategory'].forEach((k) => {
          if (payload[k] === '' || payload[k] === undefined) delete payload[k];
        });
      }
      if (type === 'toy') {
        ['itemCode', 'hsn', 'brand', 'size', 'material'].forEach((k) => {
          if (payload[k] === '' || payload[k] === undefined) delete payload[k];
        });
      }
      if (type === 'health') {
        ['itemCode', 'hsn', 'size', 'description', 'highlights'].forEach((k) => {
          if (payload[k] === '' || payload[k] === undefined) delete payload[k];
        });
        // Remove usage if empty
        if (payload.usage && (!payload.usage.dosage && !payload.usage.ageGroup)) delete payload.usage;
      }
      if (type === 'grooming') {
        ['itemCode', 'hsn', 'size', 'expiryDate', 'brand', 'description', 'keyFeatures'].forEach((k) => {
          if (payload[k] === '' || payload[k] === undefined) delete payload[k];
        });
        // Remove old variants array if exists
        delete payload.variants;
      }
      if (type === 'house') {
        ['itemCode', 'hsn', 'description', 'highlights'].forEach((k) => {
          if (payload[k] === '' || payload[k] === undefined) delete payload[k];
        });
        // Remove old price/discountPercentage fields if exists
        delete payload.price;
        delete payload.discountPercentage;
        // Remove dimensions if all fields are empty
        if (payload.dimensions && (!payload.dimensions.height && !payload.dimensions.width && !payload.dimensions.depth && !payload.dimensions.weight)) {
          delete payload.dimensions;
        }
        // Convert image to images array if needed
        if (payload.image && (!payload.images || payload.images.length === 0)) {
          payload.images = [payload.image];
        }
        delete payload.image;
      }

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
    <label className={`${type.bodySm} block text-gray-700 mb-1`}>
      {children} {required && <span className="text-red-400">*</span>}
    </label>
  );

  const SectionTitle = ({ icon, children }) => (
    <div className="flex items-center gap-2 pt-5 pb-2 border-t border-gray-100">
      <span className={`${type.body}`}>{icon}</span>
      <h3 className={`${type.caption} text-gray-800 uppercase tracking-wide`}>{children}</h3>
    </div>
  );

  const renderStringArrayField = (field, label, placeholder, required = false) => (
    <div>
      <Label required={required}>{label}</Label>
      {field === 'images' && (
        <p className={`${type.caption} text-gray-500 mb-2`}>
          Paste a URL or upload directly to storage (max {MAX_IMAGE_UPLOAD_MB} MB). Uploaded images are served via CloudFront.
        </p>
      )}
      {(formData[field] || ['']).map((val, i) => (
        <div key={i} className={`mb-3 ${field === 'images' ? 'p-3 rounded-xl border border-gray-200 bg-gray-50/50' : ''}`}>
          <div className="flex gap-2">
            <input
              value={val}
              onChange={(e) => arrSet(field, i, e.target.value)}
              placeholder={placeholder}
              className="input-field"
            />
            {field === 'images' && (
              <label className={`${type.captionMedium} px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap flex items-center shrink-0`}>
                {uploadingImageIndex === `${field}-${i}` ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploadingImageIndex === `${field}-${i}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleImageUpload(field, i, file);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
            {i > 0 && (
              <button type="button" onClick={() => arrRemove(field, i)} className={`${type.body} text-red-400 hover:text-red-600 px-1 shrink-0`}>×</button>
            )}
          </div>
          {field === 'images' && isImageUrl(val) && (
            <div className="mt-3 flex items-start gap-3">
              <img
                src={val}
                alt={`Preview ${i + 1}`}
                className="w-28 h-28 rounded-lg border border-gray-200 object-cover bg-white"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className={`${type.caption} text-gray-500 pt-1 break-all`}>{val}</p>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={() => arrAdd(field)} className={`${type.caption} text-purple-600 hover:text-purple-800`}>
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
          <Label>Brand</Label>
          <input className="input-field" value={formData.brand || ''} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Royal Canin" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Pet Category</Label>
          <select className="input-field" value={formData.category} onChange={(e) => set('category', e.target.value)} required>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label required>Sub-Category</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)} required>
            {subCategoryOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Capacity variants & pricing */}
      <SectionTitle icon="💰">Capacity & Pricing</SectionTitle>
      <p className={`${type.caption} text-gray-500 -mt-2`}>Add each pack size with its own MRP, sale price, and stock.</p>
      {formData.prices.map((row, i) => (
        <div key={i} className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[120px]">
            {i === 0 && <Label required>Capacity</Label>}
            <input
              className="input-field"
              placeholder="e.g. 1kg"
              value={row.capacity}
              onChange={(e) => subArrSet('prices', i, 'capacity', e.target.value)}
              required
            />
          </div>
          <div className="w-28">
            {i === 0 && <Label required>MRP</Label>}
            <input
              className="input-field"
              type="number"
              placeholder="MRP"
              value={row.mrp}
              onChange={(e) => subArrSet('prices', i, 'mrp', e.target.value)}
              required
            />
          </div>
          <div className="w-28">
            {i === 0 && <Label required>Sale Price</Label>}
            <input
              className="input-field"
              type="number"
              placeholder="Sale"
              value={row.discountedPrice}
              onChange={(e) => subArrSet('prices', i, 'discountedPrice', e.target.value)}
              required
            />
          </div>
          <div className="w-24">
            {i === 0 && <Label required>Stock</Label>}
            <input
              className="input-field"
              type="number"
              min="0"
              placeholder="Stock"
              value={row.availableStock}
              onChange={(e) => subArrSet('prices', i, 'availableStock', e.target.value)}
              required
            />
          </div>
          {i > 0 && (
            <button
              type="button"
              onClick={() => subArrRemove('prices', i)}
              className={`${type.body} text-red-400 hover:text-red-600 pb-2`}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => subArrAdd('prices', { capacity: '', mrp: '', discountedPrice: '', availableStock: '' })}
        className={`${type.caption} text-purple-600 hover:text-purple-800`}
      >
        + Add Capacity Variant
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Discount Type</Label>
          <input className="input-field" placeholder="e.g. Percentage, Fixed" value={formData.discountType || ''} onChange={(e) => set('discountType', e.target.value)} required />
        </div>
        <div>
          <Label required>Expiry Date</Label>
          <input className="input-field" type="date" value={formData.expiryDate || ''} onChange={(e) => set('expiryDate', e.target.value)} required />
        </div>
      </div>

      {/* Base Unit & Taxes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Base Unit</Label>
          <input className="input-field" value={formData.baseUnit || 'pieces'} onChange={(e) => set('baseUnit', e.target.value)} placeholder="e.g. pieces" required />
        </div>
        <div>
          <Label required>Taxes (GST %)</Label>
          <input className="input-field" type="number" value={formData.taxes || 18} onChange={(e) => set('taxes', e.target.value)} placeholder="18" required />
        </div>
      </div>

      {/* Item Code & HSN */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Item Code</Label>
          <input className="input-field" value={formData.itemCode || ''} onChange={(e) => set('itemCode', e.target.value)} placeholder="e.g. FD001" />
        </div>
        <div>
          <Label>HSN</Label>
          <input className="input-field" value={formData.hsn || ''} onChange={(e) => set('hsn', e.target.value)} placeholder="e.g. 23091000" />
        </div>
      </div>

      {/* Arrays */}
      <SectionTitle icon="📋">Details</SectionTitle>
      {renderStringArrayField('details', 'Details', 'Product detail...', false)}
      {renderStringArrayField('keyFeatures', 'Key Features', 'Feature...', false)}
      {renderStringArrayField('flavours', 'Flavours', 'e.g. Chicken', false)}
      {renderStringArrayField('nutrients', 'Nutrients', 'e.g. Protein 28%', false)}
      {renderStringArrayField('healthBenefits', 'Health Benefits', 'e.g. Strong muscles', false)}

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
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
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
          {i > 0 && <button type="button" onClick={() => subArrRemove('sizes', i)} className={`${type.body} text-red-400 hover:text-red-600 pb-2`}>×</button>}
        </div>
      ))}
      <button type="button" onClick={() => subArrAdd('sizes', { size: 'M', mrp: '', discountedPrice: '', availableStock: '' })} className={`${type.caption} text-purple-600 hover:text-purple-800`}>+ Add Size</button>

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
            <span className={`${type.bodySm} text-gray-700`}>Returnable</span>
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
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.productName} onChange={(e) => set('productName', e.target.value)} placeholder="e.g. Squeaky Ball" required />
        </div>
        <div>
          <Label required>Category</Label>
          <select className="input-field" value={categoryOptions[0] || 'Toys'} disabled>
            <option value={categoryOptions[0] || 'Toys'}>{categoryOptions[0] || 'Toys'}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Sub-Category</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
            {subCategoryOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pricing & Stock */}
      <SectionTitle icon="💰">Pricing & Stock</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>MRP</Label>
          <input className="input-field" type="number" value={formData.mrp} onChange={(e) => set('mrp', e.target.value)} placeholder="₹" required />
        </div>
        <div>
          <Label required>Discount Price</Label>
          <input className="input-field" type="number" value={formData.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} placeholder="₹" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Discount Type</Label>
          <input className="input-field" value={formData.discountType} onChange={(e) => set('discountType', e.target.value)} placeholder="e.g. 15, 20, 25%" required />
        </div>
        <div>
          <Label required>Available Stock</Label>
          <input className="input-field" type="number" min="0" value={formData.availableStock} onChange={(e) => set('availableStock', e.target.value)} placeholder="Qty" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Base Unit</Label>
          <input className="input-field" value={formData.baseUnit || 'pieces'} onChange={(e) => set('baseUnit', e.target.value)} placeholder="pieces" required />
        </div>
        <div>
          <Label required>Taxes (GST %)</Label>
          <input className="input-field" type="number" value={formData.taxes || 18} onChange={(e) => set('taxes', e.target.value)} placeholder="18" required />
        </div>
      </div>

      {/* Optional Fields */}
      <SectionTitle icon="📝">Additional Information (Optional)</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Item Code</Label>
          <input className="input-field" value={formData.itemCode || ''} onChange={(e) => set('itemCode', e.target.value)} placeholder="e.g. TOY001" />
        </div>
        <div>
          <Label>HSN</Label>
          <input className="input-field" value={formData.hsn || ''} onChange={(e) => set('hsn', e.target.value)} placeholder="e.g. 12345678" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Brand</Label>
          <input className="input-field" value={formData.brand || ''} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. PawPlay" />
        </div>
        <div>
          <Label>Size</Label>
          <input className="input-field" value={formData.size || ''} onChange={(e) => set('size', e.target.value)} placeholder="e.g. One Size, Large, etc." />
        </div>
      </div>
      <div>
        <Label>Material</Label>
        <input className="input-field" value={formData.material || ''} onChange={(e) => set('material', e.target.value)} placeholder="e.g. Rubber" />
      </div>
      <div>
        <Label>Colors (comma separated)</Label>
        <input className="input-field" value={(formData.color || []).join(', ')} onChange={(e) => set('color', e.target.value.split(',').map((c) => c.trim()))} placeholder="Red, Blue" />
      </div>
      <div>
        <Label>Suitable For</Label>
        <select className="input-field" value={formData.suitableFor || 'All'} onChange={(e) => set('suitableFor', e.target.value)}>
          {['Puppy', 'Adult', 'All'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Details */}
      <SectionTitle icon="📋">Details</SectionTitle>
      {renderStringArrayField('productDetails', 'Product Details', 'Detail...')}
      {renderStringArrayField('keyFeatures', 'Key Features', 'Feature...')}

      <div className="flex items-center gap-2 pt-2">
        <input type="checkbox" checked={formData.isReturnable} onChange={(e) => set('isReturnable', e.target.checked)} className="w-4 h-4 accent-purple-600" />
        <span className={`${type.bodySm} text-gray-700`}>Returnable</span>
      </div>

      {/* Images */}
      <SectionTitle icon="🖼️">Images</SectionTitle>
      {renderStringArrayField('images', 'Image URLs', 'https://...', true)}
    </>
  );

  /* ─── ACCESSORY FORM ──────────────────────────────────────────────────── */

  const renderAccessoryForm = () => (
    <>
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.productName} onChange={(e) => set('productName', e.target.value)} placeholder="e.g. Nylon Dog Collar" required />
        </div>
        <div>
          <Label required>Category</Label>
          <select className="input-field" value={categoryOptions[0] || 'Accessories'} disabled>
            <option value={categoryOptions[0] || 'Accessories'}>{categoryOptions[0] || 'Accessories'}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Sub-Category</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)} required>
            {subCategoryOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Brand</Label>
          <input className="input-field" value={formData.brand || ''} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. PawGear" />
        </div>
      </div>
      <div>
        <Label>Product Type</Label>
        <select className="input-field" value={formData.productType || ''} onChange={(e) => set('productType', e.target.value)}>
          <option value="">None</option>
          <option value="collar-leash">Collar & Leash</option>
        </select>
      </div>
      <div>
        <Label>Sub-Sub Category (Optional)</Label>
        <select className="input-field" value={formData.subSubCategory || ''} onChange={(e) => set('subSubCategory', e.target.value)}>
          <option value="">None</option>
          {accessorySubSubCategoryOptions.map((option) => (
            <option key={option} value={option}>
              {option.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
            </option>
          ))}
        </select>
        <p className={`${type.caption} text-gray-500 mt-1`}>Optional: Use this if you want to categorize as Collar & Leash</p>
      </div>

      {/* Pricing */}
      <SectionTitle icon="💰">Pricing</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>MRP</Label>
          <input className="input-field" type="number" placeholder="MRP" value={formData.mrp || ''} onChange={(e) => set('mrp', e.target.value)} required />
        </div>
        <div>
          <Label required>Discount Price</Label>
          <input className="input-field" type="number" placeholder="Discount Price" value={formData.discountPrice || ''} onChange={(e) => set('discountPrice', e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Discount Type</Label>
          <input className="input-field" placeholder="e.g. 15, 20, 25%" value={formData.discountType || ''} onChange={(e) => set('discountType', e.target.value)} required />
        </div>
        <div>
          <Label required>Available Stock</Label>
          <input className="input-field" type="number" min="0" placeholder="Stock" value={formData.availableStock || ''} onChange={(e) => set('availableStock', e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Base Unit</Label>
          <input className="input-field" value={formData.baseUnit || 'pieces'} onChange={(e) => set('baseUnit', e.target.value)} placeholder="pieces" required />
        </div>
        <div>
          <Label required>Taxes (GST %)</Label>
          <input className="input-field" type="number" value={formData.taxes || 18} onChange={(e) => set('taxes', e.target.value)} placeholder="18" required />
        </div>
      </div>

      {/* Optional Fields */}
      <SectionTitle icon="📝">Additional Information (Optional)</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Item Code</Label>
          <input className="input-field" value={formData.itemCode || ''} onChange={(e) => set('itemCode', e.target.value)} placeholder="e.g. ACC001" />
        </div>
        <div>
          <Label>HSN</Label>
          <input className="input-field" value={formData.hsn || ''} onChange={(e) => set('hsn', e.target.value)} placeholder="e.g. 12345678" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Size</Label>
          <input className="input-field" value={formData.size || ''} onChange={(e) => set('size', e.target.value)} placeholder="e.g. S, XL, Large, Medium, Size01, 1kg, 250ml, etc." />
        </div>
        <div>
          <Label>Material</Label>
          <input className="input-field" value={formData.material || ''} onChange={(e) => set('material', e.target.value)} placeholder="e.g. Nylon" />
        </div>
      </div>

      {/* Size */}
      <div>
        <Label>Size</Label>
        <input className="input-field" value={formData.size || ''} onChange={(e) => set('size', e.target.value)} placeholder="e.g. S, XL, Large, Medium, Size01, Size02, 1kg, 250ml, etc." />
        <p className={`${type.caption} text-gray-500 mt-1`}>Enter any size format: S/XL/Large/Medium, Size01/Size02, kg, ml, etc.</p>
      </div>

      {/* Appearance */}
      <SectionTitle icon="🎨">Appearance</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Material</Label>
          <input className="input-field" value={formData.material || ''} onChange={(e) => set('material', e.target.value)} placeholder="e.g. Stainless Steel" />
        </div>
        <div>
          <Label>Colors (comma separated)</Label>
          <input className="input-field" value={(formData.color || []).join(', ')} onChange={(e) => set('color', e.target.value.split(',').map((c) => c.trim()))} placeholder="Silver, Black" />
        </div>
      </div>

      {/* Details */}
      <SectionTitle icon="📋">Details</SectionTitle>
      {renderStringArrayField('productDetails', 'Product Details', 'Detail...', false)}
      {renderStringArrayField('keyFeatures', 'Key Features', 'Feature...', false)}

      <div className="flex items-center gap-2 pt-2">
        <input type="checkbox" checked={formData.isReturnable} onChange={(e) => set('isReturnable', e.target.checked)} className="w-4 h-4 accent-purple-600" />
        <span className={`${type.bodySm} text-gray-700`}>Returnable</span>
      </div>

      {/* Images */}
      <SectionTitle icon="🖼️">Images</SectionTitle>
      {renderStringArrayField('images', 'Image URLs', 'https://...', true)}
    </>
  );

  /* ─── GROOMING FORM ───────────────────────────────────────────────────── */

  const renderGroomingForm = () => (
    <>
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.productName} onChange={(e) => set('productName', e.target.value)} placeholder="e.g. Aloe Vera Shampoo" required />
        </div>
        <div>
          <Label required>Category</Label>
          <select className="input-field" value={categoryOptions[0] || 'Grooming'} disabled>
            <option value={categoryOptions[0] || 'Grooming'}>{categoryOptions[0] || 'Grooming'}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Sub-Category</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
            {subCategoryOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing & Stock */}
      <SectionTitle icon="💰">Pricing & Stock</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>MRP</Label>
          <input className="input-field" type="number" value={formData.mrp} onChange={(e) => set('mrp', e.target.value)} placeholder="₹" required />
        </div>
        <div>
          <Label required>Discount Price</Label>
          <input className="input-field" type="number" value={formData.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} placeholder="₹" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Discount Type</Label>
          <input className="input-field" value={formData.discountType} onChange={(e) => set('discountType', e.target.value)} placeholder="e.g. 15, 20, 25%" required />
        </div>
        <div>
          <Label required>Available Stock</Label>
          <input className="input-field" type="number" min="0" value={formData.availableStock} onChange={(e) => set('availableStock', e.target.value)} placeholder="Qty" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Base Unit</Label>
          <input className="input-field" value={formData.baseUnit || 'pieces'} onChange={(e) => set('baseUnit', e.target.value)} placeholder="pieces" required />
        </div>
        <div>
          <Label required>Taxes (GST %)</Label>
          <input className="input-field" type="number" value={formData.taxes || 18} onChange={(e) => set('taxes', e.target.value)} placeholder="18" required />
        </div>
      </div>

      {/* Optional Fields */}
      <SectionTitle icon="📝">Additional Information (Optional)</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Item Code</Label>
          <input className="input-field" value={formData.itemCode || ''} onChange={(e) => set('itemCode', e.target.value)} placeholder="e.g. GRM001" />
        </div>
        <div>
          <Label>HSN</Label>
          <input className="input-field" value={formData.hsn || ''} onChange={(e) => set('hsn', e.target.value)} placeholder="e.g. 12345678" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Size</Label>
          <input className="input-field" value={formData.size || ''} onChange={(e) => set('size', e.target.value)} placeholder="e.g. 250ml, 500ml, 1L, Small, Large, etc." />
        </div>
        <div>
          <Label>Expiry Date</Label>
          <input className="input-field" type="date" value={formData.expiryDate || ''} onChange={(e) => set('expiryDate', e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Brand</Label>
        <input className="input-field" value={formData.brand || ''} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. PawSpa" />
      </div>
      <div>
        <Label>Suitable For</Label>
        <select className="input-field" value={formData.suitableFor || 'Both'} onChange={(e) => set('suitableFor', e.target.value)}>
          {['Dogs', 'Cats', 'Both'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Details */}
      <SectionTitle icon="📋">Details</SectionTitle>
      <div>
        <Label>Description</Label>
        <textarea className="input-field" rows={3} value={formData.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Product description..." />
      </div>
      {renderStringArrayField('keyFeatures', 'Key Features', 'Feature...')}
      {renderStringArrayField('usageInstructions', 'Usage Instructions', 'Step...')}

      <div className="flex items-center gap-2 pt-2">
        <input type="checkbox" checked={formData.isReturnable} onChange={(e) => set('isReturnable', e.target.checked)} className="w-4 h-4 accent-purple-600" />
        <span className={`${type.bodySm} text-gray-700`}>Returnable</span>
      </div>

      {/* Images */}
      <SectionTitle icon="🖼️">Images</SectionTitle>
      {renderStringArrayField('images', 'Image URLs', 'https://...', true)}
    </>
  );

  /* ─── HEALTH SUPPLEMENT FORM ──────────────────────────────────────────── */

  const renderHealthForm = () => (
    <>
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.productName} onChange={(e) => set('productName', e.target.value)} placeholder="e.g. Joint Care Tablets" required />
        </div>
        <div>
          <Label required>Category</Label>
          <select className="input-field" value={categoryOptions[0] || 'Health'} disabled>
            <option value={categoryOptions[0] || 'Health'}>{categoryOptions[0] || 'Health'}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Sub-Category</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
            {subCategoryOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing & Stock */}
      <SectionTitle icon="💰">Pricing & Stock</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>MRP</Label>
          <input className="input-field" type="number" value={formData.mrp} onChange={(e) => set('mrp', e.target.value)} placeholder="₹" required />
        </div>
        <div>
          <Label required>Discount Price</Label>
          <input className="input-field" type="number" value={formData.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} placeholder="₹" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Discount Type</Label>
          <input className="input-field" value={formData.discountType} onChange={(e) => set('discountType', e.target.value)} placeholder="e.g. 15, 20, 25%" required />
        </div>
        <div>
          <Label required>Available Stock</Label>
          <input className="input-field" type="number" min="0" value={formData.availableStock} onChange={(e) => set('availableStock', e.target.value)} placeholder="Qty" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Base Unit</Label>
          <input className="input-field" value={formData.baseUnit || 'pieces'} onChange={(e) => set('baseUnit', e.target.value)} placeholder="pieces" required />
        </div>
        <div>
          <Label required>Taxes (GST %)</Label>
          <input className="input-field" type="number" value={formData.taxes || 18} onChange={(e) => set('taxes', e.target.value)} placeholder="18" required />
        </div>
      </div>
      <div>
        <Label required>Expiry Date</Label>
        <input className="input-field" type="date" value={formData.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} required />
      </div>

      {/* Optional Fields */}
      <SectionTitle icon="📝">Additional Information (Optional)</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Item Code</Label>
          <input className="input-field" value={formData.itemCode || ''} onChange={(e) => set('itemCode', e.target.value)} placeholder="e.g. HLT001" />
        </div>
        <div>
          <Label>HSN</Label>
          <input className="input-field" value={formData.hsn || ''} onChange={(e) => set('hsn', e.target.value)} placeholder="e.g. 12345678" />
        </div>
      </div>
      <div>
        <Label>Size</Label>
        <input className="input-field" value={formData.size || ''} onChange={(e) => set('size', e.target.value)} placeholder="e.g. 250ml, 500ml, 1L, Small, Large, kg, etc." />
      </div>

      {/* Details */}
      <SectionTitle icon="📋">Details</SectionTitle>
      <div>
        <Label>Description</Label>
        <textarea className="input-field" rows={3} value={formData.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Product description..." />
      </div>
      {renderStringArrayField('highlights', 'Highlights', 'Highlight...')}
      
      {/* Usage */}
      <SectionTitle icon="💊">Usage (Optional)</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Dosage</Label>
          <input className="input-field" value={formData.usage?.dosage || ''} onChange={(e) => setNested('usage', 'dosage', e.target.value)} placeholder="e.g. 2 tablets daily" />
        </div>
        <div>
          <Label>Age Group</Label>
          <input className="input-field" value={formData.usage?.ageGroup || ''} onChange={(e) => setNested('usage', 'ageGroup', e.target.value)} placeholder="e.g. Adults (1-7 years)" />
        </div>
      </div>

      {/* Images */}
      <SectionTitle icon="🖼️">Images</SectionTitle>
      {renderStringArrayField('images', 'Image URLs', 'https://...', true)}
    </>
  );

  /* ─── HOUSE FORM ──────────────────────────────────────────────────────── */

  const renderHouseForm = () => (
    <>
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Product Name</Label>
          <input className="input-field" value={formData.productName || formData.name} onChange={(e) => { set('productName', e.target.value); set('name', e.target.value); }} placeholder="e.g. Cozy Pet Bed" required />
        </div>
        <div>
          <Label required>Category</Label>
          <select className="input-field" value={categoryOptions[0] || 'Houses'} disabled>
            <option value={categoryOptions[0] || 'Houses'}>{categoryOptions[0] || 'Houses'}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Sub-Category</Label>
          <select className="input-field" value={formData.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
            {subCategoryOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing & Stock */}
      <SectionTitle icon="💰">Pricing & Stock</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>MRP</Label>
          <input className="input-field" type="number" value={formData.mrp || formData.price} onChange={(e) => { set('mrp', e.target.value); set('price', e.target.value); }} placeholder="₹" required />
        </div>
        <div>
          <Label required>Discount Price</Label>
          <input className="input-field" type="number" value={formData.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} placeholder="₹" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Discount Type</Label>
          <input className="input-field" value={formData.discountType || (formData.discountPercentage ? `${formData.discountPercentage}%` : '')} onChange={(e) => set('discountType', e.target.value)} placeholder="e.g. 15, 20, 25%" required />
        </div>
        <div>
          <Label required>Available Stock</Label>
          <input className="input-field" type="number" min="0" value={formData.availableStock} onChange={(e) => set('availableStock', e.target.value)} placeholder="Qty" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Base Unit</Label>
          <input className="input-field" value={formData.baseUnit || 'pieces'} onChange={(e) => set('baseUnit', e.target.value)} placeholder="pieces" required />
        </div>
        <div>
          <Label required>Taxes (GST %)</Label>
          <input className="input-field" type="number" value={formData.taxes || 18} onChange={(e) => set('taxes', e.target.value)} placeholder="18" required />
        </div>
      </div>

      {/* Optional Fields */}
      <SectionTitle icon="📝">Additional Information (Optional)</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Item Code</Label>
          <input className="input-field" value={formData.itemCode || ''} onChange={(e) => set('itemCode', e.target.value)} placeholder="e.g. HSE001" />
        </div>
        <div>
          <Label>HSN</Label>
          <input className="input-field" value={formData.hsn || ''} onChange={(e) => set('hsn', e.target.value)} placeholder="e.g. 12345678" />
        </div>
      </div>

      {/* Details */}
      <SectionTitle icon="📋">Details</SectionTitle>
      <div>
        <Label>Description</Label>
        <textarea className="input-field" rows={3} value={formData.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Product description..." />
      </div>
      {renderStringArrayField('highlights', 'Highlights', 'Highlight...')}

      {/* Dimensions */}
      <SectionTitle icon="📐">Dimensions (Optional)</SectionTitle>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <Label>Height</Label>
          <input className="input-field" value={formData.dimensions?.height || ''} onChange={(e) => setNested('dimensions', 'height', e.target.value)} placeholder="e.g. 45cm" />
        </div>
        <div>
          <Label>Width</Label>
          <input className="input-field" value={formData.dimensions?.width || ''} onChange={(e) => setNested('dimensions', 'width', e.target.value)} placeholder="e.g. 60cm" />
        </div>
        <div>
          <Label>Depth</Label>
          <input className="input-field" value={formData.dimensions?.depth || ''} onChange={(e) => setNested('dimensions', 'depth', e.target.value)} placeholder="e.g. 20cm" />
        </div>
        <div>
          <Label>Weight</Label>
          <input className="input-field" value={formData.dimensions?.weight || ''} onChange={(e) => setNested('dimensions', 'weight', e.target.value)} placeholder="e.g. 2.5kg" />
        </div>
      </div>

      {/* Images */}
      <SectionTitle icon="🖼️">Images</SectionTitle>
      {renderStringArrayField('images', 'Image URLs', 'https://...', true)}
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

  const formBody = (
    <>
      {error && (
        <div className={`${type.bodySm} bg-red-50 text-red-600 p-3 rounded-xl border border-red-100`}>
          {error}
        </div>
      )}
      {uploadSuccess && (
        <div className={`${type.bodySm} bg-blue-50 text-blue-700 p-3 rounded-xl border border-blue-100`}>
          {uploadSuccess}
        </div>
      )}

      {FORM_RENDERERS[type]?.()}

      <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
        <button type="button" onClick={onClose} className={`${type.nav} px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors`}>
          Cancel
        </button>
        <button type="submit" disabled={loading} className={`${type.bodySm} px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors`}>
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
    </>
  );

  const formStyles = (
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
  );

  return (
    <div className="w-full mx-auto my-2 sm:my-4 p-4 sm:p-6 lg:p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className={`${type.h2} text-gray-900`}>
          {existingProduct ? 'Edit' : 'Add'} {categoryData.label.replace(/s$/, '')}
        </h1>
        <p className={`${type.bodySm} text-gray-500 mt-1`}>
          {existingProduct ? 'Update product details and capacity pricing' : 'Fill in the details below'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        {formBody}
      </form>
      {formStyles}
    </div>
  );
};

export default ProductForm;
