import { IProduct } from '../models/Product';
import { ProductService } from './ProductService';
import { DoctorGuidanceService } from './DoctorGuidanceService';
import {
  findAllergyConflicts,
  hasRelevantContraindication,
  hasRelevantMedicationInteraction,
  AllergyMatch,
  HealthProfileLike,
} from './ChatSafetyService';
import { supabaseAdmin } from '../lib/supabaseAdmin';

type FullHealthProfile = HealthProfileLike & {
  conditions?: string[];
  medicalHistoryTags?: string[];
  currentMedicationTags?: string[];
};

// Health profiles now live in Supabase (public.customer_wellness) — see
// herbchain_app/supabase/migrations/0005_customer_wellness.sql. userId is the
// Supabase auth.users UUID.
async function fetchHealthProfile(userId: string): Promise<FullHealthProfile | null> {
  const { data } = await supabaseAdmin.from('customer_wellness').select('*').eq('user_id', userId).maybeSingle();
  if (!data) return null;
  return {
    ingredientAllergies: data.ingredient_allergies ?? [],
    currentMedications: data.current_medications ?? undefined,
    pregnancyStatus: data.pregnancy_status ?? undefined,
    conditions: data.conditions ?? [],
    medicalHistoryTags: data.medical_history_tags ?? [],
    currentMedicationTags: data.current_medication_tags ?? [],
  };
}

// Weighted keyword scan over a product's own documented negatives/safety
// notes — a genuinely product-specific signal from the curated safety
// dataset (seed/data/ayurtrace_products_safety_sustainability.csv), so two
// products landing in the same verdict category still separate on severity
// instead of collapsing to the exact same score.
const HIGH_SEVERITY_TERMS = ['liver injury', 'electrolyte', 'dehydration', 'bleeding risk', 'increase bleeding', 'kidney disease'];
const MODERATE_SEVERITY_TERMS = ['interact', 'thyroid', 'autoimmune', 'diarrhea', 'cramp', 'dermatitis', 'coumarin'];
const LOW_SEVERITY_TERMS = ['stomach upset', 'nausea', 'drowsiness', 'irritat', 'discomfort'];

function scoreSeverity(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  if (HIGH_SEVERITY_TERMS.some((t) => lower.includes(t))) score += 20;
  if (MODERATE_SEVERITY_TERMS.some((t) => lower.includes(t))) score += 10;
  if (LOW_SEVERITY_TERMS.some((t) => lower.includes(t))) score += 5;
  return score;
}

async function fetchRegion(userId: string): Promise<string | undefined> {
  const { data } = await supabaseAdmin.from('app_login').select('region').eq('id', userId).maybeSingle();
  return data?.region ?? undefined;
}

// Deliberately a separate, narrower vocabulary from the chatbot's internal
// ResponseCategory — this is the direct product-suitability check from spec
// §6, which explicitly avoids absolute language ("100% safe") in favor of:
// "No known conflict detected / Potential concern / High-risk match /
// Insufficient information."
export type SuitabilityVerdict = 'NO_KNOWN_CONFLICT' | 'POTENTIAL_CONCERN' | 'HIGH_RISK_MATCH' | 'INSUFFICIENT_INFORMATION';

// A composite 0-100 personal health-risk score, additive alongside the
// categorical verdict above (not a replacement) — higher means riskier,
// the inverse of TrustScore's provenance-trust semantics elsewhere in the app.
export type RiskBand = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';

// The score has to come from the *interplay* of this user's profile and this
// product's data, not from the product's generic "this class of herb carries
// these general risks" text alone — a product with a scary-sounding negatives
// blurb that matches nothing on this user's profile (NO_KNOWN_CONFLICT) must
// not outscore a genuinely relevant match, and two users looking at the same
// product should get different scores when their profiles differ. severityScore
// (the product's own documented severity) is folded in only on the two verdicts
// that mean something on this profile actually matched something on this
// product — never as a flat addition regardless of relevance.
function computeRiskScore(
  verdict: SuitabilityVerdict,
  hasHealthProfile: boolean,
  hasIngredientData: boolean,
  guidanceCount: number,
  severityScore: number,
  allergyMatchCount: number,
  concernSignalCount: number
): { riskScore: number; riskBand: RiskBand } {
  let score: number;
  if (verdict === 'HIGH_RISK_MATCH') {
    // Base risk for a confirmed ingredient allergy, escalating with how many
    // of the product's own ingredients matched a declared allergy.
    score = 55 + Math.min(25, (allergyMatchCount - 1) * 10) + severityScore;
  } else if (verdict === 'POTENTIAL_CONCERN') {
    // Base risk for an overlap with a declared condition/pregnancy status or
    // medication, escalating when both kinds of overlap were found.
    score = 25 + Math.max(0, concernSignalCount - 1) * 10 + severityScore;
  } else if (verdict === 'INSUFFICIENT_INFORMATION') {
    score = 20;
  } else {
    // NO_KNOWN_CONFLICT: nothing on this user's own profile matched anything
    // documented on this product — the product's generic risk text doesn't
    // apply to them, so it shouldn't move their personal score.
    score = 0;
  }

  if (!hasHealthProfile) score += 15;
  if (!hasIngredientData) score += 10;
  if (guidanceCount === 0) score += 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const riskBand: RiskBand = score >= 80 ? 'HIGH' : score >= 50 ? 'ELEVATED' : score >= 20 ? 'MODERATE' : 'LOW';
  return { riskScore: score, riskBand };
}

