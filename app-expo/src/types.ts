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

export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA';

export type DenunciaAdmin = Denuncia & {
  prioridade: Prioridade;
  autor: { id: number; nome: string; nivel: Nivel['nome']; bloqueado: boolean };
  outrosDenunciantes?: number;
};

export type ResumoAdmin = {
  totais: {
    total: number;
    pendentes: number;
    emAnalise: number;
    confirmadas: number;
    rejeitadas: number;
    hoje: number;
    semana: number;
  };
  porDia: { dia: string; total: number }[];
  porCategoria: { categoria: string; total: number }[];
  abertasPorPrioridade: Record<Prioridade, number>;
  usuarios: { total: number; bloqueados: number; porNivel: Record<string, number> };
};

export type UsuarioAdmin = Usuario & { estatisticas: Estatisticas };

export type AnaliseUsuario = {
  usuario: Usuario;
  estatisticas: Estatisticas;
  prioridade: Prioridade;
  categorias: { categoria: string; total: number }[];
  denuncias: Denuncia[];
};

export type PreviaExportacao = {
  total: number;
  porPrioridade: Record<Prioridade, number>;
  porStatus: Partial<Record<Status, number>>;
  primeiras: DenunciaAdmin[];
};
