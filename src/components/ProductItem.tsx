import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { CloudCheck } from 'reicon-react-native/icons/CloudCheck';
import { CloudUpload } from 'reicon-react-native/icons/CloudUpload';
import { AnimatedPressable } from '@/components/Animated';
import { isPending } from '@/db/repositories/products';
import type { Product } from '@/db/schema';
import { colors, formatCOP } from '@/theme';

export function ProductItem({
  product,
  index,
  onPress,
  onLongPress,
}: {
  product: Product;
  index: number;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const pending = isPending(product);

  return (
    // Reanimated: entrada escalonada, salida suave y reacomodo animado al borrar.
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 60).springify().damping(16)}
      exiting={FadeOut.duration(200)}
      layout={LinearTransition.springify().damping(18)}
    >
      <AnimatedPressable onPress={onPress} onLongPress={onLongPress} style={styles.card} scaleTo={0.97}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.detail}>
            {product.quantity} {product.quantity === 1 ? 'unidad' : 'unidades'} ·{' '}
            {formatCOP(product.price)} c/u
          </Text>
          <Text style={styles.subtotal}>
            Subtotal: {formatCOP(product.quantity * product.price)}
          </Text>
        </View>
        <View style={[styles.badge, pending ? styles.badgePending : styles.badgeSynced]}>
          {pending ? (
            <CloudUpload size={16} color={colors.warning} />
          ) : (
            <CloudCheck size={16} color={colors.success} />
          )}
          <Text style={[styles.badgeText, { color: pending ? '#B45309' : '#047857' }]}>
            {pending ? 'Pendiente' : 'En la nube'}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  detail: { fontSize: 13, color: colors.textMuted },
  subtotal: { fontSize: 12, color: colors.textMuted },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgePending: { backgroundColor: colors.warningLight },
  badgeSynced: { backgroundColor: colors.successLight },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
