import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import Food from '../models/Food.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const jsonPath = path.join(repoRoot, 'json', 'dry_cat_food.json');

const DEFAULT_IMAGE =
  'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg';
const DEFAULT_EXPIRY_DATE = new Date('2028-12-31');

const parseNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const extractCapacity = (itemName) => {
  if (!itemName || typeof itemName !== 'string') return '1 piece';
  const match = itemName.match(
    /^(\d+(?:\.\d+)?)\s*(kg|g|gm|grams?|ml|l|ltr|litre|litres?)\b/i
  );
  if (!match) return '1 piece';

  const value = match[1];
  const unitRaw = match[2].toLowerCase();

  if (unitRaw === 'grams' || unitRaw === 'gram' || unitRaw === 'gm') {
    return `${value}g`;
  }
  if (unitRaw === 'litre' || unitRaw === 'litres' || unitRaw === 'ltr') {
    return `${value}l`;
  }
  return `${value}${unitRaw}`;
};

const parseTaxRate = (taxRate) => {
  if (typeof taxRate !== 'string') return 18;
  const match = taxRate.match(/(\d+(?:\.\d+)?)/);
  return match ? parseNumber(match[1], 18) : 18;
};

const normalizeCategory = (value, fallback) => {
  const normalized = String(value ?? fallback).trim().toLowerCase();
  if (normalized === 'cat') return 'Cat';
  if (normalized === 'dog') return 'Dog';
  return fallback;
};

const normalizeSubCategory = (value, fallback) => {
  const normalized = String(value ?? fallback).trim().toLowerCase();
  if (normalized === 'dry food') return 'Dry Food';
  if (normalized === 'wet food') return 'Wet Food';
  if (normalized === 'treats') return 'Treats';
  return fallback;
};

const toModelDocument = (row) => {
  // Supports both the old raw export format and the already-normalized format.
  const alreadyNormalized = Object.prototype.hasOwnProperty.call(row, 'productName');
  const productName = String(
    alreadyNormalized ? row.productName : row['Item name*'] ?? ''
  ).trim();
  const defaultMrp = parseNumber(row['Default Mrp'], 0);
  const salePrice = parseNumber(row['Sale price'], 0);
  const mrp = alreadyNormalized ? parseNumber(row.mrp, 0) : defaultMrp;
  const discountPrice = alreadyNormalized
    ? parseNumber(row.discountPrice, mrp)
    : salePrice > 0
      ? salePrice
      : defaultMrp;
  const description = alreadyNormalized
    ? Array.isArray(row.details)
      ? String(row.details[0] ?? '').trim()
      : ''
    : String(row['Description'] ?? '').trim();
  const minimumStock = alreadyNormalized
    ? parseNumber(row.minimumStock, 0)
    : parseNumber(row['Minimum stock quantity'], 0);
  const availableStock = alreadyNormalized
    ? parseNumber(row.availableStock, 0)
    : parseNumber(row['Current stock quantity'], 0);
  const inclusiveOfTax = alreadyNormalized
    ? Boolean(row.inclusiveOfTax)
    : String(row['Inclusive Of Tax'] ?? '')
    .trim()
    .toUpperCase() === 'Y';

  return {
    productName,
    itemCode: String(alreadyNormalized ? row.itemCode : row['Item code'] ?? '').trim(),
    details: description ? [description] : [],
    category: normalizeCategory(row.category, 'Cat'),
    subCategory: normalizeSubCategory(row.subCategory, 'Dry Food'),
    hsn: String(alreadyNormalized ? row.hsn : row['HSN'] ?? '').trim(),
    capacity: String(
      alreadyNormalized ? row.capacity : extractCapacity(productName)
    ).trim() || '1 piece',
    mrp,
    discountPrice,
    discountType: String(
      alreadyNormalized ? row.discountType : row['Discount Type'] ?? 'Discount Amount'
    ).trim(),
    saleDiscount: parseNumber(
      alreadyNormalized ? row.saleDiscount : row['Sale Discount'],
      0
    ),
    purchasePrice: parseNumber(
      alreadyNormalized ? row.purchasePrice : row['Purchase price'],
      0
    ),
    availableStock,
    minimumStock,
    itemLocation: String(
      alreadyNormalized ? row.itemLocation : row['Item Location'] ?? ''
    ).trim(),
    taxes: alreadyNormalized ? parseNumber(row.taxes, 18) : parseTaxRate(row['Tax Rate']),
    taxRateLabel: String(
      alreadyNormalized ? row.taxRateLabel : row['Tax Rate'] ?? ''
    ).trim(),
    inclusiveOfTax,
    baseUnit: String(
      alreadyNormalized ? row.baseUnit : row['Base Unit (x)'] ?? 'PIECES'
    ).trim().toLowerCase(),
    secondaryUnit: String(
      alreadyNormalized ? row.secondaryUnit : row['Secondary Unit (y)'] ?? ''
    ).trim() || undefined,
    conversionRate: parseNumber(
      alreadyNormalized ? row.conversionRate : row['Conversion Rate (n) (x = ny)'],
      0
    ),
    expiryDate: alreadyNormalized
      ? new Date(row.expiryDate)
      : DEFAULT_EXPIRY_DATE,
    images:
      Array.isArray(row.images) && row.images.length > 0
        ? row.images
        : [DEFAULT_IMAGE],
    keyFeatures: Array.isArray(row.keyFeatures) ? row.keyFeatures : [],
    flavours: Array.isArray(row.flavours) ? row.flavours : [],
    nutrients: Array.isArray(row.nutrients) ? row.nutrients : [],
    healthBenefits: Array.isArray(row.healthBenefits) ? row.healthBenefits : [],
  };
};

const run = async () => {
  try {
    await connectDB();

    const file = await fs.readFile(jsonPath, 'utf-8');
    const rawData = JSON.parse(file);

    if (!Array.isArray(rawData)) {
      throw new Error('dry_cat_food.json must contain an array');
    }

    const documents = rawData
      .map(toModelDocument)
      .filter((doc) => doc.productName.length > 0);

    await Food.deleteMany({ category: 'Cat', subCategory: 'Dry Food' });
    const inserted = await Food.insertMany(documents);

    console.log(`Seeded ${inserted.length} dry cat food products.`);
    process.exit(0);
  } catch (error) {
    console.error('Dry cat food seed failed:', error.message);
    process.exit(1);
  }
};

run();
