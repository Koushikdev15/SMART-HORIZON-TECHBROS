import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';
import logger from '../utils/logger';

/**
 * One-off/idempotent upsert of the curated safety+sustainability dataset
 * (src/seed/data/ayurtrace_products_safety_sustainability.csv) onto real
 * Product documents — creating them if a product with that exact name
 * doesn't exist yet, updating the safety fields if it does.
 *
 * Unlike seedProducts.ts's seedIfEmpty() (which only ever runs once, against
 * an empty collection), this is meant to be re-run directly:
 *   npx tsx src/seed/addSafetyData.ts
 *
 * Negatives/Not Recommended For are folded into precautions/contraindications
 * so the existing relevance-aware checks in ChatSafetyService.ts and the
 * risk-scoring in SuitabilityService.ts pick them up without new matching
 * logic — the raw CSV fields are also kept on their own columns for display.
 */

type CsvRow = {
  'Product Name': string;
  'Dosage Form': string;
  Positives: string;
  Negatives: string;
  'Age-Based Usage': string;
  'Not Recommended For': string;
  Sustainability: string;
  'Safety / Data Note': string;
};

const HERB_INFO: Record<string, { scientificName: string; healthTopics: string[] }> = {
  ashwagandha: { scientificName: 'Withania somnifera', healthTopics: ['Stress', 'Sleep', 'Energy'] },
  shatavari: { scientificName: 'Asparagus racemosus', healthTopics: ["Women's Health", 'Digestion'] },
  amla: { scientificName: 'Phyllanthus emblica', healthTopics: ['Immunity', 'Digestion'] },
  turmeric: { scientificName: 'Curcuma longa', healthTopics: ['Joint & Muscle Health', 'Immunity'] },
  brahmi: { scientificName: 'Bacopa monnieri', healthTopics: ['Focus', 'Memory', 'Stress'] },
  neem: { scientificName: 'Azadirachta indica', healthTopics: ['Skin Health', 'Detox'] },
  cinnamon: { scientificName: 'Cinnamomum verum', healthTopics: ['Digestion'] },
  'aloe vera': { scientificName: 'Aloe barbadensis', healthTopics: ['Digestion', 'Skin Health'] },
};

function inferIngredientsAndTopics(productName: string): { ingredients: { name: string; scientificName?: string }[]; healthTopics: string[] } {
  const lower = productName.toLowerCase();
  const matches = Object.keys(HERB_INFO).filter((herb) => lower.includes(herb));

  if (matches.length === 0) {
    // e.g. "FLOWTEST Polyherbal Capsules" — an unspecified multi-herb blend,
    // matching the CSV's own safety note that the ingredient list is unknown.
    return { ingredients: [{ name: 'Polyherbal blend (unspecified)' }], healthTopics: ['General Wellness'] };
  }

  const ingredients = matches.map((herb) => ({
    name: herb.replace(/\b\w/g, (c) => c.toUpperCase()),
    scientificName: HERB_INFO[herb].scientificName,
  }));
  const healthTopics = [...new Set(matches.flatMap((herb) => HERB_INFO[herb].healthTopics))];

  if (lower.includes('skin')) healthTopics.push('Skin Health');
  if (lower.includes('digestive')) healthTopics.push('Digestion');
  if (lower.includes('immunity')) healthTopics.push('Immunity');

  return { ingredients, healthTopics: [...new Set(healthTopics)] };
}

const USAGE_BY_FORM: Record<string, string> = {
  'Powder / Churna': 'Take as directed on the product label, typically 1/2 to 1 teaspoon with warm water or milk.',
  Capsule: 'Take as directed on the product label, typically 1 capsule with meals.',
  Syrup: 'Take as directed on the product label, typically 1-2 teaspoons with water.',
  Bhasma: 'Use as directed on the product label.',
  'Oil / Talia': 'Apply externally as directed on the product label; patch-test first.',
};

const PRICE_BY_FORM: Record<string, number> = {
  'Powder / Churna': 179,
  Capsule: 249,
  Syrup: 199,
  Bhasma: 89,
  'Oil / Talia': 229,
};

async function main() {
  dotenv.config();
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/herbchain';
  await mongoose.connect(mongoUri);
  logger.info(`Connected to ${mongoUri}`);

  const raw = fs.readFileSync(path.join(__dirname, 'data', 'ayurtrace_products_safety_sustainability.csv'), 'utf-8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true }) as CsvRow[];

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const productName = row['Product Name'];
    const dosageForm = row['Dosage Form'];
    const { ingredients, healthTopics } = inferIngredientsAndTopics(productName);

    const precautions = [row.Negatives, row['Safety / Data Note']].filter(Boolean).join(' ');
    const contraindications = [row['Not Recommended For'], row['Age-Based Usage']].filter(Boolean).join(' ');

    const fields = {
      productName,
      ingredients,
      healthTopics,
      description: row.Positives,
      usageInstructions: USAGE_BY_FORM[dosageForm] ?? 'Take as directed on the product label.',
      precautions,
      contraindications,
      positives: row.Positives,
      negatives: row.Negatives,
      ageBasedUsage: row['Age-Based Usage'],
      notRecommendedFor: row['Not Recommended For'],
      sustainabilityNote: row.Sustainability,
      safetyNote: row['Safety / Data Note'],
    };

    const existing = await Product.findOne({ productName: new RegExp(`^${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (existing) {
      Object.assign(existing, fields);
      await existing.save();
      updated++;
      logger.info(`Updated: ${productName}`);
    } else {
      await Product.create({
        ...fields,
        batchIds: [],
        qrCode: `QR-SAFETY-${created + 1}`.padEnd(12, '0'),
        // price isn't a Product field yet elsewhere in the schema; ProductInventory
        // (not created here) is what actually prices a listing per-store.
      });
      created++;
      logger.info(`Created: ${productName}`);
    }
    void PRICE_BY_FORM; // reserved for a future ProductInventory listing pass
  }

  logger.info(`Done. Created ${created}, updated ${updated} of ${rows.length} products.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error('addSafetyData failed:', err);
  process.exit(1);
});
