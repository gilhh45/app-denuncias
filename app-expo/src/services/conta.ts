import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { AvisoApp, DetalheNivel, VerificacaoLink } from '@/types';
import { urlValida } from '@/utils';

const chaves = {
  avisos: ['avisos'] as const,
  nivel: ['nivel'] as const,
  link: (url: string) => ['verificar-link', url] as const,
};

export function useAvisos() {
  return useQuery({
    queryKey: chaves.avisos,
    queryFn: () => api.get<{ avisos: AvisoApp[]; naoLidos: number }>('/avisos'),
  });
}

/** Sem ids marca todos como lidos. */
export function useMarcarLidos() {
  const cliente = useQueryClient();
  const { recarregarUsuario } = useAuth();
  return useMutation({
    mutationFn: (ids?: number[]) => api.post<{ naoLidos: number }>('/avisos/lidos', { ids }),
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: chaves.avisos });
      recarregarUsuario().catch(() => {});
    },
  });
}

/** Tela "Como meu nível é calculado": o único lugar em que o cidadão vê os pontos. */
export function useDetalheNivel() {
  return useQuery({
    queryKey: chaves.nivel,
    queryFn: () => api.get<DetalheNivel>('/auth/eu/nivel'),
  });
}

/**
 * Confere o link enquanto a pessoa digita (espera meio segundo parada) para avisar
 * se outras pessoas já denunciaram ou se ela mesma já denunciou.
 */
export function useVerificarLink(url: string) {
  const [estavel, setEstavel] = useState(url);
  useEffect(() => {
    const espera = setTimeout(() => setEstavel(url.trim()), 500);
    return () => clearTimeout(espera);
  }, [url]);

  return useQuery({
    queryKey: chaves.link(estavel),
    queryFn: () => api.post<VerificacaoLink>('/denuncias/verificar-link', { url: estavel }),
    enabled: urlValida(estavel),
    staleTime: 60_000,
  });
}

// ── coisas guardadas só no aparelho ──

const CHAVE_BOAS_VINDAS = 'denuncieja.boasVindasVista';
const chaveRascunho = (usuarioId: number) => `denuncieja.rascunho.${usuarioId}`;
const chaveNivelVisto = (usuarioId: number) => `denuncieja.nivelVisto.${usuarioId}`;

export const boasVindas = {
  vista: async () => (await AsyncStorage.getItem(CHAVE_BOAS_VINDAS)) === '1',
  marcar: () => AsyncStorage.setItem(CHAVE_BOAS_VINDAS, '1'),
};

export type Rascunho = {
  passo: number;
  tipo: 'SITE' | 'REDE_SOCIAL';
  plataforma: string | null;
  perfil: string;
  url: string;
  categoria: string | null;
  titulo: string;
  descricao: string;
  imagens: { uri: string; nome: string; tipo: string }[];
  salvoEm: string;
};

/** Um rascunho por usuário, guardado no aparelho (não vai para o servidor). */
export const rascunhos = {
  ler: async (usuarioId: number): Promise<Rascunho | null> => {
    try {
      const texto = await AsyncStorage.getItem(chaveRascunho(usuarioId));
      return texto ? JSON.parse(texto) : null;
    } catch {
      return null;
    }
  },
  salvar: (usuarioId: number, r: Omit<Rascunho, 'salvoEm'>) =>
    AsyncStorage.setItem(
      chaveRascunho(usuarioId),
      JSON.stringify({ ...r, salvoEm: new Date().toISOString() }),
    ),
  apagar: (usuarioId: number) => AsyncStorage.removeItem(chaveRascunho(usuarioId)),
};

/** Último nível que a pessoa já viu, para mostrar o "novo nível" uma vez só. */
export const nivelVisto = {
  ler: (usuarioId: number) => AsyncStorage.getItem(chaveNivelVisto(usuarioId)),
  marcar: (usuarioId: number, nome: string) =>
    AsyncStorage.setItem(chaveNivelVisto(usuarioId), nome),
};
