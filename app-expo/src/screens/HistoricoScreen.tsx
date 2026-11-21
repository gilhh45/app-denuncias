import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Campo from '@/components/Campo';
import Chips from '@/components/Chips';
import DenunciaCard from '@/components/DenunciaCard';
import Esqueleto from '@/components/Esqueleto';
import EstadoVazio from '@/components/EstadoVazio';
import Texto from '@/components/Texto';
import { ORDEM_STATUS, STATUS, type Status } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { useMinhasDenuncias } from '@/services/denuncias';
import { espaco } from '@/theme';
import { formatarData, resumoDenuncia } from '@/utils';

type Filtro = Status | 'TODAS';

export default function HistoricoScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const denuncias = useMinhasDenuncias();
  const [filtro, setFiltro] = useState<Filtro>('TODAS');
  const [busca, setBusca] = useState('');

  const lista = useMemo(() => denuncias.data ?? [], [denuncias.data]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return lista.filter(
      (d) =>
        (filtro === 'TODAS' || d.status === filtro) &&
        (!termo ||
          `${d.titulo} ${d.protocolo} ${d.url} ${d.categoria}`.toLowerCase().includes(termo)),
    );
  }, [lista, filtro, busca]);

  const opcoes = [
    { valor: 'TODAS', rotulo: `Todas (${lista.length})` },
    ...ORDEM_STATUS.map((s) => ({
      valor: s,
      rotulo: `${STATUS[s].rotulo} (${lista.filter((d) => d.status === s).length})`,
      icone: STATUS[s].icone,
    })),
  ];

  return (
    <View style={[estilos.raiz, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <FlatList
        data={filtradas}
        keyExtractor={(d) => String(d.id)}
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={denuncias.isRefetching}
            onRefresh={() => void denuncias.refetch()}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={estilos.topo}>
            <View style={estilos.linhaTopo}>
              <View style={estilos.flex}>
                <Texto variante="titulo">Minhas denúncias</Texto>
                <Texto cor="textMuted">Todas as denúncias que você enviou.</Texto>
              </View>
              <Pressable
                onPress={() => router.navigate('/resumo')}
                accessibilityRole="button"
                accessibilityLabel="Ver resumo por etapa"
                style={[
                  estilos.resumo,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}>
                <Feather name="bar-chart-2" size={16} color={colors.text} />
                <Texto variante="destaque">Resumo</Texto>
              </Pressable>
            </View>
            <Campo
              rotulo="Buscar"
              icone="search"
              value={busca}
              onChangeText={setBusca}
              placeholder="Título, protocolo ou link"
              autoCapitalize="none"
              returnKeyType="search"
            />
            <Chips
              opcoes={opcoes}
              valor={filtro}
              onChange={(v) => setFiltro(v as Filtro)}
              sangrar
            />
          </View>
        }
        ListEmptyComponent={
          denuncias.isPending ? (
            <Esqueleto quantidade={5} />
          ) : denuncias.isError ? (
            <EstadoVazio
              icone="wifi-off"
              titulo="Não deu para carregar"
              texto={denuncias.error.message}
              acao={{ titulo: 'Tentar de novo', onPress: () => denuncias.refetch() }}
            />
          ) : (
            <EstadoVazio
              icone="search"
              titulo={lista.length ? 'Nada encontrado' : 'Nenhuma denúncia ainda'}
              texto={
                lista.length
                  ? 'Tente outro filtro ou outra palavra na busca.'
                  : 'Toque no botão + para fazer a primeira.'
              }
            />
          )
        }
        renderItem={({ item, index }) => (
          // anima só os primeiros para a lista não ficar lenta
          <Animated.View
            entering={index < 8 ? FadeInDown.delay(index * 40).duration(250) : undefined}>
            <DenunciaCard
              titulo={item.titulo}
              detalhe={`${item.protocolo} · ${resumoDenuncia(item)}`}
              data={formatarData(item.criadaEm)}
              status={item.status}
              icone={item.tipo === 'SITE' ? 'globe' : 'users'}
              onPress={() => router.push(`/denuncia/${item.id}`)}
            />
          </Animated.View>
        )}
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
  topo: { gap: espaco.lg, marginBottom: espaco.lg },
  flex: { flex: 1 },
  linhaTopo: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.md },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    minHeight: 44,
    paddingHorizontal: espaco.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  separador: { height: espaco.sm },
});
