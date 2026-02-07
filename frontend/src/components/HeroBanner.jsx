import { useState, useEffect } from 'react';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Placeholder banners - replace these URLs with your actual banner images
  const banners = [
    {
      id: 1,
      image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770283660/Untitled_1920_x_675_px_1920_x_600_px_zi5poz.svg', // Add your banner image URL here
      alt: 'Banner 1',
      link: '#',
    },
    {
      id: 2,
      image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770372017/Untitled_1920_x_600_px_8_ewlwye.png', // Add your banner image URL here
      alt: 'Banner 2',
      link: '#',
    },
    //  {
    //    id: 3,
    //    image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770371962/Untitled_1920_x_600_px_6_rigoq7.png', // Add your banner image URL here
    //    alt: 'Banner 3',
    //    link: '#',
    //  },
    //  {
    //    id: 4,
    //    image: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770284814/Untitled_1920_x_600_px_1_ghdtzb.png', // Add your banner image URL here
    //   alt: 'Banner 4',
    //   link: '#',
    //  },
  ];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="relative w-full overflow-hidden z-0">
      {/* Banner Container - 1920x600 aspect ratio (3.2:1) */}
      <div className="relative w-full" style={{ aspectRatio: '1920/600' }}>
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.link}
              className="min-w-full h-full flex-shrink-0"
            >
              {banner.image ? (
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                // Placeholder when no image is provided
                <div className="w-full h-full bg-gradient-to-r from-[#a3e635] to-[#84cc16] flex items-center justify-center">
                  <div className="text-center px-4">
                    <p className="text-2xl md:text-4xl font-bold text-gray-900">
                      Banner {banner.id}
                    </p>
                    <p className="text-gray-700 mt-2">Add your banner image URL</p>
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>

        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg transition-all z-10"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg transition-all z-10"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-[#a3e635] w-8'
                  : 'bg-white/70 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
