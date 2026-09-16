import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useRouter } from 'expo-router';

const PLATFORMS = ['Instagram', 'Twitter/X', 'Facebook', 'TikTok', 'YouTube', 'Outros'];

function genCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

function calcCredScore(desc, files, url) {
  let score = 15;
  if (url.startsWith('https://')) score += 35;
  if (desc.length > 50) score += 20;
  if (desc.length > 150) score += 10;
  if (files.length >= 1) score += 15;
  if (files.length >= 3) score += 5;
  return Math.min(score, 100);
}

export default function NovaDenunciaScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addReport, getRateLimitStatus, isDuplicateUrl } = useApp();
  const c = colors;

  const [type, setType] = useState('SITE');
  const [platform, setPlatform] = useState('Instagram');
  const [profileId, setProfileId] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [captcha] = useState(genCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');

  const { isRateLimited, cooldownSec, inCooldown } = getRateLimitStatus();
  const credScore = useMemo(() => calcCredScore(description, files, url), [description, files, url]);

  async function pickImages() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para anexar evidências.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setFiles(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  }

  function handleSubmit() {
    if (isRateLimited) { setError(`Limite de 3 denúncias/hora atingido.`); return; }
    if (inCooldown) { setError(`Aguarde ${cooldownSec}s antes de enviar.`); return; }
    if (!url) { setError('Informe a URL.'); return; }
    if (description.trim().length < 20) { setError('Descreva com pelo menos 20 caracteres.'); return; }
    if (parseInt(captchaInput) !== captcha.answer) { setError('Resposta da verificação incorreta.'); return; }
    if (isDuplicateUrl(url)) { setError('Você já denunciou esta URL.'); return; }

    const report = {
      id: Math.random().toString(36).slice(2, 6).toUpperCase(),
      type,
      platform: type === 'REDE SOCIAL' ? platform : undefined,
      profileId: type === 'REDE SOCIAL' ? profileId : undefined,
      url,
      description,
      files,
      createdAt: new Date(),
      status: 'PENDENTE',
      credScore,
    };
    const earned = addReport(report);
    router.push({
      pathname: '/sucesso',
      params: {
        id:report.id,
        earned: earned,
        credScore: report.credScore
      }
    });
  }

  const scoreColor = credScore >= 70 ? '#00694d' : c.primary;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header section */}
        <View style={[styles.headerSection, { backgroundColor: c.bg, borderBottomColor: c.divider }]}>
          <View style={[styles.anonBadge, { backgroundColor: c.text }]}>
            <Feather name="lock" size={12} color={c.bg} />
            <Text style={[styles.anonLabel, { color: c.bg }]}>ANÔNIMO</Text>
          </View>
          <Text style={[styles.formTitle, { color: c.text }]}>Nova Denúncia</Text>
          <Text style={[styles.formSubtitle, { color: c.textMuted }]}>
            Sua identidade está protegida por criptografia de ponta a ponta.
          </Text>
        </View>

        {/* Rate limit banner */}
        {(isRateLimited || inCooldown) && (
          <View style={styles.rateBanner}>
            <Feather name="clock" size={14} color="#fb923c" />
            <Text style={styles.rateText}>
              {isRateLimited ? 'Limite de 3 denúncias/hora atingido.' : `Aguarde ${cooldownSec}s.`}
            </Text>
          </View>
        )}

        {/* Type selection */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: c.text }]}>ORIGEM DA AMEAÇA</Text>
          <View style={[styles.typeRow, { borderColor: c.text }]}>
            {['SITE', 'REDE SOCIAL'].map(tp => (
              <TouchableOpacity
                key={tp}
                style={[styles.typeBtn, {
                  flex: 1,
                  backgroundColor: type === tp ? c.text : c.bg,
                  borderRightWidth: tp === 'SITE' ? 2 : 0,
                  borderRightColor: c.text,
                }]}
                onPress={() => setType(tp)}
              >
                <Text style={[styles.typeBtnLabel, { color: type === tp ? c.bg : c.text }]}>{tp}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {type === 'REDE SOCIAL' && (
          <>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: c.text }]}>PLATAFORMA</Text>
              <View style={styles.platformRow}>
                {PLATFORMS.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.platformChip, {
                      backgroundColor: platform === p ? c.text : c.card,
                      borderColor: platform === p ? c.text : c.border,
                    }]}
                    onPress={() => setPlatform(p)}
                  >
                    <Text style={[styles.platformLabel, { color: platform === p ? c.bg : c.textMuted }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: c.text }]}>NOME / ID DO PERFIL</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
                value={profileId}
                onChangeText={setProfileId}
                placeholder="@usuario ou ID numérico"
                placeholderTextColor={c.textPlaceholder}
              />
            </View>
          </>
        )}

        {/* URL */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: c.text }]}>URL / LINK DIRETO</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            placeholderTextColor={c.textPlaceholder}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <View style={styles.fieldLabelRow}>
            <Text style={[styles.fieldLabel, { color: c.text }]}>DESCRIÇÃO DETALHADA</Text>
            <Text style={[styles.charCount, { color: description.length < 20 ? c.primary : '#00694d' }]}>
              {description.length} car.
            </Text>
          </View>
          <TextInput
            style={[styles.textarea, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva o conteúdo ou atividade suspeita..."
            placeholderTextColor={c.textPlaceholder}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Evidence upload */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: c.text }]}>EVIDÊNCIAS (OPCIONAL)</Text>
          <TouchableOpacity
            style={[styles.uploadBox, { backgroundColor: c.cardWhite, borderColor: c.border }]}
            onPress={pickImages}
            activeOpacity={0.8}
          >
            <Feather name="upload-cloud" size={32} color={c.inputBorder} />
            <Text style={[styles.uploadTitle, { color: c.text }]}>Toque para anexar prints</Text>
            <Text style={[styles.uploadSub, { color: c.textMuted }]}>JPG, PNG máx 5MB</Text>
          </TouchableOpacity>
          {files.map((f, i) => (
            <View key={i} style={[styles.fileRow, { backgroundColor: c.card, borderColor: c.border }]}>
              <Feather name="paperclip" size={12} color={c.textMuted} />
              <Text style={[styles.fileName, { color: c.textMuted }]} numberOfLines={1}>
                {f.split('/').pop()}
              </Text>
              <TouchableOpacity onPress={() => setFiles(p => p.filter((_, j) => j !== i))}>
                <Feather name="x" size={14} color={c.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Live credibility score */}
        <View style={[styles.scoreCard, { backgroundColor: c.cardWhite, borderColor: c.border }]}>
          <View style={styles.scoreHeader}>
            <View>
              <Text style={[styles.scoreTitle, { color: c.textMuted }]}>Score de Impacto</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                <Text style={[styles.scoreNum, { color: c.primary }]}>{credScore}</Text>
                <Text style={[styles.scoreTotal, { color: c.textMuted }]}>/100</Text>
              </View>
            </View>
            <View style={[styles.scoreIcon, { backgroundColor: c.card }]}>
              <Feather name="info" size={20} color={c.primary} />
            </View>
          </View>
          <View style={[styles.progressBg, { backgroundColor: c.divider }]}>
            <View style={[styles.progressFill, { width: `${credScore}%`, backgroundColor: c.primary }]} />
          </View>
          <View style={[styles.scoreHint, { backgroundColor: c.card, borderLeftColor: c.primary }]}>
            <Text style={[styles.scoreHintText, { color: c.textMuted }]}>
              {credScore < 40
                ? 'Adicione uma URL válida para +35 pts.'
                : credScore < 70
                ? 'Adicione prints para mais credibilidade.'
                : 'Boa credibilidade! Pronto para enviar.'}
            </Text>
          </View>
        </View>

        {/* Captcha */}
        <View style={[styles.captchaBox, { backgroundColor: c.divider, borderColor: c.inputBorder }]}>
          <Feather name="shield" size={18} color={c.text} />
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={[styles.captchaTitle, { color: c.text }]}>Verificação Humana</Text>
            <View style={styles.captchaRow}>
              <Text style={[styles.captchaQuestion, { color: c.text }]}>{captcha.a} + {captcha.b} =</Text>
              <TextInput
                style={[styles.captchaInput, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text }]}
                value={captchaInput}
                onChangeText={setCaptchaInput}
                placeholder="?"
                placeholderTextColor={c.textPlaceholder}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit */}
        <View style={{ gap: 6 }}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: isRateLimited || inCooldown ? c.divider : c.primary,
                opacity: isRateLimited || inCooldown ? 0.5 : 1 },
            ]}
            onPress={handleSubmit}
            disabled={isRateLimited || inCooldown}
            activeOpacity={0.85}
          >
            <Text style={[styles.submitLabel, { color: isRateLimited || inCooldown ? c.textMuted : '#fff' }]}>
              ENVIAR DENÚNCIA
            </Text>
          </TouchableOpacity>
          {inCooldown && (
            <Text style={[styles.cooldownLabel, { color: c.textMuted }]}>
              LIMITE: 1 envio por minuto. Faltam {cooldownSec}s.
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, gap: 32, paddingBottom: 48 },
  headerSection: { gap: 8, paddingBottom: 16, borderBottomWidth: 1 },
  anonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  anonLabel: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 14, letterSpacing: 1.4 },
  formTitle: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16, marginTop: 4 },
  formSubtitle: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16, lineHeight: 24 },
  rateBanner: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3b1f0a',
    alignItems: 'center',
  },
  rateText: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 14, color: '#fb923c', flex: 1 },
  field: { gap: 8 },
  fieldLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 12 },
  typeRow: { flexDirection: 'row', borderWidth: 2, borderRadius: 4, overflow: 'hidden', padding: 2 },
  typeBtn: { paddingVertical: 16, alignItems: 'center' },
  typeBtnLabel: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 16 },
  platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  platformChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  platformLabel: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 17,
    paddingVertical: 13,
    fontSize: 16,
    fontFamily: 'HankenGrotesk_400Regular',
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 17,
    paddingVertical: 17,
    fontSize: 16,
    fontFamily: 'HankenGrotesk_400Regular',
    minHeight: 130,
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 4,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 6,
  },
  uploadTitle: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 16 },
  uploadSub: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 12 },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  fileName: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 12, flex: 1 },
  scoreCard: { borderWidth: 1, borderRadius: 4, padding: 17, gap: 16 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  scoreTitle: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 16 },
  scoreNum: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16 },
  scoreTotal: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 14 },
  scoreIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  progressBg: { height: 12, borderRadius: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 12 },
  scoreHint: {
    borderLeftWidth: 2,
    borderRadius: 2,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 8,
  },
  scoreHintText: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 14, lineHeight: 20 },
  captchaBox: {
    flexDirection: 'row',
    gap: 16,
    padding: 17,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  captchaTitle: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 16 },
  captchaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  captchaQuestion: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 16 },
  captchaInput: {
    width: 72,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'HankenGrotesk_400Regular',
    textAlign: 'center',
  },
  errorBox: { backgroundColor: '#ffdad6', borderRadius: 4, padding: 12 },
  errorText: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 14, color: '#93000a' },
  submitBtn: {
    borderRadius: 2,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 16,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  cooldownLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
