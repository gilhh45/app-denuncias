import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Aviso from '@/components/Aviso';
import Botao from '@/components/Botao';
import Campo from '@/components/Campo';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ErroApi } from '@/services/api';
import { espaco, raio } from '@/theme';

const LOGO = require('../../assets/images/icon.png');

export default function AuthScreen() {
  const { colors, escuro, toggle } = useTheme();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    setErro('');
    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      router.replace('/painel');
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível entrar agora.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Tela style={estilos.tela}>
      <View style={estilos.topo}>
        <Pressable
          onPress={toggle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={escuro ? 'Usar tema claro' : 'Usar tema escuro'}
          style={[estilos.iconeTema, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name={escuro ? 'sun' : 'moon'} size={18} color={colors.text} />
        </Pressable>
      </View>

      <Animated.View entering={FadeInDown.duration(400)} style={estilos.marca}>
        <View style={estilos.logoCaixa}>
          <Image source={LOGO} style={estilos.logo} contentFit="cover" />
        </View>
        <Texto variante="titulo" centro>
          DenuncieJá
        </Texto>
        <Texto cor="textMuted" centro>
          Denuncie golpes, perfis falsos e conteúdo ilegal na internet.
        </Texto>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={[estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Texto variante="subtitulo">Entrar</Texto>

        <Campo
          rotulo="E-mail"
          icone="mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <Campo
          rotulo="Senha"
          icone="lock"
          senha
          value={senha}
          onChangeText={setSenha}
          placeholder="Sua senha"
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={enviar}
        />

        <Pressable
          onPress={() => router.push('/recuperar-senha')}
          hitSlop={8}
          accessibilityRole="link"
          style={estilos.esqueci}>
          <Texto variante="destaque" cor="primary">
            Esqueci minha senha
          </Texto>
        </Pressable>

        {!!erro && <Aviso tipo="erro">{erro}</Aviso>}

        <Botao titulo="Entrar" icone="log-in" onPress={enviar} carregando={enviando} />
      </Animated.View>

      <View style={estilos.rodape}>
        <Feather name="shield" size={14} color={colors.success} />
        <Texto variante="legenda">Conexão protegida e senha criptografada.</Texto>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  tela: { justifyContent: 'center', gap: espaco.xl },
  topo: { alignItems: 'flex-end' },
  iconeTema: {
    width: 40,
    height: 40,
    borderRadius: raio.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marca: { alignItems: 'center', gap: espaco.sm },
  logoCaixa: {
    width: 84,
    height: 84,
    borderRadius: raio.xl,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginBottom: espaco.sm,
  },
  logo: { width: 84, height: 84 },
  cartao: {
    borderWidth: 1,
    borderRadius: raio.xl,
    padding: espaco.xl,
    gap: espaco.lg,
  },
  esqueci: { alignSelf: 'flex-end', marginTop: -espaco.sm },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
  },
});
