import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { AnimatedEntrance, AnimatedPressable } from '@/components/Animated';
import { Field } from '@/components/Field';
import { productsRepo } from '@/db/repositories/products';
import { colors } from '@/theme';

const isNonNegativeInt = (v: string) => /^\d+$/.test(v.trim());

type Errors = { name?: string; quantity?: string; price?: string };

export default function ProductoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productId = id ? Number(id) : null;
  const editing = productId !== null;

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (productId === null) return;
    productsRepo.getById(productId).then((p) => {
      if (!p) {
        Alert.alert('Producto no encontrado', 'Puede que ya no exista.', [
          { text: 'Volver', onPress: () => router.back() },
        ]);
        return;
      }
      setName(p.name);
      setQuantity(String(p.quantity));
      setPrice(String(p.price));
    });
  }, [productId]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!name.trim()) e.name = 'El nombre es obligatorio.';
    if (!isNonNegativeInt(quantity)) e.quantity = 'Ingresa un número entero mayor o igual a 0.';
    if (!isNonNegativeInt(price)) e.price = 'Ingresa un número entero mayor o igual a 0.';
    return e;
  };

  const onSave = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const input = { name, quantity: Number(quantity), price: Number(price) };
      if (productId !== null) await productsRepo.update(productId, input);
      else await productsRepo.create(input);
      router.back();
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Error desconocido');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: editing ? 'Editar producto' : 'Nuevo producto' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AnimatedEntrance style={styles.form}>
          <Field
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Ej: Arroz 500 g"
            error={errors.name}
          />
          <Field
            label="Cantidad (unidades)"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="0"
            keyboardType="number-pad"
            error={errors.quantity}
          />
          <Field
            label="Precio (pesos)"
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            keyboardType="number-pad"
            error={errors.price}
          />

          <AnimatedPressable onPress={onSave} disabled={saving} style={styles.button}>
            <Text style={styles.buttonText}>{editing ? 'Guardar cambios' : 'Crear producto'}</Text>
          </AnimatedPressable>
        </AnimatedEntrance>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  form: { gap: 16 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
