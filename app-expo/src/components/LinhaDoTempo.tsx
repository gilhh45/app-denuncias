import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

import Texto from '@/components/Texto';
import { STATUS, type Status } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';
import { formatarData } from '@/utils';

type Passo = { status: Status; nota: string | null; em: string };

/** Mostra por onde a denúncia já passou: recebida, em análise, confirmada/rejeitada. */
export default function LinhaDoTempo({ passos }: { passos: Passo[] }) {
  const { colors } = useTheme();
  const ultimo = passos.at(-1)?.status;
  const aguardando =
    ultimo === 'PENDENTE'
      ? 'Aguardando análise'
      : ultimo === 'EM_ANALISE'
        ? 'Aguardando decisão'
        : null;

  return (
    <View>
      {passos.map((p, i) => {
        const info = STATUS[p.status];
        const final = i === passos.length - 1 && !aguardando;
        return (
          <Animated.View
            key={`${p.status}-${i}`}
            entering={FadeInLeft.delay(i * 80)}
            style={estilos.passo}>
            <View style={estilos.trilho}>
              <View style={[estilos.bolinha, { backgroundColor: colors[info.fundo] }]}>
                <Feather name={info.icone} size={14} color={colors[info.cor]} />
              </View>
              {!final && <View style={[estilos.linha, { backgroundColor: colors.border }]} />}
            </View>
            <View style={estilos.texto}>
              <Texto variante="destaque">{info.rotulo}</Texto>
              {!!p.nota && <Texto variante="legenda">{p.nota}</Texto>}
              <Texto variante="legenda">{formatarData(p.em)}</Texto>
            </View>
          </Animated.View>
        );
      })}
      {aguardando && (
        <View style={estilos.passo}>
          <View style={estilos.trilho}>
            <View style={[estilos.bolinha, estilos.vazia, { borderColor: colors.border }]} />
          </View>
          <View style={estilos.texto}>
            <Texto variante="destaque" cor="textMuted">
              {aguardando}
            </Texto>
          </View>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  passo: { flexDirection: 'row', gap: espaco.md },
  trilho: { alignItems: 'center', width: 28 },
  bolinha: {
    width: 28,
    height: 28,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vazia: { borderWidth: 2, borderStyle: 'dashed' },
  linha: { width: 2, flex: 1, minHeight: 16, marginVertical: 2 },
  texto: { flex: 1, paddingBottom: espaco.lg, gap: 2 },
});
