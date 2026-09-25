import { Feather } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 4,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: {
          fontFamily: "JetBrainsMono_700Bold",
          fontSize: 10,
          letterSpacing: 1.2,
        },
      }}
    >
      <Tabs.Screen
        name="painel"
        options={{
          title: "Painel",
          tabBarLabel: "PAINEL",
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: "Histórico",
          tabBarLabel: "HISTÓRICO",
          tabBarIcon: ({ color, size }) => (
            <Feather name="clock" size={size} color={color} />
          ),
        }}
      />

      {/* Botão central "+": abre a tela nova-denuncia (que fica fora das abas) */}
      <Tabs.Screen
        name="nova"
        options={{
          title: "Nova denúncia",
          tabBarLabel: "",
          tabBarButton: () => (
            <View style={styles.fabSlot}>
              <TouchableOpacity
                style={[styles.fab, { backgroundColor: c.primary }]}
                onPress={() => router.push("/nova-denuncia")}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Nova denúncia"
              >
                <Feather name="plus" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="status"
        options={{
          title: "Status",
          tabBarLabel: "STATUS",
          tabBarIcon: ({ color, size }) => (
            <Feather name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarLabel: "PERFIL",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabSlot: { flex: 1, alignItems: "center" },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginTop: -16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
