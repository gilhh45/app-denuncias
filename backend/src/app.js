import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { config } from './config.js';
import { db } from './db.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares.js';
import { rotasAdmin } from './routes/admin.js';
import { rotasAuth } from './routes/auth.js';
import { rotasDenuncias } from './routes/denuncias.js';

export function criarApp() {
  const app = express();

  // as imagens são abertas pelo app (outra origem), então liberamos o carregamento cross-origin
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/saude', (_req, res) => {
    const { usuarios } = db.prepare('SELECT COUNT(*) AS usuarios FROM usuarios').get();
    res.json({ ok: true, usuarios, horario: new Date().toISOString() });
  });

  app.use('/uploads', express.static(config.pastaUploads, { maxAge: '7d', fallthrough: false }));
  app.use('/auth', rotasAuth);
  app.use('/denuncias', rotasDenuncias);
  app.use('/admin', rotasAdmin);

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
