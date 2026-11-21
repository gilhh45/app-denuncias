import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Botao from '@/components/Botao';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { NIVEIS } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { boasVindas } from '@/services/conta';
import { espaco, raio } from '@/theme';

const PASSOS: {
  rotulo: string;
  titulo: string;
  texto: string;
  icone: keyof typeof Feather.glyphMap;
}[] = [
  {
    rotulo: '1 de 3 · Denunciar',
    titulo: 'Viu um golpe ou abuso na internet? Denuncie em 2 minutos',
    texto:
      'Cole o link do site ou do perfil, conte o que aconteceu e anexe prints. A moderação confere cada caso.',
    icone: 'flag',
  },
  {
    rotulo: '2 de 3 · Níveis',
    titulo: 'Quanto mais você acerta, mais rápido sua denúncia anda',
    texto:
      'São 4 níveis de confiança. Denúncias confirmadas fazem você subir e, nos níveis mais altos, as suas entram primeiro na fila.',
    icone: 'award',
  },
  {
    rotulo: '3 de 3 · Protocolo',
    titulo: 'Acompanhe tudo pelo número do protocolo',
    texto:
      'Cada denúncia ganha um protocolo. Você vê em que etapa ela está e recebe um aviso com a decisão.',
    icone: 'bell',
  },
];

/** Aparece uma vez, antes do primeiro login, neste aparelho. */
export default function BoasVindasScreen() {
  const { colors } = useTheme();
  const [i, setI] = useState(0);
  const passo = PASSOS[i];

  async function concluir() {
    await boasVindas.marcar();
    router.replace('/entrar');
  }

  return (
    <Tela rolavel={false}>
      <View style={estilos.topo}>
        <Texto variante="subtitulo" style={estilos.flex}>
          Denuncie
          <Texto variante="subtitulo" cor="primary">
            Já
          </Texto>
        </Texto>
        <Pressable onPress={concluir} accessibilityRole="button" style={estilos.pular}>
          <Texto variante="destaque" cor="textMuted">
            Pular
          </Texto>
        </Pressable>
      </View>

      <View style={[estilos.ilustra, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {i === 1 ? (
          NIVEIS.map((n, k) => (
            <View
              key={n.nome}
              style={[
                estilos.nivel,
                { backgroundColor: k === 2 ? colors.primarySoft : colors.bg },
              ]}>
              <Feather name={n.icone} size={18} color={k === 2 ? colors.primary : colors.text} />
              <Texto variante="destaque" style={estilos.flex}>
                {n.nome}
              </Texto>
            </View>
          ))
        ) : (
          <View style={[estilos.circulo, { backgroundColor: colors.primarySoft }]}>
            <Feather name={passo.icone} size={44} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={estilos.textos}>
        <Texto variante="rotulo" cor="primary">
          {passo.rotulo}
        </Texto>
        <Texto variante="titulo" accessibilityRole="header">
          {passo.titulo}
        </Texto>
        <Texto cor="textMuted">{passo.texto}</Texto>
      </View>

      <View style={estilos.rodape}>
        <View style={estilos.pontos} accessible accessibilityLabel={`Passo ${i + 1} de 3`}>
          {PASSOS.map((p, k) => (
            <View
              key={p.rotulo}
              style={[
                estilos.ponto,
                {
                  width: k === i ? 24 : 8,
                  backgroundColor: k === i ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>
        <View style={estilos.botoes}>
          {i > 0 && (
            <View style={estilos.voltar}>
              <Botao titulo="Voltar" variante="secundario" onPress={() => setI(i - 1)} />
            </View>
          )}
          <View style={estilos.flex}>
            <Botao
              titulo={i < 2 ? 'Continuar' : 'Criar minha conta'}
              onPress={i < 2 ? () => setI(i + 1) : concluir}
            />
          </View>
        </View>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  topo: { flexDirection: 'row', alignItems: 'center' },
  pular: { minHeight: 44, justifyContent: 'center', paddingHorizontal: espaco.sm },
  ilustra: {
    minHeight: 260,
    borderWidth: 1,
    borderRadius: raio.xl,
    padding: espaco.lg,
    gap: espaco.sm,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  circulo: {
    width: 120,
    height: 120,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  nivel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.md,
  },
  textos: { gap: espaco.sm },
  rodape: { marginTop: 'auto', gap: espaco.lg },
  pontos: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  ponto: { height: 8, borderRadius: raio.pill },
  botoes: { flexDirection: 'row', gap: espaco.sm },
  voltar: { minWidth: 120 },
});
