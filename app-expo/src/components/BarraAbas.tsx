import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import Texto from '@/components/Texto';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { espaco, fontes, raio } from '@/theme';

const ICONES: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'home',
  historico: 'list',
  avisos: 'bell',
  perfil: 'user',
  // abas do painel administrativo
  denuncias: 'inbox',
  usuarios: 'users',
  exportar: 'download',
};

function vibrar() {
  if (Platform.OS !== 'web') Haptics.selectionAsync();
}

export default function BarraAbas({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const { colors } = useTheme();
  const { avisosNaoLidos } = useAuth();
  const lateral = descriptors[state.routes[state.index].key]?.options.tabBarPosition === 'left';

  // navegador largo (moderação): menu lateral, como no canvas
  if (lateral) {
    return (
      <View
        style={[
          estilos.lateral,
          { backgroundColor: colors.surface, borderRightColor: colors.border },
        ]}>
        <View style={estilos.marca}>
          <Texto variante="subtitulo">
            Denuncie
            <Texto variante="subtitulo" cor="primary">
              Já
            </Texto>
          </Texto>
          <View style={[estilos.selo, { borderColor: colors.textMuted }]}>
            <Texto variante="rotulo">Moderação</Texto>
          </View>
        </View>
        {state.routes.map((rota, indice) => {
          const focado = state.index === indice;
          const { options } = descriptors[rota.key];
          const titulo = options.title ?? rota.name;
          const badge = options.tabBarBadge;
          return (
            <Pressable
              key={rota.key}
              onPress={() => {
                const evento = emitter.emit({
                  type: 'tabPress',
                  target: rota.key,
                  canPreventDefault: true,
                });
                if (!focado && !evento.defaultPrevented) navigateToTab(rota.key);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: focado }}
              accessibilityLabel={badge ? `${titulo}, ${badge} abertas` : titulo}
              style={({ pressed }) => [
                estilos.itemLateral,
                focado && { backgroundColor: colors.primarySoft },
                pressed && !focado && { backgroundColor: colors.cardAlt },
              ]}>
              <Feather
                name={ICONES[rota.name] ?? 'circle'}
                size={20}
                color={focado ? colors.primary : colors.text}
              />
              <Texto
                variante="destaque"
                cor={focado ? 'primary' : 'text'}
                style={estilos.flex}
                numberOfLines={1}>
                {titulo}
              </Texto>
              {badge !== undefined && (
                <View style={[estilos.contagem, { backgroundColor: colors.card }]}>
                  <Texto style={[estilos.textoContagem, { color: colors.text }]}>{badge}</Texto>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View
      style={[
        estilos.barra,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, espaco.sm),
        },
      ]}>
      {state.routes.map((rota, indice) => {
        if (rota.name === 'resumo') return null;
        if (rota.name === 'nova') {
          return (
            <View key={rota.key} style={estilos.item}>
              <Pressable
                onPress={() => {
                  vibrar();
                  router.push('/nova-denuncia');
                }}
                accessibilityRole="button"
                accessibilityLabel="Nova denúncia"
                style={({ pressed }) => [
                  estilos.fab,
                  { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
                ]}>
                <Feather name="plus" size={26} color={colors.onPrimary} />
              </Pressable>
            </View>
          );
        }

        // o Resumo fica dentro de Minhas denúncias, então a aba continua marcada
        const focado =
          state.index === indice ||
          (rota.name === 'historico' && state.routes[state.index]?.name === 'resumo');
        const { options } = descriptors[rota.key];
        const badge =
          rota.name === 'avisos' && avisosNaoLidos > 0
            ? avisosNaoLidos
            : Number(options.tabBarBadge ?? 0);
        const titulo = options.title ?? rota.name;
        const cor = focado ? colors.primary : colors.textMuted;

        function pressionar() {
          const evento = emitter.emit({
            type: 'tabPress',
            target: rota.key,
            canPreventDefault: true,
          });
          if (!focado && !evento.defaultPrevented) {
            vibrar();
            navigateToTab(rota.key);
          }
        }

        return (
          <Pressable
            key={rota.key}
            onPress={pressionar}
            accessibilityRole="tab"
            accessibilityState={{ selected: focado }}
            accessibilityLabel={badge ? `${titulo}, ${badge} novos` : titulo}
            style={estilos.item}>
            <View style={[estilos.pilula, focado && { backgroundColor: colors.primarySoft }]}>
              <Feather name={ICONES[rota.name] ?? 'circle'} size={20} color={cor} />
              {!!badge && (
                <View
                  style={[
                    estilos.badge,
                    { backgroundColor: colors.primary, borderColor: colors.surface },
                  ]}>
                  <Texto style={[estilos.textoBadge, { color: colors.onPrimary }]}>
                    {badge > 9 ? '9+' : badge}
                  </Texto>
                </View>
              )}
            </View>
            <Texto style={[estilos.rotulo, { color: cor }]} numberOfLines={1}>
              {titulo}
            </Texto>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  lateral: {
    width: 240,
    borderRightWidth: 1,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.lg,
    gap: espaco.xs,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    paddingHorizontal: espaco.sm,
    marginBottom: espaco.lg,
  },
  selo: { borderWidth: 1, borderRadius: raio.sm, paddingHorizontal: 6, paddingVertical: 2 },
  itemLateral: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    minHeight: 44,
    paddingHorizontal: espaco.md,
    borderRadius: raio.md,
  },
  contagem: { paddingHorizontal: espaco.sm, paddingVertical: 2, borderRadius: raio.pill },
  textoContagem: { fontFamily: fontes.mono, fontSize: 12, lineHeight: 16 },
  barra: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: espaco.sm,
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  pilula: {
    width: 52,
    height: 30,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotulo: { fontFamily: fontes.semi, fontSize: 12, lineHeight: 16 },
  badge: {
    position: 'absolute',
    top: -2,
    right: 8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: raio.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBadge: { fontFamily: fontes.monoNegrito, fontSize: 10, lineHeight: 12 },
  fab: {
    width: 54,
    height: 54,
    borderRadius: raio.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    boxShadow: '0 6px 16px rgba(183, 16, 42, 0.35)',
  },
});
