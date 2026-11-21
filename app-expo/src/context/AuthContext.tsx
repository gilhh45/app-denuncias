import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

import { api, definirToken, ErroApi, quandoSessaoExpirar } from '@/services/api';
import type { Eu, EstatisticasBasicas, Sessao } from '@/types';

const CHAVE_TOKEN = 'denuncieja.token';
const CHAVE_USUARIO = 'denuncieja.usuario';

// o SecureStore não existe no navegador, então lá usamos o localStorage
const armazenamento = {
  ler: (chave: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(globalThis.localStorage?.getItem(chave) ?? null)
      : SecureStore.getItemAsync(chave),
  gravar: (chave: string, valor: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(globalThis.localStorage?.setItem(chave, valor))
      : SecureStore.setItemAsync(chave, valor),
  apagar: (chave: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(globalThis.localStorage?.removeItem(chave))
      : SecureStore.deleteItemAsync(chave),
};

type ValorAuth = {
  usuario: Eu | null;
  estatisticas: EstatisticasBasicas | null;
  /** Número da aba Avisos. */
  avisosNaoLidos: number;
  carregando: boolean;
  /** Mensagem mostrada no login quando a sessão acabou sozinha. */
  avisoSessao: string;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  recarregarUsuario: () => Promise<void>;
};

const AuthContext = createContext<ValorAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Eu | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasBasicas | null>(null);
  const [avisosNaoLidos, setAvisosNaoLidos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [avisoSessao, setAvisoSessao] = useState('');
  const consultas = useQueryClient();

  const recarregarUsuario = useCallback(async () => {
    const dados = await api.get<{
      usuario: Eu;
      estatisticas: EstatisticasBasicas;
      avisosNaoLidos: number;
    }>('/auth/eu');
    setUsuario(dados.usuario);
    setEstatisticas(dados.estatisticas);
    setAvisosNaoLidos(dados.avisosNaoLidos ?? 0);
    await armazenamento.gravar(CHAVE_USUARIO, JSON.stringify(dados.usuario));
  }, []);

  const sair = useCallback(async () => {
    definirToken(null);
    setUsuario(null);
    setEstatisticas(null);
    // apaga as denúncias em cache para a próxima conta não ver os dados desta
    consultas.clear();
    await Promise.all([armazenamento.apagar(CHAVE_TOKEN), armazenamento.apagar(CHAVE_USUARIO)]);
  }, [consultas]);

  useEffect(() => {
    quandoSessaoExpirar((mensagem) => {
      setAvisoSessao(mensagem);
      sair();
    });
    return () => quandoSessaoExpirar(() => {});
  }, [sair]);

  // ao abrir o app, recupera a sessão salva e atualiza os dados em segundo plano
  useEffect(() => {
    async function restaurar() {
      try {
        const [token, salvo] = await Promise.all([
          armazenamento.ler(CHAVE_TOKEN),
          armazenamento.ler(CHAVE_USUARIO),
        ]);
        if (!token) return;
        definirToken(token);
        if (salvo) setUsuario(JSON.parse(salvo));
        await recarregarUsuario();
      } catch (erro) {
        // sem internet mantemos a sessão salva; só sai se o token não vale mais
        if (erro instanceof ErroApi && (erro.status === 401 || erro.status === 403)) await sair();
      } finally {
        setCarregando(false);
      }
    }
    restaurar();
  }, [recarregarUsuario, sair]);

  // quando o app volta para a tela, busca de novo pontos e nível (a moderação pode ter analisado algo)
  const logado = !!usuario;
  useEffect(() => {
    if (!logado) return;
    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') recarregarUsuario().catch(() => {});
    });
    return () => inscricao.remove();
  }, [logado, recarregarUsuario]);

  async function iniciarSessao({ token, usuario }: Sessao) {
    setAvisoSessao('');
    definirToken(token);
    await Promise.all([
      armazenamento.gravar(CHAVE_TOKEN, token),
      armazenamento.gravar(CHAVE_USUARIO, JSON.stringify(usuario)),
    ]);
    setUsuario(usuario);
    recarregarUsuario().catch(() => {});
  }

  async function entrar(email: string, senha: string) {
    await iniciarSessao(await api.post<Sessao>('/auth/login', { email, senha }));
  }

  async function cadastrar(nome: string, email: string, senha: string) {
    await iniciarSessao(await api.post<Sessao>('/auth/cadastro', { nome, email, senha }));
  }

  return (
    <AuthContext
      value={{
        usuario,
        estatisticas,
        avisosNaoLidos,
        carregando,
        avisoSessao,
        entrar,
        cadastrar,
        sair,
        recarregarUsuario,
      }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const valor = use(AuthContext);
  if (!valor) throw new Error('useAuth precisa estar dentro do AuthProvider');
  return valor;
}
