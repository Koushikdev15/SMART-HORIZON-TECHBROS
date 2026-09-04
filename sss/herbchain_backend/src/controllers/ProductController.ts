import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';
import { SuitabilityService } from '../services/SuitabilityService';
import { StoreService } from '../services/StoreService';
import { BlockchainStatusService } from '../services/BlockchainStatusService';
import { TraceService } from '../services/TraceService';
import { sendResponse } from '../utils/response';
import { createProductSchema, suitabilitySchema } from '../validators/productValidator';
import { AuthRequest } from '../middleware/authMiddleware';
import { SupabaseAuthRequest } from '../middleware/supabaseAuthMiddleware';

export class ProductController {
  private productService = new ProductService();
  private suitabilityService = new SuitabilityService();
  private storeService = new StoreService();
  private blockchainStatusService = new BlockchainStatusService();
  private traceService = new TraceService();

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { error, value } = createProductSchema.validate(req.body);
      if (error) {
        return sendResponse(res, 400, false, 'Validation Error', undefined, error.details);
      }
      const result = await this.productService.create(req.user.id, value);
      return sendResponse(res, 201, true, 'Product created', result);
    } catch (err) {
      next(err);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, healthTopic, ingredient } = req.query as Record<string, string>;
      const result = await this.productService.search({ q, healthTopic, ingredient });
      return sendResponse(res, 200, true, 'Products fetched', result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productService.getById(req.params.id as string);
      return sendResponse(res, 200, true, 'Product fetched', result);
    } catch (err) {
      next(err);
    }
  };

  browseForPurchase = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, healthTopic, region, id } = req.query as Record<string, string>;
      const result = await this.productService.browseForPurchase({ q, healthTopic, region, id });
      return sendResponse(res, 200, true, 'Products fetched', result);
    } catch (err) {
      next(err);
    }
  };

  getOffers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region } = req.query as Record<string, string>;
      const result = await this.storeService.listOffers(req.params.id as string, region);
      return sendResponse(res, 200, true, 'Offers fetched', result);
    } catch (err) {
      next(err);
    }
  };

  getByQrCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productService.getByQrCode(req.params.qrCode as string);
      return sendResponse(res, 200, true, 'Product fetched', result);
    } catch (err) {
      next(err);
    }
  };

  checkSuitability = async (req: SupabaseAuthRequest, res: Response, next: NextFunction) => {
    try {
      const { error, value } = suitabilitySchema.validate(req.body);
      if (error) {
        return sendResponse(res, 400, false, 'Validation Error', undefined, error.details);
      }
      const result = await this.suitabilityService.check(req.supabaseUser!.id, value);
      return sendResponse(res, 200, true, 'Suitability check complete', result);
    } catch (err) {
      next(err);
    }
  };

  getTrace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.params.code as string;
      const result = await this.traceService.getByProductCode(code);
      if (!result.found) {
        return sendResponse(res, 404, false, 'No product found for this code', undefined, [
          { message: `No traced product found for code "${code}"` },
        ]);
      }
      return sendResponse(res, 200, true, 'Trace fetched', result);
    } catch (err) {
      next(err);
    }
  };

  getBlockchainStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.query as Record<string, string>;
      if (!name) {
        return sendResponse(res, 400, false, 'Validation Error', undefined, [{ message: 'name query param is required' }]);
      }
      const result = await this.blockchainStatusService.getByProductName(name);
      return sendResponse(res, 200, true, 'Blockchain status fetched', result);
    } catch (err) {
      next(err);
    }
  };

  getSustainability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = suitabilitySchema.validate(req.body);
      if (error) {
        return sendResponse(res, 400, false, 'Validation Error', undefined, error.details);
      }
      const result = await this.productService.getSustainability(value);
      return sendResponse(res, 200, true, 'Sustainability score computed', result);
    } catch (err) {
      next(err);
    }
  };
}
