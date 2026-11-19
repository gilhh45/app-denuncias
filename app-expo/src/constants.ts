import type { Feather } from '@expo/vector-icons';

import type { Cores } from '@/theme';

export type Status = 'PENDENTE' | 'EM_ANALISE' | 'CONFIRMADA' | 'REJEITADA';

export const STATUS: Record<
  Status,
  { rotulo: string; icone: keyof typeof Feather.glyphMap; cor: keyof Cores; fundo: keyof Cores }
> = {
  PENDENTE: { rotulo: 'Pendente', icone: 'clock', cor: 'warning', fundo: 'warningSoft' },
  EM_ANALISE: { rotulo: 'Em análise', icone: 'search', cor: 'info', fundo: 'infoSoft' },
  CONFIRMADA: { rotulo: 'Confirmada', icone: 'check-circle', cor: 'success', fundo: 'successSoft' },
  REJEITADA: { rotulo: 'Rejeitada', icone: 'x-circle', cor: 'danger', fundo: 'dangerSoft' },
};

export const ORDEM_STATUS: Status[] = ['PENDENTE', 'EM_ANALISE', 'CONFIRMADA', 'REJEITADA'];

// os dados de exemplo antigos ainda usam os nomes "ANÁLISE" e "CONCLUÍDO"
const ANTIGOS: Record<string, Status> = { ANÁLISE: 'EM_ANALISE', CONCLUÍDO: 'CONFIRMADA' };

export function normalizarStatus(status: string): Status {
  if (status in STATUS) return status as Status;
  return ANTIGOS[status.toUpperCase()] ?? 'PENDENTE';
}
