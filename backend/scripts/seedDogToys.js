import fs from 'fs/promises';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import Toy from '../models/Toy.js';

dotenv.config();

const inputPath =
  '/Users/prajwalkamdi/Desktop/fairytales/FairyTails_PetShop/json/fairy_tails_items_Dog Plush Toy,Dog Tough Toys,Dog Chew Toy,Dog Rope Toy.json';
const DEFAULT_IMAGE =
  'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770288630/Untitled_design_asmctz.png';

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
  if (!value) return null;
  const str = String(value).trim();
  if (!str || str.toLowerCase() === 'n/a' || str.toLowerCase() === 'none') return null;
  const normalized = str.includes(' ') ? str.replace(' ', 'T') : str;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toToyDoc = (row) => {
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
  const inclusiveOfTax = inclusiveRaw ? inclusiveRaw === 'Y' : true;
  const saleDiscount = Number((mrp - discountPrice).toFixed(2));
  const baseUnit = String(row['Base Unit (x)'] ?? 'PIECES').trim().toLowerCase() || 'pieces';

  return {
    category: 'toy',
    subCategory: 'dog',
    productName,
    mrp,
    discountPrice,
    discountType: String(row['Sale Discount'] ?? 'Discount Amount').trim() || 'Discount Amount',
    availableStock: toNumber(row['Current stock quantity'], 0),
    taxes: parseTaxPercent(taxRateLabel),
    baseUnit,
    images: [DEFAULT_IMAGE],
    itemCode: row['Item code'] != null ? String(row['Item code']).trim() : undefined,
    hsn: row['HSN'] != null ? String(row['HSN']).trim() : undefined,
    productDetails: row['Description'] ? [String(row['Description']).trim()] : [],
    keyFeatures: [],
    suitableFor: 'All',
    expiryDate: parseExpiryDate(row['Expiry Date']),
    saleDiscount: saleDiscount > 0 ? saleDiscount : 0,
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

    const documents = rawData
      .map(toToyDoc)
      .filter((doc) => doc.productName.length > 0);

    const deleted = await Toy.deleteMany({ category: 'toy', subCategory: 'dog' });
    const inserted = await Toy.insertMany(documents);

    console.log(`Deleted existing dog toys: ${deleted.deletedCount}`);
    console.log(`Seeded dog toys: ${inserted.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Dog toy seed failed:', error.message);
    process.exit(1);
  }
};

run();
