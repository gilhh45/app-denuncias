import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db.js';
import { autenticar, validar } from '../middlewares.js';
import { contarNaoLidos, formatarAviso } from '../services/avisos.js';

export const rotasAvisos = Router();
rotasAvisos.use(autenticar);

rotasAvisos.get('/', async (req, res) => {
  const soNaoLidos = req.query.soNaoLidos === '1';
  const linhas = await db.all(
    `SELECT * FROM avisos WHERE usuario_id = ? AND (?::int = 0 OR lido = 0)
       ORDER BY criado_em DESC, id DESC LIMIT 50`,
    req.usuario.id,
    soNaoLidos ? 1 : 0,
  );
  res.json({ avisos: linhas.map(formatarAviso), naoLidos: await contarNaoLidos(req.usuario.id) });
});

const lidosSchema = z.object({
  ids: z.array(z.number().int().positive()).max(100).optional(),
});

// sem ids marca todos; com ids marca só os do próprio usuário
rotasAvisos.post('/lidos', validar(lidosSchema), async (req, res) => {
  const { ids } = req.dados;
  if (ids?.length) {
    await db.run(
      'UPDATE avisos SET lido = 1 WHERE id = ANY(?::int[]) AND usuario_id = ?',
      ids,
      req.usuario.id,
    );
  } else {
    await db.run('UPDATE avisos SET lido = 1 WHERE usuario_id = ?', req.usuario.id);
  }
  res.json({ naoLidos: await contarNaoLidos(req.usuario.id) });
});
