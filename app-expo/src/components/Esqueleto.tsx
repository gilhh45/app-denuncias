import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';

function Bloco({ largura, altura }: { largura: DimensionValue; altura: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: largura,
        height: altura,
        borderRadius: raio.sm,
        backgroundColor: colors.cardAlt,
      }}
    />
  );
}

/** Cartões cinzas piscando enquanto a lista carrega, no lugar de um spinner solto. */
export default function Esqueleto({ quantidade = 3 }: { quantidade?: number }) {
  const { colors } = useTheme();
  const opacidade = useSharedValue(1);

  useEffect(() => {
    opacidade.set(withRepeat(withTiming(0.45, { duration: 700 }), -1, true));
  }, [opacidade]);

  const animado = useAnimatedStyle(() => ({ opacity: opacidade.get() }));

  return (
    <Animated.View style={[estilos.lista, animado]} accessibilityLabel="Carregando">
      {Array.from({ length: quantidade }, (_, i) => (
        <View
          key={i}
          style={[estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Bloco largura={44} altura={44} />
          <View style={estilos.textos}>
            <Bloco largura="70%" altura={14} />
            <Bloco largura="45%" altura={12} />
            <Bloco largura="30%" altura={18} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  lista: { gap: espaco.sm },
  cartao: {
    flexDirection: 'row',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
  },
  textos: { flex: 1, gap: espaco.sm },
});
