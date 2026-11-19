import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import Texto from '@/components/Texto';
import { normalizarStatus, STATUS } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { espaco, fontes, raio } from '@/theme';

export default function StatusBadge({ status }: { status: string }) {
  const { colors } = useTheme();
  const info = STATUS[normalizarStatus(status)];

  return (
    <View style={[estilos.badge, { backgroundColor: colors[info.fundo] }]}>
      <Feather name={info.icone} size={12} color={colors[info.cor]} />
      <Texto style={[estilos.texto, { color: colors[info.cor] }]}>{info.rotulo}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espaco.xs,
    paddingHorizontal: espaco.sm,
    paddingVertical: 3,
    borderRadius: raio.pill,
  },
  texto: { fontFamily: fontes.semi, fontSize: 12, lineHeight: 16 },
});
