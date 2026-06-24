import { useState } from 'react';
import { Link } from 'react-router-dom';
import type from '../styles/typography';

// Category icons (used for main category list in menu/catalog)
const categoryIconMap = {
  'dogs': { src: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457891/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_vzgzug.svg', alt: 'Dogs' },
  'cats': { src: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457890/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_1_q3xxat.svg', alt: 'Cats' },
  'toys': '🧸',
  'accessories': '🎀',
  'grooming-and-essential': '✂️',
  'health-and-supplement': '💊',
  'beds-and-house': '🏠',
};

// Subcategory icons (used for subcategory list)
const subIconMap = {
  'Dry Food': '🥫', 'Wet Food': '🍖', 'Dog Clothes': '👕', 'Cat Clothes': '👗',
  'Treats': '🦴',
  'Collar & Leash': '🔗',
  'Dogs': { src: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457891/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_vzgzug.svg', alt: 'Dogs' },
  'Cats': { src: 'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770457890/Untitled_900_x_600_px_900_x_600_px_1040_x_1100_px_1_q3xxat.svg', alt: 'Cats' },
};

const CategoryIcon = ({ slug, name }) => {
  const key = (slug || (name || '').toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')).toLowerCase();
  const icon = categoryIconMap[key];
  if (icon && typeof icon === 'object' && icon.src) {
    return <img src={icon.src} alt={icon.alt || name} className="w-6 h-6 object-contain" />;
  }
  return <span className="text-xl">{icon || '📦'}</span>;
};

const SubIcon = ({ name }) => {
  const icon = subIconMap[name];
  if (icon && typeof icon === 'object' && icon.src) {
    return <img src={icon.src} alt={icon.alt || name} className="w-6 h-6 object-contain" />;
  }
  return <span className="text-xl">{icon || '📦'}</span>;
};

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

/**
 * Reusable catalog menu: categories list → tap category → subcategories → tap subcategory → navigate
 */
export default function CatalogMenuContent({ categories, getSubcategoryLink, onSubcategoryClick, onClose, compact = false }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSubcategoryClick = (category, sub) => {
    const link = getSubcategoryLink(category.slug, sub.name);
    onSubcategoryClick?.(link);
    setSelectedCategory(null);
  };

  const handleBack = () => setSelectedCategory(null);

  const px = compact ? 'px-2' : 'px-4';
  const py = compact ? 'py-2' : 'py-3';

  if (selectedCategory) {
    const subs = selectedCategory.subcategories || [];
    return (
      <div>
        <button
          onClick={handleBack}
          className={`w-full flex items-center gap-2 ${px} ${py} text-gray-700 ${type.nav} hover:bg-gray-50 rounded-lg transition-colors`}
        >
          <BackIcon />
          <span>Back to categories</span>
        </button>
        <div className="mt-1 space-y-0.5">
          {subs.map((sub) => (
            <Link
              key={sub.name}
              to={getSubcategoryLink(selectedCategory.slug, sub.name)}
              onClick={() => handleSubcategoryClick(selectedCategory, sub)}
              className={`flex items-center gap-3 ${px} ${py} text-gray-700 hover:bg-gray-50 rounded-lg transition-colors`}
            >
              <SubIcon name={sub.name} />
              <span className={type.nav}>{sub.name}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {categories.map((category) => {
        const hasSubs = category.subcategories?.length > 0;
        const categoryLink = `/category/${category.slug}`;
        if (!hasSubs) {
          return (
            <Link
              key={category._id || category.slug}
              to={categoryLink}
              onClick={onClose}
              className={`flex items-center gap-2 ${px} ${py} text-gray-700 ${type.nav} hover:bg-gray-50 rounded-lg transition-colors`}
            >
              <CategoryIcon slug={category.slug} name={category.name} />
              <span>{category.name}</span>
            </Link>
          );
        }
        return (
          <button
            key={category._id || category.slug}
            onClick={() => setSelectedCategory(category)}
            className={`w-full flex items-center justify-between gap-2 ${px} ${py} text-gray-700 ${type.nav} hover:bg-gray-50 rounded-lg transition-colors text-left`}
          >
            <div className="flex items-center gap-2">
              <CategoryIcon slug={category.slug} name={category.name} />
              <span>{category.name}</span>
            </div>
            <ChevronRightIcon />
          </button>
        );
      })}
    </div>
  );
}
