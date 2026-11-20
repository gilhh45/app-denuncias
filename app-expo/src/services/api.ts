import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORTA_API = 3333;

/**
 * Descobre onde a API está rodando:
 * - EXPO_PUBLIC_API_URL no .env, se existir;
 * - no navegador, o mesmo computador que abriu a página;
 * - no celular (Expo Go), o IP do computador que está rodando o Metro.
 */
function descobrirUrl() {
  const doEnv = process.env.EXPO_PUBLIC_API_URL;
  if (doEnv) return doEnv.replace(/\/+$/, '');

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:${PORTA_API}`;
  }

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:${PORTA_API}`;

  return Platform.OS === 'android'
    ? `http://10.0.2.2:${PORTA_API}`
    : `http://localhost:${PORTA_API}`;
}

export const API_URL = descobrirUrl();

export class ErroApi extends Error {
  status: number;
  campo?: string;
  dados: Record<string, unknown>;

  constructor(status: number, mensagem: string, dados: Record<string, unknown> = {}) {
    super(mensagem);
    this.status = status;
    this.campo = typeof dados.campo === 'string' ? dados.campo : undefined;
    this.dados = dados;
  }
}

let token: string | null = null;

let aoExpirar: ((mensagem: string) => void) | null = null;

export function definirToken(novo: string | null) {
  token = novo;
}

/** O AuthContext registra aqui o que fazer quando o token deixa de valer. */
export function quandoSessaoExpirar(fn: (mensagem: string) => void) {
  aoExpirar = fn;
}

type Opcoes = {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  corpo?: unknown;
  form?: FormData;
};

export async function requisicao<T>(caminho: string, { metodo = 'GET', corpo, form }: Opcoes = {}) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (corpo !== undefined) headers['Content-Type'] = 'application/json';

  const resposta = await fetch(API_URL + caminho, {
    method: metodo,
    headers,
    body: form ?? (corpo !== undefined ? JSON.stringify(corpo) : undefined),
  });

  const dados = await resposta.json().catch(() => ({}));
  if (resposta.status === 401 && token) aoExpirar?.(dados.erro ?? 'Sua sessão expirou.');
  if (!resposta.ok) {
    throw new ErroApi(resposta.status, dados.erro ?? 'Algo deu errado. Tente de novo.', dados);
  }
  return dados as T;
}

export const api = {
  get: <T>(caminho: string) => requisicao<T>(caminho),
  post: <T>(caminho: string, corpo?: unknown) => requisicao<T>(caminho, { metodo: 'POST', corpo }),
  patch: <T>(caminho: string, corpo?: unknown) =>
    requisicao<T>(caminho, { metodo: 'PATCH', corpo }),
  enviar: <T>(caminho: string, form: FormData) => requisicao<T>(caminho, { metodo: 'POST', form }),
};

/** Caminhos como /uploads/foto.jpg viram o endereço completo da API. */
export function urlArquivo(caminho: string) {
  return caminho.startsWith('http') ? caminho : API_URL + caminho;
}
