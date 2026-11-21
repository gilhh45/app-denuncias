import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';

type Props = {
  dados: { rotulo: string; valor: number }[];
  altura?: number;
};

/** Gráfico de colunas simples, feito só com View (sem biblioteca de gráficos). */
export default function GraficoBarras({ dados, altura = 120 }: Props) {
  const { colors } = useTheme();
  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  const ultimo = dados.length - 1;

  return (
    <View>
      <View
        style={[estilos.area, { height: altura }]}
        accessibilityLabel={`Gráfico: ${dados.map((d) => `${d.rotulo} ${d.valor}`).join(', ')}`}>
        {dados.map((d, i) => (
          <View key={d.rotulo} style={estilos.coluna}>
            {d.valor > 0 && (
              <Texto variante="legenda" style={estilos.valor}>
                {d.valor}
              </Texto>
            )}
            <Animated.View
              entering={FadeInUp.delay(i * 30)}
              style={[
                estilos.barra,
                {
                  height: Math.max(3, (d.valor / maximo) * (altura - 20)),
                  backgroundColor: i === ultimo ? colors.primary : colors.primarySoft,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={[estilos.eixo, { borderTopColor: colors.border }]}>
        <Texto variante="legenda">{dados[0]?.rotulo}</Texto>
        <Texto variante="legenda">{dados[ultimo]?.rotulo}</Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  area: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  coluna: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  valor: { fontSize: 10, lineHeight: 14 },
  barra: { width: '100%', borderTopLeftRadius: raio.sm, borderTopRightRadius: raio.sm },
  eixo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: espaco.xs,
  },
});
