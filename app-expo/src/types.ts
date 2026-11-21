import type { Status } from '@/constants';

export type Nivel = {
  nome: 'Iniciante' | 'Confiável' | 'Verificado' | 'Especialista';
  minimo: number;
  bonus: number;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  proximo: { nome: string; minimo: number } | null;
  progresso: number;
};

/** Nível como o próprio cidadão vê: só por escrito, sem pontos. */
export type NivelPublico = {
  nome: Nivel['nome'];
  ordem: 1 | 2 | 3 | 4;
  prioridade: Nivel['prioridade'];
  proximo: Nivel['nome'] | null;
  perto: boolean;
};

/** Usuário completo, como a moderação vê. */
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

/** Quem está logado. O cidadão não recebe os pontos (só o admin vê os números). */
export type Eu = Omit<Usuario, 'pontos' | 'nivel'> & { nivel: NivelPublico };

export type Estatisticas = {
  total: number;
  pendentes: number;
  emAnalise: number;
  confirmadas: number;
  rejeitadas: number;
  scoreMedio: number;
  taxaAcerto: number | null;
};

/** Estatísticas que o cidadão recebe sobre si mesmo (sem score médio nem taxa de acerto). */
export type EstatisticasBasicas = Omit<Estatisticas, 'scoreMedio' | 'taxaAcerto'>;

export type Sessao = { token: string; usuario: Eu };

export type Forca = 'FRACA' | 'MEDIA' | 'FORTE';

export type MotivoRejeicao =
  'INDICIO_INSUFICIENTE' | 'FORA_DAS_REGRAS' | 'DUPLICADA' | 'LINK_FORA_DO_AR';

export type Passo = {
  status: Status;
  nota: string | null;
  motivo: MotivoRejeicao | null;
  em: string;
  /** Só a moderação recebe. */
  variacaoPontos?: number;
};

type DenunciaBase = {
  id: number;
  protocolo: string;
  tipo: 'SITE' | 'REDE_SOCIAL';
  plataforma: string | null;
  perfil: string | null;
  categoria: string;
  titulo: string;
  url: string;
  descricao: string;
  /** Categoria sensível: as evidências aparecem borradas até a pessoa escolher ver. */
  sensivel: boolean;
  status: Status;
  totalEvidencias: number;
  evidencias?: string[];
  historico?: Passo[];
  /** Último passo de confirmação ou rejeição, quando já houve decisão. */
  decisao: Passo | null;
  criadaEm: string;
  atualizadaEm: string;
};

/** Denúncia como o autor vê: força em palavras no lugar do score. */
export type Denuncia = DenunciaBase & { forca: Forca };

/** Denúncia como a moderação vê, com o score em número. */
export type DenunciaModeracao = DenunciaBase & { score: number };

export type Limite = {
  podeEnviar: boolean;
  limitePorHora: number;
  enviadasNaHora: number;
  restantesNaHora: number;
  esperarSegundos: number;
  motivo: string | null;
};

export type Captcha = { id: string; pergunta: string };

export type Dica = 'LINK_HTTPS' | 'DESCRICAO_CURTA' | 'POUCAS_PROVAS';

export type DenunciaCriada = { denuncia: Denuncia; forca: Forca; dicas: Dica[] };

export type VerificacaoLink = { valido: boolean; jaDenunciei: boolean; outrosDenunciantes: number };

export type AvisoApp = {
  id: number;
  tipo: 'STATUS' | 'NIVEL';
  denunciaId: number | null;
  titulo: string;
  texto: string;
  lido: boolean;
  criadoEm: string;
};

/** Tela "Como meu nível é calculado": o único lugar em que o cidadão vê os pontos. */
export type DetalheNivel = {
  pontos: number;
  nivel: Nivel['nome'];
  niveis: { nome: Nivel['nome']; minimo: number; bonusScore: number }[];
  regras: { confirmada: string; rejeitada: number };
  mudancas: {
    protocolo: string;
    titulo: string;
    status: Status;
    variacaoPontos: number;
    em: string;
  }[];
};

export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA';

export type DenunciaAdmin = DenunciaModeracao & {
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
  denuncias: DenunciaModeracao[];
};

export type PreviaExportacao = {
  total: number;
  porPrioridade: Record<Prioridade, number>;
  porStatus: Partial<Record<Status, number>>;
  primeiras: DenunciaAdmin[];
};
