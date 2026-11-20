import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { Captcha, Denuncia, DenunciaCriada, Limite } from '@/types';

export const chaves = {
  denuncias: ['denuncias'] as const,
  denuncia: (id: number) => ['denuncias', id] as const,
  limite: ['limite'] as const,
  captcha: ['captcha'] as const,
};

/** Quantas denúncias ainda dá para enviar agora (regras anti-spam da API). */
export function useLimite() {
  return useQuery({
    queryKey: chaves.limite,
    queryFn: () => api.get<Limite>('/denuncias/limite'),
  });
}

/** Conta do captcha. Cada uma vale uma vez só, então nunca reaproveitamos do cache. */
export function useCaptcha() {
  return useQuery({
    queryKey: chaves.captcha,
    queryFn: () => api.get<Captcha>('/denuncias/captcha'),
    staleTime: 4 * 60 * 1000,
    gcTime: 0,
  });
}

export type NovaDenuncia = {
  tipo: 'SITE' | 'REDE_SOCIAL';
  plataforma?: string;
  perfil?: string;
  categoria: string;
  titulo: string;
  url: string;
  descricao: string;
  captchaId: string;
  captchaResposta: string;
  imagens: { uri: string; nome: string; tipo: string }[];
};

async function montarFormulario({ imagens, ...campos }: NovaDenuncia) {
  const form = new FormData();
  for (const [chave, valor] of Object.entries(campos)) {
    if (valor) form.append(chave, String(valor));
  }
  for (const imagem of imagens) {
    if (Platform.OS === 'web') {
      // no navegador a imagem escolhida é um blob: e precisa virar arquivo de verdade
      const blob = await (await fetch(imagem.uri)).blob();
      form.append('evidencias', blob, imagem.nome);
    } else {
      form.append('evidencias', {
        uri: imagem.uri,
        name: imagem.nome,
        type: imagem.tipo,
      } as unknown as Blob);
    }
  }
  return form;
}

export function useCriarDenuncia() {
  const cliente = useQueryClient();
  const { recarregarUsuario } = useAuth();

  return useMutation({
    mutationFn: async (dados: NovaDenuncia) =>
      api.enviar<DenunciaCriada>('/denuncias', await montarFormulario(dados)),
    onSettled: () => {
      // o captcha é de uso único: depois de qualquer tentativa pegamos outro
      cliente.invalidateQueries({ queryKey: chaves.captcha });
      cliente.invalidateQueries({ queryKey: chaves.limite });
    },
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: chaves.denuncias });
      recarregarUsuario().catch(() => {});
    },
  });
}

export function useMinhasDenuncias() {
  return useQuery({
    queryKey: chaves.denuncias,
    queryFn: async () => (await api.get<{ denuncias: Denuncia[] }>('/denuncias')).denuncias,
  });
}

export function useDenuncia(id: number) {
  return useQuery({
    queryKey: chaves.denuncia(id),
    queryFn: async () => (await api.get<{ denuncia: Denuncia }>(`/denuncias/${id}`)).denuncia,
    enabled: Number.isFinite(id),
  });
}
