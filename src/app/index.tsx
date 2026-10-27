import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logout } from 'reicon-react-native/icons/Logout';
import { Plus } from 'reicon-react-native/icons/Plus';
import { Refresh } from 'reicon-react-native/icons/Refresh';
import { Package } from 'reicon-react-native/icons/Package';
import { AnimatedEntrance, AnimatedPressable, AnimatedPulse } from '@/components/Animated';
import { ProductItem } from '@/components/ProductItem';
import { useAuth } from '@/context/AuthContext';
import { productsRepo } from '@/db/repositories/products';
import type { Product } from '@/db/schema';
import { useProducts } from '@/hooks/useProducts';
import { useSync } from '@/hooks/useSync';
import { colors, formatCOP } from '@/theme';

export default function InventarioScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { products, totalUnits, totalValue, pendingCount } = useProducts();
  const { sync, syncing, message } = useSync();

  const confirmDelete = (product: Product) => {
    Alert.alert('Eliminar producto', `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => productsRepo.remove(product.id) },
    ]);
  };

  const confirmSignOut = () => {
    Alert.alert('Cerrar sesión', 'Tus productos seguirán guardados en este teléfono.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <AnimatedEntrance type="slideDown" style={styles.topBar}>
        <View style={styles.flex}>
          <Text style={styles.title}>Mi Tienda</Text>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
        <AnimatedPressable onPress={confirmSignOut} style={styles.iconButton}>
          <Logout size={20} color={colors.textMuted} />
        </AnimatedPressable>
      </AnimatedEntrance>

      <AnimatedEntrance delay={100} style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Unidades</Text>
          <Text style={styles.statValue}>{totalUnits}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Valor del inventario</Text>
          <Text style={styles.statValue}>{formatCOP(totalValue)}</Text>
        </View>
        <View style={[styles.statCard, pendingCount > 0 && styles.statPending]}>
          <Text style={styles.statLabel}>Pendientes</Text>
          <Text style={[styles.statValue, pendingCount > 0 && { color: '#B45309' }]}>{pendingCount}</Text>
        </View>
      </AnimatedEntrance>

      <AnimatedPulse active={pendingCount > 0 && !syncing}>
        <AnimatedPressable onPress={sync} disabled={syncing} style={styles.syncButton}>
          {syncing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Refresh size={18} color="#FFFFFF" />
              <Text style={styles.syncText}>Sincronizar</Text>
            </>
          )}
        </AnimatedPressable>
      </AnimatedPulse>

      {message ? (
        <AnimatedEntrance
          key={message.text}
          type="fade"
          style={[styles.message, message.kind === 'ok' ? styles.messageOk : styles.messageError]}
        >
          <Text style={[styles.messageText, { color: message.kind === 'ok' ? '#047857' : '#B91C1C' }]}>
            {message.text}
          </Text>
        </AnimatedEntrance>
      ) : null}

      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 96 }]}
        renderItem={({ item, index }) => (
          <ProductItem
            product={item}
            index={index}
            onPress={() => router.push({ pathname: '/producto', params: { id: String(item.id) } })}
            onLongPress={() => confirmDelete(item)}
          />
        )}
        ListEmptyComponent={
          <AnimatedEntrance type="scale" style={styles.empty}>
            <Package size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aún no hay productos</Text>
            <Text style={styles.emptyText}>Toca el botón + para agregar el primero.</Text>
          </AnimatedEntrance>
        }
        ListFooterComponent={
          products.length > 0 ? (
            <Text style={styles.hint}>Toca para editar · mantén presionado para eliminar</Text>
          ) : undefined
        }
      />

      <AnimatedEntrance type="scale" delay={300} style={[styles.fabWrap, { bottom: insets.bottom + 20 }]}>
        <AnimatedPressable onPress={() => router.push('/producto')} style={styles.fab}>
          <Plus size={28} color="#FFFFFF" />
        </AnimatedPressable>
      </AnimatedEntrance>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16, gap: 12 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  email: { fontSize: 13, color: colors.textMuted },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  statPending: { backgroundColor: colors.warningLight, borderColor: '#FDE68A' },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  statValue: { fontSize: 17, fontWeight: '800', color: colors.text },
  syncButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  message: { borderRadius: 10, padding: 10 },
  messageOk: { backgroundColor: colors.successLight },
  messageError: { backgroundColor: colors.errorLight },
  messageText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  list: { paddingTop: 4 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textMuted },
  hint: { textAlign: 'center', fontSize: 12, color: colors.textMuted, paddingVertical: 8 },
  fabWrap: { position: 'absolute', right: 20 },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
