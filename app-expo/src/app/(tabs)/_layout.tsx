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
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="historico" options={{ title: 'Denúncias' }} />
      <Tabs.Screen name="nova" options={{ title: 'Denunciar' }} />
      <Tabs.Screen name="avisos" options={{ title: 'Avisos' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
      {/* fica fora da barra: abre pelo botão Resumo de Minhas denúncias */}
      <Tabs.Screen name="resumo" options={{ title: 'Resumo' }} />
    </Tabs>
  );
}
