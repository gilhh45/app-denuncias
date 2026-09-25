import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

function credLevel(pts) {
  if (pts >= 600) return "Especialista";
  if (pts >= 300) return "Verificado";
  if (pts >= 100) return "Confiável";
  return "Iniciante";
}

export default function PerfilScreen() {
  const router = useRouter();
  const { colors, toggle, theme } = useTheme();
  const { user, logout } = useApp();
  const c = colors;

  const level = credLevel(user.credPoints);
  const initial = (user.email[0] ?? "U").toUpperCase();

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.scroll}
    >
      {/* User card */}
      <View
        style={[
          styles.userCard,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: c.primary }]}>
          <Text style={styles.avatarLetter}>{initial}</Text>
        </View>
        <View style={{ gap: 2 }}>
          <Text style={[styles.email, { color: c.text }]}>{user.email}</Text>
          <Text style={[styles.anonLabel, { color: c.textMuted }]}>
            Denunciante Anônimo
          </Text>
        </View>
      </View>
      <View style={[styles.privacyNote, { borderTopColor: c.divider }]}>
        <Feather name="lock" size={12} color={c.textMuted} />
        <Text style={[styles.privacyText, { color: c.textMuted }]}>
          Seus dados estão protegidos e não são compartilhados com terceiros.
        </Text>
      </View>

      {/* Credibility */}
      <View
        style={[
          styles.credRow,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <Feather name="shield" size={20} color="#00694d" />
        <View style={{ gap: 2 }}>
          <Text style={[styles.credLevel, { color: c.text }]}>{level}</Text>
          <Text style={[styles.credPts, { color: c.textMuted }]}>
            {user.credPoints} pontos acumulados
          </Text>
        </View>
      </View>

      {/* Theme toggle */}
      <TouchableOpacity
        style={[
          styles.menuRow,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
        onPress={toggle}
      >
        <Feather
          name={theme === "light" ? "moon" : "sun"}
          size={18}
          color={c.text}
        />
        <Text style={[styles.menuLabel, { color: c.text }]}>
          {theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
        </Text>
        <Feather
          name="chevron-right"
          size={16}
          color={c.textMuted}
          style={{ marginLeft: "auto" }}
        />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: c.primary }]}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutLabel}>SAIR DA CONTA</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={[styles.dot, { backgroundColor: "#00694d" }]} />
        <Text style={[styles.footerText, { color: c.textMuted }]}>
          SYSTEM SECURE · DADOS PROTEGIDOS
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, gap: 12, paddingBottom: 48 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  userCardTop: { flexDirection: "row", alignItems: "center", gap: 16 },
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  privacyText: { fontFamily: "HankenGrotesk_400Regular", fontSize: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 22,
    color: "#fff",
  },
  email: { fontFamily: "HankenGrotesk_700Bold", fontSize: 18 },
  anonLabel: { fontFamily: "JetBrainsMono_500Medium", fontSize: 12 },
  credRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  credLevel: { fontFamily: "HankenGrotesk_700Bold", fontSize: 20 },
  credPts: { fontFamily: "JetBrainsMono_500Medium", fontSize: 12 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  menuLabel: { fontFamily: "HankenGrotesk_400Regular", fontSize: 16 },
  logoutBtn: {
    borderRadius: 2,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  logoutLabel: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 12,
    color: "#fff",
    letterSpacing: 1.2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    opacity: 0.5,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  footerText: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
  },
});
