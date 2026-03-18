import fs from 'fs/promises';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import GroomingEssential from '../models/GroomingEssential.js';

dotenv.config();

const inputPath =
  '/Users/prajwalkamdi/Desktop/fairytales/FairyTails_PetShop/json/Grooming And Essentials.json';
const DEFAULT_IMAGE =
  'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770289192/Untitled_design_3_fzqdjq.svg';
const DEFAULT_EXPIRY_DATE = new Date('2028-12-31T00:00:00.000Z');

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const parseTaxPercent = (taxLabel) => {
  if (typeof taxLabel !== 'string') return 18;
  const match = taxLabel.match(/(\d+(?:\.\d+)?)/);
  return match ? toNumber(match[1], 18) : 18;
};

const parseExpiryDate = (value) => {
  if (!value) return DEFAULT_EXPIRY_DATE;
  const str = String(value).trim();
  if (!str || str.toLowerCase() === 'none' || str.toLowerCase() === 'n/a') {
    return DEFAULT_EXPIRY_DATE;
  }

  const normalized = str.includes(' ') ? str.replace(' ', 'T') : str;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? DEFAULT_EXPIRY_DATE : date;
};

const isNone = (value) => {
  const str = String(value ?? '').trim().toLowerCase();
  return !str || str === 'none' || str === 'null' || str === 'n/a';
};

const toGroomingDoc = (row, subCategory) => {
  const productName = String(row['Item Name'] ?? '').trim();
  const mrp = toNumber(row[' MRP'] ?? row['MRP'], 0);
  const discountPriceRaw = toNumber(row['Discount price'], NaN);
  const discountFactor = toNumber(row['Discount Type'], NaN);

  let discountPrice = Number.isFinite(discountPriceRaw) ? discountPriceRaw : mrp;
  if (!Number.isFinite(discountPriceRaw) && Number.isFinite(discountFactor) && discountFactor > 0 && discountFactor < 1) {
    discountPrice = Number((mrp * (1 - discountFactor)).toFixed(2));
  }

  const taxRateLabel = String(row['Taxes'] ?? row['Tax Rate'] ?? 'GST@18%').trim() || 'GST@18%';
  const inclusiveRaw = String(row['Inclusive Of Tax'] ?? '').trim().toUpperCase();
  const inclusiveOfTax = inclusiveRaw && inclusiveRaw !== 'NONE' ? inclusiveRaw === 'Y' : true;
  const baseUnit = String(row['Base Unit (x)'] ?? 'PIECES').trim().toLowerCase() || 'pieces';
  const saleDiscountValue = Number((mrp - discountPrice).toFixed(2));

  return {
    category: 'grooming-essentials',
    subCategory,
    productName,
    mrp,
    discountPrice,
    discountType: String(row['Sale Discount'] ?? 'Discount Amount').trim() || 'Discount Amount',
    availableStock: toNumber(row['Current stock quantity'], 0),
    taxes: parseTaxPercent(taxRateLabel),
    baseUnit,
    images: [DEFAULT_IMAGE],
    itemCode: isNone(row['Item code']) ? undefined : String(row['Item code']).trim(),
    hsn: isNone(row['HSN']) ? undefined : String(row['HSN']).trim(),
    size: undefined,
    expiryDate: parseExpiryDate(row['Expiry Date']),
    brand: undefined,
    description: isNone(row['Description']) ? undefined : String(row['Description']).trim(),
    keyFeatures: [],
    suitableFor: 'Both',
    usageInstructions: [],
    saleDiscount: saleDiscountValue > 0 ? saleDiscountValue : 0,
    taxRateLabel,
    inclusiveOfTax,
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

    const dogDocs = rawData
      .map((row) => toGroomingDoc(row, 'dog'))
      .filter((doc) => doc.productName.length > 0);

    const catDocs = rawData
      .map((row) => toGroomingDoc(row, 'cat'))
      .filter((doc) => doc.productName.length > 0);

    const deletedDog = await GroomingEssential.deleteMany({
      category: 'grooming-essentials',
      subCategory: 'dog',
    });
    const deletedCat = await GroomingEssential.deleteMany({
      category: 'grooming-essentials',
      subCategory: 'cat',
    });

    const insertedDog = await GroomingEssential.insertMany(dogDocs);
    const insertedCat = await GroomingEssential.insertMany(catDocs);

    console.log(`Deleted existing dog grooming essentials: ${deletedDog.deletedCount}`);
    console.log(`Deleted existing cat grooming essentials: ${deletedCat.deletedCount}`);
    console.log(`Seeded dog grooming essentials: ${insertedDog.length}`);
    console.log(`Seeded cat grooming essentials: ${insertedCat.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Grooming essentials seed failed:', error.message);
    process.exit(1);
  }
};

run();
