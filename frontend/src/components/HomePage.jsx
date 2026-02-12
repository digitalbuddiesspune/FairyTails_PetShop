import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from './HeroBanner';

// Color mapping for category circle backgrounds
const categoryColors = {
  'dogs': 'bg-amber-100',
  'cats': 'bg-purple-100',
  'toys': 'bg-blue-100',
  'accessories': 'bg-rose-100',
  'grooming-and-essential': 'bg-cyan-100',
  'health-and-supplement': 'bg-green-100',
  'beds-and-house': 'bg-pink-100',
};

const API = import.meta.env.VITE_BACKEND_API;

// Category endpoints with their product type identifier
const FEATURED_SOURCES = [
  { endpoint: '/food', type: 'Food' },
  { endpoint: '/clothes', type: 'Clothes' },
  { endpoint: '/toys', type: 'Toy' },
  { endpoint: '/accessories', type: 'Accessory' },
  { endpoint: '/grooming-essentials', type: 'GroomingEssential' },
  { endpoint: '/health-supplements', type: 'HealthSupplement' },
  { endpoint: '/houses', type: 'House' },
];

// Extract a displayable price from any product shape
const extractPrice = (p) => {
  // Food has prices[], Clothes has sizes[], Toys has variants[], Accessories has variants[]
  const options = p.prices || p.sizes || p.variants || [];
  if (options.length > 0) {
    const best = options.reduce(
      (min, o) => ((o.discountedPrice ?? o.price) < (min.discountedPrice ?? min.price) ? o : min),
      options[0],
    );
    return { price: best.discountedPrice ?? best.price, mrp: best.mrp ?? best.price };
  }
  // Flat-price models (HealthSupplement, House, Grooming)
  const disc = p.discountedPrice ?? p.discountPrice ?? p.price;
  const mrp = p.mrp ?? p.price;
  return { price: disc, mrp };
};