const VERDICT_LABELS: Record<SuitabilityVerdict, string> = {
  NO_KNOWN_CONFLICT: 'No known conflict detected',
  POTENTIAL_CONCERN: 'Potential concern',
  HIGH_RISK_MATCH: 'High-risk match',
  INSUFFICIENT_INFORMATION: 'Insufficient information',
};

function buildExplanation(
  verdict: SuitabilityVerdict,
  product: IProduct,
  allergyConflicts: AllergyMatch[]
): string {
  if (verdict === 'HIGH_RISK_MATCH') {
    const allergens = [...new Set(allergyConflicts.map((c) => c.matchedAllergy))].join(', ');
    return (
      `Your health profile indicates an allergy to ${allergens}, which is an ingredient in ${product.productName}. ` +
      `Avoid using this product and consult a qualified healthcare professional.`
    );
  }
  if (verdict === 'POTENTIAL_CONCERN') {
    const reason = product.notRecommendedFor || product.contraindications;
    return (
      `${product.productName}'s documented restrictions overlap with something on your health profile: "${reason}". ` +
      `Review this against your own situation and consult a doctor if you're unsure.`
    );
  }
  if (verdict === 'INSUFFICIENT_INFORMATION') {
    return "We don't have enough verified ingredient or health-profile information to assess this product's suitability safely.";
  }
  return (
    `No recorded ingredient allergy in your health profile matches ${product.productName}'s listed ingredients. ` +
    `This is not a guarantee of safety for every individual — consult a doctor if you have concerns.`
  );
}

export class SuitabilityService {
  private productService = new ProductService();
  private guidanceService = new DoctorGuidanceService();

  async check(userId: string, identifier: { productId?: string; productName?: string }) {
    const product = await this.productService.resolve(identifier);
    const [healthProfile, region] = await Promise.all([fetchHealthProfile(userId), fetchRegion(userId)]);

    const allergyConflicts = findAllergyConflicts(product, healthProfile);
    const hasIngredientData = product.ingredients.length > 0;

    // Relevance-aware, not "this product happens to have contraindication
    // text on file" (true of nearly every real herbal product, which is why
    // every product previously landed on the same verdict/score regardless
    // of whether any of it actually applied to this specific user).
    const hasContraindicationConcern = hasRelevantContraindication([product], healthProfile);
    const hasMedicationConcern = hasRelevantMedicationInteraction([product], healthProfile);
    const concernSignalCount = [hasContraindicationConcern, hasMedicationConcern].filter(Boolean).length;

    let verdict: SuitabilityVerdict;
    if (allergyConflicts.length > 0) {
      verdict = 'HIGH_RISK_MATCH';
    } else if (concernSignalCount > 0) {
      verdict = 'POTENTIAL_CONCERN';
    } else if (!hasIngredientData && !healthProfile) {
      verdict = 'INSUFFICIENT_INFORMATION';
    } else {
      verdict = 'NO_KNOWN_CONFLICT';
    }

    const guidance = await this.guidanceService.findPublished({ productId: String(product._id), region });
    const severityScore = scoreSeverity(`${product.negatives ?? ''} ${product.safetyNote ?? ''}`);
    const { riskScore, riskBand } = computeRiskScore(
      verdict,
      Boolean(healthProfile),
      hasIngredientData,
      guidance.length,
      severityScore,
      allergyConflicts.length,
      concernSignalCount
    );

    return {
      product,
      verdict,
      verdictLabel: VERDICT_LABELS[verdict],
      explanation: buildExplanation(verdict, product, allergyConflicts),
      riskScore,
      riskBand,
      allergyConflicts,
      hasHealthProfile: Boolean(healthProfile),
      doctorGuidance: guidance.map((g) => ({
        guidanceId: String(g.guidance._id),
        title: g.version.title,
        doctorName: g.doctor.name,
      })),
    };
  }
}
