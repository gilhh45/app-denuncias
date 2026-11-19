import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { db } from './db.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares.js';
import { rotasAuth } from './routes/auth.js';

export function criarApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/saude', (_req, res) => {
    const { usuarios } = db.prepare('SELECT COUNT(*) AS usuarios FROM usuarios').get();
    res.json({ ok: true, usuarios, horario: new Date().toISOString() });
  });

  app.use('/auth', rotasAuth);

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
