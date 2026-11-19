import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import Botao from '@/components/Botao';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';

type Props = {
  icone?: keyof typeof Feather.glyphMap;
  titulo: string;
  texto?: string;
  acao?: { titulo: string; onPress: () => void };
};

export default function EstadoVazio({ icone = 'inbox', titulo, texto, acao }: Props) {
  const { colors } = useTheme();

  return (
    <View style={estilos.caixa}>
      <View style={[estilos.circulo, { backgroundColor: colors.cardAlt }]}>
        <Feather name={icone} size={26} color={colors.textMuted} />
      </View>
      <Texto variante="destaque" centro>
        {titulo}
      </Texto>
      {!!texto && (
        <Texto variante="legenda" centro>
          {texto}
        </Texto>
      )}
      {acao && <Botao titulo={acao.titulo} onPress={acao.onPress} variante="secundario" compacto />}
    </View>
  );
}

export function Carregando({ texto }: { texto?: string }) {
  const { colors } = useTheme();
  return (
    <View style={estilos.caixa}>
      <ActivityIndicator color={colors.primary} />
      {!!texto && (
        <Texto variante="legenda" centro>
          {texto}
        </Texto>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
    paddingVertical: espaco.xxl,
    paddingHorizontal: espaco.xl,
  },
  circulo: {
    width: 64,
    height: 64,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.sm,
  },
});
