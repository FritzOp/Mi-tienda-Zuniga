import React, { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';

type EntranceType = 'slideUp' | 'slideDown' | 'scale' | 'fade';

/** Entrada con fade + resorte (slideUp, slideDown, scale o fade), con retardo para escalonar. */
export function AnimatedEntrance({
  children,
  type = 'slideUp',
  duration = 450,
  delay = 0,
  style,
}: {
  children: ReactNode;
  type?: EntranceType;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(
    () => new Animated.Value(type === 'slideUp' ? 24 : type === 'slideDown' ? -24 : 0)
  );
  const [scale] = useState(() => new Animated.Value(type === 'scale' ? 0.88 : 1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, tension: 40, friction: 7, delay, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 40, friction: 7, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, duration, opacity, scale, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }, { scale }] }]}>
      {children}
    </Animated.View>
  );
}

/** Botón con micro-interacción de escala (resorte) al presionar. */
export function AnimatedPressable({
  children,
  onPress,
  onLongPress,
  style,
  scaleTo = 0.96,
  disabled = false,
}: {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const to = (toValue: number, tension: number) =>
    Animated.spring(scale, { toValue, tension, friction: 5, useNativeDriver: true }).start();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => to(scaleTo, 100)}
      onPressOut={() => to(1, 50)}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Pulso suave y continuo para destacar una acción (p. ej. Sincronizar con pendientes). */
export function AnimatedPulse({
  children,
  style,
  active = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
}) {
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!active) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  return <Animated.View style={[style, { transform: [{ scale: pulse }] }]}>{children}</Animated.View>;
}
