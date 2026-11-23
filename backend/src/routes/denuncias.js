import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';

import { config } from '../config.js';
import { db, transacao } from '../db.js';
import { autenticar, ErroHttp, validar } from '../middlewares.js';
import {
  CATEGORIAS,
  formatarDenuncia,
  formatarDenunciaCidadao,
  PLATAFORMAS,
  STATUS,
  TIPOS,
} from '../modelos.js';
import { avaliarLimite, denunciasDoMesmoLink, jaDenunciou } from '../services/antispam.js';
import { linkDaEvidencia, salvarEvidencias, tipoAceito } from '../services/arquivos.js';
import { conferirCaptcha, gerarCaptcha } from '../services/captcha.js';
import { calcularScore, dicasDaDenuncia, forcaDoScore } from '../services/confianca.js';
import { normalizarUrl, urlValida } from '../services/url.js';

export const rotasDenuncias = Router();
rotasDenuncias.use(autenticar);

export const MAX_EVIDENCIAS = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_EVIDENCIAS },
  fileFilter: (_req, arquivo, cb) => {
    if (tipoAceito(arquivo.mimetype)) cb(null, true);
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

export async function buscarDenuncia(id) {
  const linha = await db.get('SELECT * FROM denuncias WHERE id = ?', id);
  if (!linha) return null;
  const arquivos = await db.all(
    'SELECT arquivo FROM evidencias WHERE denuncia_id = ? ORDER BY id',
    id,
  );
  const evidencias = await Promise.all(
    arquivos.map(async (e) => ({ ...e, url: await linkDaEvidencia(e.arquivo) })),
  );
  const historico = await db.all(
    'SELECT * FROM historico_status WHERE denuncia_id = ? ORDER BY id',
    id,
  );
  return { linha, evidencias, historico };
}

rotasDenuncias.get('/', async (req, res) => {
  const status = STATUS.includes(req.query.status) ? req.query.status : null;
  const linhas = await db.all(
    `SELECT d.*, (SELECT COUNT(*) FROM evidencias e WHERE e.denuncia_id = d.id) AS total_evidencias
       FROM denuncias d
       WHERE d.usuario_id = ? AND (?::text IS NULL OR d.status = ?)
       ORDER BY d.criada_em DESC`,
    req.usuario.id,
    status,
    status,
  );
  res.json({ denuncias: linhas.map((l) => formatarDenunciaCidadao(l)) });
});

rotasDenuncias.get('/limite', async (req, res) => {
  res.json(await avaliarLimite(req.usuario.id));
});

rotasDenuncias.get('/captcha', (_req, res) => {
  res.json(gerarCaptcha());
});

// o app consulta enquanto a pessoa digita; o limite evita usar a rota para sondar links
const limiteVerificacao = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: (req) => String(req.usuario.id),
  skip: () => config.teste,
  handler: () => {
    throw new ErroHttp(429, 'Muitas consultas seguidas. Espere um pouco.');
  },
});

// POST com corpo para o link denunciado não ficar em logs de acesso
rotasDenuncias.post(
  '/verificar-link',
  limiteVerificacao,
  validar(z.object({ url: z.string({ error: 'Informe o link.' }).trim().max(2000) })),
  async (req, res) => {
    const { url } = req.dados;
    if (!urlValida(url)) {
      return res.json({ valido: false, jaDenunciei: false, outrosDenunciantes: 0 });
    }
    const normalizada = normalizarUrl(url);
    res.json({
      valido: true,
      jaDenunciei: await jaDenunciou(req.usuario.id, normalizada),
      // só a contagem, nunca quem denunciou
      outrosDenunciantes: await denunciasDoMesmoLink(normalizada, req.usuario.id),
    });
  },
);

rotasDenuncias.get('/:id', async (req, res) => {
  const encontrada = await buscarDenuncia(Number(req.params.id));
  const dono = encontrada?.linha.usuario_id === req.usuario.id;
  if (!encontrada || (!dono && req.usuario.papel !== 'admin')) {
    throw new ErroHttp(404, 'Denúncia não encontrada.');
  }
  const formatar = req.usuario.papel === 'admin' ? formatarDenuncia : formatarDenunciaCidadao;
  res.json({ denuncia: formatar(encontrada.linha, encontrada) });
});

rotasDenuncias.post('/', receberEvidencias, validar(novaDenunciaSchema), async (req, res) => {
  if (req.usuario.papel === 'admin') {
    throw new ErroHttp(403, 'A conta de administrador não envia denúncias.');
  }

  const limite = await avaliarLimite(req.usuario.id);
  if (!limite.podeEnviar) {
    throw new ErroHttp(429, limite.motivo, { esperarSegundos: limite.esperarSegundos });
  }

  const d = req.dados;
  const urlNormalizada = normalizarUrl(d.url);
  if (await jaDenunciou(req.usuario.id, urlNormalizada)) {
    throw new ErroHttp(409, 'Você já denunciou este link.', { campo: 'url' });
  }

  // o captcha fica por último: ele é de uso único, então só gastamos se o resto estiver certo
  const captcha = conferirCaptcha(req.body.captchaId, req.body.captchaResposta);
  if (captcha !== 'ok') {
    throw new ErroHttp(
      400,
      captcha === 'expirado'
        ? 'A verificação expirou. Responda a nova conta.'
        : 'Resposta da conta incorreta.',
      { campo: 'captcha' },
    );
  }

  const arquivos = await salvarEvidencias(req.files ?? []);
  const { score } = calcularScore(
    { url: d.url, descricao: d.descricao, evidencias: arquivos.length },
    req.usuario.pontos,
  );

  const id = await transacao(async () => {
    const { id: novaId } = await db.run(
      `INSERT INTO denuncias
          (protocolo, usuario_id, tipo, plataforma, perfil, categoria, titulo, url, url_normalizada, descricao, score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      gerarProtocolo(),
      req.usuario.id,
      d.tipo,
      d.tipo === 'REDE_SOCIAL' ? d.plataforma : null,
      d.tipo === 'REDE_SOCIAL' ? d.perfil || null : null,
      d.categoria,
      d.titulo,
      d.url,
      urlNormalizada,
      d.descricao,
      score,
    );
    for (const nome of arquivos) {
      await db.run('INSERT INTO evidencias (denuncia_id, arquivo) VALUES (?, ?)', novaId, nome);
    }
    await db.run(
      "INSERT INTO historico_status (denuncia_id, status, nota) VALUES (?, 'PENDENTE', ?)",
      novaId,
      'Denúncia recebida',
    );
    return novaId;
  });

  const nova = await buscarDenuncia(id);
  res.status(201).json({
    denuncia: formatarDenunciaCidadao(nova.linha, nova),
    forca: forcaDoScore(score),
    dicas: dicasDaDenuncia({ url: d.url, descricao: d.descricao, evidencias: arquivos.length }),
  });
});
