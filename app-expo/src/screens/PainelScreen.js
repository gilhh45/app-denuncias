import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import denunciasMock from "../data/denunciasMock.json";

const ACTIVITY_IMG_1 = require("../../assets/activity1.jpg");
const ACTIVITY_IMG_2 = require("../../assets/activity2.jpg");

function credLevel(pts) {
  if (pts >= 600) return "Especialista";
  if (pts >= 300) return "Verificado";
  if (pts >= 100) return "Confiável";
  return "Iniciante";
}

function nextLevelLabel(level) {
  if (level === "Iniciante") return "CONFIÁVEL (100 PTS)";
  if (level === "Confiável") return "VERIFICADO (300 PTS)";
  if (level === "Verificado") return "ESPECIALISTA (600 PTS)";
  return "NÍVEL MÁXIMO";
}

function nextLevelPts(level) {
  const map = {
    Iniciante: 100,
    Confiável: 300,
    Verificado: 600,
    Especialista: 600,
  };
  return map[level] ?? 100;
}

function prevLevelPts(level) {
  const map = {
    Iniciante: 0,
    Confiável: 100,
    Verificado: 300,
    Especialista: 600,
  };
  return map[level] ?? 0;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PainelScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, reports } = useApp();
  const c = colors;
  const insets = useSafeAreaInsets();

  const allReports = reports.length > 0 ? reports : denunciasMock || [];

  const activeReportsCount = allReports.filter((r) =>
    ["ANÁLISE", "PENDENTE"].includes(r.status?.toUpperCase()),
  ).length;

  const [recent] = useState(allReports);

  const level = credLevel(user.credPoints);
  const next = nextLevelPts(level);
  const prev = prevLevelPts(level);
  const progressPct = Math.min(
    ((user.credPoints - prev) / (next - prev)) * 100,
    100,
  );

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
      >
        {/* Nova Denúncia CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: c.primary }]}
          onPress={() => router.push("/nova-denuncia")}
          activeOpacity={0.88}
        >
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Nova Denúncia</Text>
            <Text style={styles.ctaSubtitle}>Reporte um problema agora</Text>
          </View>
          <Feather name="megaphone" size={26} color="white" />
        </TouchableOpacity>

        {/* Credibility Card */}
        <View style={[styles.credCard, { backgroundColor: c.card }]}>
          <View style={styles.credHeader}>
            <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
              STATUS DE CIDADÃO
            </Text>
            <Feather name="shield" size={18} color="#00694d" />
          </View>
          <Text style={[styles.credLevel, { color: c.text }]}>{level}</Text>
          <Text style={[styles.credPts, { color: c.textMuted }]}>
            {user.credPoints} Pontos Acumulados
          </Text>
          {/* Progress bar */}
          <View style={[styles.progressBg, { backgroundColor: c.divider }]}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressCurrent, { color: "#00694d" }]}>
              NÍVEL ATUAL
            </Text>
            <Text style={[styles.progressNext, { color: c.textMuted }]}>
              {nextLevelLabel(level)}
            </Text>
          </View>
        </View>

        {/* Recent activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
            ATIVIDADE RECENTE
          </Text>
          {recent?.length === 0 ? (
            <>
              <ActivityItem
                img={ACTIVITY_IMG_1}
                title="Buraco na Via Pública"
                time="HOJE, 09:41"
                status="ANÁLISE"
                colors={c}
              />
              <ActivityItem
                img={ACTIVITY_IMG_2}
                title="Iluminação Defeituosa"
                time="22 MAR, 14:20"
                status="CONCLUÍDO"
                colors={c}
              />
            </>
          ) : (
            recent.map((r) => (
              <ActivityItem
                key={r.id}
                title={(r.titulo || r.categoria).slice(0, 35)}
                time={formatDate(r.data)}
                status={r.status}
                colors={c}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ActivityItem({ img, title, time, status, colors: c }) {
  return (
    <View style={[styles.actItem, { backgroundColor: c.cardWhite }]}>
      <View style={[styles.actThumb, { backgroundColor: c.divider }]}>
        {img && (
          <Image source={img} style={styles.actThumbImg} resizeMode="cover" />
        )}
      </View>
      <View style={styles.actInfo}>
        <Text style={[styles.actTitle, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.actTime, { color: c.textMuted }]}>{time}</Text>
      </View>
      <StatusBadge status={status} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48, gap: 40 },
  counterSection: { gap: 8, paddingTop: 8 },
  sectionLabel: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  counterRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  counterNum: {
    fontFamily: "HankenGrotesk_800ExtraBold",
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: -3.2,
  },
  counterSub: {
    fontFamily: "HankenGrotesk_400Regular",
    fontSize: 16,
    marginBottom: 8,
  },
  ctaBtn: {
    borderRadius: 8,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaText: { gap: 4 },
  ctaTitle: {
    fontFamily: "HankenGrotesk_600SemiBold",
    fontSize: 24,
    color: "#fff",
    lineHeight: 31,
  },
  ctaSubtitle: {
    fontFamily: "HankenGrotesk_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  credCard: {
    borderRadius: 8,
    padding: 24,
    gap: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  credHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  credLevel: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 32,
    lineHeight: 38,
  },
  credPts: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  progressBg: {
    height: 12,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00694d",
    borderRadius: 12,
  },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressCurrent: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  progressNext: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  section: { gap: 8 },
  actItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  actThumb: { width: 48, height: 48, borderRadius: 6, overflow: "hidden" },
  actThumbImg: { width: "100%", height: "100%" },
  actInfo: { flex: 1, gap: 4 },
  actTitle: { fontFamily: "JetBrainsMono_500Medium", fontSize: 14 },
  actTime: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
  },
});
