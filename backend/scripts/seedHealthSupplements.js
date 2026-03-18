import fs from 'fs/promises';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import HealthSupplement from '../models/HealthSupplement.js';

dotenv.config();

const inputPath =
  '/Users/prajwalkamdi/Desktop/fairytales/FairyTails_PetShop/json/health_and_supplements.json';
const DEFAULT_IMAGE =
  'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770287785/Untitled_design_2_xnht2p.svg';
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

const toHealthDoc = (row, subCategory) => {
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
    category: 'health-supplement',
    subCategory,
    productName,
    mrp,
    discountPrice,
    discountType: String(row['Sale Discount'] ?? 'Discount Amount').trim() || 'Discount Amount',
    availableStock: toNumber(row['Current stock quantity'], 0),
    expiryDate: parseExpiryDate(row['Expiry Date']),
    taxes: parseTaxPercent(taxRateLabel),
    baseUnit,
    images: [DEFAULT_IMAGE],
    itemCode: isNone(row['Item code']) ? undefined : String(row['Item code']).trim(),
    hsn: isNone(row['HSN']) ? undefined : String(row['HSN']).trim(),
    description: isNone(row['Description']) ? undefined : String(row['Description']).trim(),
    highlights: [],
    usage: {},
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
      .map((row) => toHealthDoc(row, 'dog'))
      .filter((doc) => doc.productName.length > 0);

    const catDocs = rawData
      .map((row) => toHealthDoc(row, 'cat'))
      .filter((doc) => doc.productName.length > 0);

    const deletedDog = await HealthSupplement.deleteMany({
      category: 'health-supplement',
      subCategory: 'dog',
    });
    const deletedCat = await HealthSupplement.deleteMany({
      category: 'health-supplement',
      subCategory: 'cat',
    });

    const insertedDog = await HealthSupplement.insertMany(dogDocs);
    const insertedCat = await HealthSupplement.insertMany(catDocs);

    console.log(`Deleted existing dog health supplements: ${deletedDog.deletedCount}`);
    console.log(`Deleted existing cat health supplements: ${deletedCat.deletedCount}`);
    console.log(`Seeded dog health supplements: ${insertedDog.length}`);
    console.log(`Seeded cat health supplements: ${insertedCat.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Health supplements seed failed:', error.message);
    process.exit(1);
  }
};

run();
