import { router } from 'expo-router';
import { useState } from 'react';

import Aviso from '@/components/Aviso';
import Botao from '@/components/Botao';
import Cabecalho from '@/components/Cabecalho';
import Campo from '@/components/Campo';
import Passos from '@/components/Passos';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { api, ErroApi } from '@/services/api';
import { emailValido } from '@/utils';

export const PASSOS_RECUPERACAO = ['E-mail', 'Código', 'Nova senha'];

export default function RecuperarSenhaScreen() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!emailValido(email)) {
      setErro('Digite o e-mail da sua conta.');
      return;
    }
    setErro('');
    setEnviando(true);
    try {
      const r = await api.post<{ codigoDemo?: string }>('/auth/recuperar', {
        email: email.trim(),
      });
      router.push({
        pathname: '/verificar-codigo',
        params: { email: email.trim().toLowerCase(), codigoDemo: r.codigoDemo ?? '' },
      });
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível enviar agora.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Tela>
      <Cabecalho voltar titulo="Recuperar senha" />
      <Passos passos={PASSOS_RECUPERACAO} atual={0} />
      <Texto cor="textMuted">
        Informe o e-mail da sua conta. Vamos gerar um código de 6 números para você criar uma nova
        senha.
      </Texto>
      <Campo
        rotulo="E-mail"
        icone="mail"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setErro('');
        }}
        placeholder="voce@email.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={enviar}
        autoFocus
      />
      {!!erro && <Aviso tipo="erro">{erro}</Aviso>}
      <Botao titulo="Enviar código" icone="send" onPress={enviar} carregando={enviando} />
    </Tela>
  );
}
