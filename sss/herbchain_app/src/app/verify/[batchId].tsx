import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '@/theme';
import { AppHeader } from '@/components/Header';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import Icon from '@/components/Icon';
import { traceService, type TraceResult } from '@/services/traceService';

/** Small inline status pill — mirrors BlockchainStatusBadge's states, kept
 *  local here since this screen renders it at two different scopes
 *  (product-level and per-batch). */
function BlockchainPill({ status, txId }: { status?: 'PENDING' | 'CONFIRMED' | 'FAILED'; txId?: string }) {
  if (!status) {
    return (
      <View style={[styles.pill, { backgroundColor: Colors.surfaceContainerHigh }]}>
        <Icon name="time-outline" size={12} color={Colors.textMuted} />
        <Text style={[styles.pillText, { color: Colors.textMuted }]}>Not yet on-chain</Text>
      </View>
    );
  }
  const config = {
    PENDING: { icon: 'time-outline' as const, label: 'Pending', bg: Colors.tertiaryFixed, fg: Colors.warning },
    CONFIRMED: { icon: 'checkmark-circle' as const, label: 'Blockchain Verified', bg: Colors.lightGreen, fg: Colors.success },
    FAILED: { icon: 'close-circle' as const, label: 'Blockchain Failed', bg: Colors.errorContainer, fg: Colors.error },
  }[status];
  return (
    <View style={[styles.pill, { backgroundColor: config.bg }]} accessibilityLabel={txId ? `Fabric tx ${txId}` : undefined}>
      <Icon name={config.icon} size={12} color={config.fg} />
      <Text style={[styles.pillText, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
}

export default function VerificationResultScreen() {
  const router = useRouter();
  const { batchId: code } = useLocalSearchParams<{ batchId: string }>();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TraceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    traceService
      .getByCode(code || '')
      .then((r) => {
        if (cancelled) return;
        if (!r.found) {
          router.replace('/qr-not-found' as any);
          return;
        }
        setResult(r);
      })
      .catch(() => {
        if (!cancelled) setError('Could not reach the server. Check your connection and try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader showBack onBackPress={() => router.back()} title="Verifying" />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.verifyingText}>Looking up {code}…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !result?.product) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader showBack onBackPress={() => router.back()} title="Verification" />
        <View style={styles.centerBox}>
          <Icon name="cloud-offline-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.errorText}>{error || 'Something went wrong.'}</Text>
          <SecondaryButton title="Try Again" onPress={() => router.replace(`/verify/${code}` as any)} style={{ marginTop: Spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  const { product, batches = [] } = result;
  const isRecalled = product.status === 'Recalled';

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader showBack onBackPress={() => router.back()} title="Verification Result" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isRecalled && (
          <View style={styles.recallBanner}>
            <Icon name="warning" size={20} color={Colors.white} />
            <Text style={styles.recallText}>This product has been recalled. Do not consume — return it to the point of purchase.</Text>
          </View>
        )}

        {/* Product summary */}
        <View style={[styles.prodCard, Shadow.md]}>
          <View style={styles.prodHeaderRow}>
            <View style={styles.iconBox}>
              <Icon name="medical" size={30} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.prodName}>{product.productName}</Text>
              <Text style={styles.prodMfr}>{product.manufacturerName}</Text>
              <Text style={styles.prodCode}>{product.productCode}</Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <BlockchainPill status={product.blockchainStatus} txId={product.blockchainTxId} />
            {product.blockchainNetwork && (
              <Text style={styles.networkText}>{product.blockchainNetwork}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.metaGrid}>
            {product.category ? <MetaItem label="Category" value={product.category} /> : null}
            {product.formulation ? <MetaItem label="Formulation" value={product.formulation} /> : null}
            {product.manufacturingDate ? <MetaItem label="Manufactured" value={product.manufacturingDate} /> : null}
            {product.expiryDate ? <MetaItem label="Expires" value={product.expiryDate} /> : null}
            {product.mrp ? <MetaItem label="MRP" value={product.mrp} /> : null}
            {product.batchSize ? <MetaItem label="Batch Size" value={product.batchSize} /> : null}
          </View>

          {product.indications ? (
            <Text style={styles.infoLine}><Text style={styles.infoLabel}>Indications: </Text>{product.indications}</Text>
          ) : null}
          {product.contraindications ? (
            <Text style={[styles.infoLine, { color: Colors.error }]}><Text style={styles.infoLabel}>Contraindications: </Text>{product.contraindications}</Text>
          ) : null}
          {product.dosage ? (
            <Text style={styles.infoLine}><Text style={styles.infoLabel}>Dosage: </Text>{product.dosage}</Text>
          ) : null}
        </View>

        {/* Constituent batches — the real provenance chain */}
        {batches.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Traced Back to {batches.length} Harvest{batches.length > 1 ? 'es' : ''}</Text>
            {batches.map((b) => (
              <View key={b.id} style={[styles.batchCard, Shadow.sm]}>
                <View style={styles.batchHeaderRow}>
                  <Icon name="leaf" size={18} color={Colors.primary} />
                  <Text style={styles.batchSpecies}>{b.species}</Text>
                  {b.botanicalName ? <Text style={styles.batchBotanical}>({b.botanicalName})</Text> : null}
                </View>
                <Text style={styles.batchLine}>{b.quantity} {b.unit} · {b.batchNumber}</Text>
                <Text style={styles.batchLine}>
                  <Icon name="person-outline" size={11} color={Colors.textMuted} /> {b.collectorName}
                  {b.collectorType ? ` (${b.collectorType})` : ''}
                </Text>
                <Text style={styles.batchLine}>
                  <Icon name="location-outline" size={11} color={Colors.textMuted} /> {b.region}
                </Text>
                <Text style={styles.batchLine}>
                  <Icon name="calendar-outline" size={11} color={Colors.textMuted} /> Harvested {b.harvestDate}
                </Text>
                {b.labReport?.overallResult && (
                  <Text style={styles.batchLine}>
                    <Icon name="flask-outline" size={11} color={Colors.textMuted} /> Lab result: {b.labReport.overallResult}
                    {b.labReport.labName ? ` — ${b.labReport.labName}` : ''}
                  </Text>
                )}
                <View style={{ marginTop: 6 }}>
                  <BlockchainPill status={b.blockchainStatus} txId={b.blockchainTxId} />
                </View>
              </View>
            ))}
          </>
        )}

        <PrimaryButton
          title="Ask AyurTrace+ About This Product"
          onPress={() => router.push({ pathname: '/copilot', params: { productName: product.productName } } as any)}
          icon="sparkles-outline"
          size="lg"
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  verifyingText: { fontFamily: Fonts.family.medium, fontSize: Fonts.size.sm, color: Colors.textSecondary },
  errorText: { fontFamily: Fonts.family.medium, fontSize: Fonts.size.sm, color: Colors.textSecondary, textAlign: 'center' },
  scrollContent: { paddingHorizontal: Spacing.gutter, paddingBottom: Spacing['3xl'] },
  recallBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  recallText: { flex: 1, color: Colors.white, fontFamily: Fonts.family.semiBold, fontSize: Fonts.size.xs + 1, lineHeight: 17 },
  prodCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  prodHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  iconBox: {
    width: 56, height: 56, borderRadius: BorderRadius.xl,
    backgroundColor: Colors.lightGreen, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  prodName: { fontFamily: Fonts.family.serifSemiBold, fontSize: Fonts.size.lg, color: Colors.text },
  prodMfr: { fontFamily: Fonts.family.medium, fontSize: Fonts.size.sm, color: Colors.textSecondary, marginTop: 1 },
  prodCode: { fontFamily: Fonts.family.medium, fontSize: 11, color: Colors.textMuted, marginTop: 2, letterSpacing: 0.5 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  networkText: { fontFamily: Fonts.family.regular, fontSize: 11, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.outlineVariant, opacity: 0.6, marginVertical: Spacing.md },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.sm },
  metaItem: { minWidth: '40%' },
  metaLabel: { fontFamily: Fonts.family.regular, fontSize: 10.5, color: Colors.textMuted },
  metaValue: { fontFamily: Fonts.family.semiBold, fontSize: Fonts.size.xs + 1, color: Colors.text, marginTop: 1 },
  infoLine: { fontFamily: Fonts.family.regular, fontSize: Fonts.size.xs + 1, color: Colors.textSecondary, marginTop: 6, lineHeight: 18 },
  infoLabel: { fontFamily: Fonts.family.semiBold, color: Colors.text },
  sectionTitle: { fontFamily: Fonts.family.serifSemiBold, fontSize: Fonts.size.base, color: Colors.primary, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  batchCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  batchHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  batchSpecies: { fontFamily: Fonts.family.semiBold, fontSize: Fonts.size.sm, color: Colors.text },
  batchBotanical: { fontFamily: Fonts.family.regular, fontSize: 11, fontStyle: 'italic', color: Colors.textMuted },
  batchLine: { fontFamily: Fonts.family.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: BorderRadius.full, alignSelf: 'flex-start',
  },
  pillText: { fontFamily: Fonts.family.bold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3 },
});
