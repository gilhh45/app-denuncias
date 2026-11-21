import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import BarraProgresso from '@/components/BarraProgresso';
import { Carregando } from '@/components/EstadoVazio';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { ORDEM_STATUS, STATUS, type Status } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';
import type { Estatisticas } from '@/types';

const EXPLICACAO: Record<Status, string> = {
  PENDENTE: 'Recebida, esperando a moderação começar.',
  EM_ANALISE: 'A moderação está conferindo o link e as provas.',
  CONFIRMADA: 'A violação foi confirmada e você ganhou pontos.',
  REJEITADA: 'Não foi encontrada violação e você perdeu 20 pontos.',
};

const CAMPO: Record<Status, keyof Estatisticas> = {
  PENDENTE: 'pendentes',
  EM_ANALISE: 'emAnalise',
  CONFIRMADA: 'confirmadas',
  REJEITADA: 'rejeitadas',
};

const NIVEIS = [
  { nome: 'Iniciante', minimo: 0, texto: 'Todo mundo começa aqui.' },
  { nome: 'Confiável', minimo: 100, texto: '+5 no score e prioridade média.' },
  { nome: 'Verificado', minimo: 300, texto: '+10 no score e prioridade alta.' },
  { nome: 'Especialista', minimo: 600, texto: '+15 no score e prioridade alta.' },
];

export default function StatusScreen() {
  const { colors } = useTheme();
  const { usuario, estatisticas, recarregarUsuario } = useAuth();
  const [atualizando, setAtualizando] = useState(false);

  async function atualizar() {
    setAtualizando(true);
    await recarregarUsuario().catch(() => {});
    setAtualizando(false);
  }

  const total = estatisticas?.total ?? 0;
  const cartao = [estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }];

  return (
    <Tela
      semFundoSeguro
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={atualizar} tintColor={colors.primary} />
      }>
      <View>
        <Texto variante="titulo">Status</Texto>
        <Texto cor="textMuted">
          {total === 1 ? '1 denúncia enviada' : `${total} denúncias enviadas`}, por etapa.
        </Texto>
      </View>

      {!estatisticas ? (
        <Carregando />
      ) : (
        ORDEM_STATUS.map((s, i) => {
          const info = STATUS[s];
          const quantidade = estatisticas[CAMPO[s]] as number;
          return (
            <Animated.View key={s} entering={FadeInDown.delay(i * 60)} style={cartao}>
              <View style={estilos.linha}>
                <View style={[estilos.icone, { backgroundColor: colors[info.fundo] }]}>
                  <Feather name={info.icone} size={18} color={colors[info.cor]} />
                </View>
                <View style={estilos.flex}>
                  <Texto variante="destaque">{info.rotulo}</Texto>
                  <Texto variante="legenda">{EXPLICACAO[s]}</Texto>
                </View>
                <Texto variante="numero" cor={info.cor}>
                  {quantidade}
                </Texto>
              </View>
              <BarraProgresso valor={total ? quantidade / total : 0} cor={info.cor} altura={6} />
            </Animated.View>
          );
        })
      )}

      <View style={cartao}>
        <Texto variante="subtitulo">Como ganhar confiança</Texto>
        <Texto variante="legenda">
          Cada denúncia confirmada vale 10 pontos mais 30% do score dela. Quanto maior o nível, mais
          rápido suas denúncias chegam ao órgão responsável.
        </Texto>
        {NIVEIS.map((n) => {
          const atual = usuario?.nivel.nome === n.nome;
          return (
            <View
              key={n.nome}
              style={[estilos.nivel, atual && { backgroundColor: colors.primarySoft }]}>
              <Feather
                name={atual ? 'star' : 'circle'}
                size={16}
                color={atual ? colors.primary : colors.textPlaceholder}
              />
              <View style={estilos.flex}>
                <Texto variante="destaque" cor={atual ? 'primary' : 'text'}>
                  {n.nome}
                  {atual ? ' (você)' : ''}
                </Texto>
                <Texto variante="legenda">{n.texto}</Texto>
              </View>
              <Texto variante="legenda">{n.minimo} pts</Texto>
            </View>
          );
        })}
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  icone: {
    width: 40,
    height: 40,
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nivel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.sm,
    borderRadius: raio.md,
  },
});
