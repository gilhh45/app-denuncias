import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import Chips from '@/components/Chips';
import Esqueleto from '@/components/Esqueleto';
import EstadoVazio from '@/components/EstadoVazio';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { useAvisos, useMarcarLidos } from '@/services/conta';
import { espaco, raio, type Cores } from '@/theme';
import type { AvisoApp } from '@/types';
import { formatarData } from '@/utils';

function visual(a: AvisoApp): {
  icone: keyof typeof Feather.glyphMap;
  cor: keyof Cores;
  fundo: keyof Cores;
} {
  if (a.tipo === 'NIVEL') return { icone: 'award', cor: 'primary', fundo: 'primarySoft' };
  if (a.titulo.includes('confirmada'))
    return { icone: 'check-circle', cor: 'success', fundo: 'successSoft' };
  if (a.titulo.includes('rejeitada'))
    return { icone: 'x-circle', cor: 'danger', fundo: 'dangerSoft' };
  return { icone: 'search', cor: 'info', fundo: 'infoSoft' };
}

/** Caixa de entrada: cada mudança de status ou de nível vira um aviso. */
export default function AvisosScreen() {
  const { colors } = useTheme();
  const avisos = useAvisos();
  const marcar = useMarcarLidos();
  const [filtro, setFiltro] = useState<'todos' | 'novos'>('todos');

  const lista = (avisos.data?.avisos ?? []).filter((a) => filtro === 'todos' || !a.lido);
  const naoLidos = avisos.data?.naoLidos ?? 0;

  function abrir(a: AvisoApp) {
    if (!a.lido) marcar.mutate([a.id]);
    if (a.denunciaId) router.push(`/denuncia/${a.denunciaId}`);
  }

  return (
    <Tela
      semFundoSeguro
      refreshControl={
        <RefreshControl
          refreshing={avisos.isRefetching}
          onRefresh={() => void avisos.refetch()}
          tintColor={colors.primary}
        />
      }>
      <View style={estilos.topo}>
        <Texto variante="titulo" style={estilos.flex} accessibilityRole="header">
          Avisos
        </Texto>
        {naoLidos > 0 && (
          <Pressable
            onPress={() => marcar.mutate(undefined)}
            accessibilityRole="button"
            style={estilos.marcar}>
            <Texto variante="destaque" cor="primary">
              Marcar como lidos
            </Texto>
          </Pressable>
        )}
      </View>

      <Chips
        opcoes={[
          { valor: 'todos', rotulo: 'Todos' },
          { valor: 'novos', rotulo: `Não lidos (${naoLidos})` },
        ]}
        valor={filtro}
        onChange={(v) => setFiltro(v as 'todos' | 'novos')}
      />

      {avisos.isPending ? (
        <Esqueleto />
      ) : avisos.isError ? (
        <EstadoVazio
          icone="wifi-off"
          titulo="Não deu para carregar"
          texto={avisos.error.message}
          acao={{ titulo: 'Tentar de novo', onPress: () => avisos.refetch() }}
        />
      ) : lista.length === 0 ? (
        <EstadoVazio
          icone="bell"
          titulo="Tudo lido por aqui"
          texto="Avisamos sempre que uma denúncia sua mudar de status."
        />
      ) : (
        <View style={[estilos.lista, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {lista.map((a, i) => {
            const v = visual(a);
            return (
              <Pressable
                key={a.id}
                onPress={() => abrir(a)}
                accessibilityRole="button"
                accessibilityLabel={`${a.lido ? '' : 'Não lido. '}${a.titulo}. ${a.texto}`}
                style={({ pressed }) => [
                  estilos.item,
                  i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider },
                  !a.lido && { backgroundColor: colors.primarySoft },
                  pressed && { backgroundColor: colors.cardAlt },
                ]}>
                <View style={[estilos.icone, { backgroundColor: colors[v.fundo] }]}>
                  <Feather name={v.icone} size={18} color={colors[v.cor]} />
                </View>
                <View style={estilos.flex}>
                  <Texto variante="destaque">{a.titulo}</Texto>
                  <Texto variante="legenda">{a.texto}</Texto>
                  <Texto variante="legenda">{formatarData(a.criadoEm)}</Texto>
                </View>
                {!a.lido && <View style={[estilos.ponto, { backgroundColor: colors.primary }]} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  marcar: { minHeight: 44, justifyContent: 'center' },
  lista: { borderWidth: 1, borderRadius: raio.lg, overflow: 'hidden' },
  item: { flexDirection: 'row', gap: espaco.md, padding: espaco.lg, alignItems: 'flex-start' },
  icone: {
    width: 40,
    height: 40,
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ponto: { width: 10, height: 10, borderRadius: raio.pill, marginTop: 6 },
});
