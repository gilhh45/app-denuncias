import { Tabs } from 'expo-router/js-tabs';
import { Platform, useWindowDimensions } from 'react-native';

import BarraAbas from '@/components/BarraAbas';
import { useTheme } from '@/context/ThemeContext';
import { useResumo } from '@/services/admin';

export default function AbasAdminLayout() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const resumo = useResumo();
  const abertas = (resumo.data?.totais.pendentes ?? 0) + (resumo.data?.totais.emAnalise ?? 0);
  // no navegador largo o menu vira uma barra lateral, como no painel de moderação desenhado
  const lateral = Platform.OS === 'web' && width >= 1024;

  return (
    <Tabs
      tabBar={(props) => <BarraAbas {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        animation: 'shift',
        tabBarPosition: lateral ? 'left' : 'bottom',
      }}>
      <Tabs.Screen name="index" options={{ title: 'Visão geral' }} />
      <Tabs.Screen
        name="denuncias"
        options={{ title: 'Denúncias', tabBarBadge: abertas || undefined }}
      />
      <Tabs.Screen name="usuarios" options={{ title: 'Usuários' }} />
      <Tabs.Screen name="exportar" options={{ title: 'Exportar' }} />
    </Tabs>
  );
}
