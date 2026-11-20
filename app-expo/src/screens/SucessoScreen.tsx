import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import Aviso from '@/components/Aviso';
import BarraProgresso from '@/components/BarraProgresso';
import Botao from '@/components/Botao';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';
import { corDoScore } from '@/utils';

export default function SucessoScreen() {
  const { colors } = useTheme();
  const { protocolo, score, pontos } = useLocalSearchParams<{
    id: string;
    protocolo: string;
    score: string;
    pontos: string;
  }>();
  const valorScore = Number(score) || 0;

  return (
    <Tela style={estilos.tela}>
      <View style={estilos.topo}>
        <Animated.View
          entering={ZoomIn.springify().damping(12)}
          style={[estilos.circulo, { backgroundColor: colors.successSoft }]}>
          <Feather name="check" size={40} color={colors.success} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(150)} style={estilos.textos}>
          <Texto variante="titulo" centro>
            Denúncia enviada!
          </Texto>
          <Texto cor="textMuted" centro>
            A moderação vai analisar e você acompanha tudo pelo histórico.
          </Texto>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(250)}
        style={[estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={estilos.linha}>
          <Texto variante="rotulo">Protocolo</Texto>
          <Texto variante="numero" cor="primary" selectable>
            {protocolo}
          </Texto>
        </View>
        <View style={[estilos.divisor, { backgroundColor: colors.divider }]} />
        <View style={estilos.linha}>
          <Texto variante="rotulo">Score de credibilidade</Texto>
          <Texto variante="destaque" cor={corDoScore(valorScore)}>
            {valorScore}/100
          </Texto>
        </View>
        <BarraProgresso valor={valorScore / 100} cor={corDoScore(valorScore)} />
        <View style={[estilos.divisor, { backgroundColor: colors.divider }]} />
        <View style={estilos.linha}>
          <Texto variante="rotulo">Pontos se confirmada</Texto>
          <Texto variante="destaque" cor="success">
            +{pontos}
          </Texto>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350)}>
        <Aviso tipo="info">
          Denúncias confirmadas aumentam seu nível de confiança. Denúncias rejeitadas tiram 20
          pontos.
        </Aviso>
      </Animated.View>

      <View style={estilos.botoes}>
        <Botao
          titulo="Ver no histórico"
          icone="clock"
          onPress={() => router.replace('/historico')}
        />
        <Botao
          titulo="Voltar ao início"
          variante="secundario"
          onPress={() => router.dismissTo('/')}
        />
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  tela: { justifyContent: 'center', gap: espaco.xl },
  topo: { alignItems: 'center', gap: espaco.lg },
  circulo: {
    width: 88,
    height: 88,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { gap: espaco.sm },
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divisor: { height: 1 },
  botoes: { gap: espaco.sm },
});
