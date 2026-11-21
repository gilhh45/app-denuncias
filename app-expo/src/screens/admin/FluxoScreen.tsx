import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';
import { confirmar } from '@/utils';

function BotaoIcone({
  icone,
  rotulo,
  onPress,
}: {
  icone: keyof typeof Feather.glyphMap;
  rotulo: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [
        estilos.botaoIcone,
        { backgroundColor: pressed ? colors.cardAlt : colors.card, borderColor: colors.border },
      ]}>
      <Feather name={icone} size={18} color={colors.text} />
    </Pressable>
  );
}

export default function FluxoScreen() {
  const { escuro, toggle } = useTheme();
  const { usuario, sair } = useAuth();

  async function pedirParaSair() {
    if (await confirmar('Sair do painel?', 'Você vai precisar entrar de novo.', 'Sair')) sair();
  }

  return (
    <Tela semFundoSeguro>
      <View style={estilos.cabecalho}>
        <View style={estilos.flex}>
          <Texto variante="rotulo" cor="primary">
            Painel administrativo
          </Texto>
          <Texto variante="titulo">Fluxo de denúncias</Texto>
          <Texto cor="textMuted">Conectado como {usuario?.nome}</Texto>
        </View>
        <BotaoIcone
          icone={escuro ? 'sun' : 'moon'}
          rotulo={escuro ? 'Usar tema claro' : 'Usar tema escuro'}
          onPress={toggle}
        />
        <BotaoIcone icone="log-out" rotulo="Sair" onPress={pedirParaSair} />
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.sm },
  botaoIcone: {
    width: 40,
    height: 40,
    borderRadius: raio.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
