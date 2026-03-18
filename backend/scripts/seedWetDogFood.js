import fs from 'fs/promises';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import Food from '../models/Food.js';

dotenv.config();

const inputPath =
  '/Users/prajwalkamdi/Desktop/fairytales/FairyTails_PetShop/json/wet_dog_food (1).json';
const DEFAULT_IMAGE =
  'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445067/Untitled_design_6_sqklkn.svg';
const DEFAULT_EXPIRY_DATE = new Date('2028-12-31T00:00:00.000Z');

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const parseCapacity = (name, baseUnit) => {
  if (typeof name === 'string') {
    const normalized = name.trim();
    const match = normalized.match(
      /^(\d+(?:\+\d+)?(?:\.\d+)?)\s*(kg|g|gm|grams?|ml|l|ltr|litre|litres?|pieces?|pcs?)\b/i
    );
    if (match) {
      let unit = match[2].toLowerCase();
      if (unit === 'gm' || unit === 'gram' || unit === 'grams') unit = 'g';
      if (unit === 'ltr' || unit === 'litre' || unit === 'litres') unit = 'l';
      if (unit === 'pcs' || unit === 'piece' || unit === 'pieces') unit = 'pieces';
      return `${match[1]}${unit === 'pieces' ? ' pieces' : unit}`;
    }
  }

  return baseUnit === 'pieces' ? '1 piece' : `1 ${baseUnit}`;
};

const parseTaxPercent = (taxLabel) => {
  if (typeof taxLabel !== 'string') return 18;
  const match = taxLabel.match(/(\d+(?:\.\d+)?)/);
  return match ? toNumber(match[1], 18) : 18;
};

const toFoodDocument = (row) => {
  const productName = String(row['Item Name'] ?? '').trim();
  const mrp = toNumber(row[' MRP'] ?? row['MRP'], 0);
  const discountPriceRaw = toNumber(row['Discount price'], NaN);
  const discountFactor = toNumber(row['Discount Type'], NaN);

  let discountPrice = Number.isFinite(discountPriceRaw) ? discountPriceRaw : mrp;
  if (!Number.isFinite(discountPriceRaw) && Number.isFinite(discountFactor) && discountFactor > 0 && discountFactor < 1) {
    discountPrice = Number((mrp * (1 - discountFactor)).toFixed(2));
  }

  const baseUnit = String(row['Base Unit (x)'] ?? 'PIECES').trim().toLowerCase() || 'pieces';
  const expiryRaw = row['Expiry Date'];
  const parsedDate = expiryRaw ? new Date(String(expiryRaw).replace(' ', 'T')) : null;
  const expiryDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : DEFAULT_EXPIRY_DATE;

  const taxRateLabel = String(row['Taxes'] ?? row['Tax Rate'] ?? 'GST@18%').trim() || 'GST@18%';
  const inclusiveRaw = String(row['Inclusive Of Tax'] ?? '').trim().toUpperCase();
  const inclusiveOfTax = inclusiveRaw ? inclusiveRaw === 'Y' : true;
  const saleDiscountValue = Number((mrp - discountPrice).toFixed(2));

  return {
    productName,
    category: 'Dog',
    subCategory: 'Wet Food',
    capacity: parseCapacity(productName, baseUnit),
    mrp,
    discountPrice,
    discountType: String(row['Sale Discount'] ?? 'Discount Amount').trim() || 'Discount Amount',
    availableStock: toNumber(row['Current stock quantity'], 0),
    expiryDate,
    baseUnit,
    taxes: parseTaxPercent(taxRateLabel),
    images: [DEFAULT_IMAGE],
    itemCode: row['Item code'] != null ? String(row['Item code']).trim() : undefined,
    hsn: row['HSN'] != null ? String(row['HSN']).trim() : undefined,
    details: row['Description'] ? [String(row['Description']).trim()] : [],
    keyFeatures: [],
    flavours: [],
    nutrients: [],
    healthBenefits: [],
    purchasePrice: 0,
    saleDiscount: saleDiscountValue > 0 ? saleDiscountValue : 0,
    minimumStock: 0,
    itemLocation: '',
    taxRateLabel,
    inclusiveOfTax,
    secondaryUnit: undefined,
    conversionRate: 0,
  };
};

const run = async () => {
  try {
    await connectDB();

    const rawContent = await fs.readFile(inputPath, 'utf-8');
    const rawData = JSON.parse(rawContent);

    if (!Array.isArray(rawData)) {
      throw new Error('Input JSON must be an array');
    }

    const documents = rawData
      .map(toFoodDocument)
      .filter((doc) => doc.productName.length > 0);

    const deleted = await Food.deleteMany({ category: 'Dog', subCategory: 'Wet Food' });
    const inserted = await Food.insertMany(documents);

    console.log(`Deleted existing Dog Wet Food: ${deleted.deletedCount}`);
    console.log(`Seeded Dog Wet Food records: ${inserted.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Dog Wet Food seed failed:', error.message);
    process.exit(1);
  }
};

run();
