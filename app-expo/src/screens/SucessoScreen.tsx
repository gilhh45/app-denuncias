import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import Aviso from '@/components/Aviso';
import Botao from '@/components/Botao';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';
import { FORCA } from '@/constants';
import type { Forca } from '@/types';

export default function SucessoScreen() {
  const { colors } = useTheme();
  const { id, protocolo, forca } = useLocalSearchParams<{
    id: string;
    protocolo: string;
    forca: Forca;
  }>();
  const f = FORCA[forca] ?? FORCA.MEDIA;

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
          <Texto variante="rotulo">Força da denúncia</Texto>
          <Texto variante="destaque" cor={f.cor}>
            {f.rotulo}
          </Texto>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350)}>
        <Aviso tipo="info">
          Se for confirmada, você fica mais perto do próximo nível de confiança.
        </Aviso>
      </Animated.View>

      <View style={estilos.botoes}>
        <Botao
          titulo="Ver denúncia"
          icone="file-text"
          onPress={() => router.replace(`/denuncia/${id}`)}
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
