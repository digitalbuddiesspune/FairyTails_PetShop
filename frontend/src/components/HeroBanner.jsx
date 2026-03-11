import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_API;

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileSlide, setMobileSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [mobileBanners, setMobileBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH BANNERS =================
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Fetch desktop banners
        const desktopRes = await fetch(`${API_BASE}/banners?deviceType=desktop`);
        const desktopData = await desktopRes.json();
        if (desktopData.success) {
          setBanners(desktopData.data);
        }

        // Fetch mobile banners
        const mobileRes = await fetch(`${API_BASE}/banners?deviceType=mobile`);
        const mobileData = await mobileRes.json();
        if (mobileData.success) {
          setMobileBanners(mobileData.data.map(b => b.image));
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // ================= DESKTOP AUTOPLAY =================
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // ================= MOBILE AUTOPLAY =================
  useEffect(() => {
    if (mobileBanners.length === 0) return;
    const interval = setInterval(() => {
      setMobileSlide((prev) => (prev + 1) % mobileBanners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [mobileBanners.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const goToPrevious = () =>
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  const goToNext = () =>
    setCurrentSlide((prev) => (prev + 1) % banners.length);

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden">
        <div className="w-full aspect-[1920/600] bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400">Loading banners...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* ================= MOBILE BANNER ================= */}
      {mobileBanners.length > 0 && (
        <div className="md:hidden relative w-full overflow-hidden" style={{ aspectRatio: "1/1" }}>
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${mobileSlide * 100}%)` }}
          >
            {mobileBanners.map((image, index) => (
              <div
                key={index}
                className="min-w-full h-full flex-shrink-0 relative"
              >
                <img
                  src={image}
                  alt={`Mobile Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Mobile Dots */}
          {mobileBanners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {mobileBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setMobileSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    mobileSlide === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= DESKTOP BANNER ================= */}
      {banners.length > 0 && (
        <div
          className="relative w-full hidden md:block"
          style={{ aspectRatio: "1920/600" }}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((banner) => (
              <a
                key={banner._id}
                href={banner.link || '#'}
                className="min-w-full h-full flex-shrink-0"
              >
                <img
                  src={banner.image}
                  alt={`Banner ${banner._id}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>

          {/* Previous */}
          {banners.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg"
            >
              ‹
            </button>
          )}

          {/* Next */}
          {banners.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg"
            >
              ›
            </button>
          )}

          {/* Desktop Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all rounded-full ${
                    currentSlide === index
                      ? "bg-[#a3e635] w-8 h-3"
                      : "bg-white/70 w-3 h-3"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default HeroBanner;
