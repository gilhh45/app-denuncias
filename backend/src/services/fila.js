import { db } from '../db.js';
import { formatarDenuncia } from '../modelos.js';
import { nivelPorPontos } from './confianca.js';

const ORDEM_PRIORIDADE = { ALTA: 0, MEDIA: 1, BAIXA: 2 };

/** Prioridade da denúncia vem do nível de confiança de quem enviou. */
export function prioridadeDoAutor(pontos, bloqueado) {
  return bloqueado ? 'BAIXA' : nivelPorPontos(pontos).prioridade;
}

export function denunciaComAutor(linha, extras) {
  return {
    ...formatarDenuncia(linha, extras),
    prioridade: prioridadeDoAutor(linha.autor_pontos, linha.autor_bloqueado),
    autor: {
      id: linha.usuario_id,
      nome: linha.autor_nome,
      nivel: nivelPorPontos(linha.autor_pontos).nome,
      bloqueado: !!linha.autor_bloqueado,
    },
  };
}

export const SELECT_COM_AUTOR = `
  SELECT d.*, u.nome AS autor_nome, u.pontos AS autor_pontos, u.bloqueado AS autor_bloqueado,
    (SELECT COUNT(*) FROM evidencias e WHERE e.denuncia_id = d.id) AS total_evidencias
  FROM denuncias d JOIN usuarios u ON u.id = d.usuario_id`;

/** Lista as denúncias com autor e prioridade, da mais importante para a menos. */
export function listarDenunciasPorPrioridade({ status, prioridade, busca, desde } = {}) {
  const termo = busca ? `%${busca.toLowerCase()}%` : null;
  const linhas = db
    .prepare(
      `${SELECT_COM_AUTOR}
       WHERE (? IS NULL OR d.status = ?)
         AND (? IS NULL OR d.criada_em >= ?)
         AND (? IS NULL OR lower(d.titulo || ' ' || d.protocolo || ' ' || d.url || ' ' || u.nome) LIKE ?)`,
    )
    .all(status ?? null, status ?? null, desde ?? null, desde ?? null, termo, termo);

  return linhas
    .map((l) => denunciaComAutor(l))
    .filter((d) => !prioridade || d.prioridade === prioridade)
    .sort(
      (a, b) =>
        ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade] ||
        b.score - a.score ||
        b.criadaEm.localeCompare(a.criadaEm),
    );
}
