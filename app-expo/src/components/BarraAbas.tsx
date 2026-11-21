import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, fontes, raio } from '@/theme';

const ICONES: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'grid',
  historico: 'clock',
  resumo: 'bar-chart-2',
  perfil: 'user',
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

        const focado = state.index === indice;
        const { options } = descriptors[rota.key];
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
            accessibilityLabel={titulo}
            style={estilos.item}>
            <View style={[estilos.pilula, focado && { backgroundColor: colors.primarySoft }]}>
              <Feather name={ICONES[rota.name] ?? 'circle'} size={20} color={cor} />
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
  rotulo: { fontFamily: fontes.semi, fontSize: 11, lineHeight: 14 },
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
