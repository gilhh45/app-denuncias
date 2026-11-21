import { useDeferredValue, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Campo from '@/components/Campo';
import CartaoDenunciaAdmin from '@/components/CartaoDenunciaAdmin';
import Chips from '@/components/Chips';
import Esqueleto from '@/components/Esqueleto';
import EstadoVazio from '@/components/EstadoVazio';
import Texto from '@/components/Texto';
import { ORDEM_STATUS, PRIORIDADE, STATUS, type Status } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
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

  return (
    <View style={[estilos.raiz, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <FlatList
        data={fila.data ?? []}
        keyExtractor={(d) => String(d.id)}
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
        renderItem={({ item }) => <CartaoDenunciaAdmin denuncia={item} />}
        ItemSeparatorComponent={() => <View style={estilos.separador} />}
      />
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
  separador: { height: espaco.sm },
});
