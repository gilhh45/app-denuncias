import { Router } from 'express';
import multer from 'multer';
import { randomBytes, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { config } from '../config.js';
import { db, transacao } from '../db.js';
import { autenticar, ErroHttp, validar } from '../middlewares.js';
import { CATEGORIAS, formatarDenuncia, PLATAFORMAS, STATUS, TIPOS } from '../modelos.js';
import { normalizarUrl, urlValida } from '../services/url.js';

export const rotasDenuncias = Router();
rotasDenuncias.use(autenticar);

export const MAX_EVIDENCIAS = 5;
const EXTENSOES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_EVIDENCIAS },
  fileFilter: (_req, arquivo, cb) => {
    if (EXTENSOES[arquivo.mimetype]) cb(null, true);
    else cb(new ErroHttp(400, 'As evidências precisam ser imagens (JPG, PNG ou WEBP).'));
  },
});

function receberEvidencias(req, res, next) {
  upload.array('evidencias', MAX_EVIDENCIAS)(req, res, (erro) => {
    if (erro?.code === 'LIMIT_FILE_SIZE')
      return next(new ErroHttp(400, 'Cada imagem pode ter até 5 MB.'));
    if (erro?.code === 'LIMIT_FILE_COUNT' || erro?.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ErroHttp(400, `Envie no máximo ${MAX_EVIDENCIAS} imagens.`));
    }
    next(erro);
  });
}

const novaDenunciaSchema = z
  .object({
    tipo: z.enum(TIPOS, { error: 'Escolha se é um site ou uma rede social.' }),
    plataforma: z.enum(PLATAFORMAS, { error: 'Escolha a plataforma.' }).optional(),
    perfil: z.string().trim().max(80).optional(),
    categoria: z.enum(CATEGORIAS, { error: 'Escolha uma categoria.' }),
    titulo: z
      .string({ error: 'Informe um título.' })
      .trim()
      .min(5, { error: 'O título precisa ter pelo menos 5 letras.' })
      .max(100, { error: 'O título pode ter no máximo 100 letras.' }),
    url: z
      .string({ error: 'Informe o link.' })
      .trim()
      .refine(urlValida, { error: 'Informe um link completo, começando com http:// ou https://' }),
    descricao: z
      .string({ error: 'Descreva o que aconteceu.' })
      .trim()
      .min(20, { error: 'Descreva com pelo menos 20 letras.' })
      .max(2000, { error: 'A descrição pode ter no máximo 2000 letras.' }),
  })
  .refine((d) => d.tipo !== 'REDE_SOCIAL' || d.plataforma, {
    error: 'Escolha a plataforma.',
    path: ['plataforma'],
  });

function gerarProtocolo() {
  const codigo = randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `DJ-${codigo}`;
}

function salvarArquivos(arquivos) {
  fs.mkdirSync(config.pastaUploads, { recursive: true });
  return arquivos.map((arquivo) => {
    const nome = randomUUID() + EXTENSOES[arquivo.mimetype];
    fs.writeFileSync(path.join(config.pastaUploads, nome), arquivo.buffer);
    return nome;
  });
}

export function buscarDenuncia(id) {
  const linha = db.prepare('SELECT * FROM denuncias WHERE id = ?').get(id);
  if (!linha) return null;
  const evidencias = db.prepare('SELECT arquivo FROM evidencias WHERE denuncia_id = ?').all(id);
  const historico = db
    .prepare('SELECT * FROM historico_status WHERE denuncia_id = ? ORDER BY id')
    .all(id);
  return { linha, evidencias, historico };
}

rotasDenuncias.get('/', (req, res) => {
  const status = STATUS.includes(req.query.status) ? req.query.status : null;
  const linhas = db
    .prepare(
      `SELECT d.*, (SELECT COUNT(*) FROM evidencias e WHERE e.denuncia_id = d.id) AS total_evidencias
       FROM denuncias d
       WHERE d.usuario_id = ? AND (? IS NULL OR d.status = ?)
       ORDER BY d.criada_em DESC`,
    )
    .all(req.usuario.id, status, status);
  res.json({ denuncias: linhas.map((l) => formatarDenuncia(l)) });
});

rotasDenuncias.get('/:id', (req, res) => {
  const encontrada = buscarDenuncia(Number(req.params.id));
  const dono = encontrada?.linha.usuario_id === req.usuario.id;
  if (!encontrada || (!dono && req.usuario.papel !== 'admin')) {
    throw new ErroHttp(404, 'Denúncia não encontrada.');
  }
  res.json({ denuncia: formatarDenuncia(encontrada.linha, encontrada) });
});

rotasDenuncias.post('/', receberEvidencias, validar(novaDenunciaSchema), (req, res) => {
  if (req.usuario.papel === 'admin') {
    throw new ErroHttp(403, 'A conta de administrador não envia denúncias.');
  }

  const d = req.dados;
  const arquivos = salvarArquivos(req.files ?? []);

  const id = transacao(() => {
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO denuncias
          (protocolo, usuario_id, tipo, plataforma, perfil, categoria, titulo, url, url_normalizada, descricao)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        gerarProtocolo(),
        req.usuario.id,
        d.tipo,
        d.tipo === 'REDE_SOCIAL' ? d.plataforma : null,
        d.tipo === 'REDE_SOCIAL' ? d.perfil || null : null,
        d.categoria,
        d.titulo,
        d.url,
        normalizarUrl(d.url),
        d.descricao,
      );
    const inserir = db.prepare('INSERT INTO evidencias (denuncia_id, arquivo) VALUES (?, ?)');
    for (const nome of arquivos) inserir.run(lastInsertRowid, nome);
    db.prepare(
      "INSERT INTO historico_status (denuncia_id, status, nota) VALUES (?, 'PENDENTE', ?)",
    ).run(lastInsertRowid, 'Denúncia recebida');
    return lastInsertRowid;
  });

  const nova = buscarDenuncia(id);
  res.status(201).json({ denuncia: formatarDenuncia(nova.linha, nova) });
});
