import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';
import logger from '../utils/logger';

/**
 * One-off: sets a single generic, clearly-labelled illustration (not real
 * packaging photography — see public/product-images/*.jpg headers) on the
 * handful of products that have no source PDF to extract a real photo from.
 * Every other product uses addProductImages.ts's real packaging renders;
 * this only covers the gap.
 *
 * Usage: npx tsx src/seed/addPlaceholderImages.ts
 */

const PLACEHOLDER_BY_NAME: Record<string, string> = {
  'Turmeric Wellness Capsules': '/product-images/turmeric-wellness-capsules.jpg',
  'Turmeric Golden Milk Mix': '/product-images/turmeric-golden-milk-mix.jpg',
  'Aloe Vera Skin Care Gel': '/product-images/aloe-vera-skin-care-gel.jpg',
  'Aloe Vera Herbal Gel': '/product-images/aloe-vera-herbal-gel.jpg',
  'Amla Herbal Powder': '/product-images/amla-herbal-powder.jpg',
  'Amla Digestive Tea': '/product-images/amla-digestive-tea.jpg',
};

async function main() {
  dotenv.config();
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/herbchain';
  await mongoose.connect(mongoUri);
  logger.info(`Connected to ${mongoUri}`);

  let updated = 0;
  for (const [name, imagePath] of Object.entries(PLACEHOLDER_BY_NAME)) {
    const product = await Product.findOne({ productName: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (!product) {
      logger.warn(`No product found for: ${name}`);
      continue;
    }
    if (product.images?.length) {
      logger.info(`Already has images, skipping: ${name}`);
      continue;
    }
    product.images = [imagePath];
    await product.save();
    logger.info(`Set placeholder image for: ${name}`);
    updated++;
  }

  logger.info(`Done. Updated ${updated}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error('addPlaceholderImages failed:', err);
  process.exit(1);
});
