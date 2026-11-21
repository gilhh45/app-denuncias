import { db } from '../db.js';
import { MOTIVOS_REJEICAO } from '../modelos.js';
import { nivelPorPontos } from './confianca.js';

const inserir = () =>
  db.prepare(
    'INSERT INTO avisos (usuario_id, tipo, denuncia_id, titulo, texto, criado_em) VALUES (?, ?, ?, ?, ?, ?)',
  );

const agoraIso = () => new Date().toISOString();

/** Aviso para o autor quando a moderação muda o status da denúncia. */
export function avisarMudancaDeStatus(denuncia, status, motivo, em = agoraIso()) {
  const textos = {
    EM_ANALISE: [
      'Sua denúncia entrou em análise',
      `${denuncia.titulo}. Um moderador está conferindo.`,
    ],
    CONFIRMADA: [
      'Sua denúncia foi confirmada',
      `${denuncia.titulo}. Isso conta a favor do seu nível.`,
    ],
    REJEITADA: [
      'Sua denúncia foi rejeitada',
      `${denuncia.titulo}: ${(MOTIVOS_REJEICAO[motivo] ?? 'sem motivo informado').toLowerCase()}. Veja a nota da moderação.`,
    ],
  };
  const [titulo, texto] = textos[status];
  inserir().run(denuncia.usuario_id, 'STATUS', denuncia.id, titulo, texto, em);
}

/** Aviso quando os pontos fazem o usuário mudar de nível (para cima ou para baixo). */
export function avisarMudancaDeNivel(usuarioId, pontosAntes, pontosDepois) {
  const antes = nivelPorPontos(pontosAntes);
  const depois = nivelPorPontos(pontosDepois);
  if (antes.nome === depois.nome) return;

  const subiu = pontosDepois > pontosAntes;
  const prioridade = { ALTA: 'alta', MEDIA: 'média', BAIXA: 'baixa' }[depois.prioridade];
  inserir().run(
    usuarioId,
    'NIVEL',
    null,
    subiu ? `Você agora é ${depois.nome}` : `Seu nível mudou para ${depois.nome}`,
    `Suas denúncias passam a ter prioridade ${prioridade} na fila da moderação.`,
    agoraIso(),
  );
}

export function formatarAviso(linha) {
  return {
    id: linha.id,
    tipo: linha.tipo,
    denunciaId: linha.denuncia_id,
    titulo: linha.titulo,
    texto: linha.texto,
    lido: !!linha.lido,
    criadoEm: linha.criado_em,
  };
}

export function contarNaoLidos(usuarioId) {
  return db
    .prepare('SELECT COUNT(*) AS n FROM avisos WHERE usuario_id = ? AND lido = 0')
    .get(usuarioId).n;
}
