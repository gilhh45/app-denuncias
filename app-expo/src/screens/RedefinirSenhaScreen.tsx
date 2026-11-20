import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Aviso from '@/components/Aviso';
import Botao from '@/components/Botao';
import Cabecalho from '@/components/Cabecalho';
import Campo from '@/components/Campo';
import EstadoVazio from '@/components/EstadoVazio';
import Passos from '@/components/Passos';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { PASSOS_RECUPERACAO } from '@/screens/RecuperarSenhaScreen';
import { api, ErroApi } from '@/services/api';
import { espaco, raio, type Cores } from '@/theme';

/** Nota de 0 a 4 só para orientar quem está criando a senha. */
export function forcaDaSenha(senha: string) {
  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (/\d/.test(senha)) pontos++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;
  return senha.length < 6 ? 0 : pontos;
}

const NIVEIS: { rotulo: string; cor: keyof Cores }[] = [
  { rotulo: 'Muito curta', cor: 'danger' },
  { rotulo: 'Fraca', cor: 'danger' },
  { rotulo: 'Razoável', cor: 'warning' },
  { rotulo: 'Boa', cor: 'success' },
  { rotulo: 'Forte', cor: 'success' },
];

export default function RedefinirSenhaScreen() {
  const { colors } = useTheme();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const forca = forcaDaSenha(senha);

  async function salvar() {
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.');
    if (senha !== confirmacao) return setErro('As senhas não são iguais.');

    setErro('');
    setEnviando(true);
    try {
      await api.post('/auth/redefinir', { tokenRedefinicao: token, senha });
      setConcluido(true);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível salvar agora.');
    } finally {
      setEnviando(false);
    }
  }

  if (concluido) {
    return (
      <Tela style={estilos.centro}>
        <Animated.View entering={FadeInDown.duration(400)} style={estilos.sucesso}>
          <EstadoVazio
            icone="check-circle"
            titulo="Senha alterada"
            texto="Agora é só entrar com a senha nova."
          />
          <Botao
            titulo="Ir para o login"
            icone="log-in"
            onPress={() => router.dismissTo('/entrar')}
          />
        </Animated.View>
      </Tela>
    );
  }

  return (
    <Tela>
      <Cabecalho voltar titulo="Nova senha" />
      <Passos passos={PASSOS_RECUPERACAO} atual={2} />
      <Texto cor="textMuted">Crie uma senha nova. Use pelo menos 6 caracteres.</Texto>

      <Campo
        rotulo="Nova senha"
        icone="lock"
        senha
        value={senha}
        onChangeText={(t) => {
          setSenha(t);
          setErro('');
        }}
        placeholder="Mínimo de 6 caracteres"
        autoComplete="new-password"
        textContentType="newPassword"
        autoFocus
      />
      {senha.length > 0 && (
        <View style={estilos.forca} accessibilityLabel={`Força da senha: ${NIVEIS[forca].rotulo}`}>
          <View style={estilos.barras}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  estilos.barra,
                  { backgroundColor: i <= forca ? colors[NIVEIS[forca].cor] : colors.border },
                ]}
              />
            ))}
          </View>
          <Texto variante="legenda" cor={NIVEIS[forca].cor}>
            {NIVEIS[forca].rotulo}
          </Texto>
        </View>
      )}
      <Campo
        rotulo="Confirmar nova senha"
        icone="lock"
        senha
        value={confirmacao}
        onChangeText={(t) => {
          setConfirmacao(t);
          setErro('');
        }}
        placeholder="Repita a senha"
        autoComplete="new-password"
        returnKeyType="done"
        onSubmitEditing={salvar}
      />

      {!!erro && <Aviso tipo="erro">{erro}</Aviso>}
      <Botao titulo="Salvar nova senha" icone="save" onPress={salvar} carregando={enviando} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  centro: { justifyContent: 'center' },
  sucesso: { gap: espaco.lg },
  forca: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, marginTop: -espaco.sm },
  barras: { flex: 1, flexDirection: 'row', gap: espaco.xs },
  barra: { flex: 1, height: 4, borderRadius: raio.pill },
});
