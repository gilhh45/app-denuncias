import { strToU8, zipSync } from 'fflate';

import { denunciasDoMesmoLink } from './antispam.js';
import { estatisticasDoUsuario } from './confianca.js';
import { listarDenunciasPorPrioridade } from './fila.js';
import { normalizarUrl } from './url.js';

const COLUNAS = [
  'prioridade',
  'protocolo',
  'data',
  'status',
  'tipo',
  'plataforma',
  'categoria',
  'titulo',
  'url',
  'resumo',
  'score',
  'evidencias',
  'nivel_autor',
  'taxa_acerto_autor',
  'autor',
  'outros_denunciantes',
];

const ROTULO_PRIORIDADE = { ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' };
const ROTULO_STATUS = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  CONFIRMADA: 'Confirmada',
  REJEITADA: 'Rejeitada',
};

// CSV com ";" porque é o separador que o Excel em português abre direto
function celula(valor) {
  const texto = String(valor ?? '');
  return /[;"\n\r]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
}

function resumir(texto, limite = 160) {
  const linha = texto.replace(/\s+/g, ' ').trim();
  return linha.length > limite ? `${linha.slice(0, limite - 1)}…` : linha;
}

/** Seleciona as denúncias do período (rejeitadas ficam de fora por padrão). */
export async function selecionarDenuncias({ dias, incluirRejeitadas = false }) {
  const desde = dias ? new Date(Date.now() - dias * 86_400_000).toISOString() : undefined;
  return (await listarDenunciasPorPrioridade({ desde })).filter(
    (d) => incluirRejeitadas || d.status !== 'REJEITADA',
  );
}

export function contarPor(denuncias, campo) {
  const contagem = {};
  for (const d of denuncias) contagem[d[campo]] = (contagem[d[campo]] ?? 0) + 1;
  return contagem;
}

export async function gerarExportacao({ dias, incluirRejeitadas }) {
  const denuncias = await selecionarDenuncias({ dias, incluirRejeitadas });
  const taxas = new Map();
  const linhas = [];
  for (const d of denuncias) {
    if (!taxas.has(d.autor.id)) {
      taxas.set(d.autor.id, (await estatisticasDoUsuario(d.autor.id)).taxaAcerto);
    }
    const taxa = taxas.get(d.autor.id);
    const outros = await denunciasDoMesmoLink(normalizarUrl(d.url), d.autor.id);
    linhas.push(
      [
        ROTULO_PRIORIDADE[d.prioridade],
        d.protocolo,
        d.criadaEm.slice(0, 10),
        ROTULO_STATUS[d.status],
        d.tipo === 'SITE' ? 'Site' : 'Rede social',
        d.plataforma ?? '',
        d.categoria,
        d.titulo,
        d.url,
        resumir(d.descricao),
        d.score,
        d.totalEvidencias,
        d.autor.nivel,
        taxa === null ? '' : `${taxa}%`,
        // o órgão recebe um código, não o nome de quem denunciou
        `U${String(d.autor.id).padStart(4, '0')}`,
        outros,
      ]
        .map(celula)
        .join(';'),
    );
  }

  const csv = '﻿' + [COLUNAS.join(';'), ...linhas].join('\r\n') + '\r\n';
  const geradoEm = new Date();
  const porPrioridade = contarPor(denuncias, 'prioridade');
  const porStatus = contarPor(denuncias, 'status');

  const leiaMe = [
    'DenuncieJá - Exportação de denúncias',
    `Gerado em: ${geradoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
    `Período: ${dias ? `últimos ${dias} dias` : 'todas as denúncias'}`,
    `Total de denúncias: ${denuncias.length}`,
    '',
    'Prioridade (definida pelo nível de confiança de quem denunciou):',
    `  Alta  (Verificado e Especialista): ${porPrioridade.ALTA ?? 0}`,
    `  Média (Confiável): ${porPrioridade.MEDIA ?? 0}`,
    `  Baixa (Iniciante ou conta bloqueada): ${porPrioridade.BAIXA ?? 0}`,
    '',
    'Status:',
    ...Object.entries(ROTULO_STATUS)
      .filter(([s]) => porStatus[s])
      .map(([s, rotulo]) => `  ${rotulo}: ${porStatus[s]}`),
    '',
    'O arquivo denuncias.csv usa ";" como separador e está ordenado da maior para a menor',
    'prioridade e, dentro de cada prioridade, pelo score de credibilidade (0 a 100).',
    'Os autores aparecem só por um código (ex.: U0004) para proteger a identidade.',
  ].join('\r\n');

  const zip = zipSync(
    { 'denuncias.csv': strToU8(csv), 'LEIA-ME.txt': strToU8(leiaMe) },
    { level: 9, mtime: geradoEm },
  );

  return {
    zip,
    nomeArquivo: `denuncieja-${geradoEm.toISOString().slice(0, 10)}.zip`,
    total: denuncias.length,
    porPrioridade,
  };
}
