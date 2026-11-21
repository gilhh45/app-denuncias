import { router } from 'expo-router';
import { useDeferredValue, useEffect, useEffectEvent, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Campo from '@/components/Campo';
import CartaoDenunciaAdmin from '@/components/CartaoDenunciaAdmin';
import Chips from '@/components/Chips';
import Esqueleto from '@/components/Esqueleto';
import EstadoVazio from '@/components/EstadoVazio';
import Texto from '@/components/Texto';
import { ORDEM_STATUS, PRIORIDADE, STATUS, type Status } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import AnaliseDenunciaScreen from '@/screens/admin/AnaliseDenunciaScreen';
import { useFila } from '@/services/admin';
import { espaco } from '@/theme';
import type { Prioridade } from '@/types';

export default function FilaScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<Status | 'TODOS'>('PENDENTE');
  const [prioridade, setPrioridade] = useState<Prioridade | 'TODAS'>('TODAS');
  const [busca, setBusca] = useState('');
  // espera a pessoa parar de digitar um pouco antes de buscar na API
  const buscaAdiada = useDeferredValue(busca.trim());

  const fila = useFila({
    status: status === 'TODOS' ? undefined : status,
    prioridade: prioridade === 'TODAS' ? undefined : prioridade,
    busca: buscaAdiada || undefined,
  });

  const { width } = useWindowDimensions();
  const lado = Platform.OS === 'web' && width >= 1024;
  const itens = fila.data ?? [];
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const atual = lado ? (itens.find((d) => d.id === selecionada) ?? itens[0]) : undefined;

  function mover(passo: number) {
    if (!itens.length) return;
    const i = Math.max(
      0,
      itens.findIndex((d) => d.id === atual?.id),
    );
    setSelecionada(itens[(i + passo + itens.length) % itens.length].id);
  }
  // depois de decidir, abre a próxima da lista (a decidida sai da fila de pendentes)
  function proxima() {
    const i = itens.findIndex((d) => d.id === atual?.id);
    setSelecionada(itens[i + 1]?.id ?? itens[i - 1]?.id ?? null);
  }

  // J e K andam pela fila, como em leitores de e-mail
  const atalho = useEffectEvent((k: string) => {
    if (k === 'j') mover(1);
    if (k === 'k') mover(-1);
  });
  useEffect(() => {
    if (!lado) return;
    function tecla(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement | null;
      if (alvo && /INPUT|TEXTAREA/.test(alvo.tagName)) return;
      atalho(e.key.toLowerCase());
    }
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [lado]);

  return (
    <View
      style={[
        estilos.raiz,
        lado && estilos.lado,
        { backgroundColor: colors.bg, paddingTop: insets.top },
      ]}>
      <FlatList
        data={itens}
        keyExtractor={(d) => String(d.id)}
        style={lado && [estilos.listaLado, { borderRightColor: colors.border }]}
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={fila.isRefetching}
            onRefresh={() => void fila.refetch()}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={estilos.topo}>
            <View>
              <Texto variante="titulo">Denúncias</Texto>
              <Texto cor="textMuted">
                Ordenadas pela confiança de quem denunciou e depois pelo score.
              </Texto>
            </View>
            <Campo
              rotulo="Buscar"
              icone="search"
              value={busca}
              onChangeText={setBusca}
              placeholder="Título, protocolo, link ou autor"
              autoCapitalize="none"
            />
            <Chips
              opcoes={[
                { valor: 'TODOS', rotulo: 'Todos os status' },
                ...ORDEM_STATUS.map((s) => ({
                  valor: s,
                  rotulo: STATUS[s].rotulo,
                  icone: STATUS[s].icone,
                })),
              ]}
              valor={status}
              onChange={(v) => setStatus(v as Status | 'TODOS')}
              sangrar
            />
            <Chips
              opcoes={[
                { valor: 'TODAS', rotulo: 'Todas as prioridades' },
                ...(['ALTA', 'MEDIA', 'BAIXA'] as const).map((p) => ({
                  valor: p,
                  rotulo: PRIORIDADE[p].rotulo,
                  icone: 'flag' as const,
                })),
              ]}
              valor={prioridade}
              onChange={(v) => setPrioridade(v as Prioridade | 'TODAS')}
              sangrar
            />
            {fila.data && (
              <Texto variante="legenda">
                {fila.data.length === 1 ? '1 denúncia' : `${fila.data.length} denúncias`}
              </Texto>
            )}
          </View>
        }
        ListEmptyComponent={
          fila.isPending ? (
            <Esqueleto quantidade={4} />
          ) : fila.isError ? (
            <EstadoVazio
              icone="wifi-off"
              titulo="Não deu para carregar"
              texto={fila.error.message}
              acao={{ titulo: 'Tentar de novo', onPress: () => fila.refetch() }}
            />
          ) : (
            <EstadoVazio
              icone="check-circle"
              titulo="Nada por aqui"
              texto="Nenhuma denúncia com esses filtros."
            />
          )
        }
        renderItem={({ item }) => (
          <View
            style={
              lado &&
              item.id === atual?.id && [estilos.selecionada, { borderColor: colors.primary }]
            }>
            <CartaoDenunciaAdmin
              denuncia={item}
              onPress={() =>
                lado ? setSelecionada(item.id) : router.push(`/admin/denuncia/${item.id}`)
              }
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={estilos.separador} />}
      />
      {lado && (
        <View style={estilos.analise}>
          {atual ? (
            <AnaliseDenunciaScreen key={atual.id} id={atual.id} aoDecidir={proxima} />
          ) : (
            <EstadoVazio
              icone="check-circle"
              titulo="Fila zerada"
              texto="Nenhuma denúncia aberta com esses filtros."
            />
          )}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  conteudo: {
    padding: espaco.lg,
    paddingBottom: espaco.xxl,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  topo: { gap: espaco.md, marginBottom: espaco.lg },
  lado: { flexDirection: 'row' },
  listaLado: { flexGrow: 0, width: 420, borderRightWidth: 1 },
  analise: { flex: 1 },
  selecionada: { borderWidth: 2, borderRadius: 18 },
  separador: { height: espaco.sm },
});
