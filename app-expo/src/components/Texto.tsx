import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { fontes, type Cores } from '@/theme';

type Variante = 'titulo' | 'subtitulo' | 'corpo' | 'destaque' | 'legenda' | 'rotulo' | 'numero';

type Props = TextProps & {
  variante?: Variante;
  cor?: keyof Cores;
  centro?: boolean;
};

export default function Texto({ variante = 'corpo', cor, centro, style, ...resto }: Props) {
  const { colors } = useTheme();
  const corPadrao: keyof Cores =
    variante === 'legenda' || variante === 'rotulo' ? 'textMuted' : 'text';

  return (
    <Text
      style={[
        estilos[variante],
        { color: colors[cor ?? corPadrao] },
        centro && { textAlign: 'center' },
        style,
      ]}
      {...resto}
    />
  );
}

const estilos = StyleSheet.create({
  titulo: { fontFamily: fontes.extra, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  subtitulo: { fontFamily: fontes.negrito, fontSize: 19, lineHeight: 25, letterSpacing: -0.2 },
  corpo: { fontFamily: fontes.regular, fontSize: 15, lineHeight: 22 },
  destaque: { fontFamily: fontes.semi, fontSize: 15, lineHeight: 22 },
  legenda: { fontFamily: fontes.regular, fontSize: 13, lineHeight: 18 },
  rotulo: {
    fontFamily: fontes.monoNegrito,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  numero: { fontFamily: fontes.monoNegrito, fontSize: 22, lineHeight: 28 },
});
