import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StatusBadge from '../components/StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

import denunciasMock from '../data/denuncias.json';

export default function StatusScreen() {
  const { colors } = useTheme();
  const { reports } = useApp();
  const c = colors;

  const localData = Array.isArray(denunciasMock) ? denunciasMock : [];
  const allReports = reports && reports.length > 0 ? reports : localData;

  const counts = { PENDENTE: 0, ANÁLISE: 0, CONCLUÍDO: 0 };
  allReports.forEach(r => { counts[r.status] = (counts[r.status] ?? 0) + 1; });

  return (
    <ScrollView style={[styles.root, { backgroundColor: c.bg }]} contentContainerStyle={styles.scroll}>
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: c.text }]}>Status</Text>
        <Text style={[styles.pageSubtitle, { color: c.textMuted }]}>Resumo das suas denúncias por estado.</Text>
      </View>

      {(['PENDENTE', 'ANÁLISE', 'CONCLUÍDO']).map(s => (
        <View key={s} style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}>
          <StatusBadge status={s} />
          <Text style={[styles.count, { color: c.primary }]}>{counts[s]}</Text>
        </View>
      ))}

      {allReports.length === 0 && (
        <Text style={[styles.empty, { color: c.textMuted }]}>Nenhuma denúncia enviada ainda.</Text>
      )}

      <View style={[styles.totalRow, { borderTopColor: c.divider }]}>
        <Text style={[styles.totalLabel, { color: c.textMuted }]}>TOTAL</Text>
        <Text style={[styles.totalNum, { color: c.text }]}>{allReports.length}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, gap: 12, paddingBottom: 48 },
  pageHeader: { gap: 8, paddingTop: 8, marginBottom: 8 },
  pageTitle: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 32, lineHeight: 38 },
  pageSubtitle: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  count: { fontFamily: 'HankenGrotesk_800ExtraBold', fontSize: 32 },
  empty: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16, textAlign: 'center', paddingVertical: 32 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
  totalLabel: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 12, letterSpacing: 1.2 },
  totalNum: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 24 },
});
