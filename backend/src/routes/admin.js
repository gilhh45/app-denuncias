import { Router } from 'express';
import { z } from 'zod';

import { db, transacao } from '../db.js';
import { autenticar, ErroHttp, validar } from '../middlewares.js';
import { formatarDenuncia, formatarUsuario, MOTIVOS_REJEICAO, STATUS } from '../modelos.js';
import { denunciasDoMesmoLink } from '../services/antispam.js';
import { avisarMudancaDeNivel, avisarMudancaDeStatus } from '../services/avisos.js';
import {
  estatisticasDoUsuario,
  nivelPorPontos,
  PENALIDADE_REJEICAO,
  pontosPorConfirmacao,
} from '../services/confianca.js';
import { contarPor, gerarExportacao, selecionarDenuncias } from '../services/exportacao.js';
import {
  denunciaComAutor,
  listarDenunciasPorPrioridade,
  prioridadeDoAutor,
  SELECT_COM_AUTOR,
} from '../services/fila.js';
import { buscarDenuncia } from './denuncias.js';

export const rotasAdmin = Router();

function apenasAdmin(req, _res, next) {
  if (req.usuario.papel !== 'admin') throw new ErroHttp(403, 'Área restrita à administração.');
  next();
}

rotasAdmin.use(autenticar, apenasAdmin);

// próximos status permitidos a partir de cada status
const TRANSICOES = {
  PENDENTE: ['EM_ANALISE', 'CONFIRMADA', 'REJEITADA'],
  EM_ANALISE: ['CONFIRMADA', 'REJEITADA'],
  CONFIRMADA: [],
  REJEITADA: [],
};

// ── fluxo de denúncias ──

rotasAdmin.get('/resumo', async (_req, res) => {
  const agora = Date.now();
  const hoje = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const semana = new Date(agora - 7 * 86_400_000).toISOString();
  const quinzeDias = new Date(agora - 13 * 86_400_000);
  quinzeDias.setHours(0, 0, 0, 0);

  const totais = await db.get(
    `SELECT COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'PENDENTE') AS pendentes,
         COUNT(*) FILTER (WHERE status = 'EM_ANALISE') AS "emAnalise",
         COUNT(*) FILTER (WHERE status = 'CONFIRMADA') AS confirmadas,
         COUNT(*) FILTER (WHERE status = 'REJEITADA') AS rejeitadas,
         COUNT(*) FILTER (WHERE criada_em >= ?::text) AS hoje,
         COUNT(*) FILTER (WHERE criada_em >= ?::text) AS semana
       FROM denuncias`,
    hoje,
    semana,
  );

  const datas = await db.all(
    'SELECT criada_em FROM denuncias WHERE criada_em >= ?',
    quinzeDias.toISOString(),
  );
  const porDia = Array.from({ length: 14 }, (_, i) => {
    const dia = new Date(quinzeDias.getTime() + i * 86_400_000);
    const fim = dia.getTime() + 86_400_000;
    const total = datas.filter((d) => {
      const t = Date.parse(d.criada_em);
      return t >= dia.getTime() && t < fim;
    }).length;
    return { dia: dia.toISOString().slice(0, 10), total };
  });

  const porCategoria = await db.all(
    'SELECT categoria, COUNT(*) AS total FROM denuncias GROUP BY categoria ORDER BY total DESC LIMIT 6',
  );

  const abertas = (await listarDenunciasPorPrioridade()).filter(
    (d) => d.status === 'PENDENTE' || d.status === 'EM_ANALISE',
  );
  const porPrioridade = { ALTA: 0, MEDIA: 0, BAIXA: 0 };
  for (const d of abertas) porPrioridade[d.prioridade] += 1;

  const usuarios = await db.all("SELECT pontos, bloqueado FROM usuarios WHERE papel = 'cidadao'");
  const porNivel = {};
  for (const u of usuarios) {
    const nome = nivelPorPontos(u.pontos).nome;
    porNivel[nome] = (porNivel[nome] ?? 0) + 1;
  }

  res.json({
    totais: Object.fromEntries(Object.entries(totais).map(([k, v]) => [k, v ?? 0])),
    porDia,
    porCategoria,
    abertasPorPrioridade: porPrioridade,
    usuarios: {
      total: usuarios.length,
      bloqueados: usuarios.filter((u) => u.bloqueado).length,
      porNivel,
    },
  });
});

