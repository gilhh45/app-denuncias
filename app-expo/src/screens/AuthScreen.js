import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

const LOGO = require("../../assets/logo.png");
const LOGO_ESCURO = require("../../assets/logoescuro.png");

export default function AuthScreen({ navigation }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { colors, toggle, theme } = useTheme();
  const { login } = useApp();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit() {
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    const emailLimpo = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (mode === "register" && password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("Senha deve ter mínimo 6 caracteres.");
      return;
    }
    login(emailLimpo);
    router.replace("/painel");
  }

  const c = colors;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: c.surface,
            borderBottomColor: c.border,
            height: 64 + insets.top,
            paddingTop: insets.top,
          },
        ]}
      >
        <Text style={[styles.brandName, { color: c.primary }]}>DenuncieJá</Text>
        <TouchableOpacity onPress={toggle} style={styles.iconBtn}>
          <Feather
            name={theme === "light" ? "moon" : "sun"}
            size={20}
            color={c.textMuted}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo + heading */}
        <View style={styles.logoArea}>
          <Image
            source={theme === "dark" ? LOGO_ESCURO : LOGO}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.heading, { color: c.text }]}>ACCESS</Text>
          <Text style={[styles.subheading, { color: c.textMuted }]}>
            Secure authentication required.
          </Text>
        </View>

        {/* Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: c.card, borderColor: c.text },
          ]}
        >
          {/* Tab toggle */}
          <View style={[styles.tabRow, { borderBottomColor: c.text }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  backgroundColor: mode === "login" ? c.bg : c.divider,
                  borderRightColor: c.text,
                },
              ]}
              onPress={() => {
                setMode("login");
                setError("");
              }}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: mode === "login" ? c.text : c.textMuted },
                ]}
              >
                LOGIN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { backgroundColor: mode === "register" ? c.bg : c.divider },
              ]}
              onPress={() => {
                setMode("register");
                setError("");
              }}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: mode === "register" ? c.text : c.textMuted },
                ]}
              >
                REGISTER
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fields */}
          <View style={styles.fields}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: c.text }]}>
                EMAIL ADDRESS
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.inputBg,
                    borderColor: c.border,
                    color: c.text,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="user@domain.com"
                placeholderTextColor={c.textPlaceholder}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={[styles.fieldLabel, { color: c.text }]}>
                  PASSWORD
                </Text>
                {mode === "login" && (
                  <Text style={[styles.forgotLabel, { color: c.primary }]}>
                    FORGOT?
                  </Text>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.inputBg,
                    borderColor: c.border,
                    color: c.text,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={c.textPlaceholder}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={
                  showPassword ? "Ocultar senha" : "Mostrar senha"
                }
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={c.textMuted}
                />
              </TouchableOpacity>
            </View>

            {mode === "register" && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: c.text }]}>
                  CONFIRM PASSWORD
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: c.inputBg,
                      borderColor: c.border,
                      color: c.text,
                    },
                  ]}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="••••••••"
                  placeholderTextColor={c.textPlaceholder}
                  secureTextEntry={!showPassword}
                />
              </View>
            )}

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: c.primary }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitLabel}>AUTHENTICATE</Text>
              <Feather name="arrow-right" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security indicator */}
        <View style={styles.secureRow}>
          <View style={[styles.dot, { backgroundColor: "#00694d" }]} />
          <Text style={[styles.secureLabel, { color: c.textMuted }]}>
            SYSTEM SECURE
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: 36,
  },
  brandName: {
    fontFamily: "HankenGrotesk_600SemiBold",
    fontSize: 24,
    letterSpacing: -0.6,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { padding: 16, paddingTop: 24, paddingBottom: 48 },
  logoArea: { alignItems: "center", marginBottom: 32 },
  logo: { width: 96, height: 96, marginBottom: 16 },
  heading: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 32,
    letterSpacing: 0,
    alignSelf: "flex-start",
  },
  subheading: {
    fontFamily: "HankenGrotesk_400Regular",
    fontSize: 16,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  card: {
    borderWidth: 2,
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabLabel: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  fields: { padding: 26, gap: 16 },
  fieldGroup: { gap: 4 },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 14,
    marginBottom: 4,
  },
  forgotLabel: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 9,
    paddingVertical: 11,
    fontSize: 16,
    fontFamily: "HankenGrotesk_400Regular",
  },
  errorBox: {
    backgroundColor: "#ffdad6",
    borderRadius: 4,
    padding: 12,
  },
  errorText: {
    fontFamily: "HankenGrotesk_400Regular",
    fontSize: 14,
    color: "#93000a",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 2,
    paddingVertical: 16,
    marginTop: 4,
  },
  submitLabel: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 12,
    color: "#fff",
    letterSpacing: 1.2,
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    opacity: 0.5,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  secureLabel: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
  },
});
