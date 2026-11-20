import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import Aviso from '@/components/Aviso';
import Botao from '@/components/Botao';
import Cabecalho from '@/components/Cabecalho';
import Passos from '@/components/Passos';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { PASSOS_RECUPERACAO } from '@/screens/RecuperarSenhaScreen';
import { api, ErroApi } from '@/services/api';
import { espaco, fontes, raio } from '@/theme';

const TAMANHO = 6;
const ESPERA_REENVIO = 30;

export default function VerificarCodigoScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ email: string; codigoDemo?: string }>();
  const entrada = useRef<ComponentRef<typeof TextInput>>(null);

  const [codigo, setCodigo] = useState('');
  const [codigoDemo, setCodigoDemo] = useState(params.codigoDemo ?? '');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(ESPERA_REENVIO);
  const [focado, setFocado] = useState(true);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function verificar(valor = codigo) {
    if (valor.length !== TAMANHO) {
      setErro('Digite os 6 números do código.');
      return;
    }
    setErro('');
    setEnviando(true);
    try {
      const r = await api.post<{ tokenRedefinicao: string }>('/auth/verificar-codigo', {
        email: params.email,
        codigo: valor,
      });
      router.replace({ pathname: '/redefinir-senha', params: { token: r.tokenRedefinicao } });
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível verificar agora.');
      setCodigo('');
    } finally {
      setEnviando(false);
    }
  }

  async function reenviar() {
    setErro('');
    setCodigo('');
    try {
      const r = await api.post<{ codigoDemo?: string }>('/auth/recuperar', { email: params.email });
      setCodigoDemo(r.codigoDemo ?? '');
      setEspera(ESPERA_REENVIO);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível reenviar agora.');
    }
  }

  function digitar(texto: string) {
    const limpo = texto.replace(/\D/g, '').slice(0, TAMANHO);
    setCodigo(limpo);
    setErro('');
    if (limpo.length === TAMANHO) verificar(limpo);
  }

  return (
    <Tela>
      <Cabecalho voltar titulo="Digite o código" />
      <Passos passos={PASSOS_RECUPERACAO} atual={1} />
      <Texto cor="textMuted">
        Enviamos um código de 6 números para <Texto variante="destaque">{params.email}</Texto>. Ele
        vale por 15 minutos.
      </Texto>

      {!!codigoDemo && (
        <Aviso tipo="info">
          {`Modo de demonstração (sem envio de e-mail): seu código é ${codigoDemo}.`}
        </Aviso>
      )}

      <Pressable
        onPress={() => entrada.current?.focus()}
        style={estilos.caixas}
        accessibilityLabel="Código de verificação">
        {Array.from({ length: TAMANHO }, (_, i) => {
          const ativa = focado && i === Math.min(codigo.length, TAMANHO - 1);
          return (
            <View
              key={i}
              style={[
                estilos.caixa,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: erro ? colors.danger : ativa ? colors.primary : colors.inputBorder,
                },
              ]}>
              <Texto style={estilos.digito}>{codigo[i] ?? ''}</Texto>
            </View>
          );
        })}
        <TextInput
          ref={entrada}
          value={codigo}
          onChangeText={digitar}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={TAMANHO}
          autoFocus
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          style={estilos.escondido}
          accessibilityLabel="Código de 6 números"
        />
      </Pressable>

      {!!erro && <Aviso tipo="erro">{erro}</Aviso>}

      <Botao titulo="Verificar" icone="check" onPress={() => verificar()} carregando={enviando} />
      <Botao
        titulo={espera > 0 ? `Reenviar código em ${espera}s` : 'Reenviar código'}
        variante="fantasma"
        desabilitado={espera > 0}
        onPress={reenviar}
      />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  caixas: { flexDirection: 'row', justifyContent: 'space-between', gap: espaco.sm },
  caixa: {
    flex: 1,
    maxWidth: 56,
    aspectRatio: 0.85,
    borderWidth: 1.5,
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digito: { fontFamily: fontes.monoNegrito, fontSize: 24 },
  escondido: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
