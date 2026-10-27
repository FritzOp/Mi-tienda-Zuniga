# AI-LOG — Parcial Mi Tienda

**Estudiante:** Edgar Zuñiga · **Herramienta:** Claude Code (asistente de IA)

## Prompts usados

1. "Usa lo que he hecho en mis proyectos (taller-modulos-sensores, Proyecto_Final_Movil) para desarrollar la app Mi Tienda del parcial; ya está conectado a Supabase."
2. "Colócale las animaciones que puse en la app de StudyAI, o sea esas librerías."

## Qué generó la IA y qué corregí / verifiqué

- **Proyecto base:** la plantilla en blanco era JavaScript con `App.js` y `AsyncStorage`. El enunciado exige TypeScript, Expo Router y SecureStore, así que se migró la estructura (se eliminó `AsyncStorage` y `App.js`).
- **Variable de entorno:** la plantilla usaba `EXPO_PUBLIC_SUPABASE_ANON_KEY`; el enunciado pide `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Se renombró en `.env` (local, ignorado por git) y en `.env.example`.
- **Sesión en SecureStore:** el adaptador por fragmentos (`src/lib/secureStorage.ts`) es nuevo; no existía en mis repos de referencia.
- **Reglas de lint:** el patrón `useRef(new Animated.Value(...)).current` copiado de StudyAI fallaba `react-hooks/refs`; se cambió por `useState(() => new Animated.Value(...))`.
- **`babel-preset-expo`:** el bundle fallaba (`Cannot find module 'babel-preset-expo'`) hasta instalarlo como dependencia explícita con `npx expo install`.
- **Schema de Drizzle:** se mantuvo sin imports de Expo; el UUID se genera en el repositorio con `Crypto.randomUUID()`.

## Alucinación / riesgo detectado

- Mis repos de referencia son SDK 57 y esta plantilla es SDK 58, así que no se copiaron versiones a mano: todo se instaló con `npx expo install` y se consultó la documentación de SDK 58 (`expo-secure-store`, `Stack.Protected`).
- Se comprobó que `Stack.Protected` y `useLiveQuery` existan en las versiones instaladas en lugar de asumir la API de memoria.