const extractImage = (p) => {
  if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
  if (typeof p.images === 'string') return p.images;
  if (typeof p.image === 'string') return p.image;
  return null;
};

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Fetch categories from backend API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch featured products from multiple categories
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const results = await Promise.allSettled(
          FEATURED_SOURCES.map(async ({ endpoint, type }) => {
            const res = await fetch(`${API}${endpoint}?limit=3`);
            const data = await res.json();
            const items = data.success ? (data.data || data.products || []) : [];
            return items.map((p) => ({ ...p, _type: type }));
          }),
        );
        const all = results
          .filter((r) => r.status === 'fulfilled')
          .flatMap((r) => r.value);

        // Shuffle and pick up to 8 diverse products
        const shuffled = all.sort(() => Math.random() - 0.5);
        // Try to pick at most 1-2 per category for diversity
        const picked = [];
        const typeCounts = {};
        for (const p of shuffled) {
          const count = typeCounts[p._type] || 0;
          if (count < 2 && picked.length < 8) {
            picked.push(p);
            typeCounts[p._type] = count + 1;
          }
        }
        // Fill remaining slots if we have fewer than 8
        if (picked.length < 8) {
          for (const p of shuffled) {
            if (!picked.includes(p) && picked.length < 8) picked.push(p);
          }
        }
        setFeaturedProducts(picked);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const services = [
    { title: 'Free Delivery', description: 'On orders above ₹499', icon: '🚚' },
    { title: 'Vet Consultation', description: 'Expert advice 24/7', icon: '👨‍⚕️' },
    { title: 'Easy Returns', description: '7-day return policy', icon: '↩️' },
    { title: 'Secure Payment', description: '100% secure checkout', icon: '🔒' },
  ];

  const categorySections = [
    {
      id: 'dogs',
      name: 'Dogs',
      title: 'Everything for Your Best Friend',
      description: 'From premium dog food to toys and accessories, find everything your canine companion needs. We carry top brands and vet-recommended products to keep your dog healthy, happy, and well-groomed.',
      features: ['Premium dog food & treats', 'Durable chew & fetch toys', 'Comfortable collars & leashes', 'Grooming essentials'],
      color: 'bg-amber-50',
      accentColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445933/Untitled_design_9_jtfiba.svg',
      ]
    },
    {
      id: 'cats',
      name: 'Cats',
      title: 'Purr-fect Products for Your Feline',
      description: 'Explore our curated collection of cat essentials. From nutritious meals and interactive toys to cozy beds and scratching posts, we have everything to keep your cat content and entertained.',
      features: ['Nutritious cat food & treats', 'Interactive & feather toys', 'Scratching posts & trees', 'Litter & hygiene products'],
      color: 'bg-purple-50',
      accentColor: 'bg-purple-500',
      textColor: 'text-purple-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445459/Untitled_900_x_600_px_1080_x_1080_px_eerbg4.svg',
      ]
    },
    {
      id: 'toys',
      name: 'Toys',
      title: 'Endless Fun & Entertainment',
      description: 'Keep your pets active and entertained with our exciting range of toys. From interactive puzzles to squeaky toys, we have something to delight every pet personality.',
      features: ['Safe & durable materials', 'Interactive designs', 'Mental stimulation toys', 'Variety for all pet sizes'],
      color: 'bg-blue-50',
      accentColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770375875/Untitled_160_x_90_px_1_ocqzja.svg',
      ]
    },
    {
      id: 'accessories',
      name: 'Accessories',
      title: 'Style Meets Functionality',
      description: 'Discover our collection of pet accessories including collars, leashes, bowls, carriers, and clothing. Designed for safety, comfort, and style for your furry companions.',
      features: ['Adjustable collars & leashes', 'Travel-friendly carriers', 'Stylish pet clothing', 'Durable bowls & feeders'],
      color: 'bg-rose-50',
      accentColor: 'bg-rose-500',
      textColor: 'text-rose-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770371876/Untitled_160_x_90_px_600_x_1000_px_600_x_800_px_1_ec1tsb.svg',
      ]
    },
    {
      id: 'grooming-essential',
      name: 'Grooming & Essential',
      title: 'Keep Them Clean & Fresh',
      description: 'Pamper your pets with our professional-grade grooming products. From gentle shampoos and conditioners to brushes and nail care, everything you need to keep your pet looking their best.',
      features: ['Natural shampoos & conditioners', 'Professional brushes & combs', 'Nail clippers & grinders', 'Dental care products'],
      color: 'bg-cyan-50',
      accentColor: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770365101/Untitled_160_x_90_px_600_x_1000_px_600_x_800_px_znz6aj.svg',
      ]
    },
    {
      id: 'health-supplement',
      name: 'Health & Supplement',
      title: 'Wellness from the Inside Out',
      description: 'Support your pet\'s overall health with our range of veterinary-approved supplements and health products. From vitamins and joint support to digestive aids, help your pets thrive at every life stage.',
      features: ['Vet-approved formulas', 'Joint & mobility support', 'Skin & coat supplements', 'Digestive health boosters'],
      color: 'bg-green-50',
      accentColor: 'bg-green-500',
      textColor: 'text-green-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770360339/Untitled_1600_x_600_px_1080_x_1080_px_1080_x_600_px_1080_x_600_px_1000_x_600_px_a7yk4z.svg',
      ]
    },
    {
      id: 'beds-house',
      name: 'Beds & House',
      title: 'Cozy Spaces for Your Companions',
      description: 'Create the perfect resting spot for your pets with our comfortable beds, houses, and crates. Give them a cozy place they can call their own for relaxation and peaceful sleep.',
      features: ['Orthopedic & memory foam beds', 'Easy to clean & maintain', 'Multiple sizes available', 'Weatherproof outdoor houses'],
      color: 'bg-pink-50',
      accentColor: 'bg-pink-500',
      textColor: 'text-pink-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770364698/Untitled_1600_x_600_px_1080_x_1080_px_1080_x_600_px_1080_x_600_px_1000_x_600_px_2_blykem.svg',
      ]
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Banner Carousel */}
      <HeroBanner />

      {/* Shop by Category */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
            {categories.map((category) => (
              <Link
                key={category._id || category.slug}
                to={`/category/${category.slug}`}
                className="text-center group cursor-pointer"
              >
                <div className="relative flex items-center justify-center mb-4">
                  {/* Circle background */}
                  <div className={`${categoryColors[category.slug] || 'bg-gray-100'} w-28 h-28 md:w-36 md:h-36 rounded-full shadow-md group-hover:shadow-xl transition-shadow`}></div>
                  {/* Image from backend API */}
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="absolute w-32 h-32 md:w-40 md:h-40 object-contain -top-4 group-hover:scale-110 group-hover:-top-6 transition-all duration-300 drop-shadow-lg"
                    />
                  ) : (
                    <span className="absolute text-7xl md:text-8xl -top-2 group-hover:scale-110 group-hover:-top-4 transition-all duration-300 drop-shadow-lg">
                      📦
                    </span>
                  )}
                </div>
                <span className="font-semibold text-gray-900">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-40 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => {
                const { price, mrp } = extractPrice(product);
                const img = extractImage(product);
                const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                const name = product.productName || product.name || 'Product';

                return (
                  <Link
                    to={`/product/${product._id}`}
                    key={product._id}
                    className="bg-gray-50 rounded-2xl p-4 hover:shadow-lg transition-all group relative overflow-hidden"
                  >
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                        {discount}% OFF
                      </span>
                    )}
                    <div className="bg-white rounded-xl h-40 mb-4 flex items-center justify-center overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={name}
                          className="max-h-full max-w-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-5xl">🐾</span>
                      )}
                    </div>
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      {product._type}
                    </span>
                    <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 text-sm leading-snug">{name}</h3>
                    {product.rating != null && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-xs text-gray-500">{product.rating}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">₹{price?.toLocaleString()}</span>
                      {mrp > price && (
                        <span className="text-sm text-gray-400 line-through">₹{mrp?.toLocaleString()}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Category Detail Sections */}
      {categorySections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className={`py-16 md:py-24 ${section.color}`}
        >
          <div className="container mx-auto px-4">
            <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}>
              {/* Info Side */}
              <div className="flex-1 space-y-6">
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${section.accentColor} text-white`}>
                  {section.name}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {section.title}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {section.description}
                </p>
                <ul className="space-y-3">
                  {section.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full ${section.accentColor} flex items-center justify-center`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={`#shop-${section.id}`}
                  className={`inline-block px-8 py-3 rounded-full font-semibold ${section.accentColor} text-white hover:opacity-90 transition-opacity shadow-lg`}
                >
                  Shop {section.name} →
                </a>
              </div>

              {/* Images Side */}
              <div className="flex-1 relative">
                <div className="relative">
                  {/* Decorative circle background */}
                  <div className={`absolute inset-0 ${section.accentColor} opacity-10 rounded-full transform scale-75`}></div>

                  {/* Main image */}
                  <div className="relative z-10 flex items-center justify-center">
                    <img
                      src={section.images[0]}
                      alt={section.name}
                      className="w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Floating decorative elements */}
                  <div className={`absolute top-4 right-4 w-16 h-16 ${section.accentColor} opacity-20 rounded-full animate-pulse`}></div>
                  <div className={`absolute bottom-8 left-4 w-12 h-12 ${section.accentColor} opacity-30 rounded-full animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Banner Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vet Consultation Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Consult a Vet Online</h3>
                <p className="mb-4 opacity-90">Get expert advice from certified veterinarians from the comfort of your home.</p>
                <a href="#consult" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  Book Now
                </a>
              </div>
              <span className="absolute right-4 bottom-4 text-8xl opacity-20">👨‍⚕️</span>
            </div>

            {/* Grooming Banner */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Pet Grooming Services</h3>
                <p className="mb-4 opacity-90">Professional grooming to keep your pet looking and feeling their best.</p>
                <a href="#grooming" className="inline-block bg-white text-pink-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  Learn More
                </a>
              </div>
              <span className="absolute right-4 bottom-4 text-8xl opacity-20">✂️</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vet Consultation Banner */}
      <section className="bg-[#fff7ed] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 py-10 md:py-14">

            {/* Left — Text Content */}
            <div className="flex-1 space-y-5">
              <p className="text-gray-500 text-sm font-medium italic">
                A healthy pet is a happy pet.
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Expert <span className="text-[#65a30d]">Vet Consultation</span><br />
                at Your Fingertips
              </h2>

              <div className="space-y-3 pt-2">
                {[
                  { icon: '🩺', text: 'Instant Online Vet Consultations' },
                  { icon: '💊', text: 'Personalised Health & Diet Plans' },
                  { icon: '📍', text: 'Find Nearby Vet Clinics & Pet Hospitals' },
                  { icon: '📋', text: 'Vaccination Reminders & Health Records' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/contact"
                className="inline-block mt-4 bg-[#65a30d] hover:bg-[#4d7c0f] text-white font-bold px-8 py-3 rounded-full transition-colors shadow-lg shadow-[#65a30d]/20"
              >
                Book a Consultation
              </Link>
            </div>

            {/* Right — Image Only */}
            <div className="flex-1 flex justify-center">
              <img
                src="https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770878069/Untitled_1080_x_1080_px_1_ok1teu.svg"
                alt="Vet Consultation"
                className="w-full max-w-md object-contain"
              />
            </div>

          </div>
        </div>
      </section>


      {/* Why Choose Us */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose FairyTails?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#a3e635] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Products</h3>
              <p className="text-gray-600">We source only the best products from trusted brands for your beloved pets.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#a3e635] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pet-First Approach</h3>
              <p className="text-gray-600">Every decision we make is guided by what's best for your pet's health and happiness.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#a3e635] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🌟</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">Our team of pet experts and vets are always here to help you make informed decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
              Our Promise to You
            </h2>
            <p className="text-black max-w-2xl mx-auto">
              We're committed to providing the best shopping experience for you and your furry friends
            </p>
          </div>
          <div className="grid grid-cols-2  md:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-gray-100 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-gray-200 transition-all duration-300 hover:scale-105 group"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-3xl">{service.icon}</span>
                </div>
                <h4 className="font-bold text-black text-lg mb-2">{service.title}</h4>
                <p className="text-black text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
