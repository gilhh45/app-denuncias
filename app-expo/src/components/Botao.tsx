import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, fontes, raio } from '@/theme';

type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo';

type Props = {
  titulo: string;
  onPress?: () => void;
  variante?: Variante;
  icone?: keyof typeof Feather.glyphMap;
  carregando?: boolean;
  desabilitado?: boolean;
  compacto?: boolean;
  acessibilidade?: string;
};

export default function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando,
  desabilitado,
  compacto,
  acessibilidade,
}: Props) {
  const { colors } = useTheme();
  const escala = useSharedValue(1);
  const animado = useAnimatedStyle(() => ({ transform: [{ scale: escala.get() }] }));
  const inativo = desabilitado || carregando;

  const cores = {
    primario: { fundo: colors.primary, texto: colors.onPrimary, borda: colors.primary },
    secundario: { fundo: colors.card, texto: colors.text, borda: colors.border },
    fantasma: { fundo: 'transparent', texto: colors.primary, borda: 'transparent' },
    perigo: { fundo: colors.dangerSoft, texto: colors.danger, borda: colors.dangerSoft },
  }[variante];

  function pressionar() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }

  return (
    <Animated.View style={animado}>
      <Pressable
        onPress={pressionar}
        onPressIn={() => escala.set(withSpring(0.97, { duration: 150 }))}
        onPressOut={() => escala.set(withSpring(1, { duration: 200 }))}
        disabled={inativo}
        accessibilityRole="button"
        accessibilityLabel={acessibilidade ?? titulo}
        accessibilityState={{ disabled: !!inativo, busy: !!carregando }}
        style={[
          estilos.botao,
          compacto && estilos.compacto,
          { backgroundColor: cores.fundo, borderColor: cores.borda },
          inativo && { opacity: 0.55 },
        ]}>
        {carregando ? (
          <ActivityIndicator color={cores.texto} />
        ) : (
          <View style={estilos.conteudo}>
            {icone && <Feather name={icone} size={compacto ? 16 : 18} color={cores.texto} />}
            <Texto style={[estilos.titulo, { color: cores.texto }]}>{titulo}</Texto>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: 52,
    paddingHorizontal: espaco.xl,
    borderRadius: raio.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compacto: { minHeight: 40, paddingHorizontal: espaco.lg },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  titulo: { fontFamily: fontes.negrito, fontSize: 15 },
});