const filtrosSchema = z.object({
  status: z.enum(STATUS).optional(),
  prioridade: z.enum(['ALTA', 'MEDIA', 'BAIXA']).optional(),
  busca: z.string().trim().max(80).optional(),
});

rotasAdmin.get('/denuncias', validar(filtrosSchema, 'query'), async (req, res) => {
  res.json({ denuncias: await listarDenunciasPorPrioridade(req.dados) });
});

rotasAdmin.get('/denuncias/:id', async (req, res) => {
  const id = Number(req.params.id);
  const linha = await db.get(`${SELECT_COM_AUTOR} WHERE d.id = ?`, id);
  if (!linha) throw new ErroHttp(404, 'Denúncia não encontrada.');

  const { evidencias, historico } = await buscarDenuncia(id);
  res.json({
    denuncia: {
      ...denunciaComAutor(linha, { evidencias, historico }),
      outrosDenunciantes: await denunciasDoMesmoLink(linha.url_normalizada, linha.usuario_id),
    },
  });
});

const statusSchema = z
  .object({
    status: z.enum(['EM_ANALISE', 'CONFIRMADA', 'REJEITADA'], { error: 'Status inválido.' }),
    nota: z.string().trim().max(300).optional(),
    motivo: z.enum(Object.keys(MOTIVOS_REJEICAO), { error: 'Motivo inválido.' }).optional(),
  })
  .refine((d) => d.status !== 'REJEITADA' || d.motivo, {
    error: 'Escolha o motivo da rejeição.',
    path: ['motivo'],
  });

rotasAdmin.patch('/denuncias/:id/status', validar(statusSchema), async (req, res) => {
  const id = Number(req.params.id);
  const { status, nota } = req.dados;
  const motivo = status === 'REJEITADA' ? req.dados.motivo : null;
  const denuncia = await db.get('SELECT * FROM denuncias WHERE id = ?', id);
  if (!denuncia) throw new ErroHttp(404, 'Denúncia não encontrada.');

  if (!TRANSICOES[denuncia.status].includes(status)) {
    throw new ErroHttp(409, 'Esta denúncia não pode mudar para esse status.');
  }

  // a confiança do autor muda conforme o resultado da análise
  let variacao = 0;
  if (status === 'CONFIRMADA') variacao = pontosPorConfirmacao(denuncia.score);
  if (status === 'REJEITADA') variacao = -PENALIDADE_REJEICAO;

  await transacao(async () => {
    await db.run(
      'UPDATE denuncias SET status = ?, atualizada_em = ? WHERE id = ?',
      status,
      new Date().toISOString(),
      id,
    );
    await db.run(
      'INSERT INTO historico_status (denuncia_id, status, nota, motivo, variacao_pontos) VALUES (?, ?, ?, ?, ?)',
      id,
      status,
      nota || null,
      motivo,
      variacao,
    );
    await avisarMudancaDeStatus(denuncia, status, motivo);
    if (variacao) {
      const { pontos } = await db.get(
        'SELECT pontos FROM usuarios WHERE id = ?',
        denuncia.usuario_id,
      );
      const novos = Math.max(0, pontos + variacao);
      await db.run('UPDATE usuarios SET pontos = ? WHERE id = ?', novos, denuncia.usuario_id);
      await avisarMudancaDeNivel(denuncia.usuario_id, pontos, novos);
    }
  });

  const linha = await db.get(`${SELECT_COM_AUTOR} WHERE d.id = ?`, id);
  res.json({
    denuncia: denunciaComAutor(linha, await buscarDenuncia(id)),
    variacaoPontos: variacao,
  });
});

