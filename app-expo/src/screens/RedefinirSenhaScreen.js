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
 * PASSO 3 de 3: define a nova senha.
 *
 * TODO (backend): sem banco de dados ainda, então a senha não é
 * salva em lugar nenhum, só validada no formato. Quando existir um
 * backend, troque o corpo desta função para atualizar a senha do
 * usuário (email) de verdade.
 */
async function salvarNovaSenha(email, novaSenha) {
  await new Promise((resolve) => setTimeout(resolve, 800));
}

export default function RedefinirSenhaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: c, theme } = useTheme();
  const isDark = theme === 'dark';
  const { email } = useLocalSearchParams();

  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSave() {
    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      setError('As senhas não coincidem.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await salvarNovaSenha(email, senha);
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <View style={[styles.root, styles.doneRoot, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <View style={[styles.doneIcon, { backgroundColor: c.greenBg }]}>
          <Feather name="check" size={32} color={c.green} />
        </View>
        <Text style={[styles.heading, { color: c.text, textAlign: 'center' }]}>SENHA REDEFINIDA!</Text>
        <Text style={[styles.subheading, { color: c.textMuted, textAlign: 'center' }]}>
          Sua senha foi atualizada. Você já pode entrar com a nova senha.
        </Text>
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: c.primary, marginTop: 32, alignSelf: 'stretch' }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.submitLabel}>IR PARA O LOGIN</Text>
        </TouchableOpacity>
      </View>
    );
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
        <View style={[styles.stepLine, { backgroundColor: c.border }]} />
        <View style={[styles.stepDot, { backgroundColor: c.border }]} />
        <View style={[styles.stepLine, { backgroundColor: c.primary }]} />
        <View style={[styles.stepDot, { backgroundColor: c.primary }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.heading, { color: c.text }]}>NOVA SENHA</Text>
        <Text style={[styles.subheading, { color: c.textMuted }]}>
          Escolha uma nova senha para a conta {email ? String(email) : ''}.
        </Text>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: c.text }]}>NOVA SENHA</Text>
            <View>
              <TextInput
                style={[styles.input, { backgroundColor: c.inputBg, borderColor: error ? c.primary : c.border, color: c.text, paddingRight: 44 }]}
                value={senha}
                onChangeText={(t) => { setSenha(t); setError(''); }}
                placeholder="••••••••"
                placeholderTextColor={c.textPlaceholder}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={c.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: c.text }]}>CONFIRMAR NOVA SENHA</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.inputBg, borderColor: error ? c.primary : c.border, color: c.text }]}
              value={confirmar}
              onChangeText={(t) => { setConfirmar(t); setError(''); }}
              placeholder="••••••••"
              placeholderTextColor={c.textPlaceholder}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleSave}
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
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitLabel}>REDEFINIR SENHA</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  doneRoot: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { padding: 6 },
  topTitle: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 20 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepLine: { width: 28, height: 2 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  heading: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 26, letterSpacing: 0.5 },
  subheading: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16, lineHeight: 24, marginTop: 8 },
  form: { marginTop: 28, gap: 16 },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 14, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, fontFamily: 'HankenGrotesk_400Regular' },
  eyeBtn: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 44, alignItems: 'center', justifyContent: 'center' },
  box: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14 },
  boxText: { flex: 1, fontFamily: 'HankenGrotesk_400Regular', fontSize: 14, lineHeight: 20 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16 },
  submitLabel: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 12, color: '#fff', letterSpacing: 1.2 },
});
