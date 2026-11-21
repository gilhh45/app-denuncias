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
    </Tabs>
  );
}
