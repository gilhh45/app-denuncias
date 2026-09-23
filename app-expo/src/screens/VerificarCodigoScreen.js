import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

/**
 * PASSO 2 de 3: confere o código enviado por e-mail.
 *
 * TODO (backend): sem banco de dados ainda, então qualquer código
 * preenchido é aceito (modo de teste). Quando existir um backend,
 * troque o corpo desta função para checar o código de verdade e
 * tratar o caso de código errado ou expirado.
 */
async function verificarCodigo(email, codigo) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return true; // modo de teste: sempre aceita
}

export default function VerificarCodigoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: c, theme } = useTheme();
  const isDark = theme === 'dark';
  const { email } = useLocalSearchParams();

  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (!codigo.trim()) {
      setError('Informe o código recebido por e-mail.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const ok = await verificarCodigo(email, codigo.trim());
      if (ok) {
        router.push({ pathname: '/redefinir-senha', params: { email } });
      } else {
        setError('Código inválido. Confira e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 8, borderBottomColor: c.border, backgroundColor: c.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Voltar">
          <Feather name="arrow-left" size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: c.primary }]}>DenuncieJá</Text>
      </View>

      <View style={styles.stepsRow}>
        <View style={[styles.stepDot, { backgroundColor: c.border }]} />
        <View style={[styles.stepLine, { backgroundColor: c.primary }]} />
        <View style={[styles.stepDot, { backgroundColor: c.primary }]} />
        <View style={[styles.stepLine, { backgroundColor: c.border }]} />
        <View style={[styles.stepDot, { backgroundColor: c.border }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.heading, { color: c.text }]}>VERIFIQUE SEU E-MAIL</Text>
        <Text style={[styles.subheading, { color: c.textMuted }]}>
          Enviamos um código de 6 dígitos para{' '}
          <Text style={{ color: c.text, fontFamily: 'HankenGrotesk_700Bold' }}>{email}</Text>.
        </Text>

        <View style={[styles.testBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Feather name="info" size={14} color={c.textMuted} />
          <Text style={[styles.testBoxText, { color: c.textMuted }]}>
            Ambiente de testes: qualquer código é aceito.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: c.text }]}>CÓDIGO DE VERIFICAÇÃO</Text>
            <TextInput
              style={[
                styles.input,
                styles.codeInput,
                { backgroundColor: c.inputBg, borderColor: error ? c.primary : c.border, color: c.text },
              ]}
              value={codigo}
              onChangeText={(t) => { setCodigo(t); setError(''); }}
              placeholder="••••••"
              placeholderTextColor={c.textPlaceholder}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleVerify}
              editable={!loading}
            />
          </View>

          {!!error && (
            <View style={[styles.box, { backgroundColor: isDark ? '#3b0f0f' : '#ffdad6' }]}>
              <Text style={[styles.boxText, { color: isDark ? '#ff8a80' : '#93000a' }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: c.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.submitLabel}>VERIFICAR CÓDIGO</Text>
                <Feather name="arrow-right" size={14} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.resendBtn}>
            <Text style={[styles.resendLabel, { color: c.primary }]}>NÃO RECEBEU? REENVIAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { padding: 6 },
  topTitle: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 20 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepLine: { width: 28, height: 2 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  heading: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 26, letterSpacing: 0.5 },
  subheading: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16, lineHeight: 24, marginTop: 8 },
  testBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 16 },
  testBoxText: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 12, flex: 1 },
  form: { marginTop: 24, gap: 16 },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 14, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, fontFamily: 'HankenGrotesk_400Regular' },
  codeInput: { textAlign: 'center', fontSize: 24, fontFamily: 'JetBrainsMono_700Bold', letterSpacing: 8 },
  box: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14 },
  boxText: { flex: 1, fontFamily: 'HankenGrotesk_400Regular', fontSize: 14, lineHeight: 20 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16 },
  submitLabel: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 12, color: '#fff', letterSpacing: 1.2 },
  resendBtn: { alignSelf: 'center', padding: 8 },
  resendLabel: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 12, letterSpacing: 0.6 },
});
