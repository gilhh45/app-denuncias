import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db.js';
import { autenticar, email, ErroHttp, gerarToken, senha, validar } from '../middlewares.js';
import { formatarUsuario } from '../modelos.js';

export const rotasAuth = Router();

const cadastroSchema = z.object({
  nome: z
    .string({ error: 'Informe seu nome.' })
    .trim()
    .min(3, { error: 'O nome precisa ter pelo menos 3 letras.' })
    .max(80, { error: 'Nome muito longo.' }),
  email,
  senha,
});

const loginSchema = z.object({
  email,
  senha: z.string({ error: 'Informe a senha.' }).min(1, { error: 'Informe a senha.' }),
});

function sessao(usuario) {
  db.prepare(
    "UPDATE usuarios SET ultimo_acesso = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
  ).run(usuario.id);
  return { token: gerarToken(usuario), usuario: formatarUsuario(usuario) };
}

rotasAuth.post('/cadastro', validar(cadastroSchema), (req, res) => {
  const { nome, email, senha } = req.dados;

  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existe) throw new ErroHttp(409, 'Este e-mail já tem uma conta.', { campo: 'email' });

  const hash = bcrypt.hashSync(senha, 10);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)')
    .run(nome, email, hash);

  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(lastInsertRowid);
  res.status(201).json(sessao(usuario));
});

rotasAuth.post('/login', validar(loginSchema), (req, res) => {
  const { email, senha } = req.dados;
  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

  if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
    throw new ErroHttp(401, 'E-mail ou senha incorretos.');
  }
  if (usuario.bloqueado) {
    throw new ErroHttp(403, 'Sua conta está bloqueada. Fale com a moderação.');
  }

  res.json(sessao(usuario));
});

rotasAuth.get('/eu', autenticar, (req, res) => {
  res.json({ usuario: formatarUsuario(req.usuario) });
});
