import { Feather } from '@expo/vector-icons';
import { useDeferredValue, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Campo from '@/components/Campo';
import Esqueleto from '@/components/Esqueleto';
import EstadoVazio from '@/components/EstadoVazio';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { useUsuarios } from '@/services/admin';
import { espaco, fontes, raio } from '@/theme';
import type { UsuarioAdmin } from '@/types';

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes.at(-1)?.[0] ?? '') : '';
  return (primeira + ultima).toUpperCase();
}

function CartaoUsuario({ usuario: u, onPress }: { usuario: UsuarioAdmin; onPress?: () => void }) {
  const { colors } = useTheme();
  const taxa = u.estatisticas.taxaAcerto;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${u.nome}, ${u.nivel.nome}`}
      style={({ pressed }) => [
        estilos.cartao,
        { backgroundColor: pressed ? colors.cardAlt : colors.card, borderColor: colors.border },
      ]}>
      <View
        style={[
          estilos.avatar,
          { backgroundColor: u.bloqueado ? colors.cardAlt : colors.primarySoft },
        ]}>
        <Texto
          style={[estilos.iniciais, { color: u.bloqueado ? colors.textMuted : colors.primary }]}>
          {iniciais(u.nome)}
        </Texto>
      </View>
      <View style={estilos.meio}>
        <View style={estilos.linha}>
          <Texto variante="destaque" numberOfLines={1} style={estilos.flex}>
            {u.nome}
          </Texto>
          {u.bloqueado && (
            <View style={[estilos.bloqueado, { backgroundColor: colors.dangerSoft }]}>
              <Feather name="slash" size={11} color={colors.danger} />
              <Texto variante="legenda" cor="danger">
                Bloqueado
              </Texto>
            </View>
          )}
        </View>
        <Texto variante="legenda" numberOfLines={1}>
          {u.email}
        </Texto>
        <Texto variante="legenda">
          {u.nivel.nome} · {u.pontos} pts · {u.estatisticas.total} denúncias
          {taxa !== null ? ` · ${taxa}% de acerto` : ''}
        </Texto>
      </View>
      {onPress && <Feather name="chevron-right" size={18} color={colors.textPlaceholder} />}
    </Pressable>
  );
}

export default function UsuariosScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [busca, setBusca] = useState('');
  const usuarios = useUsuarios(useDeferredValue(busca.trim()));

  return (
    <View style={[estilos.raiz, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <FlatList
        data={usuarios.data ?? []}
        keyExtractor={(u) => String(u.id)}
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={usuarios.isRefetching}
            onRefresh={() => void usuarios.refetch()}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={estilos.topo}>
            <View>
              <Texto variante="titulo">Usuários</Texto>
              <Texto cor="textMuted">Do mais confiável para o menos confiável.</Texto>
            </View>
            <Campo
              rotulo="Buscar"
              icone="search"
              value={busca}
              onChangeText={setBusca}
              placeholder="Nome ou e-mail"
              autoCapitalize="none"
            />
          </View>
        }
        ListEmptyComponent={
          usuarios.isPending ? (
            <Esqueleto quantidade={4} />
          ) : usuarios.isError ? (
            <EstadoVazio
              icone="wifi-off"
              titulo="Não deu para carregar"
              texto={usuarios.error.message}
              acao={{ titulo: 'Tentar de novo', onPress: () => usuarios.refetch() }}
            />
          ) : (
            <EstadoVazio icone="users" titulo="Nenhum usuário encontrado" />
          )
        }
        renderItem={({ item }) => <CartaoUsuario usuario={item} />}
        ItemSeparatorComponent={() => <View style={estilos.separador} />}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  flex: { flex: 1 },
  conteudo: {
    padding: espaco.lg,
    paddingBottom: espaco.xxl,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  topo: { gap: espaco.md, marginBottom: espaco.lg },
  separador: { height: espaco.sm },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciais: { fontFamily: fontes.negrito, fontSize: 15 },
  meio: { flex: 1, gap: 2 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  bloqueado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espaco.sm,
    borderRadius: raio.pill,
  },
});