// ── usuários ──

rotasAdmin.get('/usuarios', async (req, res) => {
  const busca = typeof req.query.busca === 'string' ? `%${req.query.busca.toLowerCase()}%` : null;
  const linhas = await db.all(
    `SELECT * FROM usuarios
       WHERE papel = 'cidadao' AND (?::text IS NULL OR lower(nome || ' ' || email) LIKE ?)
       ORDER BY pontos DESC`,
    busca,
    busca,
  );

  res.json({
    usuarios: await Promise.all(
      linhas.map(async (u) => ({
        ...formatarUsuario(u),
        estatisticas: await estatisticasDoUsuario(u.id),
      })),
    ),
  });
});

rotasAdmin.get('/usuarios/:id', async (req, res) => {
  const usuario = await db.get(
    "SELECT * FROM usuarios WHERE id = ? AND papel = 'cidadao'",
    Number(req.params.id),
  );
  if (!usuario) throw new ErroHttp(404, 'Usuário não encontrado.');

  const denuncias = await db.all(
    `SELECT d.*, (SELECT COUNT(*) FROM evidencias e WHERE e.denuncia_id = d.id) AS total_evidencias
       FROM denuncias d WHERE usuario_id = ? ORDER BY criada_em DESC`,
    usuario.id,
  );

  const categorias = await db.all(
    `SELECT categoria, COUNT(*) AS total FROM denuncias
       WHERE usuario_id = ? GROUP BY categoria ORDER BY total DESC LIMIT 4`,
    usuario.id,
  );

  res.json({
    usuario: formatarUsuario(usuario),
    estatisticas: await estatisticasDoUsuario(usuario.id),
    prioridade: prioridadeDoAutor(usuario.pontos, usuario.bloqueado),
    categorias,
    denuncias: denuncias.map((d) => formatarDenuncia(d)),
  });
});

rotasAdmin.patch(
  '/usuarios/:id/bloqueio',
  validar(z.object({ bloqueado: z.boolean({ error: 'Informe se deve bloquear.' }) })),
  async (req, res) => {
    const usuario = await db.get(
      "SELECT * FROM usuarios WHERE id = ? AND papel = 'cidadao'",
      Number(req.params.id),
    );
    if (!usuario) throw new ErroHttp(404, 'Usuário não encontrado.');

    await db.run(
      'UPDATE usuarios SET bloqueado = ? WHERE id = ?',
      req.dados.bloqueado ? 1 : 0,
      usuario.id,
    );
    const atualizado = await db.get('SELECT * FROM usuarios WHERE id = ?', usuario.id);
    res.json({ usuario: formatarUsuario(atualizado) });
  },
);

// ── exportação para o órgão regulador ──

const exportacaoSchema = z.object({
  dias: z.coerce.number().int().min(1).max(365).optional(),
  incluirRejeitadas: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  formato: z.enum(['zip', 'base64']).optional(),
});

rotasAdmin.get('/exportacao/previa', validar(exportacaoSchema, 'query'), async (req, res) => {
  const denuncias = await selecionarDenuncias(req.dados);
  res.json({
    total: denuncias.length,
    porPrioridade: { ALTA: 0, MEDIA: 0, BAIXA: 0, ...contarPor(denuncias, 'prioridade') },
    porStatus: contarPor(denuncias, 'status'),
    primeiras: denuncias.slice(0, 5),
  });
});

rotasAdmin.get('/exportacao', validar(exportacaoSchema, 'query'), async (req, res) => {
  const { zip, nomeArquivo, total } = await gerarExportacao(req.dados);

  // no celular é mais simples receber o arquivo em base64 e salvar direto
  if (req.dados.formato === 'base64') {
    return res.json({
      nomeArquivo,
      total,
      bytes: zip.length,
      base64: Buffer.from(zip).toString('base64'),
    });
  }

  res
    .set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    })
    .send(Buffer.from(zip));
});
