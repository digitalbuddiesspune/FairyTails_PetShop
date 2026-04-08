import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMyProducts from './admin/AdminMyProducts';

const API_BASE = import.meta.env.VITE_BACKEND_API;

// ─── Category config: maps tab keys to API endpoints + display helpers ───
const PRODUCT_CATEGORIES = [
  { key: 'food', label: 'Food', icon: '🍖', endpoint: '/food', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { key: 'clothes', label: 'Clothes', icon: '👕', endpoint: '/clothes', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { key: 'grooming', label: 'Grooming', icon: '✂️', endpoint: '/grooming-essentials', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { key: 'essentials', label: 'Essentials', icon: '💊', endpoint: '/health-supplements', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { key: 'toys', label: 'Toys', icon: '🧸', endpoint: '/toys', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { key: 'housing', label: 'Housing', icon: '🏠', endpoint: '/houses', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { key: 'accessories', label: 'Accessories', icon: '🎀', endpoint: '/accessories', color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

// Normalize product data across different models for display
const normalizeProduct = (product, categoryKey) => {
  let name = '', image = '', price = 0, mrp = 0, brand = '';

  switch (categoryKey) {
    case 'food':
      name = product.productName;
      image = product.images?.[0];
      price = product.prices?.[0]?.discountedPrice || 0;
      mrp = product.prices?.[0]?.mrp || 0;
      brand = product.brand;
      break;
    case 'clothes':
      name = product.productName;
      image = product.images?.[0];
      price = product.sizes?.[0]?.discountedPrice || 0;
      mrp = product.sizes?.[0]?.mrp || 0;
      brand = product.brand;
      break;
    case 'toys':
      name = product.productName;
      image = product.images?.[0];
      price = product.discountedPrice || product.price || 0;
      mrp = product.price || 0;
      brand = product.brand;
      break;
    case 'housing':
      name = product.name;
      image = product.image;
      price = product.discountPrice || product.price || 0;
      mrp = product.price || 0;
      brand = '';
      break;
    case 'accessories':
      name = product.productName;
      image = product.images?.[0];
      price = product.sizes?.[0]?.discountedPrice || 0;
      mrp = product.sizes?.[0]?.mrp || 0;
      brand = product.brand;
      break;
    case 'grooming':
      name = product.productName;
      image = product.images?.[0];
      price = product.variants?.[0]?.discountedPrice || 0;
      mrp = product.variants?.[0]?.mrp || 0;
      brand = product.brand;
      break;
    case 'essentials':
      name = product.name;
      image = product.image;
      price = product.discountPrice || product.price || 0;
      mrp = product.price || 0;
      brand = '';
      break;
    default:
      name = product.productName || product.name;
      image = product.images?.[0] || product.image;
      price = 0;
      mrp = 0;
      brand = product.brand || '';
  }

  return { ...product, _name: name, _image: image, _price: price, _mrp: mrp, _brand: brand };
};

// Map categoryKey to API delete/edit path
const getCategoryApiPath = (categoryKey) => {
  const map = {
    food: '/food',
    clothes: '/clothes',
    grooming: '/grooming-essentials',
    essentials: '/health-supplements',
    toys: '/toys',
    housing: '/houses',
    accessories: '/accessories',
  };
  return map[categoryKey] || '/food';
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productsAccordionOpen, setProductsAccordionOpen] = useState(false);

  // Product states
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Add/Edit product
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addCategory, setAddCategory] = useState('food');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // ─── Food form ───
  const emptyFoodForm = {
    productName: '', brand: '', category: 'Dog', subCategory: 'Dry Food',
    prices: [{ capacity: '', mrp: '', discountedPrice: '' }],
    details: [''], keyFeatures: [''], flavours: [''], nutrients: [''], healthBenefits: [''],
    images: [''], expiryDate: ''
  };
  // ─── Clothes form ───
  const emptyClothesForm = {
    productName: '', brand: '', category: 'Dog', subCategory: 'Clothing',
    sizes: [{ size: 'M', mrp: '', discountedPrice: '', availableStock: '' }],
    material: '', color: [''], productDetails: [''], keyFeatures: [''],
    images: [''], careInstructions: ['']
  };
  // ─── Toy form ───
  const emptyToyForm = {
    productName: '', brand: '', category: 'Toy', subCategory: 'Dog',
    price: '', discountedPrice: '', discountPercentage: '', size: 'One Size', availableStock: '',
    material: '', color: [''], productDetails: [''], keyFeatures: [''],
    images: [''], suitableFor: 'All'
  };
  // ─── Housing form ───
  const emptyHouseForm = {
    category: 'house', subCategory: 'dog', name: '', price: '', discountPrice: '', discountPercentage: '',
    highlights: [''], description: '',
    dimensions: { height: '', width: '', depth: '', weight: '' },
    availableStock: '', image: ''
  };
  // ─── Accessories form ───
  const emptyAccessoryForm = {
    category: 'accessories', subCategory: 'dog', productName: '', brand: '',
    sizes: [{ size: 'One Size', mrp: '', discountedPrice: '', availableStock: '' }],
    material: '', color: [''], productDetails: [''], keyFeatures: [''], images: ['']
  };
  // ─── Grooming form ───
  const emptyGroomingForm = {
    category: 'grooming-essentials', subCategory: 'dog', productName: '', brand: '',
    variants: [{ volume: '', mrp: '', discountedPrice: '', discountPercentage: '', availableStock: '' }],
    description: '', keyFeatures: [''], suitableFor: 'Both', usageInstructions: [''], images: ['']
  };
  // ─── Health Supplements form ───
  const emptyEssentialForm = {
    category: 'health-supplement', subCategory: 'dog', name: '', price: '', discountPrice: '', discountPercentage: '',
    highlights: [''], description: '', usage: { dosage: '', ageGroup: '' },
    expiryDate: '', availableStock: '', image: ''
  };

  const getEmptyForm = (cat) => {
    switch (cat) {
      case 'food': return { ...emptyFoodForm };
      case 'clothes': return { ...emptyClothesForm };
      case 'toys': return { ...emptyToyForm };
      case 'housing': return { ...emptyHouseForm };
      case 'accessories': return { ...emptyAccessoryForm };
      case 'grooming': return { ...emptyGroomingForm };
      case 'essentials': return { ...emptyEssentialForm };
      default: return {};
    }
  };

  const [productForm, setProductForm] = useState(getEmptyForm('food'));

  const [stats] = useState({ totalUsers: 0, totalOrders: 0, totalProducts: 0, totalRevenue: 0 });

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    const adminToken = localStorage.getItem('adminToken');
    if (!adminData || !adminToken) { navigate('/admin/signin'); return; }
    setAdmin(JSON.parse(adminData));
  }, [navigate]);

  // Fetch products when category changes
  useEffect(() => {
    if (activeTab === 'myProducts') fetchProducts(selectedCategory);
  }, [activeTab, selectedCategory]);

  const fetchProducts = async (catKey) => {
    setProductsLoading(true);
    const catConfig = PRODUCT_CATEGORIES.find(c => c.key === catKey);
    try {
      const res = await fetch(`${API_BASE}${catConfig.endpoint}`);
      const data = await res.json();
      if (data.success) {
        setProducts((data.data || []).map(p => normalizeProduct(p, catKey)));
      } else {
        setProducts([]);
      }
    } catch { setProducts([]); }
    finally { setProductsLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/signin');
  };

  // ─── Form helpers ───
  const handleFormChange = (field, value) => setProductForm(prev => ({ ...prev, [field]: value }));
  const handleNestedChange = (parent, field, value) => setProductForm(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));

  const handleArrayChange = (field, index, value) => {
    setProductForm(prev => { const arr = [...prev[field]]; arr[index] = value; return { ...prev, [field]: arr }; });
  };
  const addArrayItem = (field, defaultVal = '') => setProductForm(prev => ({ ...prev, [field]: [...prev[field], defaultVal] }));
  const removeArrayItem = (field, index) => {
    setProductForm(prev => { const arr = prev[field].filter((_, i) => i !== index); return { ...prev, [field]: arr.length ? arr : [typeof prev[field][0] === 'object' ? {} : ''] }; });
  };

  const handleSizeChange = (field, index, key, value) => {
    setProductForm(prev => { const arr = [...prev[field]]; arr[index] = { ...arr[index], [key]: value }; return { ...prev, [field]: arr }; });
  };
  const addSizeRow = (field, defaultObj) => setProductForm(prev => ({ ...prev, [field]: [...prev[field], { ...defaultObj }] }));
  const removeSizeRow = (field, index) => {
    setProductForm(prev => { const arr = prev[field].filter((_, i) => i !== index); return { ...prev, [field]: arr.length ? arr : [prev[field][0]] }; });
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setProductForm(getEmptyForm(addCategory));
    setFormError(''); setFormSuccess('');
    setShowAddForm(true);
  };

  const openEditForm = (product, catKey) => {
    setAddCategory(catKey);
    setEditingProduct(product);
    // Build form from raw product data based on category
    switch (catKey) {
      case 'food':
        setProductForm({
          productName: product.productName || '', brand: product.brand || '',
          category: product.category || 'Dog', subCategory: product.subCategory || 'Dry Food',
          prices: product.prices?.length ? product.prices.map(p => ({ capacity: p.capacity, mrp: p.mrp, discountedPrice: p.discountedPrice })) : [{ capacity: '', mrp: '', discountedPrice: '' }],
          details: product.details?.length ? [...product.details] : [''],
          keyFeatures: product.keyFeatures?.length ? [...product.keyFeatures] : [''],
          flavours: product.flavours?.length ? [...product.flavours] : [''],
          nutrients: product.nutrients?.length ? [...product.nutrients] : [''],
          healthBenefits: product.healthBenefits?.length ? [...product.healthBenefits] : [''],
          images: product.images?.length ? [...product.images] : [''],
          expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
        }); break;
      case 'clothes':
        setProductForm({
          productName: product.productName || '', brand: product.brand || '',
          category: product.category || 'Dog', subCategory: product.subCategory || 'Clothing',
          sizes: product.sizes?.length ? product.sizes.map(s => ({ size: s.size, mrp: s.mrp, discountedPrice: s.discountedPrice, availableStock: s.availableStock })) : [{ size: 'M', mrp: '', discountedPrice: '', availableStock: '' }],
          material: product.material || '', color: product.color?.length ? [...product.color] : [''],
          productDetails: product.productDetails?.length ? [...product.productDetails] : [''],
          keyFeatures: product.keyFeatures?.length ? [...product.keyFeatures] : [''],
          images: product.images?.length ? [...product.images] : [''],
          careInstructions: product.careInstructions?.length ? [...product.careInstructions] : ['']
        }); break;
      case 'toys':
        setProductForm({
          productName: product.productName || '', brand: product.brand || '',
          category: 'Toy', subCategory: product.subCategory || 'Dog',
          price: product.price || '', discountedPrice: product.discountedPrice || '',
          discountPercentage: product.discountPercentage || '', size: product.size || 'One Size',
          availableStock: product.availableStock || '', material: product.material || '',
          color: product.color?.length ? [...product.color] : [''],
          productDetails: product.productDetails?.length ? [...product.productDetails] : [''],
          keyFeatures: product.keyFeatures?.length ? [...product.keyFeatures] : [''],
          images: product.images?.length ? [...product.images] : [''],
          suitableFor: product.suitableFor || 'All'
        }); break;
      case 'housing':
        setProductForm({
          category: 'house', subCategory: product.subCategory || 'dog',
          name: product.name || '', price: product.price || '', discountPrice: product.discountPrice || '',
          discountPercentage: product.discountPercentage || '',
          highlights: product.highlights?.length ? [...product.highlights] : [''],
          description: product.description || '',
          dimensions: product.dimensions ? { ...product.dimensions } : { height: '', width: '', depth: '', weight: '' },
          availableStock: product.availableStock || '', image: product.image || ''
        }); break;
      case 'accessories':
        setProductForm({
          category: 'accessories', subCategory: product.subCategory || 'dog',
          productName: product.productName || '', brand: product.brand || '',
          sizes: product.sizes?.length ? product.sizes.map(s => ({ size: s.size, mrp: s.mrp, discountedPrice: s.discountedPrice, availableStock: s.availableStock })) : [{ size: 'One Size', mrp: '', discountedPrice: '', availableStock: '' }],
          material: product.material || '', color: product.color?.length ? [...product.color] : [''],
          productDetails: product.productDetails?.length ? [...product.productDetails] : [''],
          keyFeatures: product.keyFeatures?.length ? [...product.keyFeatures] : [''],
          images: product.images?.length ? [...product.images] : ['']
        }); break;
      case 'grooming':
        setProductForm({
          category: 'grooming-essentials', subCategory: product.subCategory || 'dog',
          productName: product.productName || '', brand: product.brand || '',
          variants: product.variants?.length ? product.variants.map(v => ({ volume: v.volume, mrp: v.mrp, discountedPrice: v.discountedPrice, discountPercentage: v.discountPercentage || '', availableStock: v.availableStock })) : [{ volume: '', mrp: '', discountedPrice: '', discountPercentage: '', availableStock: '' }],
          description: product.description || '',
          keyFeatures: product.keyFeatures?.length ? [...product.keyFeatures] : [''],
          suitableFor: product.suitableFor || 'Both',
          usageInstructions: product.usageInstructions?.length ? [...product.usageInstructions] : [''],
          images: product.images?.length ? [...product.images] : ['']
        }); break;
      case 'essentials':
        setProductForm({
          category: 'health-supplement', subCategory: product.subCategory || 'dog',
          name: product.name || '', price: product.price || '', discountPrice: product.discountPrice || '',
          discountPercentage: product.discountPercentage || '',
          highlights: product.highlights?.length ? [...product.highlights] : [''],
          description: product.description || '',
          usage: product.usage ? { ...product.usage } : { dosage: '', ageGroup: '' },
          expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
          availableStock: product.availableStock || '', image: product.image || ''
        }); break;
      default: break;
    }
    setFormError(''); setFormSuccess('');
    setShowAddForm(true);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    const apiPath = getCategoryApiPath(addCategory);
    const token = localStorage.getItem('adminToken');

    // Clean arrays
    const cleanArr = (arr) => (arr || []).filter(v => typeof v === 'string' ? v.trim() : true);

    let payload = { ...productForm };
    // Clean array fields
    ['details', 'keyFeatures', 'flavours', 'nutrients', 'healthBenefits', 'images',
     'color', 'productDetails', 'careInstructions', 'highlights', 'usageInstructions'].forEach(f => {
      if (payload[f]) payload[f] = cleanArr(payload[f]);
    });
    // Clean price/size arrays
    if (payload.prices) payload.prices = payload.prices.filter(p => p.capacity).map(p => ({ capacity: p.capacity, mrp: Number(p.mrp), discountedPrice: Number(p.discountedPrice) }));
    if (payload.sizes) payload.sizes = payload.sizes.filter(s => s.size).map(s => ({ ...s, mrp: Number(s.mrp), discountedPrice: Number(s.discountedPrice), availableStock: Number(s.availableStock) }));
    if (payload.variants) payload.variants = payload.variants.filter(v => v.volume).map(v => ({ ...v, mrp: Number(v.mrp), discountedPrice: Number(v.discountedPrice), discountPercentage: Number(v.discountPercentage || 0), availableStock: Number(v.availableStock) }));
    // Convert numeric fields
    ['price', 'discountedPrice', 'discountPrice', 'discountPercentage', 'availableStock'].forEach(f => {
      if (payload[f] !== undefined && payload[f] !== '') payload[f] = Number(payload[f]);
    });
    if (payload.expiryDate) payload.expiryDate = new Date(payload.expiryDate);

    try {
      let res;
      if (editingProduct) {
        res = await fetch(`${API_BASE}${apiPath}/${editingProduct._id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}${apiPath}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }
      const data = await res.json();
      if (data.success) {
        setFormSuccess(editingProduct ? 'Product updated!' : 'Product added!');
        setTimeout(() => {
          setShowAddForm(false); setEditingProduct(null);
          setSelectedCategory(addCategory);
          setActiveTab('myProducts');
          fetchProducts(addCategory);
        }, 800);
      } else {
        setFormError(data.message || 'Something went wrong');
      }
    } catch { setFormError('Network error. Please try again.'); }
  };

  const handleDeleteProduct = async (product) => {
    const apiPath = getCategoryApiPath(selectedCategory);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE}${apiPath}/${product._id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== product._id));
        setDeleteConfirm(null);
      }
    } catch { console.error('Delete failed'); }
  };

  // ──────────────────────────────────────
  // SIDEBAR MENU
  // ──────────────────────────────────────
  const sidebarMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'products-accordion', label: 'Products', icon: <ProductIcon />, isAccordion: true },
    { id: 'categories', label: 'Categories', icon: <CategoryIcon /> },
    { id: 'orders', label: 'Orders', icon: <OrderIcon /> },
    { id: 'users', label: 'Users', icon: <UserIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  // ──────────────────────────────────────
  // FORM RENDERING PER CATEGORY
  // ──────────────────────────────────────
  const renderCategoryForm = () => {
    switch (addCategory) {
      case 'food': return <FoodForm form={productForm} onChange={handleFormChange} onArrayChange={handleArrayChange} addItem={addArrayItem} removeItem={removeArrayItem} onSizeChange={handleSizeChange} addSizeRow={addSizeRow} removeSizeRow={removeSizeRow} />;
      case 'clothes': return <ClothesForm form={productForm} onChange={handleFormChange} onArrayChange={handleArrayChange} addItem={addArrayItem} removeItem={removeArrayItem} onSizeChange={handleSizeChange} addSizeRow={addSizeRow} removeSizeRow={removeSizeRow} />;
      case 'toys': return <ToyForm form={productForm} onChange={handleFormChange} onArrayChange={handleArrayChange} addItem={addArrayItem} removeItem={removeArrayItem} />;
      case 'housing': return <HouseForm form={productForm} onChange={handleFormChange} onNestedChange={handleNestedChange} onArrayChange={handleArrayChange} addItem={addArrayItem} removeItem={removeArrayItem} />;
      case 'accessories': return <AccessoryForm form={productForm} onChange={handleFormChange} onArrayChange={handleArrayChange} addItem={addArrayItem} removeItem={removeArrayItem} onSizeChange={handleSizeChange} addSizeRow={addSizeRow} removeSizeRow={removeSizeRow} />;
      case 'grooming': return <GroomingForm form={productForm} onChange={handleFormChange} onArrayChange={handleArrayChange} addItem={addArrayItem} removeItem={removeArrayItem} onSizeChange={handleSizeChange} addSizeRow={addSizeRow} removeSizeRow={removeSizeRow} />;
      case 'essentials': return <EssentialForm form={productForm} onChange={handleFormChange} onNestedChange={handleNestedChange} onArrayChange={handleArrayChange} addItem={addArrayItem} removeItem={removeArrayItem} />;
      default: return null;
    }
  };

  // ──────────────────────────────────────
  // PRODUCT FORM MODAL
  // ──────────────────────────────────────
  const renderProductFormModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={() => { setShowAddForm(false); setEditingProduct(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmitProduct} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {formError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-200">{formError}</div>}
          {formSuccess && <div className="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl text-sm font-medium border border-blue-200">{formSuccess}</div>}

          {/* Category selector (only when adding new) */}
          {!editingProduct && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Type *</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {PRODUCT_CATEGORIES.map(cat => (
                  <button key={cat.key} type="button"
                    onClick={() => { setAddCategory(cat.key); setProductForm(getEmptyForm(cat.key)); }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${addCategory === cat.key ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                    <span className="text-base block mb-0.5">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {renderCategoryForm()}
        </form>

        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button type="button" onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmitProduct}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors shadow-lg">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────
  // DELETE CONFIRM MODAL
  // ──────────────────────────────────────
  const renderDeleteConfirm = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
        <p className="text-sm text-gray-500 mb-6">This will permanently delete <span className="font-semibold text-gray-700">"{deleteConfirm?._name}"</span>.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => handleDeleteProduct(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────
  // MAIN CONTENT
  // ──────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="bg-blue-50 border-blue-200" textColor="text-blue-600" />
              <StatCard title="Total Orders" value={stats.totalOrders} icon="📦" color="bg-blue-50 border-blue-200" textColor="text-blue-600" />
              <StatCard title="Total Products" value={stats.totalProducts} icon="🛍️" color="bg-purple-50 border-purple-200" textColor="text-purple-600" />
              <StatCard title="Revenue" value={`₹${stats.totalRevenue}`} icon="💰" color="bg-amber-50 border-amber-200" textColor="text-amber-600" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="text-center py-12 text-gray-400">
                <span className="text-5xl mb-4 block">📊</span>
                <p className="text-lg font-medium">No recent activity</p>
                <p className="text-sm mt-1">Activity will appear here as your store grows</p>
              </div>
            </div>
          </div>
        );

      case 'myProducts':
        return <AdminMyProducts />;

      case 'addProduct':
        return null; // handled by modal

      case 'categories':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <span className="text-5xl mb-4 block">📂</span>
              <p className="text-gray-500 text-lg font-medium">No categories yet</p>
              <p className="text-gray-400 text-sm mt-1">Organize your products into categories</p>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <span className="text-5xl mb-4 block">📦</span>
              <p className="text-gray-500 text-lg font-medium">No orders yet</p>
              <p className="text-gray-400 text-sm mt-1">Orders will appear here when customers place them</p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Users</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <span className="text-5xl mb-4 block">👥</span>
              <p className="text-gray-500 text-lg font-medium">User management</p>
              <p className="text-gray-400 text-sm mt-1">View and manage registered users</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Admin Profile</h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-xs text-gray-500 uppercase font-bold">Email</label>
                <p className="text-gray-900 font-semibold">{admin?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (!admin) return null;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {showAddForm && renderProductFormModal()}
      {deleteConfirm && renderDeleteConfirm()}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ─── SIDEBAR ─── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 flex flex-col h-screen lg:h-full shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center font-bold text-lg">🐾</div>
            <div><h1 className="font-bold text-sm">FairyTails</h1><p className="text-xs text-slate-400">Admin Panel</p></div>
          </div>
        </div>

        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-300 font-bold text-sm">{admin.email?.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{admin.email}</p></div>
          </div>
        </div>

        <nav className="p-3 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {sidebarMenuItems.map((item) => {
              if (item.isAccordion) {
                return (
                  <div key={item.id}>
                    <button onClick={() => setProductsAccordionOpen(!productsAccordionOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        (activeTab === 'myProducts' || activeTab === 'addProduct')
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}>
                      <div className="flex items-center gap-3">{item.icon}{item.label}</div>
                      <svg className={`w-4 h-4 transition-transform ${productsAccordionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {productsAccordionOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        <button onClick={() => { setActiveTab('myProducts'); setSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'myProducts' ? 'bg-purple-500/10 text-purple-300' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                          My Products
                        </button>
                        <button onClick={() => { setAddCategory('food'); setProductForm(getEmptyForm('food')); setEditingProduct(null); setFormError(''); setFormSuccess(''); setShowAddForm(true); setSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-500 hover:bg-slate-800 hover:text-white`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Add Product
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  {item.icon}{item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-700/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogoutIcon /> Log Out
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900 capitalize">{activeTab === 'myProducts' ? 'My Products' : activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:inline">Welcome, <span className="font-semibold text-gray-700">Admin</span></span>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">{admin.email?.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main className={`flex-1 min-h-0 p-4 sm:p-6 ${activeTab === 'myProducts' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>{renderContent()}</main>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn .3s ease-out; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </div>
  );
};

// ════════════════════════════════════════
// CATEGORY-SPECIFIC FORM COMPONENTS
// ════════════════════════════════════════

const InputField = ({ label, required, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}{required && ' *'}</label>
    <input {...props} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
  </div>
);

const SelectField = ({ label, required, options, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}{required && ' *'}</label>
    <select {...props} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-white">
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  </div>
);

const ArrayField = ({ label, field, values, onChange, onAdd, onRemove, placeholder }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <button type="button" onClick={() => onAdd(field)} className="text-xs font-semibold text-purple-600 hover:text-purple-700">+ Add</button>
    </div>
    <div className="space-y-2">
      {values.map((val, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input type="text" value={val} onChange={(e) => onChange(field, i, e.target.value)} placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
          {values.length > 1 && <button type="button" onClick={() => onRemove(field, i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><XIcon /></button>}
        </div>
      ))}
    </div>
  </div>
);

// ─── FOOD FORM ───
const FoodForm = ({ form, onChange, onArrayChange, addItem, removeItem, onSizeChange, addSizeRow, removeSizeRow }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Product Name" required type="text" value={form.productName} onChange={e => onChange('productName', e.target.value)} placeholder="e.g. Royal Canin Dog Food" />
      <InputField label="Brand" required type="text" value={form.brand} onChange={e => onChange('brand', e.target.value)} placeholder="e.g. Royal Canin" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="Category" required value={form.category} onChange={e => onChange('category', e.target.value)} options={['Dog', 'Cat', 'Bird', 'Fish', 'Other']} />
      <SelectField label="Sub Category" required value={form.subCategory} onChange={e => onChange('subCategory', e.target.value)} options={['Dry Food', 'Wet Food', 'Treats']} />
    </div>
    <InputField label="Expiry Date" required type="date" value={form.expiryDate} onChange={e => onChange('expiryDate', e.target.value)} />
    {/* Prices */}
    <div>
      <div className="flex items-center justify-between mb-2"><label className="text-sm font-semibold text-gray-700">Prices *</label><button type="button" onClick={() => addSizeRow('prices', { capacity: '', mrp: '', discountedPrice: '' })} className="text-xs font-semibold text-purple-600">+ Add Price</button></div>
      {form.prices.map((p, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <input type="text" placeholder="Capacity" value={p.capacity} onChange={e => onSizeChange('prices', i, 'capacity', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          <input type="number" placeholder="MRP" value={p.mrp} onChange={e => onSizeChange('prices', i, 'mrp', e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          <input type="number" placeholder="Sale Price" value={p.discountedPrice} onChange={e => onSizeChange('prices', i, 'discountedPrice', e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          {form.prices.length > 1 && <button type="button" onClick={() => removeSizeRow('prices', i)} className="p-1 text-red-400 hover:text-red-600"><XIcon /></button>}
        </div>
      ))}
    </div>
    <ArrayField label="Image URLs *" field="images" values={form.images} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="https://..." />
    <ArrayField label="Flavours" field="flavours" values={form.flavours} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="e.g. Chicken" />
    <ArrayField label="Details" field="details" values={form.details} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Detail..." />
    <ArrayField label="Key Features" field="keyFeatures" values={form.keyFeatures} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Feature..." />
    <ArrayField label="Nutrients" field="nutrients" values={form.nutrients} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="e.g. Protein 26%" />
    <ArrayField label="Health Benefits" field="healthBenefits" values={form.healthBenefits} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="e.g. Strong bones" />
  </div>
);

// ─── CLOTHES FORM ───
const ClothesForm = ({ form, onChange, onArrayChange, addItem, removeItem, onSizeChange, addSizeRow, removeSizeRow }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Product Name" required type="text" value={form.productName} onChange={e => onChange('productName', e.target.value)} />
      <InputField label="Brand" required type="text" value={form.brand} onChange={e => onChange('brand', e.target.value)} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="Category" required value={form.category} onChange={e => onChange('category', e.target.value)} options={['Dog', 'Cat']} />
      <SelectField label="Sub Category" required value={form.subCategory} onChange={e => onChange('subCategory', e.target.value)} options={['Clothing', 'Dresses', 'Winter Wear', 'Rain Wear']} />
    </div>
    <InputField label="Material" type="text" value={form.material} onChange={e => onChange('material', e.target.value)} placeholder="e.g. Cotton" />
    <div>
      <div className="flex items-center justify-between mb-2"><label className="text-sm font-semibold text-gray-700">Sizes *</label><button type="button" onClick={() => addSizeRow('sizes', { size: 'M', mrp: '', discountedPrice: '', availableStock: '' })} className="text-xs font-semibold text-purple-600">+ Add Size</button></div>
      {form.sizes.map((s, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <select value={s.size} onChange={e => onSizeChange('sizes', i, 'size', e.target.value)} className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white"><option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option></select>
          <input type="number" placeholder="MRP" value={s.mrp} onChange={e => onSizeChange('sizes', i, 'mrp', e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
          <input type="number" placeholder="Sale" value={s.discountedPrice} onChange={e => onSizeChange('sizes', i, 'discountedPrice', e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
          <input type="number" placeholder="Stock" value={s.availableStock} onChange={e => onSizeChange('sizes', i, 'availableStock', e.target.value)} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
          {form.sizes.length > 1 && <button type="button" onClick={() => removeSizeRow('sizes', i)} className="p-1 text-red-400"><XIcon /></button>}
        </div>
      ))}
    </div>
    <ArrayField label="Colors" field="color" values={form.color} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="e.g. Red" />
    <ArrayField label="Image URLs *" field="images" values={form.images} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="https://..." />
    <ArrayField label="Product Details" field="productDetails" values={form.productDetails} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Detail..." />
    <ArrayField label="Key Features" field="keyFeatures" values={form.keyFeatures} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Feature..." />
    <ArrayField label="Care Instructions" field="careInstructions" values={form.careInstructions} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Instruction..." />
  </div>
);

// ─── TOY FORM ───
const ToyForm = ({ form, onChange, onArrayChange, addItem, removeItem }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Product Name" required type="text" value={form.productName} onChange={e => onChange('productName', e.target.value)} />
      <InputField label="Brand" required type="text" value={form.brand} onChange={e => onChange('brand', e.target.value)} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="For" required value={form.subCategory} onChange={e => onChange('subCategory', e.target.value)} options={['Dog', 'Cat']} />
      <SelectField label="Suitable For" value={form.suitableFor} onChange={e => onChange('suitableFor', e.target.value)} options={['Puppy', 'Adult', 'All']} />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <InputField label="Price" required type="number" value={form.price} onChange={e => onChange('price', e.target.value)} />
      <InputField label="Discounted Price" type="number" value={form.discountedPrice} onChange={e => onChange('discountedPrice', e.target.value)} />
      <InputField label="Stock" required type="number" value={form.availableStock} onChange={e => onChange('availableStock', e.target.value)} />
    </div>
    <InputField label="Material" type="text" value={form.material} onChange={e => onChange('material', e.target.value)} />
    <ArrayField label="Colors" field="color" values={form.color} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="e.g. Blue" />
    <ArrayField label="Image URLs *" field="images" values={form.images} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="https://..." />
    <ArrayField label="Product Details" field="productDetails" values={form.productDetails} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Detail..." />
    <ArrayField label="Key Features" field="keyFeatures" values={form.keyFeatures} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Feature..." />
  </div>
);

// ─── HOUSE FORM ───
const HouseForm = ({ form, onChange, onNestedChange, onArrayChange, addItem, removeItem }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Name" required type="text" value={form.name} onChange={e => onChange('name', e.target.value)} />
      <SelectField label="For" required value={form.subCategory} onChange={e => onChange('subCategory', e.target.value)} options={['dog', 'cat']} />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <InputField label="Price" required type="number" value={form.price} onChange={e => onChange('price', e.target.value)} />
      <InputField label="Discount Price" required type="number" value={form.discountPrice} onChange={e => onChange('discountPrice', e.target.value)} />
      <InputField label="Stock" required type="number" value={form.availableStock} onChange={e => onChange('availableStock', e.target.value)} />
    </div>
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-2 block">Dimensions</label>
      <div className="grid grid-cols-4 gap-2">
        <input type="text" placeholder="Height" value={form.dimensions.height} onChange={e => onNestedChange('dimensions', 'height', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
        <input type="text" placeholder="Width" value={form.dimensions.width} onChange={e => onNestedChange('dimensions', 'width', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
        <input type="text" placeholder="Depth" value={form.dimensions.depth} onChange={e => onNestedChange('dimensions', 'depth', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
        <input type="text" placeholder="Weight" value={form.dimensions.weight} onChange={e => onNestedChange('dimensions', 'weight', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
      </div>
    </div>
    <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
      <textarea value={form.description} onChange={e => onChange('description', e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" /></div>
    <InputField label="Image URL *" type="text" value={form.image} onChange={e => onChange('image', e.target.value)} placeholder="https://..." />
    <ArrayField label="Highlights" field="highlights" values={form.highlights} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Highlight..." />
  </div>
);

// ─── ACCESSORY FORM ───
const AccessoryForm = ({ form, onChange, onArrayChange, addItem, removeItem, onSizeChange, addSizeRow, removeSizeRow }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Product Name" required type="text" value={form.productName} onChange={e => onChange('productName', e.target.value)} />
      <InputField label="Brand" required type="text" value={form.brand} onChange={e => onChange('brand', e.target.value)} />
    </div>
    <SelectField label="For" required value={form.subCategory} onChange={e => onChange('subCategory', e.target.value)} options={['dog', 'cat']} />
    <InputField label="Material" type="text" value={form.material} onChange={e => onChange('material', e.target.value)} />
    <div>
      <div className="flex items-center justify-between mb-2"><label className="text-sm font-semibold text-gray-700">Sizes *</label><button type="button" onClick={() => addSizeRow('sizes', { size: 'One Size', mrp: '', discountedPrice: '', availableStock: '' })} className="text-xs font-semibold text-purple-600">+ Add Size</button></div>
      {form.sizes.map((s, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <select value={s.size} onChange={e => onSizeChange('sizes', i, 'size', e.target.value)} className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white"><option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>One Size</option></select>
          <input type="number" placeholder="MRP" value={s.mrp} onChange={e => onSizeChange('sizes', i, 'mrp', e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
          <input type="number" placeholder="Sale" value={s.discountedPrice} onChange={e => onSizeChange('sizes', i, 'discountedPrice', e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
          <input type="number" placeholder="Stock" value={s.availableStock} onChange={e => onSizeChange('sizes', i, 'availableStock', e.target.value)} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
          {form.sizes.length > 1 && <button type="button" onClick={() => removeSizeRow('sizes', i)} className="p-1 text-red-400"><XIcon /></button>}
        </div>
      ))}
    </div>
    <ArrayField label="Colors" field="color" values={form.color} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="e.g. Black" />
    <ArrayField label="Image URLs *" field="images" values={form.images} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="https://..." />
    <ArrayField label="Product Details" field="productDetails" values={form.productDetails} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Detail..." />
    <ArrayField label="Key Features" field="keyFeatures" values={form.keyFeatures} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Feature..." />
  </div>
);

// ─── GROOMING FORM ───
const GroomingForm = ({ form, onChange, onArrayChange, addItem, removeItem, onSizeChange, addSizeRow, removeSizeRow }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Product Name" required type="text" value={form.productName} onChange={e => onChange('productName', e.target.value)} />
      <InputField label="Brand" required type="text" value={form.brand} onChange={e => onChange('brand', e.target.value)} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="For" required value={form.subCategory} onChange={e => onChange('subCategory', e.target.value)} options={['dog', 'cat']} />
      <SelectField label="Suitable For" value={form.suitableFor} onChange={e => onChange('suitableFor', e.target.value)} options={['Dogs', 'Cats', 'Both']} />
    </div>
    <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
      <textarea value={form.description} onChange={e => onChange('description', e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" /></div>
    <div>
      <div className="flex items-center justify-between mb-2"><label className="text-sm font-semibold text-gray-700">Variants *</label><button type="button" onClick={() => addSizeRow('variants', { volume: '', mrp: '', discountedPrice: '', discountPercentage: '', availableStock: '' })} className="text-xs font-semibold text-purple-600">+ Add Variant</button></div>
      {form.variants.map((v, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center flex-wrap">
          <input type="text" placeholder="Volume" value={v.volume} onChange={e => onSizeChange('variants', i, 'volume', e.target.value)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
          <input type="number" placeholder="MRP" value={v.mrp} onChange={e => onSizeChange('variants', i, 'mrp', e.target.value)} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
          <input type="number" placeholder="Sale" value={v.discountedPrice} onChange={e => onSizeChange('variants', i, 'discountedPrice', e.target.value)} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
          <input type="number" placeholder="Stock" value={v.availableStock} onChange={e => onSizeChange('variants', i, 'availableStock', e.target.value)} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
          {form.variants.length > 1 && <button type="button" onClick={() => removeSizeRow('variants', i)} className="p-1 text-red-400"><XIcon /></button>}
        </div>
      ))}
    </div>
    <ArrayField label="Image URLs *" field="images" values={form.images} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="https://..." />
    <ArrayField label="Key Features" field="keyFeatures" values={form.keyFeatures} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Feature..." />
    <ArrayField label="Usage Instructions" field="usageInstructions" values={form.usageInstructions} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Instruction..." />
  </div>
);

// ─── HEALTH ESSENTIALS FORM ───
const EssentialForm = ({ form, onChange, onNestedChange, onArrayChange, addItem, removeItem }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Name" required type="text" value={form.name} onChange={e => onChange('name', e.target.value)} />
      <SelectField label="For" required value={form.subCategory} onChange={e => onChange('subCategory', e.target.value)} options={['dog', 'cat']} />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <InputField label="Price" required type="number" value={form.price} onChange={e => onChange('price', e.target.value)} />
      <InputField label="Discount Price" required type="number" value={form.discountPrice} onChange={e => onChange('discountPrice', e.target.value)} />
      <InputField label="Stock" required type="number" value={form.availableStock} onChange={e => onChange('availableStock', e.target.value)} />
    </div>
    <InputField label="Expiry Date" required type="date" value={form.expiryDate} onChange={e => onChange('expiryDate', e.target.value)} />
    <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
      <textarea value={form.description} onChange={e => onChange('description', e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" /></div>
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-2 block">Usage</label>
      <div className="grid grid-cols-2 gap-2">
        <input type="text" placeholder="Dosage" value={form.usage.dosage} onChange={e => onNestedChange('usage', 'dosage', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
        <input type="text" placeholder="Age Group" value={form.usage.ageGroup} onChange={e => onNestedChange('usage', 'ageGroup', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
      </div>
    </div>
    <InputField label="Image URL *" type="text" value={form.image} onChange={e => onChange('image', e.target.value)} placeholder="https://..." />
    <ArrayField label="Highlights" field="highlights" values={form.highlights} onChange={onArrayChange} onAdd={addItem} onRemove={removeItem} placeholder="Highlight..." />
  </div>
);

// ════════════════════════════════════════
// SMALL COMPONENTS & ICONS
// ════════════════════════════════════════

const StatCard = ({ title, value, icon, color, textColor }) => (
  <div className={`${color} border rounded-2xl p-5`}>
    <div className="flex items-center justify-between mb-3"><span className="text-3xl">{icon}</span><span className={`text-2xl font-bold ${textColor}`}>{value}</span></div>
    <p className="text-gray-600 text-sm font-medium">{title}</p>
  </div>
);

const XIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const DeleteIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ProductIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const CategoryIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const OrderIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

export default AdminPanel;
