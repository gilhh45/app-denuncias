import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { createHash, randomInt } from 'node:crypto';
import { z } from 'zod';

import { config } from '../config.js';
import { db, transacao } from '../db.js';
import { autenticar, email, ErroHttp, gerarToken, senha, validar } from '../middlewares.js';
import { formatarUsuario } from '../modelos.js';
import { estatisticasDoUsuario } from '../services/confianca.js';

export const rotasAuth = Router();

const QUINZE_MINUTOS = 15 * 60 * 1000;
const MAX_TENTATIVAS_CODIGO = 5;

const limiteTentativas = rateLimit({
  windowMs: QUINZE_MINUTOS,
  limit: 10,
  skip: () => config.teste,
  handler: () => {
    throw new ErroHttp(429, 'Muitas tentativas. Espere alguns minutos e tente de novo.');
  },
});

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

const codigo = z
  .string({ error: 'Informe o código.' })
  .trim()
  .regex(/^\d{6}$/, { error: 'O código tem 6 números.' });

const hashCodigo = (valor) => createHash('sha256').update(valor).digest('hex');

function sessao(usuario) {
  db.prepare(
    "UPDATE usuarios SET ultimo_acesso = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
  ).run(usuario.id);
  return { token: gerarToken(usuario), usuario: formatarUsuario(usuario) };
}

rotasAuth.post('/cadastro', limiteTentativas, validar(cadastroSchema), (req, res) => {
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

rotasAuth.post('/login', limiteTentativas, validar(loginSchema), (req, res) => {
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
  res.json({
    usuario: formatarUsuario(req.usuario),
    estatisticas: estatisticasDoUsuario(req.usuario.id),
  });
});

// ── recuperação de senha ──
// Não temos envio de e-mail no projeto, então fora de produção o código volta na
// resposta (codigoDemo) para dar para testar o fluxo inteiro.

rotasAuth.post('/recuperar', limiteTentativas, validar(z.object({ email })), (req, res) => {
  const usuario = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(req.dados.email);
  const resposta = { mensagem: 'Se o e-mail estiver cadastrado, enviamos um código de 6 números.' };

  if (usuario) {
    const novo = String(randomInt(0, 1_000_000)).padStart(6, '0');
    transacao(() => {
      db.prepare('UPDATE codigos_recuperacao SET usado = 1 WHERE usuario_id = ?').run(usuario.id);
      db.prepare(
        'INSERT INTO codigos_recuperacao (usuario_id, codigo_hash, expira_em) VALUES (?, ?, ?)',
      ).run(usuario.id, hashCodigo(novo), Date.now() + QUINZE_MINUTOS);
    });
    if (!config.producao) resposta.codigoDemo = novo;
  }

  res.json(resposta);
});

rotasAuth.post(
  '/verificar-codigo',
  limiteTentativas,
  validar(z.object({ email, codigo })),
  (req, res) => {
    const { email, codigo } = req.dados;
    const registro = db
      .prepare(
        `SELECT c.* FROM codigos_recuperacao c
         JOIN usuarios u ON u.id = c.usuario_id
         WHERE u.email = ? AND c.usado = 0
         ORDER BY c.id DESC LIMIT 1`,
      )
      .get(email);

    if (!registro || registro.expira_em < Date.now()) {
      throw new ErroHttp(400, 'Código expirado. Peça um novo.');
    }
    if (registro.tentativas >= MAX_TENTATIVAS_CODIGO) {
      throw new ErroHttp(400, 'Você errou o código muitas vezes. Peça um novo.');
    }
    if (registro.codigo_hash !== hashCodigo(codigo)) {
      db.prepare('UPDATE codigos_recuperacao SET tentativas = tentativas + 1 WHERE id = ?').run(
        registro.id,
      );
      const restantes = MAX_TENTATIVAS_CODIGO - registro.tentativas - 1;
      throw new ErroHttp(400, `Código incorreto. Você ainda tem ${restantes} tentativa(s).`);
    }

    const tokenRedefinicao = jwt.sign({ codigo: registro.id }, config.jwtSegredo, {
      subject: String(registro.usuario_id),
      expiresIn: '15m',
    });
    res.json({ tokenRedefinicao });
  },
);

rotasAuth.post(
  '/redefinir',
  validar(z.object({ tokenRedefinicao: z.string(), senha })),
  (req, res) => {
    let dados;
    try {
      dados = jwt.verify(req.dados.tokenRedefinicao, config.jwtSegredo);
    } catch {
      throw new ErroHttp(400, 'O prazo para trocar a senha acabou. Comece de novo.');
    }

    const registro = db
      .prepare('SELECT * FROM codigos_recuperacao WHERE id = ? AND usado = 0')
      .get(dados.codigo);
    if (!registro) throw new ErroHttp(400, 'Este código já foi usado. Comece de novo.');

    transacao(() => {
      db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(
        bcrypt.hashSync(req.dados.senha, 10),
        registro.usuario_id,
      );
      db.prepare('UPDATE codigos_recuperacao SET usado = 1 WHERE id = ?').run(registro.id);
    });

    res.json({ mensagem: 'Senha alterada. Entre com a nova senha.' });
  },
);
