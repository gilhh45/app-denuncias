import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { config } from './config.js';
import { db } from './db.js';

export class ErroHttp extends Error {
  constructor(status, mensagem, extra = {}) {
    super(mensagem);
    this.status = status;
    this.extra = extra;
  }
}

export function gerarToken(usuario) {
  return jwt.sign({ papel: usuario.papel }, config.jwtSegredo, {
    subject: String(usuario.id),
    expiresIn: config.jwtValidade,
  });
}

/** Confere o token e coloca o usuário do banco em req.usuario. */
export async function autenticar(req, _res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) throw new ErroHttp(401, 'Faça login para continuar.');

  let dados;
  try {
    dados = jwt.verify(token, config.jwtSegredo);
  } catch {
    throw new ErroHttp(401, 'Sua sessão expirou. Entre novamente.');
  }

  const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', Number(dados.sub));
  if (!usuario) throw new ErroHttp(401, 'Sua sessão expirou. Entre novamente.');
  if (usuario.bloqueado) throw new ErroHttp(403, 'Sua conta está bloqueada.');

  req.usuario = usuario;
  next();
}

/** Valida req.body (ou outra parte da requisição) com um schema do zod. */
export function validar(schema, parte = 'body') {
  return (req, _res, next) => {
    const resultado = schema.safeParse(req[parte] ?? {});
    if (!resultado.success) {
      const primeiro = resultado.error.issues[0];
      throw new ErroHttp(400, primeiro?.message ?? 'Dados inválidos.', {
        campo: primeiro?.path.join('.'),
      });
    }
    req.dados = resultado.data;
    next();
  };
}

export const email = z
  .string({ error: 'Informe o e-mail.' })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Digite um e-mail válido.' }));

export const senha = z
  .string({ error: 'Informe a senha.' })
  .min(6, { error: 'A senha precisa ter pelo menos 6 caracteres.' })
  .max(72, { error: 'A senha pode ter no máximo 72 caracteres.' });

export function rotaNaoEncontrada(req, _res, next) {
  next(new ErroHttp(404, `Rota ${req.method} ${req.path} não existe.`));
}

// eslint-disable-next-line no-unused-vars
export function tratarErros(erro, _req, res, _next) {
  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json({ erro: erro.message, ...erro.extra });
  }
  if (erro?.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno. Tente novamente em instantes.' });
}
