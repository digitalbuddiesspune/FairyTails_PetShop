import fs from 'fs/promises';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import Food from '../models/Food.js';

dotenv.config();

const inputPath =
  '/Users/prajwalkamdi/Desktop/fairytales/FairyTails_PetShop/json/Cat Treats json data.json';
const DEFAULT_IMAGE =
  'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770445262/Untitled_design_7_mye5vd.svg';
const DEFAULT_EXPIRY_DATE = new Date('2028-12-31T00:00:00.000Z');

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const parseCapacity = (name, baseUnit) => {
  if (typeof name === 'string') {
    const normalized = name.trim();
    const quantityMatch = normalized.match(/^(\d+(?:\+\d+)?)\s*(pieces?|pcs?)\b/i);
    if (quantityMatch) {
      return `${quantityMatch[1]} pieces`;
    }

    const metricMatch = normalized.match(
      /^(\d+(?:\.\d+)?)\s*(kg|g|gm|grams?|ml|l|ltr|litre|litres?)\b/i
    );
    if (metricMatch) {
      let unit = metricMatch[2].toLowerCase();
      if (unit === 'gm' || unit === 'gram' || unit === 'grams') unit = 'g';
      if (unit === 'ltr' || unit === 'litre' || unit === 'litres') unit = 'l';
      return `${metricMatch[1]}${unit}`;
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
  const directDiscountPrice = toNumber(row['Discount price'], NaN);
  const discountFactor = toNumber(row['Discount Type'], NaN);

  let discountPrice = Number.isFinite(directDiscountPrice) ? directDiscountPrice : mrp;
  if (!Number.isFinite(directDiscountPrice) && Number.isFinite(discountFactor) && discountFactor > 0 && discountFactor < 1) {
    discountPrice = Number((mrp * (1 - discountFactor)).toFixed(2));
  }

  const baseUnit = String(row['Base Unit (x)'] ?? 'PIECES').trim().toLowerCase() || 'pieces';
  const expiryRaw = row['Expiry Date'];
  const expiryDate =
    expiryRaw && !Number.isNaN(new Date(expiryRaw).getTime())
      ? new Date(expiryRaw)
      : DEFAULT_EXPIRY_DATE;

  const taxRateLabel = String(row['Taxes'] ?? row['Tax Rate'] ?? 'GST@18%').trim() || 'GST@18%';
  const inclusiveRaw = String(row['Inclusive Of Tax'] ?? '').trim().toUpperCase();
  const inclusiveOfTax = inclusiveRaw ? inclusiveRaw === 'Y' : true;

  const saleDiscountValue = Number((mrp - discountPrice).toFixed(2));

  return {
    productName,
    category: 'Cat',
    subCategory: 'Treats',
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

    const deleted = await Food.deleteMany({ category: 'Cat', subCategory: 'Treats' });
    const inserted = await Food.insertMany(documents);

    console.log(`Deleted existing Cat Treats: ${deleted.deletedCount}`);
    console.log(`Seeded Cat Treats records: ${inserted.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Cat Treats seed failed:', error.message);
    process.exit(1);
  }
};

run();
