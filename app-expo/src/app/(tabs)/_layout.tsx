import { Tabs } from 'expo-router/js-tabs';

import BarraAbas from '@/components/BarraAbas';
import { useTheme } from '@/context/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <BarraAbas {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        animation: 'shift',
      }}>
      <Tabs.Screen name="index" options={{ title: 'Painel' }} />
      <Tabs.Screen name="historico" options={{ title: 'Histórico' }} />
      <Tabs.Screen name="nova" options={{ title: 'Nova' }} />
      <Tabs.Screen name="status" options={{ title: 'Status' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
