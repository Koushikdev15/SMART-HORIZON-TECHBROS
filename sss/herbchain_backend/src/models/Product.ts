import mongoose, { Schema, Document } from 'mongoose';

export interface IProductIngredient {
  name: string;
  scientificName?: string;
}

export interface IProduct extends Document {
  productName: string;
  batchIds: mongoose.Types.ObjectId[];
  /** Optional: unset for products synced in from the traceability portal's
   *  own Supabase-backed records, which have no corresponding Mongo Batch/
   *  User to reference — see herbchain_backend/scripts/sync-traced-products.ts. */
  manufacturerId?: mongoose.Types.ObjectId;
  /** Real manufacturer name, for products that only have a name (from the
   *  traceability portal) and no linked Mongo manufacturerId. */
  manufacturerName?: string;
  /** The traceability portal's own product code (e.g. "AYUR-PRD-XXXXXX"),
   *  for products synced in from there — lets the app link back to the real
   *  public trace/verify page. */
  tracedProductCode?: string;
  qrCode?: string;
  fabricTxHash?: string;

  // Ayurvedic-product content — used by the chatbot's RAG retrieval and
  // allergy/ingredient safety checking (matched against HealthProfile
  // allergies/ingredientAllergies by name).
  ingredients: IProductIngredient[];
  /** Documented traditional uses/topics this product is relevant to, e.g. ["Digestion", "Stress"]. */
  healthTopics: string[];
  description?: string;
  usageInstructions?: string;
  precautions?: string;
  contraindications?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    productName: { type: String, required: true },
    batchIds: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
    manufacturerId: { type: Schema.Types.ObjectId, ref: 'User' },
    manufacturerName: { type: String },
    tracedProductCode: { type: String },
    qrCode: { type: String },
    fabricTxHash: { type: String },

    ingredients: [
      {
        name: { type: String, required: true },
        scientificName: { type: String },
      },
    ],
    healthTopics: { type: [String], default: [] },
    description: { type: String },
    usageInstructions: { type: String },
    precautions: { type: String },
    contraindications: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ productName: 'text', healthTopics: 'text', 'ingredients.name': 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
