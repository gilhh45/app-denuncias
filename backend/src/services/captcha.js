import { randomInt, randomUUID } from 'node:crypto';

const VALIDADE = 5 * 60 * 1000;
const pendentes = new Map();

function limparVencidos(agora) {
  for (const [id, item] of pendentes) {
    if (item.expira < agora) pendentes.delete(id);
  }
}

/** Gera uma conta simples. A resposta fica só no servidor. */
export function gerarCaptcha() {
  const agora = Date.now();
  limparVencidos(agora);

  const a = randomInt(2, 10);
  const b = randomInt(1, 10);
  const id = randomUUID();
  pendentes.set(id, { resposta: a + b, expira: agora + VALIDADE });

  return { id, pergunta: `Quanto é ${a} + ${b}?` };
}

/** Cada captcha só pode ser usado uma vez, acertando ou errando. */
export function conferirCaptcha(id, resposta) {
  const item = pendentes.get(id);
  pendentes.delete(id);
  if (!item || item.expira < Date.now()) return 'expirado';
  return Number(resposta) === item.resposta ? 'ok' : 'errado';
}
