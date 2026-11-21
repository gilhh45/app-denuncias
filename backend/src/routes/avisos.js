import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db.js';
import { autenticar, validar } from '../middlewares.js';
import { contarNaoLidos, formatarAviso } from '../services/avisos.js';

export const rotasAvisos = Router();
rotasAvisos.use(autenticar);

rotasAvisos.get('/', (req, res) => {
  const soNaoLidos = req.query.soNaoLidos === '1';
  const linhas = db
    .prepare(
      `SELECT * FROM avisos WHERE usuario_id = ? AND (? = 0 OR lido = 0)
       ORDER BY criado_em DESC, id DESC LIMIT 50`,
    )
    .all(req.usuario.id, soNaoLidos ? 1 : 0);
  res.json({ avisos: linhas.map(formatarAviso), naoLidos: contarNaoLidos(req.usuario.id) });
});

const lidosSchema = z.object({
  ids: z.array(z.number().int().positive()).max(100).optional(),
});

// sem ids marca todos; com ids marca só os do próprio usuário
rotasAvisos.post('/lidos', validar(lidosSchema), (req, res) => {
  const { ids } = req.dados;
  if (ids?.length) {
    const marcar = db.prepare('UPDATE avisos SET lido = 1 WHERE id = ? AND usuario_id = ?');
    for (const id of ids) marcar.run(id, req.usuario.id);
  } else {
    db.prepare('UPDATE avisos SET lido = 1 WHERE usuario_id = ?').run(req.usuario.id);
  }
  res.json({ naoLidos: contarNaoLidos(req.usuario.id) });
});
