import { Feather,Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

import denunciasMock from "../data/denunciasMock.json";

const FILTERS = ["Todos", "PENDENTE", "ANÁLISE", "CONCLUÍDO"];
const FILTER_LABELS = {
  Todos: "Todos",
  PENDENTE: "Pendentes",
  ANÁLISE: "Em Análise",
  CONCLUÍDO: "Concluídos",
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatProtocol(id) {
  return `PRT-${new Date().getFullYear()}-${id}`;
}

export default function HistoricoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { reports } = useApp();
  const c = colors;
  const [filter, setFilter] = useState("Todos");

  const localData = Array.isArray(denunciasMock) ? denunciasMock : [];
  const allReports = reports && reports.length > 0 ? reports : localData;

  const filtered =
    filter === "Todos"
      ? allReports
      : allReports.filter((r) => (r.status || "").toUpperCase() === filter);

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: c.text }]}>Histórico</Text>
        <Text style={[styles.pageSubtitle, { color: c.textMuted }]}>
          Acompanhe o andamento das suas denúncias.
        </Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterWrap}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f) => f}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  backgroundColor: filter === f ? c.primary : c.card,
                  borderColor: filter === f ? c.primary : c.border,
                },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: filter === f ? "#fff" : c.text },
                ]}
              >
                {FILTER_LABELS[f]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyBox,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              Nenhuma denúncia nesta categoria.
            </Text>
          </View>
        }
        renderItem={({ item: r }) => (
          <ReportCard report={r} colors={c} router={router} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
}

function ReportCard({ report: r, colors: c }) {
  const isDone = r.status === 'CONCLUÍDO';
  const tituloText = r.titulo || 'Sem título informado';
  const categoryText = r.category || r.categCanal || 'Sem categoria';
  const data = r.createdAt || r.data;

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.protocolWrap}>
          <Ionicons name="document-text-outline" size={16} color={c.text} />
          <Text style={[styles.protocol, { color: c.text }]}>
            {formatProtocol(r.id)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isDone ? c.success : c.warning }]}>
          <Text style={styles.statusText}>{r.status}</Text>
        </View>
      </View>

      {/* Título com destaque */}
      <Text style={[styles.title, { color: c.text }]}>
        {tituloText.slice(0, 50)}
      </Text>

      {/* Categoria em formato de Tag/Badge separado */}
      <View style={styles.categoryRow}>
        <Ionicons name="pricetag-outline" size={14} color={c.textMuted} />
        <Text style={[styles.categoryText, { color: c.textMuted }]}>
          {categoryText.toUpperCase()}
        </Text>
      </View>

      {/* Meta */}
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={c.textMuted} />
          <Text style={[styles.metaText, { color: c.textMuted }]}>
            {formatDate(data)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color={c.textMuted} />
          <Text style={[styles.metaText, { color: c.textMuted }]}>
            Denunciante Anônimo
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="globe-outline" size={14} color={c.textMuted} />
          <Text style={[styles.metaText, { color: c.textMuted }]}>
            {r.type === "REDE SOCIAL"
              ? `Rede Social (${r.platform ?? ""})`
              : "Website"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 8,
  },
  pageTitle: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 32,
    lineHeight: 38,
  },
  pageSubtitle: { fontFamily: "HankenGrotesk_400Regular", fontSize: 16 },
  filterWrap: { marginBottom: 8 },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipLabel: { fontFamily: "JetBrainsMono_500Medium", fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  emptyBox: {
    padding: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: { fontFamily: "HankenGrotesk_400Regular", fontSize: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 17,
    gap: 8,
  },
  cardTop: {
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
  cardTitle: {
    fontFamily: "HankenGrotesk_400Regular",
    fontSize: 20,
    lineHeight: 25,
  },
  cardMeta: { gap: 4, marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: {
    fontFamily: "HankenGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  
categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 2,
    marginBottom: 6,
  },
  categoryTagText: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 11,
    letterSpacing: 0.6,
  },

});
