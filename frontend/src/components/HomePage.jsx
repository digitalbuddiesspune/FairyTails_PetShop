import HeroBanner from './HeroBanner';

const HomePage = () => {
  const categories = [
    { name: 'Clothes', image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770287327/Untitled_design_1_kjwduy.svg', color: 'bg-amber-100' },
    { name: 'Food', image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770287785/Untitled_design_2_xnht2p.svg', color: 'bg-purple-100' },
    { name: 'Toys', image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770288630/Untitled_design_asmctz.png', color: 'bg-blue-100' },
    { name: 'Skin Care', image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770289192/Untitled_design_3_fzqdjq.svg', color: 'bg-cyan-100' },
    { name: 'House', image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770289385/Untitled_design_4_tpstae.svg', color: 'bg-pink-100' },
    { name: 'Belt', image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770289827/Untitled_design_5_uondnk.svg', color: 'bg-green-100' },
  ];

  const featuredProducts = [
    { id: 1, name: 'Premium Dog Food', price: 1299, originalPrice: 1599, image: '🍖', rating: 4.5, reviews: 128 },
    { id: 2, name: 'Cat Scratching Post', price: 899, originalPrice: 1199, image: '🐱', rating: 4.8, reviews: 89 },
    { id: 3, name: 'Bird Cage Deluxe', price: 2499, originalPrice: 2999, image: '🏠', rating: 4.3, reviews: 45 },
    { id: 4, name: 'Aquarium Starter Kit', price: 3499, originalPrice: 4299, image: '🐟', rating: 4.7, reviews: 67 },
  ];

  const services = [
    { title: 'Free Delivery', description: 'On orders above ₹499', icon: '🚚' },
    { title: 'Vet Consultation', description: 'Expert advice 24/7', icon: '👨‍⚕️' },
    { title: 'Easy Returns', description: '7-day return policy', icon: '↩️' },
    { title: 'Secure Payment', description: '100% secure checkout', icon: '🔒' },
  ];

  const categorySections = [
    {
      id: 'clothes',
      name: 'Pets Clothes',
      title: 'Dress Your Pet in Style',
      description: 'Explore our adorable collection of pet clothing designed for comfort and fashion. From cozy sweaters to raincoats, we have everything to keep your furry friend looking fabulous in every season.',
      features: ['Premium quality fabrics', 'Comfortable fit for all breeds', 'Seasonal collections', 'Easy to wash & maintain'],
      color: 'bg-amber-50',
      accentColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770360022/Untitled_1600_x_600_px_1080_x_1080_px_1080_x_600_px_1000_x_600_px_jssuuh.svg',
      ]
    },
    {
      id: 'food',
      name: 'Pets Food',
      title: 'Nutritious Meals for Happy Pets',
      description: 'Give your pets the nutrition they deserve with our premium selection of pet food. We offer balanced diets for dogs, cats, birds, and more from trusted brands worldwide.',
      features: ['Vet-approved formulas', 'Natural ingredients', 'Age-specific nutrition', 'Grain-free options available'],
      color: 'bg-purple-50',
      accentColor: 'bg-purple-500',
      textColor: 'text-purple-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770360339/Untitled_1600_x_600_px_1080_x_1080_px_1080_x_600_px_1080_x_600_px_1000_x_600_px_a7yk4z.svg',
      ]
    },
    {
      id: 'toys',
      name: 'Pets Toys',
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
      id: 'skin-care',
      name: 'Pets Skin Care',
      title: 'Healthy Skin, Happy Pet',
      description: 'Pamper your pets with our specialized skin care products. From gentle shampoos to moisturizing treatments, keep your pet\'s coat shiny and skin healthy.',
      features: ['Dermatologist tested', 'Natural & organic options', 'Anti-itch formulas', 'Coat conditioning treatments'],
      color: 'bg-cyan-50',
      accentColor: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770365101/Untitled_160_x_90_px_600_x_1000_px_600_x_800_px_znz6aj.svg',
      ]
    },
    {
      id: 'house',
      name: 'Pets House',
      title: 'Cozy Homes for Your Companions',
      description: 'Create the perfect space for your pets with our comfortable beds, houses, and crates. Give them a place they can call their own for rest and relaxation.',
      features: ['Orthopedic options', 'Easy to clean', 'Multiple sizes available', 'Stylish designs'],
      color: 'bg-pink-50',
      accentColor: 'bg-pink-500',
      textColor: 'text-pink-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770364698/Untitled_1600_x_600_px_1080_x_1080_px_1080_x_600_px_1080_x_600_px_1000_x_600_px_2_blykem.svg',
      ]
    },
    {
      id: 'belt',
      name: 'Pets Belt & Leashes',
      title: 'Walk with Confidence',
      description: 'Explore our collection of premium leashes, harnesses, and collars. Designed for safety and comfort, perfect for daily walks and outdoor adventures.',
      features: ['Adjustable & secure', 'Reflective for night walks', 'Padded for comfort', 'Durable hardware'],
      color: 'bg-green-50',
      accentColor: 'bg-green-500',
      textColor: 'text-green-600',
      images: [
        'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770371876/Untitled_160_x_90_px_600_x_1000_px_600_x_800_px_1_ec1tsb.svg',
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
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <a
                key={index}
                href={`#${category.name.toLowerCase()}`}
                className="text-center group cursor-pointer"
              >
                <div className="relative flex items-center justify-center mb-4">
                  {/* Circle background */}
                  <div className={`${category.color} w-28 h-28 md:w-36 md:h-36 rounded-full shadow-md group-hover:shadow-xl transition-shadow`}></div>
                  {/* Image/Icon positioned to pop out */}
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="absolute w-32 h-32 md:w-40 md:h-40 object-contain -top-4 group-hover:scale-110 group-hover:-top-6 transition-all duration-300 drop-shadow-lg"
                    />
                  ) : (
                    <span className="absolute text-7xl md:text-8xl -top-2 group-hover:scale-110 group-hover:-top-4 transition-all duration-300 drop-shadow-lg">
                      {category.icon}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-gray-900">{category.name}</span>
              </a>
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
            <a href="#all-products" className="text-[#65a30d] font-semibold hover:underline">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-50 rounded-2xl p-4 hover:shadow-lg transition-shadow group"
              >
                <div className="bg-white rounded-xl p-6 mb-4 text-center">
                  <span className="text-6xl group-hover:scale-110 transition-transform inline-block">
                    {product.image}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600">{product.rating} ({product.reviews})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                  <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                </div>
                <button className="w-full mt-4 bg-[#a3e635] text-gray-900 py-2 rounded-lg font-semibold hover:bg-[#84cc16] transition-colors">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
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
