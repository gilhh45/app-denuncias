import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import StatusBadge from '@/components/StatusBadge';
import Texto from '@/components/Texto';
import { PRIORIDADE } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { espaco, fontes, raio } from '@/theme';
import type { DenunciaAdmin } from '@/types';
import { corDoScore, formatarData } from '@/utils';

export function SeloPrioridade({ prioridade }: { prioridade: DenunciaAdmin['prioridade'] }) {
  const { colors } = useTheme();
  const p = PRIORIDADE[prioridade];
  return (
    <View style={[estilos.selo, { backgroundColor: colors[p.fundo] }]}>
      <Feather name="flag" size={11} color={colors[p.cor]} />
      <Texto style={[estilos.seloTexto, { color: colors[p.cor] }]}>Prioridade {p.rotulo}</Texto>
    </View>
  );
}

export default function CartaoDenunciaAdmin({
  denuncia: d,
  onPress,
}: {
  denuncia: DenunciaAdmin;
  onPress?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${d.titulo}, prioridade ${PRIORIDADE[d.prioridade].rotulo}`}
      style={({ pressed }) => [
        estilos.cartao,
        { backgroundColor: pressed ? colors.cardAlt : colors.card, borderColor: colors.border },
      ]}>
      <View style={estilos.linha}>
        <SeloPrioridade prioridade={d.prioridade} />
        <Texto variante="legenda">{formatarData(d.criadaEm)}</Texto>
      </View>
      <Texto variante="destaque" numberOfLines={2}>
        {d.titulo}
      </Texto>
      <Texto variante="legenda" numberOfLines={1}>
        {d.protocolo} · {d.categoria}
      </Texto>
      <View style={estilos.linha}>
        <View style={estilos.autor}>
          <Feather name="user" size={13} color={colors.textMuted} />
          <Texto variante="legenda" numberOfLines={1}>
            {d.autor.nome} · {d.autor.nivel}
          </Texto>
        </View>
        <Texto variante="legenda" cor={corDoScore(d.score)}>
          score {d.score}
        </Texto>
      </View>
      <StatusBadge status={d.status} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.md, gap: 6 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.sm,
  },
  autor: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espaco.sm,
    paddingVertical: 3,
    borderRadius: raio.pill,
  },
  seloTexto: { fontFamily: fontes.semi, fontSize: 12, lineHeight: 16 },
});
