import fs from 'fs/promises';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import Accessory from '../models/Accessory.js';

dotenv.config();

const inputPaths = [
  '/Users/prajwalkamdi/Desktop/fairytales/FairyTails_PetShop/json/dog_collor_leash.json',
];

const DEFAULT_IMAGE =
  'https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770289827/Untitled_design_5_uondnk.svg';

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
  if (!str || str.toLowerCase() === 'n/a') return null;

  const normalized = str.includes(' ') ? str.replace(' ', 'T') : str;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getAccessoryType = (value) => {
  const normalized = String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (normalized.includes('collar') || normalized.includes('leash')) return 'collar-leash';
  return undefined;
};

const toAccessoryDocument = (row) => {
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

  const baseUnit = String(row['Base Unit (x)'] ?? 'PIECES').trim().toLowerCase() || 'pieces';
  const saleDiscount = Number((mrp - discountPrice).toFixed(2));

  return {
    category: 'accessories',
    subCategory: 'dog',
    productType: getAccessoryType(row['Category']),
    subSubCategory: getAccessoryType(row['Category']),
    productName,
    mrp,
    discountPrice,
    discountType: String(row['Sale Discount'] ?? 'Discount Amount').trim() || 'Discount Amount',
    availableStock: toNumber(row['Current stock quantity'], 0),
    expiryDate: parseExpiryDate(row['Expiry Date']),
    taxes: parseTaxPercent(taxRateLabel),
    baseUnit,
    images: [DEFAULT_IMAGE],
    itemCode: row['Item code'] != null ? String(row['Item code']).trim() : undefined,
    hsn: row['HSN'] != null ? String(row['HSN']).trim() : undefined,
    productDetails: row['Description'] ? [String(row['Description']).trim()] : [],
    keyFeatures: [],
    saleDiscount: saleDiscount > 0 ? saleDiscount : 0,
    taxRateLabel,
    inclusiveOfTax,
  };
};

const run = async () => {
  try {
    await connectDB();

    const allRows = [];
    for (const path of inputPaths) {
      const content = await fs.readFile(path, 'utf-8');
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        throw new Error(`Input JSON must be an array: ${path}`);
      }
      allRows.push(...parsed);
    }

    const documents = allRows
      .map(toAccessoryDocument)
      .filter((doc) => doc.productName.length > 0);

    const productNames = documents.map((doc) => doc.productName);
    const deleted = await Accessory.deleteMany({
      category: 'accessories',
      subCategory: 'dog',
      productName: { $in: productNames },
    });
    const inserted = await Accessory.insertMany(documents);

    console.log(`Deleted existing matching dog accessories: ${deleted.deletedCount}`);
    console.log(`Seeded dog accessories: ${inserted.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Dog accessories seed failed:', error.message);
    process.exit(1);
  }
};

run();
