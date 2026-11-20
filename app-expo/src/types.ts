export type Nivel = {
  nome: 'Iniciante' | 'Confiável' | 'Verificado' | 'Especialista';
  minimo: number;
  bonus: number;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  proximo: { nome: string; minimo: number } | null;
  progresso: number;
};

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  papel: 'cidadao' | 'admin';
  pontos: number;
  nivel: Nivel;
  bloqueado: boolean;
  criadoEm: string;
  ultimoAcesso: string | null;
};

export type Estatisticas = {
  total: number;
  pendentes: number;
  emAnalise: number;
  confirmadas: number;
  rejeitadas: number;
  scoreMedio: number;
  taxaAcerto: number | null;
};

export type Sessao = { token: string; usuario: Usuario };
