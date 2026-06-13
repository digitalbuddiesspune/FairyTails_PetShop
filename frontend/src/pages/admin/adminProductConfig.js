import { categories } from './AdminCategorySelection';

export const CATEGORY_KEY_TO_TYPE = {
  food: 'food',
  clothes: 'clothes',
  grooming: 'grooming',
  health: 'health',
  houses: 'house',
  toys: 'toy',
  accessories: 'accessory',
};

export const TYPE_TO_CATEGORY_KEY = {
  food: 'food',
  clothes: 'clothes',
  grooming: 'grooming',
  health: 'health',
  house: 'houses',
  toy: 'toys',
  accessory: 'accessories',
};

export const getCategoryDataByKey = (categoryKey) => {
  const type = CATEGORY_KEY_TO_TYPE[categoryKey];
  if (!type) return null;
  return categories.find((cat) => cat.type === type) || null;
};
