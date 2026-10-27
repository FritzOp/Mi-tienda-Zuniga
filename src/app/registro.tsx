import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedEntrance, AnimatedPressable } from '@/components/Animated';
import { Field } from '@/components/Field';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

export default function RegistroScreen() {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validaciones en vivo: se muestran apenas el usuario empieza a escribir.
  const passwordError =
    password.length > 0 && password.length < 6 ? 'La contraseña debe tener al menos 6 caracteres.' : null;
  const confirmError =
    confirm.length > 0 && confirm !== password ? 'Las contraseñas no coinciden.' : null;

  const onSubmit = async () => {
    if (!email.trim()) return setError('Escribe tu correo.');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (password !== confirm) return setError('Las contraseñas no coinciden.');

    setError(null);
    setLoading(true);
    const result = await signUp(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
    // Si Supabase devuelve sesión, Stack.Protected entra solo al inventario.
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <AnimatedEntrance type="slideDown">
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Tu inventario se respaldará en la nube.</Text>
        </AnimatedEntrance>

        <AnimatedEntrance delay={150} style={styles.form}>
          <Field
            label="Correo"
            value={email}
            onChangeText={setEmail}
            placeholder="rosa@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Field
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoCapitalize="none"
            error={passwordError}
          />
          <Field
            label="Confirmar contraseña"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repite la contraseña"
            secureTextEntry
            autoCapitalize="none"
            error={confirmError}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <AnimatedPressable onPress={onSubmit} disabled={loading} style={styles.button}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Registrarme</Text>
            )}
          </AnimatedPressable>

          <Link href="/login" style={styles.link}>
            ¿Ya tienes cuenta? Volver a iniciar sesión
          </Link>
        </AnimatedEntrance>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, gap: 28, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  form: { gap: 16 },
  errorBox: { backgroundColor: colors.errorLight, borderRadius: 10, padding: 12 },
  errorText: { color: '#B91C1C', fontSize: 13, fontWeight: '600' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  link: { textAlign: 'center', color: colors.primaryDark, fontWeight: '600', fontSize: 14, paddingVertical: 8 },
});
