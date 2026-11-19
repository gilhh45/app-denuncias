import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';

type Props = {
  titulo: string;
  subtitulo?: string;
  voltar?: boolean;
  acao?: ReactNode;
};

export default function Cabecalho({ titulo, subtitulo, voltar, acao }: Props) {
  const { colors } = useTheme();

  return (
    <View style={estilos.linha}>
      {voltar && (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          style={({ pressed }) => [
            estilos.voltar,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.6 },
          ]}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
      )}
      <View style={estilos.textos}>
        <Texto variante="titulo" accessibilityRole="header">
          {titulo}
        </Texto>
        {!!subtitulo && <Texto cor="textMuted">{subtitulo}</Texto>}
      </View>
      {acao}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.md },
  voltar: {
    width: 40,
    height: 40,
    borderRadius: raio.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  textos: { flex: 1, gap: 2 },
});
