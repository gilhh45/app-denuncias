import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="painel" options={{ title: 'Painel' }} />
      <Tabs.Screen name="historico" options={{ title: 'Histórico' }} />
      <Tabs.Screen 
        name="status" 
        options={{ 
          title: 'Status',
          tabBarIcon: ({ color, size }) => <Feather name="star" size={size} color={color} />
        }} 
      />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
