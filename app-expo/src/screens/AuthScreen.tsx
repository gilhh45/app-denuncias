import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

import Aviso from '@/components/Aviso';
import Botao from '@/components/Botao';
import Campo from '@/components/Campo';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { API_URL, ErroApi } from '@/services/api';
import { boasVindas } from '@/services/conta';
import { espaco, fontes, raio } from '@/theme';
import { emailValido } from '@/utils';

const LOGO = require('../../assets/images/icon.png');

type Modo = 'entrar' | 'cadastrar';
type Erros = Partial<Record<'nome' | 'email' | 'senha' | 'confirmacao' | 'geral', string>> & {
  semConexao?: boolean;
};

export default function AuthScreen() {
  const { colors, escuro, toggle } = useTheme();
  const { entrar, cadastrar, avisoSessao } = useAuth();

  const [modo, setModo] = useState<Modo>('entrar');
  useEffect(() => {
    boasVindas.vista().then((vista) => {
      if (!vista) router.replace('/boas-vindas');
    });
  }, []);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);

  const cadastro = modo === 'cadastrar';

  function trocarModo(novo: Modo) {
    setModo(novo);
    setErros({});
  }

  function validar(): Erros {
    const e: Erros = {};
    if (cadastro && nome.trim().length < 3) e.nome = 'Digite seu nome (pelo menos 3 letras).';
    if (!emailValido(email)) e.email = 'Digite um e-mail válido.';
    if (cadastro && senha.length < 6) e.senha = 'A senha precisa ter pelo menos 6 caracteres.';
    if (!cadastro && !senha) e.senha = 'Digite sua senha.';
    if (cadastro && senha !== confirmacao) e.confirmacao = 'As senhas não são iguais.';
    return e;
  }

  async function enviar() {
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    try {
      if (cadastro) await cadastrar(nome.trim(), email.trim(), senha);
      else await entrar(email.trim(), senha);
      // não precisa navegar: o layout raiz troca para as abas quando o usuário entra
    } catch (e) {
      if (e instanceof ErroApi && e.campo === 'email') setErros({ email: e.message });
      else {
        setErros({
          geral: e instanceof ErroApi ? e.message : 'Não foi possível entrar agora.',
          semConexao: e instanceof ErroApi && e.status === 0,
        });
      }
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
        layout={LinearTransition.duration(250)}
        style={[estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View
          style={[estilos.abas, { backgroundColor: colors.cardAlt }]}
          accessibilityRole="tablist">
          {(['entrar', 'cadastrar'] as const).map((m) => {
            const ativo = modo === m;
            return (
              <Pressable
                key={m}
                onPress={() => trocarModo(m)}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativo }}
                style={[estilos.aba, ativo && { backgroundColor: colors.card }]}>
                <Texto
                  style={[estilos.abaTexto, { color: ativo ? colors.text : colors.textMuted }]}>
                  {m === 'entrar' ? 'Entrar' : 'Criar conta'}
                </Texto>
              </Pressable>
            );
          })}
        </View>

        {cadastro && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Campo
              rotulo="Nome"
              icone="user"
              value={nome}
              onChangeText={setNome}
              placeholder="Como você se chama"
              autoComplete="name"
              textContentType="name"
              erro={erros.nome}
            />
          </Animated.View>
        )}
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
          erro={erros.email}
        />
        <Campo
          rotulo="Senha"
          icone="lock"
          senha
          value={senha}
          onChangeText={setSenha}
          placeholder={cadastro ? 'Mínimo de 6 caracteres' : 'Sua senha'}
          autoComplete={cadastro ? 'new-password' : 'password'}
          textContentType={cadastro ? 'newPassword' : 'password'}
          returnKeyType={cadastro ? 'next' : 'go'}
          onSubmitEditing={cadastro ? undefined : enviar}
          erro={erros.senha}
        />
        {cadastro && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Campo
              rotulo="Confirmar senha"
              icone="lock"
              senha
              value={confirmacao}
              onChangeText={setConfirmacao}
              placeholder="Repita a senha"
              autoComplete="new-password"
              returnKeyType="go"
              onSubmitEditing={enviar}
              erro={erros.confirmacao}
            />
          </Animated.View>
        )}

        {!cadastro && (
          <Pressable
            onPress={() => router.push('/recuperar-senha')}
            hitSlop={8}
            accessibilityRole="link"
            style={estilos.esqueci}>
            <Texto variante="destaque" cor="primary">
              Esqueci minha senha
            </Texto>
          </Pressable>
        )}

        {!!avisoSessao && !erros.geral && <Aviso tipo="alerta">{avisoSessao}</Aviso>}
        {!!erros.geral && (
          <Aviso tipo="erro">
            <Texto cor="danger">{erros.geral}</Texto>
            {erros.semConexao && (
              <Texto variante="legenda" cor="danger" selectable>
                Endereço da API: {API_URL}
              </Texto>
            )}
          </Aviso>
        )}

        <Botao
          titulo={cadastro ? 'Criar conta' : 'Entrar'}
          icone={cadastro ? 'user-plus' : 'log-in'}
          onPress={enviar}
          carregando={enviando}
        />
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
  abas: { flexDirection: 'row', borderRadius: raio.md, padding: 4 },
  aba: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: raio.sm },
  abaTexto: { fontFamily: fontes.semi, fontSize: 14 },
  esqueci: { alignSelf: 'flex-end', marginTop: -espaco.sm },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
  },
});
