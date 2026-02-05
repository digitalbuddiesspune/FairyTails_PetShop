import HeroBanner from './HeroBanner';

const HomePage = () => {
  const categories = [
    { name: 'Dogs', icon: '🐕', color: 'bg-amber-100' },
    { name: 'Cats', icon: '🐈', color: 'bg-purple-100' },
    { name: 'Birds', icon: '🐦', color: 'bg-blue-100' },
    { name: 'Fish', icon: '🐠', color: 'bg-cyan-100' },
    { name: 'Small Pets', icon: '🐹', color: 'bg-pink-100' },
    { name: 'Reptiles', icon: '🦎', color: 'bg-green-100' },
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Banner Carousel */}
      <HeroBanner />

      {/* Services Bar */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-2xl">{service.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{service.title}</h4>
                  <p className="text-gray-500 text-xs">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Pet Category */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            Shop by Pet
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <a
                key={index}
                href={`#${category.name.toLowerCase()}`}
                className={`${category.color} rounded-2xl p-6 text-center hover:shadow-lg transition-shadow group`}
              >
                <span className="text-5xl md:text-6xl block mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </span>
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
    </main>
  );
};

export default HomePage;
