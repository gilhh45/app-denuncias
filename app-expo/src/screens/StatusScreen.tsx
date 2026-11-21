import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import BarraProgresso from '@/components/BarraProgresso';
import { Carregando } from '@/components/EstadoVazio';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { NIVEIS, ORDEM_STATUS, STATUS, type Status } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';
import type { EstatisticasBasicas } from '@/types';

const EXPLICACAO: Record<Status, string> = {
  PENDENTE: 'Recebida, esperando a moderação começar.',
  EM_ANALISE: 'A moderação está conferindo o link e as provas.',
  CONFIRMADA: 'A violação foi confirmada. Conta a favor do seu nível.',
  REJEITADA: 'Não foi encontrada violação. Conta contra o seu nível.',
};

const CAMPO: Record<Status, keyof EstatisticasBasicas> = {
  PENDENTE: 'pendentes',
  EM_ANALISE: 'emAnalise',
  CONFIRMADA: 'confirmadas',
  REJEITADA: 'rejeitadas',
};

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
      <Pressable
        onPress={() => router.navigate('/historico')}
        accessibilityRole="button"
        style={estilos.link}>
        <Feather name="arrow-left" size={16} color={colors.primary} />
        <Texto variante="destaque" cor="primary">
          Minhas denúncias
        </Texto>
      </Pressable>
      <View>
        <Texto variante="titulo">Resumo</Texto>
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
        <Texto variante="subtitulo">Como subir de nível</Texto>
        <Texto variante="legenda">
          Denúncias confirmadas fazem você subir. Link completo, relato com detalhes e prints deixam
          a denúncia mais forte. Na dúvida, descreva o que viu em vez de exagerar.
        </Texto>
        {NIVEIS.map((n) => {
          const atual = usuario?.nivel.nome === n.nome;
          return (
            <View
              key={n.nome}
              style={[estilos.nivel, atual && { backgroundColor: colors.primarySoft }]}>
              <Feather name={n.icone} size={16} color={atual ? colors.primary : colors.textMuted} />
              <View style={estilos.flex}>
                <Texto variante="destaque" cor={atual ? 'primary' : 'text'}>
                  {n.nome}
                  {atual ? ' (você)' : ''}
                </Texto>
                <Texto variante="legenda">{n.texto}</Texto>
              </View>
            </View>
          );
        })}
        <Pressable
          onPress={() => router.push('/meu-nivel')}
          accessibilityRole="button"
          style={estilos.link}>
          <Texto variante="destaque" cor="primary">
            Ver como meu nível é calculado
          </Texto>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </Pressable>
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
  link: { flexDirection: 'row', alignItems: 'center', gap: espaco.xs, minHeight: 44 },
  nivel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.sm,
    borderRadius: raio.md,
  },
});
