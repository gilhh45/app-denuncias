import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/context/ThemeContext';
import { raio, type Cores } from '@/theme';

type Props = {
  /** De 0 a 1. */
  valor: number;
  cor?: keyof Cores;
  altura?: number;
};

export default function BarraProgresso({ valor, cor = 'primary', altura = 8 }: Props) {
  const { colors } = useTheme();
  const progresso = useSharedValue(0);

  useEffect(() => {
    progresso.set(withTiming(Math.min(1, Math.max(0, valor)), { duration: 500 }));
  }, [valor, progresso]);

  const animado = useAnimatedStyle(() => ({ width: `${progresso.get() * 100}%` }));

  return (
    <View
      style={[estilos.trilho, { height: altura, backgroundColor: colors.cardAlt }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(valor * 100) }}>
      <Animated.View style={[estilos.barra, { backgroundColor: colors[cor] }, animado]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  trilho: { width: '100%', borderRadius: raio.pill, overflow: 'hidden' },
  barra: { height: '100%', borderRadius: raio.pill },
});
