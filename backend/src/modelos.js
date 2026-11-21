import { forcaDoScore, nivelPorPontos, nivelPublico } from './services/confianca.js';

export const TIPOS = ['SITE', 'REDE_SOCIAL'];

export const PLATAFORMAS = [
  'Instagram',
  'X (Twitter)',
  'Facebook',
  'TikTok',
  'YouTube',
  'WhatsApp',
  'Kwai',
  'Outra',
];

export const CATEGORIAS = [
  'Golpe ou fraude',
  'Phishing / roubo de dados',
  'Perfil falso',
  'Discurso de ódio',
  'Assédio ou ameaça',
  'Violência ou conteúdo gráfico',
  'Conteúdo sexual não consentido',
  'Segurança infantil',
  'Suicídio ou automutilação',
  'Terrorismo ou extremismo',
  'Desinformação',
  'Spam',
  'Outro',
];

// as evidências dessas categorias chegam borradas no app até a pessoa escolher ver
export const CATEGORIAS_SENSIVEIS = [
  'Violência ou conteúdo gráfico',
  'Conteúdo sexual não consentido',
  'Segurança infantil',
  'Suicídio ou automutilação',
];

export const STATUS = ['PENDENTE', 'EM_ANALISE', 'CONFIRMADA', 'REJEITADA'];

export const MOTIVOS_REJEICAO = {
  INDICIO_INSUFICIENTE: 'Indício insuficiente',
  FORA_DAS_REGRAS: 'Fora das regras',
  DUPLICADA: 'Denúncia duplicada',
  LINK_FORA_DO_AR: 'Link fora do ar',
};

/** Converte uma linha da tabela usuarios no formato enviado ao app (sem a senha). */
export function formatarUsuario(linha) {
  return {
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    papel: linha.papel,
    pontos: linha.pontos,
    nivel: nivelPorPontos(linha.pontos),
    bloqueado: !!linha.bloqueado,
    criadoEm: linha.criado_em,
    ultimoAcesso: linha.ultimo_acesso,
  };
}

/** Usuário como o próprio cidadão vê: nível só por escrito, sem pontos. */
export function formatarUsuarioCidadao(linha) {
  const { pontos: _pontos, ...usuario } = formatarUsuario(linha);
  return { ...usuario, nivel: nivelPublico(linha.pontos) };
}

/** Formato completo, usado pela moderação. */
export function formatarDenuncia(linha, { evidencias, historico } = {}) {
  const passos = historico?.map((h) => ({
    status: h.status,
    nota: h.nota,
    motivo: h.motivo ?? null,
    variacaoPontos: h.variacao_pontos ?? 0,
    em: h.criado_em,
  }));
  const final = passos?.findLast((h) => h.status === 'CONFIRMADA' || h.status === 'REJEITADA');
  return {
    id: linha.id,
    protocolo: linha.protocolo,
    tipo: linha.tipo,
    plataforma: linha.plataforma,
    perfil: linha.perfil,
    categoria: linha.categoria,
    sensivel: CATEGORIAS_SENSIVEIS.includes(linha.categoria),
    titulo: linha.titulo,
    url: linha.url,
    descricao: linha.descricao,
    score: linha.score,
    status: linha.status,
    totalEvidencias: evidencias?.length ?? linha.total_evidencias ?? 0,
    evidencias: evidencias?.map((e) => `/uploads/${e.arquivo}`),
    historico: passos,
    decisao: final ?? null,
    criadaEm: linha.criada_em,
    atualizadaEm: linha.atualizada_em,
  };
}

/** Denúncia como o autor vê: força em palavras no lugar do score e sem variação de pontos. */
export function formatarDenunciaCidadao(linha, extras) {
  const { score, historico, decisao, ...denuncia } = formatarDenuncia(linha, extras);
  const semPontos = ({ variacaoPontos: _v, ...passo }) => passo;
  return {
    ...denuncia,
    forca: forcaDoScore(score),
    historico: historico?.map(semPontos),
    decisao: decisao && semPontos(decisao),
  };
}
