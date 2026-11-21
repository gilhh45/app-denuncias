import { Tabs } from 'expo-router/js-tabs';

import BarraAbas from '@/components/BarraAbas';
import { useTheme } from '@/context/ThemeContext';

export default function AbasAdminLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <BarraAbas {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        animation: 'shift',
      }}>
      <Tabs.Screen name="index" options={{ title: 'Fluxo' }} />
      <Tabs.Screen name="denuncias" options={{ title: 'Denúncias' }} />
      <Tabs.Screen name="usuarios" options={{ title: 'Usuários' }} />
      <Tabs.Screen name="exportar" options={{ title: 'Exportar' }} />
    </Tabs>
  );
}
