import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import StatusBadge from "./StatusBadge";

// "RESOLVIDO" é aceito como sinônimo de "CONCLUÍDO" (nome usado no app).
function normalizeStatus(status) {
  const s = String(status ?? "").toUpperCase();
  return s === "RESOLVIDO" ? "CONCLUÍDO" : s;
}

/**
 * Card reutilizável de denúncia.
 *
 * Props:
 *  - protocolo: string  -> ex.: "PRT-2026-8A4F"
 *  - titulo:    string  -> ex.: "Perfil falso se passando por mim"
 *  - status:    'PENDENTE' | 'ANÁLISE' | 'CONCLUÍDO' (ou 'RESOLVIDO')
 *  - detalhes:  opcional, lista de { icone, texto } exibida abaixo do título
 *               ex.: [{ icone: 'calendar', texto: '24 set 2026' }]
 *  - onPress:   opcional; se vier, o card fica clicável
 *
 * A cor do status vem do StatusBadge (vermelho, azul ou verde, com tema escuro).
 */
export default function DenunciaCard({
  protocolo,
  titulo,
  status,
  detalhes = [],
  onPress,
}) {
  const { colors: c } = useTheme();
  const st = normalizeStatus(status);
  const isDone = st === "CONCLUÍDO";

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.card,
        {
          backgroundColor: isDone ? c.card : c.bg,
          borderColor: c.border,
          opacity: isDone ? 0.8 : 1,
        },
      ]}
      {...(onPress ? { onPress, activeOpacity: 0.85 } : {})}
    >
      <View style={styles.top}>
        <View style={styles.protocolRow}>
          <Feather name="hash" size={11} color={c.textMuted} />
          <Text style={[styles.protocolText, { color: c.text }]}>
            {protocolo}
          </Text>
        </View>
        <StatusBadge status={st} />
      </View>

      <Text
        numberOfLines={2}
        style={[
          styles.title,
          {
            color: c.text,
            textDecorationLine: isDone ? "line-through" : "none",
          },
        ]}
      >
        {titulo}
      </Text>

      {detalhes.length > 0 && (
        <View style={styles.meta}>
          {detalhes.map((d, i) => (
            <View key={i} style={styles.metaRow}>
              <Feather name={d.icone} size={12} color={c.textMuted} />
              <Text style={[styles.metaText, { color: c.textMuted }]}>
                {d.texto}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 8, padding: 17, gap: 8 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  protocolRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  protocolText: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: "HankenGrotesk_400Regular",
    fontSize: 20,
    lineHeight: 25,
  },
  meta: { gap: 4, marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: {
    fontFamily: "HankenGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
});
