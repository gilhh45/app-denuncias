import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Status } from '@/constants';
import { api } from '@/services/api';
import type {
  AnaliseUsuario,
  DenunciaAdmin,
  PreviaExportacao,
  Prioridade,
  ResumoAdmin,
  Usuario,
  UsuarioAdmin,
} from '@/types';

const chaves = {
  tudo: ['admin'] as const,
  resumo: ['admin', 'resumo'] as const,
  fila: (filtros: object) => ['admin', 'fila', filtros] as const,
  denuncia: (id: number) => ['admin', 'denuncia', id] as const,
  usuarios: (busca: string) => ['admin', 'usuarios', busca] as const,
  usuario: (id: number) => ['admin', 'usuario', id] as const,
  previa: (filtros: object) => ['admin', 'previa', filtros] as const,
};

function parametros(filtros: Record<string, string | number | boolean | undefined>) {
  const p = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') p.set(chave, String(valor));
  }
  const texto = p.toString();
  return texto ? `?${texto}` : '';
}

export function useResumo() {
  return useQuery({
    queryKey: chaves.resumo,
    queryFn: () => api.get<ResumoAdmin>('/admin/resumo'),
  });
}

export type FiltrosFila = { status?: Status; prioridade?: Prioridade; busca?: string };

export function useFila(filtros: FiltrosFila) {
  return useQuery({
    queryKey: chaves.fila(filtros),
    queryFn: async () =>
      (await api.get<{ denuncias: DenunciaAdmin[] }>(`/admin/denuncias${parametros(filtros)}`))
        .denuncias,
    placeholderData: (anterior) => anterior,
  });
}

export function useDenunciaAdmin(id: number) {
  return useQuery({
    queryKey: chaves.denuncia(id),
    queryFn: async () =>
      (await api.get<{ denuncia: DenunciaAdmin }>(`/admin/denuncias/${id}`)).denuncia,
  });
}

export function useMudarStatus(id: number) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (dados: { status: Exclude<Status, 'PENDENTE'>; nota?: string }) =>
      api.patch<{ denuncia: DenunciaAdmin; variacaoPontos: number }>(
        `/admin/denuncias/${id}/status`,
        dados,
      ),
    // mudar um status mexe no resumo, na fila e nos pontos do autor
    onSuccess: () => cliente.invalidateQueries({ queryKey: chaves.tudo }),
  });
}

export function useUsuarios(busca: string) {
  return useQuery({
    queryKey: chaves.usuarios(busca),
    queryFn: async () =>
      (await api.get<{ usuarios: UsuarioAdmin[] }>(`/admin/usuarios${parametros({ busca })}`))
        .usuarios,
    placeholderData: (anterior) => anterior,
  });
}

export function useAnaliseUsuario(id: number) {
  return useQuery({
    queryKey: chaves.usuario(id),
    queryFn: () => api.get<AnaliseUsuario>(`/admin/usuarios/${id}`),
  });
}

export function useBloqueio(id: number) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (bloqueado: boolean) =>
      api.patch<{ usuario: Usuario }>(`/admin/usuarios/${id}/bloqueio`, { bloqueado }),
    onSuccess: () => cliente.invalidateQueries({ queryKey: chaves.tudo }),
  });
}

export type FiltrosExportacao = { dias?: number; incluirRejeitadas: boolean };

export function usePreviaExportacao(filtros: FiltrosExportacao) {
  return useQuery({
    queryKey: chaves.previa(filtros),
    queryFn: () =>
      api.get<PreviaExportacao>(`/admin/exportacao/previa${parametros({ ...filtros })}`),
    placeholderData: (anterior) => anterior,
  });
}
