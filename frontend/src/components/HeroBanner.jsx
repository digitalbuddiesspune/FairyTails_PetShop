import { useState, useEffect } from "react";

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileSlide, setMobileSlide] = useState(0);

  // ================= DESKTOP BANNERS =================
  const banners = [
    {
      id: 1,
      image:
        "https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770283660/Untitled_1920_x_675_px_1920_x_600_px_zi5poz.svg",
      alt: "Banner 1",
      link: "#",
    },
    {
      id: 2,
      image:
        "https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770901211/fairy_tails_4x-100.jpg_odmnzj.jpg",
      alt: "Banner 2",
      link: "#",
    },
  ];

  // ================= MOBILE BANNERS =================
  const mobileBanners = [
    "https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770968037/Untitled_1080_x_1080_px_3_beftgo.svg",
    "https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770976443/Untitled_1080_x_1080_px_1_2_bmulkz.png",
  ];

  // ================= DESKTOP AUTOPLAY =================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // ================= MOBILE AUTOPLAY =================
  useEffect(() => {
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

  return (
    <section className="relative w-full overflow-hidden">

      {/* ================= MOBILE BANNER ================= */}
      <div className="md:hidden relative w-full h-auto overflow-hidden">

        {mobileBanners.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Mobile Banner ${index}`}
            className={`w-full h-auto object-cover transition-opacity duration-700 ${
              mobileSlide === index
                ? "opacity-100 relative"
                : "opacity-0 absolute top-0 left-0"
            }`}
          />
        ))}

        {/* Mobile Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
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
      </div>

      {/* ================= DESKTOP BANNER ================= */}
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
              key={banner.id}
              href={banner.link}
              className="min-w-full h-full flex-shrink-0"
            >
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-full object-cover"
              />
            </a>
          ))}
        </div>

        {/* Previous */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg"
        >
          ‹
        </button>

        {/* Next */}
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg"
        >
          ›
        </button>

        {/* Desktop Dots */}
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
      </div>
    </section>
  );
};

export default HeroBanner;
