import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { useRouter } from 'expo-router'

import denunciasMock from '../data/denunciasMock.json';

const FILTERS = ['Todos', 'PENDENTE', 'ANÁLISE', 'CONCLUÍDO'];
const FILTER_LABELS = { Todos: 'Todos', PENDENTE: 'Pendentes', ANÁLISE: 'Em Análise', CONCLUÍDO: 'Concluídos' };

function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatProtocol(id) {
  return `PRT-${new Date().getFullYear()}-${id}`;
}

export default function HistoricoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { reports } = useApp();
  const c = colors;
  const [filter, setFilter] = useState('Todos');

  const localData = Array.isArray(denunciasMock) ? denunciasMock : [];
  const allReports = reports && reports.length > 0 ? reports : localData;

  const filtered = filter === 'Todos'
    ? allReports : allReports.filter(r=> (r.status || '').toUpperCase() === filter);

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
          keyExtractor={f => f}
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
              <Text style={[styles.chipLabel, { color: filter === f ? '#fff' : c.text }]}>
                {FILTER_LABELS[f]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={[styles.emptyBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.emptyText, { color: c.textMuted }]}>Nenhuma denúncia nesta categoria.</Text>
          </View>
        }
        renderItem={({ item: r }) => <ReportCard report={r} colors={c} router={router} />}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
}

function ReportCard({ report: r, colors: c }) {
  const isDone = r.status === 'CONCLUÍDO';
  const descriptionText = r.descricao || r.titulo || 'Sem descrição informada';
  const data = r.data;
  return (
    <View style={[
      styles.card,
      { backgroundColor: isDone ? (c === c ? '#f6f3f2' : '#1a1a1a') : c.bg, borderColor: c.border, opacity: isDone ? 0.8 : 1 },
    ]}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={styles.protocolRow}>
          <Feather name="hash" size={11} color={c.textMuted} />
          <Text style={[styles.protocolText, { color: c.text }]}>{formatProtocol(r.id)}</Text>
        </View>
        <StatusBadge status={r.status} />
      </View>

      {/* Title */}
      <Text style={[
        styles.cardTitle,
        { color: c.text, textDecorationLine: isDone ? 'line-through' : 'none' },
      ]}>
        {descriptionText?.slice(0, 45)}
      </Text>

      {/* Meta */}
      <View style={styles.cardMeta}>
        <View style={styles.metaRow}>
          <Feather name="calendar" size={12} color={c.textMuted} />
          <Text style={[styles.metaText, { color: c.textMuted }]}>{formatDate(data)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="eye-off" size={13} color={c.textMuted} />
          <Text style={[styles.metaText, { color: c.textMuted }]}>Denunciante Anônimo</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="link" size={12} color={c.textMuted} />
          <Text style={[styles.metaText, { color: c.textMuted }]}>
            {r.type === 'REDE SOCIAL' ? `Rede Social (${r.platform ?? ''})` : 'Website'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pageHeader: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8, gap: 8 },
  pageTitle: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 32, lineHeight: 38 },
  pageSubtitle: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16 },
  filterWrap: { marginBottom: 8 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipLabel: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  emptyBox: {
    padding: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 17,
    gap: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  protocolRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  protocolText: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 12, letterSpacing: 1.2 },
  cardTitle: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 20, lineHeight: 25 },
  cardMeta: { gap: 4, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 14, lineHeight: 21 },
});
