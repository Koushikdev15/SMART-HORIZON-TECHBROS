import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '@/theme';
import { AppHeader } from '@/components/Header';
import Icon from '@/components/Icon';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api';
import { ebuyService, type PurchaseProduct, type StoreOffer } from '@/services/ebuyService';
import { storeService } from '@/services/storeService';
import { estimateDelivery } from '@/lib/deliveryEstimate';
import { PRODUCTS as TRACED_PRODUCTS } from '@/data/mockProducts';

const NEAREST_STORES_LIMIT = 5;
const DESCRIPTION_PREVIEW_LINES = 3;

type OfferRow = StoreOffer & { distanceKm?: number };

export default function EBuyProductDetailScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const userAddress = useAuthStore((s) => s.user?.address);

  const [product, setProduct] = useState<PurchaseProduct | null>(null);
  const [offers, setOffers] = useState<OfferRow[] | null>(null);
  const [showingNearest, setShowingNearest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);

  // Bridges to the real traceability record for this exact product (same
  // Supabase-sourced data, same by-name matching pattern already used by the
  // suitability/sustainability checks elsewhere in the app) — gives this
  // purchase page access to the real trust score, batch timeline, and lab
  // certification counts without duplicating that data into the commerce
  // catalog's own schema.
  const traced = product ? TRACED_PRODUCTS.find((p) => p.name.toLowerCase() === product.productName.toLowerCase()) : undefined;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const productResult = await ebuyService.getById(productId);
        if (cancelled) return;
        setProduct(productResult);

        // Prefer the nearest 5 stores that actually stock this product, by
        // real distance — falls back to the flat region-matched list below
        // if location permission isn't granted or a fix can't be obtained.
        let nearest: OfferRow[] | null = null;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const nearby = await storeService.findNearby({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              productId,
            });
            nearest = nearby.slice(0, NEAREST_STORES_LIMIT).map((s) => ({
              storeId: s._id,
              storeName: s.name,
              region: s.region,
              address: s.address,
              isOpenNow: s.isOpenNow,
              price: s.inventory?.price,
              quantity: s.inventory?.quantity,
              distanceKm: s.distanceKm,
            }));
          }
        } catch {
          // Location denied/unavailable — fall through to the region-based list.
        }
        if (cancelled) return;

        if (nearest && nearest.length > 0) {
          setOffers(nearest);
          setShowingNearest(true);
        } else {
          const fallback = await ebuyService.getOffers(productId);
          if (cancelled) return;
          setOffers(fallback);
          setShowingNearest(false);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Could not load this product.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  function handleAddToCart(offer: StoreOffer) {
    if (!product || offer.price == null) return;
    addItem(
      {
        productId: product._id,
        productName: product.productName,
        storeId: offer.storeId,
        storeName: offer.storeName,
        storeRegion: offer.region,
        unitPrice: offer.price,
      },
      1
    );
    useToastStore.getState().show(`Added ${product.productName} to cart`, 'success');
  }

  const bestOffer = offers?.find((o) => o.price != null) ?? null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppHeader showBack onBackPress={() => router.back()} title="Product Details" />

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : loadError || !product ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{loadError || 'Product not found.'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={[styles.heroCard, Shadow.md]}>
            <View style={styles.heroTopRow}>
              <View style={styles.imgBox}>
                <Icon name="leaf" size={28} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{product.productName}</Text>
                {traced && <Text style={styles.mfrText}>{traced.manufacturer}</Text>}
              </View>
            </View>

            {product.healthTopics.length > 0 && (
              <View style={styles.topicsRow}>
                {product.healthTopics.map((topic) => (
                  <View key={topic} style={styles.topicChip}>
                    <Text style={styles.topicChipText}>{topic}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.badgeRow}>
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark-circle" size={14} color={Colors.onSecondaryContainer} />
                <Text style={styles.verifiedBadgeText}>Verified Traced Batch</Text>
              </View>
              {traced && (
                <View style={styles.trustBadge}>
                  <Icon name="shield-checkmark" size={14} color={Colors.gold} />
                  <Text style={styles.trustBadgeText}>{traced.trustScore}/100 Trust Score</Text>
                </View>
              )}
            </View>

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.priceValue}>{bestOffer?.price != null ? `₹${bestOffer.price}` : '—'}</Text>
              </View>
              <TouchableOpacity
                style={[styles.heroAddBtn, !bestOffer && styles.heroAddBtnDisabled]}
                onPress={() => bestOffer && handleAddToCart(bestOffer)}
                disabled={!bestOffer}
              >
                <Icon name="cart-outline" size={16} color={Colors.onPrimary} />
                <Text style={styles.heroAddBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Blockchain-secured traceability — the headline novelty */}
          {traced && (
            <View style={[styles.chainCard, Shadow.md]}>
              <View style={styles.chainHeaderRow}>
                <View style={styles.chainIconBadge}>
                  <Icon name="cube" size={20} color={Colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.chainTitle}>Blockchain-Secured Traceability</Text>
                  <Text style={styles.chainSub}>Every stage of this batch is recorded end-to-end, from farm to your cart.</Text>
                </View>
              </View>

              <View style={styles.chainCodeBox}>
                <Icon name="link-outline" size={13} color={Colors.gold} />
                <Text style={styles.chainCodeText}>{traced.batchId}</Text>
              </View>

              <View style={styles.chainStatsRow}>
                <View style={styles.chainStat}>
                  <Text style={styles.chainStatValue}>{traced.timeline.length}</Text>
                  <Text style={styles.chainStatLabel}>Stages Recorded</Text>
                </View>
                <View style={styles.chainStatDivider} />
                <View style={styles.chainStat}>
                  <Text style={styles.chainStatValue}>{traced.labResults.length}</Text>
                  <Text style={styles.chainStatLabel}>Lab Tests</Text>
                </View>
                <View style={styles.chainStatDivider} />
                <View style={styles.chainStat}>
                  <Text style={styles.chainStatValue}>{traced.ingredients.length}</Text>
                  <Text style={styles.chainStatLabel}>Ingredients Traced</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.chainCta}
                onPress={() => router.push(`/product/${traced.id}` as any)}
              >
                <Text style={styles.chainCtaText}>View Full Traceability Record</Text>
                <Icon name="chevron-forward" size={16} color={Colors.onPrimary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Details */}
          <View style={[styles.detailCard, Shadow.sm]}>
            {product.description ? (
              <>
                <Text style={styles.detailText} numberOfLines={descExpanded ? undefined : DESCRIPTION_PREVIEW_LINES}>
                  {product.description}
                </Text>
                <TouchableOpacity onPress={() => setDescExpanded((v) => !v)}>
                  <Text style={styles.readMoreText}>{descExpanded ? 'Show less' : 'Read full report'}</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {product.ingredients.length > 0 && (
              <View style={styles.infoRow}>
                <Icon name="leaf-outline" size={15} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  <Text style={styles.detailLabel}>Ingredients: </Text>
                  {product.ingredients.map((i) => (i.scientificName ? `${i.name} (${i.scientificName})` : i.name)).join(', ')}
                </Text>
              </View>
            )}
            {product.usageInstructions ? (
              <View style={styles.infoRow}>
                <Icon name="information-circle-outline" size={15} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  <Text style={styles.detailLabel}>Usage: </Text>
                  {product.usageInstructions}
                </Text>
              </View>
            ) : null}
            {product.precautions ? (
              <View style={styles.infoRow}>
                <Icon name="alert-circle-outline" size={15} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  <Text style={styles.detailLabel}>Precautions: </Text>
                  {product.precautions}
                </Text>
              </View>
            ) : null}
            {product.contraindications ? (
              <View style={styles.infoRow}>
                <Icon name="warning-outline" size={15} color={Colors.error} />
                <Text style={[styles.infoText, { color: Colors.error }]}>
                  <Text style={styles.detailLabel}>Contraindications: </Text>
                  {product.contraindications}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>{showingNearest ? 'Nearest Stores' : 'Available From'}</Text>
          {!offers || offers.length === 0 ? (
            <Text style={styles.emptyText}>No stores currently stock this product.</Text>
          ) : (
            offers.map((offer) => (
              <View key={offer.storeId} style={styles.offerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.offerStoreName}>{offer.storeName}</Text>
                  <Text style={styles.offerAddress}>{offer.address}</Text>
                  {offer.distanceKm != null && (
                    <View style={styles.deliveryRow}>
                      <Icon name="navigate-outline" size={12} color={Colors.primary} />
                      <Text style={[styles.deliveryText, { color: Colors.primary }]}>{offer.distanceKm} km away</Text>
                    </View>
                  )}
                  {offer.isOpenNow !== null && (
                    <Text style={[styles.offerStatus, { color: offer.isOpenNow ? Colors.secondary : Colors.error }]}>
                      {offer.isOpenNow ? 'Open now' : 'Closed'}
                    </Text>
                  )}
                  {offer.price != null && (
                    <View style={styles.deliveryRow}>
                      <Icon name="bicycle-outline" size={12} color={Colors.textMuted} />
                      <Text style={styles.deliveryText}>{estimateDelivery(offer.region, userAddress)}</Text>
                    </View>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.offerPrice}>{offer.price != null ? `₹${offer.price}` : '—'}</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(offer)} disabled={offer.price == null}>
                    <Text style={styles.addBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <Text style={styles.footerNote}>
            Products are purchased through your cart — add items from any store above, then check out from the cart.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  errorText: { fontFamily: Fonts.family.regular, fontSize: Fonts.size.sm, color: Colors.error, textAlign: 'center' },
  scrollContent: { padding: Spacing.gutter, paddingBottom: Spacing['3xl'] },

  heroCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  imgBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: Fonts.family.serifSemiBold, fontSize: Fonts.size.xl, color: Colors.primary },
  mfrText: { fontFamily: Fonts.family.medium, fontSize: Fonts.size.sm, color: Colors.textSecondary, marginTop: 2 },
  topicsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  topicChip: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  topicChipText: { fontFamily: Fonts.family.medium, fontSize: 11, color: Colors.onSecondaryContainer },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  verifiedBadgeText: { fontFamily: Fonts.family.semiBold, fontSize: 11, color: Colors.onSecondaryContainer },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.tertiaryFixed,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  trustBadgeText: { fontFamily: Fonts.family.semiBold, fontSize: 11, color: Colors.onTertiaryFixedVariant },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceLabel: { fontFamily: Fonts.family.regular, fontSize: 11, color: Colors.textMuted },
  priceValue: { fontFamily: Fonts.family.serifSemiBold, fontSize: Fonts.size['2xl'], color: Colors.primary },
  heroAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
  },
  heroAddBtnDisabled: { backgroundColor: Colors.outlineVariant },
  heroAddBtnText: { fontFamily: Fonts.family.semiBold, fontSize: Fonts.size.sm, color: Colors.onPrimary },

  chainCard: {
    backgroundColor: Colors.darkGreen,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  chainHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
  chainIconBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chainTitle: { fontFamily: Fonts.family.serifSemiBold, fontSize: Fonts.size.md, color: Colors.white },
  chainSub: { fontFamily: Fonts.family.regular, fontSize: 12, color: Colors.lightGreen, marginTop: 2, lineHeight: 16 },
  chainCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: Colors.gold + '50',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    marginBottom: Spacing.md,
  },
  chainCodeText: { fontFamily: Fonts.family.semiBold, fontSize: 12, color: Colors.gold, letterSpacing: 0.5 },
  chainStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  chainStat: { flex: 1, alignItems: 'center' },
  chainStatValue: { fontFamily: Fonts.family.bold, fontSize: Fonts.size.lg, color: Colors.white },
  chainStatLabel: { fontFamily: Fonts.family.regular, fontSize: 10, color: Colors.lightGreen, marginTop: 2, textAlign: 'center' },
  chainStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },
  chainCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 12,
  },
  chainCtaText: { fontFamily: Fonts.family.semiBold, fontSize: Fonts.size.sm, color: Colors.onPrimary },

  detailCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  detailText: { fontFamily: Fonts.family.regular, fontSize: Fonts.size.sm, color: Colors.textSecondary, marginBottom: 4, lineHeight: 20 },
  readMoreText: { fontFamily: Fonts.family.semiBold, fontSize: 12, color: Colors.primary, marginBottom: Spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: Spacing.sm },
  infoText: { flex: 1, fontFamily: Fonts.family.regular, fontSize: Fonts.size.sm, color: Colors.textSecondary, lineHeight: 19 },
  detailLabel: { fontFamily: Fonts.family.semiBold, color: Colors.onSurface },
  sectionTitle: {
    fontFamily: Fonts.family.serifSemiBold,
    fontSize: Fonts.size.md,
    color: Colors.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  emptyText: { fontFamily: Fonts.family.regular, fontSize: Fonts.size.sm, color: Colors.textMuted, paddingVertical: Spacing.md },
  offerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  offerStoreName: { fontFamily: Fonts.family.semiBold, fontSize: Fonts.size.sm, color: Colors.onSurface },
  offerAddress: { fontFamily: Fonts.family.regular, fontSize: Fonts.size.xs, color: Colors.textMuted, marginTop: 1 },
  offerStatus: { fontFamily: Fonts.family.regular, fontSize: 11, marginTop: 2 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  deliveryText: { fontFamily: Fonts.family.regular, fontSize: 11, color: Colors.textMuted },
  offerPrice: { fontFamily: Fonts.family.semiBold, fontSize: Fonts.size.sm, color: Colors.primary },
  addBtn: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  addBtnText: { fontFamily: Fonts.family.semiBold, fontSize: 11, color: Colors.onPrimary },
  footerNote: {
    fontFamily: Fonts.family.regular,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
    textAlign: 'center',
    lineHeight: 15,
  },
});
