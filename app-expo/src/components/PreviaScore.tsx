import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import Texto from '@/components/Texto';
import { FORCA } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';
import type { Forca } from '@/types';

type Props = {
  forca: Forca;
  /** O que ainda deixaria a denúncia mais forte. */
  itens?: { rotulo: string; ok: boolean }[];
  texto?: string;
};

/** Força da denúncia em palavras. O score em número fica só com a moderação. */
export default function PreviaScore({ forca, itens, texto }: Props) {
  const { colors } = useTheme();
  const f = FORCA[forca];

  return (
    <View style={[estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={estilos.topo}>
        <Texto variante="destaque" style={estilos.flex}>
          Força da denúncia
        </Texto>
        <Texto variante="destaque" cor={f.cor}>
          {f.rotulo}
        </Texto>
      </View>
      <View
        style={estilos.barras}
        accessible
        accessibilityLabel={`Força ${f.barras} de 3: ${f.rotulo.toLowerCase()}`}>
        {[1, 2, 3].map((n) => (
          <View
            key={n}
            style={[
              estilos.barra,
              { backgroundColor: n <= f.barras ? colors[f.cor] : colors.cardAlt },
            ]}
          />
        ))}
      </View>
      {!!texto && <Texto variante="legenda">{texto}</Texto>}
      {itens?.map((item) => (
        <View key={item.rotulo} style={estilos.item}>
          <Feather
            name={item.ok ? 'check-circle' : 'circle'}
            size={16}
            color={item.ok ? colors.success : colors.textPlaceholder}
          />
          <Texto variante="legenda" cor={item.ok ? 'text' : 'textMuted'} style={estilos.flex}>
            {item.rotulo}
          </Texto>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  barras: { flexDirection: 'row', gap: espaco.xs },
  barra: { flex: 1, height: 6, borderRadius: raio.pill },
  item: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  flex: { flex: 1 },
});
