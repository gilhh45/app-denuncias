import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { db } from './db.js';

export function criarApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/saude', (_req, res) => {
    const { usuarios } = db.prepare('SELECT COUNT(*) AS usuarios FROM usuarios').get();
    res.json({ ok: true, usuarios, horario: new Date().toISOString() });
  });

  return app;
}
