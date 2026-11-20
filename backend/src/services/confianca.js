import { db } from '../db.js';

/**
 * Níveis de confiança do usuário. Os pontos vêm das denúncias confirmadas pela
 * moderação; denúncias rejeitadas tiram pontos.
 */
export const NIVEIS = [
  { nome: 'Iniciante', minimo: 0, bonus: 0, prioridade: 'BAIXA' },
  { nome: 'Confiável', minimo: 100, bonus: 5, prioridade: 'MEDIA' },
  { nome: 'Verificado', minimo: 300, bonus: 10, prioridade: 'ALTA' },
  { nome: 'Especialista', minimo: 600, bonus: 15, prioridade: 'ALTA' },
];

export const PENALIDADE_REJEICAO = 20;

export function nivelPorPontos(pontos) {
  const indice = NIVEIS.findLastIndex((n) => pontos >= n.minimo);
  const atual = NIVEIS[indice];
  const proximo = NIVEIS[indice + 1] ?? null;
  const progresso = proximo ? (pontos - atual.minimo) / (proximo.minimo - atual.minimo) : 1;

  return {
    nome: atual.nome,
    minimo: atual.minimo,
    bonus: atual.bonus,
    prioridade: atual.prioridade,
    proximo: proximo && { nome: proximo.nome, minimo: proximo.minimo },
    progresso: Math.round(progresso * 100) / 100,
  };
}

/**
 * Score de credibilidade da denúncia (0 a 100). Quanto mais completa a denúncia
 * e mais confiável quem envia, maior o score.
 */
export function calcularScore({ url, descricao, evidencias }, pontosDoAutor) {
  const detalhes = [{ rotulo: 'Denúncia registrada', pontos: 25 }];

  if (url.trim().toLowerCase().startsWith('https://')) {
    detalhes.push({ rotulo: 'Link seguro (https)', pontos: 10 });
  }

  const tamanho = descricao.trim().length;
  if (tamanho >= 150) detalhes.push({ rotulo: 'Descrição detalhada', pontos: 25 });
  else if (tamanho >= 60) detalhes.push({ rotulo: 'Descrição com contexto', pontos: 15 });

  if (evidencias >= 3) detalhes.push({ rotulo: '3 ou mais evidências', pontos: 25 });
  else if (evidencias >= 1) detalhes.push({ rotulo: 'Com evidência', pontos: 15 });

  const nivel = nivelPorPontos(pontosDoAutor);
  if (nivel.bonus) detalhes.push({ rotulo: `Usuário ${nivel.nome}`, pontos: nivel.bonus });

  const score = Math.min(
    100,
    detalhes.reduce((soma, d) => soma + d.pontos, 0),
  );
  return { score, detalhes };
}

/** Pontos que o autor ganha quando a denúncia é confirmada. */
export function pontosPorConfirmacao(score) {
  return 10 + Math.round(score * 0.3);
}

export function estatisticasDoUsuario(usuarioId) {
  const linha = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'PENDENTE') AS pendentes,
         SUM(status = 'EM_ANALISE') AS emAnalise,
         SUM(status = 'CONFIRMADA') AS confirmadas,
         SUM(status = 'REJEITADA') AS rejeitadas,
         ROUND(AVG(score)) AS scoreMedio
       FROM denuncias WHERE usuario_id = ?`,
    )
    .get(usuarioId);

  const confirmadas = linha.confirmadas ?? 0;
  const rejeitadas = linha.rejeitadas ?? 0;
  const analisadas = confirmadas + rejeitadas;

  return {
    total: linha.total,
    pendentes: linha.pendentes ?? 0,
    emAnalise: linha.emAnalise ?? 0,
    confirmadas,
    rejeitadas,
    scoreMedio: linha.scoreMedio ?? 0,
    // taxa de acerto: das denúncias já analisadas, quantas foram confirmadas
    taxaAcerto: analisadas ? Math.round((confirmadas / analisadas) * 100) : null,
  };
}
