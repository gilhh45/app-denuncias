import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import StatusBadge from '@/components/StatusBadge';
import Texto from '@/components/Texto';
import { ETAPA_STATUS, STATUS, type Status } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';

type Props = {
  titulo: string;
  detalhe: string;
  data: string;
  status: Status;
  icone?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
};

export default function DenunciaCard({
  titulo,
  detalhe,
  data,
  status,
  icone = 'globe',
  onPress,
}: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${titulo}, ${detalhe}`}
      style={({ pressed }) => [
        estilos.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { backgroundColor: colors.cardAlt },
      ]}>
      <View style={[estilos.icone, { backgroundColor: colors.primarySoft }]}>
        <Feather name={icone} size={20} color={colors.primary} />
      </View>
      <View style={estilos.meio}>
        <Texto variante="destaque" numberOfLines={1}>
          {titulo}
        </Texto>
        <Texto variante="legenda" numberOfLines={1}>
          {detalhe}
        </Texto>
        <View
          style={estilos.trilha}
          accessible
          accessibilityLabel={`Etapa ${ETAPA_STATUS[status]} de 4: ${STATUS[status].rotulo}`}>
          {[1, 2, 3, 4].map((n) => {
            const etapa = ETAPA_STATUS[status];
            const cor =
              n > etapa ? colors.cardAlt : n === etapa ? colors[STATUS[status].cor] : colors.text;
            return <View key={n} style={[estilos.barra, { backgroundColor: cor }]} />;
          })}
        </View>
        <View style={estilos.rodape}>
          <StatusBadge status={status} />
          <Texto variante="legenda">{data}</Texto>
        </View>
      </View>
      {onPress && <Feather name="chevron-right" size={18} color={colors.textPlaceholder} />}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meio: { flex: 1, gap: 2 },
  rodape: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, marginTop: espaco.xs },
  trilha: { flexDirection: 'row', gap: 3, marginTop: espaco.xs },
  barra: { flex: 1, height: 4, borderRadius: raio.pill },
});
