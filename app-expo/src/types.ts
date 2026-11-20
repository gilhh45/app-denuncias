import type { Status } from '@/constants';

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

export type Denuncia = {
  id: number;
  protocolo: string;
  tipo: 'SITE' | 'REDE_SOCIAL';
  plataforma: string | null;
  perfil: string | null;
  categoria: string;
  titulo: string;
  url: string;
  descricao: string;
  score: number;
  status: Status;
  totalEvidencias: number;
  evidencias?: string[];
  historico?: { status: Status; nota: string | null; em: string }[];
  criadaEm: string;
  atualizadaEm: string;
};

export type Limite = {
  podeEnviar: boolean;
  limitePorHora: number;
  enviadasNaHora: number;
  restantesNaHora: number;
  esperarSegundos: number;
  motivo: string | null;
};

export type Captcha = { id: string; pergunta: string };

export type DenunciaCriada = {
  denuncia: Denuncia;
  score: { valor: number; detalhes: { rotulo: string; pontos: number }[] };
  pontosSeConfirmada: number;
};
