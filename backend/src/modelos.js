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

export const STATUS = ['PENDENTE', 'EM_ANALISE', 'CONFIRMADA', 'REJEITADA'];

/** Converte uma linha da tabela usuarios no formato enviado ao app (sem a senha). */
export function formatarUsuario(linha) {
  return {
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    papel: linha.papel,
    pontos: linha.pontos,
    bloqueado: !!linha.bloqueado,
    criadoEm: linha.criado_em,
    ultimoAcesso: linha.ultimo_acesso,
  };
}

export function formatarDenuncia(linha, { evidencias, historico } = {}) {
  return {
    id: linha.id,
    protocolo: linha.protocolo,
    tipo: linha.tipo,
    plataforma: linha.plataforma,
    perfil: linha.perfil,
    categoria: linha.categoria,
    titulo: linha.titulo,
    url: linha.url,
    descricao: linha.descricao,
    score: linha.score,
    status: linha.status,
    totalEvidencias: evidencias?.length ?? linha.total_evidencias ?? 0,
    evidencias: evidencias?.map((e) => `/uploads/${e.arquivo}`),
    historico: historico?.map((h) => ({ status: h.status, nota: h.nota, em: h.criado_em })),
    criadaEm: linha.criada_em,
    atualizadaEm: linha.atualizada_em,
  };
}
