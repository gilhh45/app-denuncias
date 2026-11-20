import { StyleSheet, View } from 'react-native';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';

type Props = { passos: string[]; atual: number };

/** Indicador de etapas, usado no fluxo de recuperação de senha. */
export default function Passos({ passos, atual }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={estilos.linha}
      accessibilityRole="progressbar"
      accessibilityLabel={`Etapa ${atual + 1} de ${passos.length}: ${passos[atual]}`}>
      {passos.map((passo, i) => {
        const feito = i <= atual;
        return (
          <View key={passo} style={estilos.passo}>
            <View
              style={[estilos.barra, { backgroundColor: feito ? colors.primary : colors.border }]}
            />
            <Texto variante="legenda" cor={i === atual ? 'text' : 'textMuted'}>
              {i + 1}. {passo}
            </Texto>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', gap: espaco.sm },
  passo: { flex: 1, gap: espaco.xs },
  barra: { height: 4, borderRadius: raio.pill },
});
