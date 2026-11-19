import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio, type Cores } from '@/theme';

type Tipo = 'erro' | 'alerta' | 'info' | 'sucesso';

const ESTILO: Record<
  Tipo,
  { icone: keyof typeof Feather.glyphMap; cor: keyof Cores; fundo: keyof Cores }
> = {
  erro: { icone: 'alert-octagon', cor: 'danger', fundo: 'dangerSoft' },
  alerta: { icone: 'alert-triangle', cor: 'warning', fundo: 'warningSoft' },
  info: { icone: 'info', cor: 'info', fundo: 'infoSoft' },
  sucesso: { icone: 'check-circle', cor: 'success', fundo: 'successSoft' },
};

export default function Aviso({ tipo = 'info', children }: { tipo?: Tipo; children: ReactNode }) {
  const { colors } = useTheme();
  const e = ESTILO[tipo];

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      accessibilityRole={tipo === 'erro' ? 'alert' : undefined}
      style={[estilos.caixa, { backgroundColor: colors[e.fundo] }]}>
      <Feather name={e.icone} size={18} color={colors[e.cor]} style={estilos.icone} />
      <View style={estilos.texto}>
        {typeof children === 'string' ? (
          <Texto style={{ color: colors[e.cor] }}>{children}</Texto>
        ) : (
          children
        )}
      </View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.md,
  },
  icone: { marginTop: 2 },
  texto: { flex: 1 },
});
