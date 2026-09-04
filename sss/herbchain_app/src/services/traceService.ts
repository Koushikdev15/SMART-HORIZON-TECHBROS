import { apiRequest, ApiError } from '@/lib/api';

export interface TracedBatch {
  id: string;
  batchNumber: string;
  species: string;
  botanicalName?: string;
  quantity: number;
  unit: string;
  collectionCenter: string;
  collectorName: string;
  collectorType?: string;
  harvestDate: string;
  region: string;
  status: string;
  labReport?: {
    moisture?: number;
    dnaAuthentication?: string;
    pesticides?: string;
    overallResult?: string;
    labName?: string;
    certificateNumber?: string;
  };
  blockchainTxId?: string;
  blockchainStatus?: 'PENDING' | 'CONFIRMED' | 'FAILED';
  blockchainNetwork?: string;
}

export interface TracedProductComponent {
  batchId: string;
  species: string;
  botanicalName?: string;
  quantityUsed: number;
  unit: string;
  collectorName: string;
  region: string;
  harvestDate: string;
  batchNumber: string;
  labCertificate?: string;
}

export interface TracedProduct {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  formulation?: string;
  components: TracedProductComponent[];
  manufacturerName: string;
  manufacturingDate: string;
  expiryDate: string;
  batchSize?: string;
  dosage?: string;
  indications?: string;
  contraindications?: string;
  mrp?: string;
  status: string;
  blockchainTxId?: string;
  blockchainStatus?: 'PENDING' | 'CONFIRMED' | 'FAILED';
  blockchainNetwork?: string;
}

export interface TracedPayment {
  id: string;
  stage: string;
  amount: number;
}

export interface TraceResult {
  found: boolean;
  product?: TracedProduct;
  batches?: TracedBatch[];
  payments?: TracedPayment[];
}

export const traceService = {
  /** Real Supabase-backed product lookup by product code — the same query
   *  herbchain_web's public /verify/:code page runs, exposed for the mobile
   *  app's QR scanner and manual entry so both show real data natively. */
  async getByCode(code: string): Promise<TraceResult> {
    try {
      return await apiRequest(`/products/trace/${encodeURIComponent(code)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return { found: false };
      throw err;
    }
  },
};
