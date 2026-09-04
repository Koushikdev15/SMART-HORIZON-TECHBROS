import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '@/theme';
import { AppHeader } from '@/components/Header';
import Icon from '@/components/Icon';
import { getProductById, PRODUCTS } from '@/data/mockProducts';
import { productService, BlockchainStatusResult } from '@/services/productService';

export default function BlockchainScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Bridges this screen's demo product catalog to the real chain the same
  // way the suitability check does — by product name, against whatever
  // Supabase actually has recorded for a product with that name. A match
  // failing to appear here is not a bug: it means this exact demo product
  // hasn't gone through the real Fabric pipeline yet.
  const product = getProductById(id || '') || PRODUCTS[0];
  const [blockchain, setBlockchain] = useState<BlockchainStatusResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productService
      .getBlockchainStatus(product.name)
      .then((result) => {
        if (!cancelled) setBlockchain(result);
      })
      .catch(() => {
        if (!cancelled) setBlockchain({ verified: false });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product.name]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader showBack onBackPress={() => router.back()} title="Blockchain Verification" />
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader showBack onBackPress={() => router.back()} title="Blockchain Verification" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={[styles.headerCard, Shadow.md]}>
          <View style={styles.goldBadge}>
            <Icon name="cube" size={32} color={Colors.gold} />
          </View>
          <Text style={styles.statusTitle}>
            {blockchain?.verified ? 'Blockchain Verified ✓' : 'Unverified Record ⚠️'}
          </Text>
          <Text style={styles.networkSub}>{blockchain?.network || 'Not yet recorded on-chain'}</Text>
        </View>

        {/* Technical Ledger Specs — only fields the real Fabric Gateway
            integration actually produces; nothing here is invented when a
            product isn't verified. */}
        <View style={[styles.card, Shadow.sm]}>
          <Text style={styles.cardTitle}>Technical Ledger Data</Text>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Transaction Reference</Text>
            <Text style={styles.fieldValMono}>{blockchain?.transactionRef || 'N/A'}</Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Transaction ID (TX Hash)</Text>
            <Text style={styles.fieldValMono}>{blockchain?.transactionId || 'N/A'}</Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Timestamp</Text>
            <Text style={styles.fieldVal}>{blockchain?.timestamp || 'N/A'}</Text>
          </View>
        </View>

        {/* Immutability Note */}
        <View style={[styles.card, Shadow.sm]}>
          <Text style={styles.cardTitle}>About Blockchain Traceability</Text>
          <Text style={styles.noteText}>
            Every stage of this batch (herb source, lab testing, manufacturing) is cryptographically signed and stored on a decentralized ledger. Records cannot be altered, forged, or backdated.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['2xl'],
  },
  headerCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    alignItems: 'center',
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  goldBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statusTitle: {
    fontFamily: Fonts.family.serifSemiBold,
    fontSize: Fonts.size.lg,
    color: Colors.text,
  },
  networkSub: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.xs + 1,
    color: Colors.gold,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  cardTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.base,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  fieldItem: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  fieldVal: {
    fontFamily: Fonts.family.semiBold,
    fontSize: Fonts.size.xs + 1,
    color: Colors.text,
  },
  fieldValMono: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.xs,
    color: Colors.primary,
    backgroundColor: Colors.cream,
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs + 1,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
