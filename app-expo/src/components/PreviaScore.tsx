import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import BarraProgresso from '@/components/BarraProgresso';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';
import { corDoScore, type PreviaDoScore } from '@/utils';

export default function PreviaScore({ previa }: { previa: PreviaDoScore }) {
  const { colors } = useTheme();
  const cor = corDoScore(previa.score);

  return (
    <View style={[estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={estilos.topo}>
        <View style={estilos.textos}>
          <Texto variante="rotulo">Score de credibilidade</Texto>
          <Texto variante="legenda">Prévia: o valor final é calculado ao enviar.</Texto>
        </View>
        <Texto variante="numero" cor={cor} accessibilityLabel={`Score ${previa.score} de 100`}>
          {previa.score}
          <Texto variante="legenda">/100</Texto>
        </Texto>
      </View>
      <BarraProgresso valor={previa.score / 100} cor={cor} />
      <View style={estilos.itens}>
        {previa.itens.map((item) => (
          <View key={item.rotulo} style={estilos.item}>
            <Feather
              name={item.ok ? 'check-circle' : 'circle'}
              size={16}
              color={item.ok ? colors.success : colors.textPlaceholder}
            />
            <Texto variante="legenda" cor={item.ok ? 'text' : 'textMuted'} style={estilos.rotulo}>
              {item.rotulo}
            </Texto>
            <Texto variante="legenda" cor={item.ok ? 'success' : 'textMuted'}>
              +{item.pontos}
            </Texto>
          </View>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  textos: { flex: 1, gap: 2 },
  itens: { gap: espaco.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  rotulo: { flex: 1 },
});
