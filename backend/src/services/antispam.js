import { db } from '../db.js';

export const LIMITE_POR_HORA = 3;
export const INTERVALO_SEGUNDOS = 60;

const UMA_HORA = 60 * 60 * 1000;

/**
 * Regras contra spam de cada usuário:
 * - no máximo 3 denúncias por hora;
 * - pelo menos 1 minuto entre uma denúncia e outra.
 */
export function avaliarLimite(usuarioId, agora = Date.now()) {
  const desde = new Date(agora - UMA_HORA).toISOString();
  const recentes = db
    .prepare(
      'SELECT criada_em FROM denuncias WHERE usuario_id = ? AND criada_em > ? ORDER BY criada_em',
    )
    .all(usuarioId, desde)
    .map((d) => Date.parse(d.criada_em));

  const ultima = recentes.at(-1);
  const esperaIntervalo = ultima ? ultima + INTERVALO_SEGUNDOS * 1000 - agora : 0;
  // quando bate o limite, libera assim que a mais antiga da última hora "vencer"
  const esperaHora = recentes.length >= LIMITE_POR_HORA ? recentes[0] + UMA_HORA - agora : 0;
  const esperarSegundos = Math.max(0, Math.ceil(Math.max(esperaIntervalo, esperaHora) / 1000));

  let motivo = null;
  if (esperaHora > 0) motivo = `Você já enviou ${LIMITE_POR_HORA} denúncias na última hora.`;
  else if (esperaIntervalo > 0) motivo = 'Espere um pouco antes de enviar outra denúncia.';

  return {
    podeEnviar: esperarSegundos === 0,
    limitePorHora: LIMITE_POR_HORA,
    enviadasNaHora: recentes.length,
    restantesNaHora: Math.max(0, LIMITE_POR_HORA - recentes.length),
    esperarSegundos,
    motivo,
  };
}

/** O mesmo usuário não pode denunciar o mesmo link duas vezes. */
export function jaDenunciou(usuarioId, urlNormalizada) {
  return !!db
    .prepare('SELECT 1 FROM denuncias WHERE usuario_id = ? AND url_normalizada = ?')
    .get(usuarioId, urlNormalizada);
}

/** Quantas outras pessoas já denunciaram o mesmo link (reforça a denúncia, não bloqueia). */
export function denunciasDoMesmoLink(urlNormalizada, usuarioId) {
  return db
    .prepare(
      'SELECT COUNT(DISTINCT usuario_id) AS total FROM denuncias WHERE url_normalizada = ? AND usuario_id <> ?',
    )
    .get(urlNormalizada, usuarioId).total;
}
