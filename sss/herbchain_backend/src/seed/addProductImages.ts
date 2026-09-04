import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';
import logger from '../utils/logger';

/**
 * One-off upsert of packaging images (public/product-images/, rendered from
 * the manufacturer-supplied PDFs) onto the matching real Product documents —
 * matched by name, same convention as addSafetyData.ts. Only 15 of the 20
 * safety-dataset products have packaging art; the rest are left with no
 * images rather than a placeholder that would misrepresent them as branded.
 *
 * Usage: npx tsx src/seed/addProductImages.ts
 */

const FILE_TO_PRODUCT_NAME: Record<string, string> = {
  Aloe_Vera_Digestive_Juice: 'Aloe Vera Digestive Juice',
  Amla_Antioxidant_Capsules: 'Amla Antioxidant Capsules',
  Amla_Immunity_Juice: 'Amla Immunity Juice',
  Ashwagandha_Herbal_Tea: 'Ashwagandha Herbal Tea',
  Ashwagandha_Recovery_Capsules: 'Ashwagandha Recovery Capsules',
  Ashwagandha_Stress_Relief_Powder: 'Ashwagandha Stress Relief Powder',
  Brahmi_Brain_Wellness_Syrup: 'Brahmi Brain Wellness Syrup',
  Brahmi_Memory_Support_Capsules: 'Brahmi Memory Support Capsules',
  Cinnamon_Digestive_Tea: 'Cinnamon Digestive Tea',
  FLOWTEST_Polyherbal_Capsules: 'FLOWTEST Polyherbal Capsules',
  Neem_Herbal_Soap: 'Neem Herbal Soap',
  Shatavari_Herbal_Tea: 'Shatavari Herbal Tea',
  Shatavari_Wellness_Powder: 'Shatavari Wellness Powder',
  Shatavari_Women_s_Health_Capsules: "Shatavari Women's Health Capsules",
  Turmeric_Curcumin_Powder: 'Turmeric Curcumin Powder',
};

async function main() {
  dotenv.config();
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/herbchain';
  await mongoose.connect(mongoUri);
  logger.info(`Connected to ${mongoUri}`);

  let updated = 0;
  let notFound = 0;

  for (const [fileBase, productName] of Object.entries(FILE_TO_PRODUCT_NAME)) {
    const images = [`/product-images/${fileBase}__page1.jpg`, `/product-images/${fileBase}__page2.jpg`];
    const escaped = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const product = await Product.findOne({ productName: new RegExp(`^${escaped}$`, 'i') });

    if (!product) {
      logger.warn(`No product found for: ${productName}`);
      notFound++;
      continue;
    }

    product.images = images;
    await product.save();
    logger.info(`Set images for: ${productName}`);
    updated++;
  }

  logger.info(`Done. Updated ${updated}, not found ${notFound}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error('addProductImages failed:', err);
  process.exit(1);
});
