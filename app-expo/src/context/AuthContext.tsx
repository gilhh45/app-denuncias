import * as SecureStore from 'expo-secure-store';
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { api, definirToken, ErroApi } from '@/services/api';
import type { Estatisticas, Sessao, Usuario } from '@/types';

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
  usuario: Usuario | null;
  estatisticas: Estatisticas | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  recarregarUsuario: () => Promise<void>;
};

const AuthContext = createContext<ValorAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregarUsuario = useCallback(async () => {
    const dados = await api.get<{ usuario: Usuario; estatisticas: Estatisticas }>('/auth/eu');
    setUsuario(dados.usuario);
    setEstatisticas(dados.estatisticas);
    await armazenamento.gravar(CHAVE_USUARIO, JSON.stringify(dados.usuario));
  }, []);

  const sair = useCallback(async () => {
    definirToken(null);
    setUsuario(null);
    setEstatisticas(null);
    await Promise.all([armazenamento.apagar(CHAVE_TOKEN), armazenamento.apagar(CHAVE_USUARIO)]);
  }, []);

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

  async function iniciarSessao({ token, usuario }: Sessao) {
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
      value={{ usuario, estatisticas, carregando, entrar, cadastrar, sair, recarregarUsuario }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const valor = use(AuthContext);
  if (!valor) throw new Error('useAuth precisa estar dentro do AuthProvider');
  return valor;
}
