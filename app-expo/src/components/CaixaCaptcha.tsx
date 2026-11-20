import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import Campo from '@/components/Campo';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';

type Props = {
  pergunta?: string;
  carregando: boolean;
  resposta: string;
  onResposta: (texto: string) => void;
  onTrocar: () => void;
  erro?: string;
};

/** Conta simples gerada pela API para barrar envios automáticos. */
export default function CaixaCaptcha({
  pergunta,
  carregando,
  resposta,
  onResposta,
  onTrocar,
  erro,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={[estilos.caixa, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={estilos.topo}>
        <Feather name="shield" size={18} color={colors.primary} />
        <Texto variante="destaque" style={estilos.titulo}>
          Confirme que você não é um robô
        </Texto>
        <Pressable
          onPress={onTrocar}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Trocar a conta"
          style={({ pressed }) => pressed && { opacity: 0.5 }}>
          <Feather name="refresh-cw" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      {carregando || !pergunta ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Texto variante="numero" centro accessibilityRole="text">
          {pergunta}
        </Texto>
      )}
      <Campo
        rotulo="Resposta"
        value={resposta}
        onChangeText={(t) => onResposta(t.replace(/\D/g, ''))}
        keyboardType="number-pad"
        maxLength={3}
        placeholder="Digite o resultado"
        erro={erro}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  titulo: { flex: 1 },
});
