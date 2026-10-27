import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from 'reicon-react-native/icons/Store';
import { AnimatedEntrance, AnimatedPressable, AnimatedPulse } from '@/components/Animated';
import { Field } from '@/components/Field';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setError(null);
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
    // Si entra bien, Stack.Protected lleva solo al inventario.
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <AnimatedEntrance type="scale" style={styles.header}>
          <AnimatedPulse>
            <View style={styles.logo}>
              <Store size={40} color="#FFFFFF" weight="Filled" />
            </View>
          </AnimatedPulse>
          <Text style={styles.title}>Mi Tienda</Text>
          <Text style={styles.subtitle}>Inventario que funciona con o sin internet</Text>
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
            placeholder="Tu contraseña"
            secureTextEntry
            autoCapitalize="none"
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
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </AnimatedPressable>

          <Link href="/registro" style={styles.link}>
            ¿No tienes cuenta? Regístrate
          </Link>
        </AnimatedEntrance>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, gap: 32, flexGrow: 1 },
  header: { alignItems: 'center', gap: 8 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
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
