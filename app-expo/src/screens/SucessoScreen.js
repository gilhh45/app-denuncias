import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';


function formatProtocol(id) {
  return `PRT-${new Date().getFullYear()}-${id}`;
}

export default function SucessoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const c = colors;
  const { id, earned, credScore } = useLocalSearchParams();

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <View style={[styles.checkCircle, { backgroundColor: c.greenBg, borderColor: '#00694d' }]}>
        <Feather name="check" size={32} color="#00694d" />
      </View>

      <Text style={[styles.title, { color: c.text }]}>Denúncia enviada</Text>
      <Text style={[styles.subtitle, { color: c.textMuted }]}>Registrada de forma anônima e segura.</Text>

      <View style={styles.infoCards}>
        <InfoRow label="Protocolo" value={id ? `#${id}` : 'N/A'} valueColor={c.primary} colors={c} />
        <InfoRow label="Confiabilidade" value={`${credScore}/100`} valueColor={c.primary} colors={c} />
        <InfoRow label="Pontos ganhos" value={`+${earned ?? 0} pts`} valueColor="#00694d" colors={c} />
      </View>

      <Text style={[styles.notice, { color: c.textMuted }]}>
        Sua identidade é protegida. Nenhum dado pessoal foi associado a esta denúncia.
      </Text>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: c.primary }]}
        onPress={() => router.replace('/painel')}
        activeOpacity={0.85}
      >
        <Text style={styles.btnLabel}>VOLTAR AO INÍCIO</Text>
      </TouchableOpacity>
    </View>
  );
}

function InfoRow({ label, value, valueColor, colors: c }) {
  return (
    <View style={[styles.infoRow, { backgroundColor: c.card, borderColor: c.border }]}>
      <Text style={[styles.infoLabel, { color: c.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 24,
  },
  title: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 32, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16, marginBottom: 32, textAlign: 'center' },
  infoCards: { width: '100%', maxWidth: 320, gap: 8, marginBottom: 32 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoLabel: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 12 },
  infoValue: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 14 },
  notice: {
    fontFamily: 'HankenGrotesk_400Regular',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: 32,
  },
  btn: {
    borderRadius: 2,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  btnLabel: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 12, color: '#fff', letterSpacing: 1.2 },
});
