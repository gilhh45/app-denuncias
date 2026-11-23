import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { config } from '../config.js';
import { ErroHttp } from '../middlewares.js';

/**
 * Prints das denúncias. Com SUPABASE_URL e SUPABASE_SECRET_KEY vão para o bucket
 * privado do Storage; sem isso ficam na pasta uploads/ (testes e uso local).
 */
export const usaStorage = !!(config.supabaseUrl && config.supabaseChave);

const EXTENSOES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
export const tipoAceito = (mimetype) => !!EXTENSOES[mimetype];

// link temporário: quem abre a denúncia vê o print por 1 hora
const VALIDADE_LINK = 60 * 60;

function cabecalhos(extra = {}) {
  const h = { apikey: config.supabaseChave, ...extra };
  // a chave antiga (service_role) é um JWT e também vai no Authorization
  if (config.supabaseChave.startsWith('eyJ')) h.Authorization = `Bearer ${config.supabaseChave}`;
  return h;
}

async function enviarAoStorage(nome, arquivo) {
  const resposta = await fetch(`${config.supabaseUrl}/storage/v1/object/${config.bucket}/${nome}`, {
    method: 'POST',
    headers: cabecalhos({ 'Content-Type': arquivo.mimetype }),
    body: arquivo.buffer,
  });
  if (!resposta.ok) {
    console.error('Storage recusou o arquivo:', resposta.status, await resposta.text());
    throw new ErroHttp(502, 'Não foi possível salvar as imagens agora. Tente de novo.');
  }
}

/** Salva os arquivos recebidos pelo multer e devolve os nomes para gravar no banco. */
export async function salvarEvidencias(arquivos) {
  const nomes = arquivos.map((a) => randomUUID() + EXTENSOES[a.mimetype]);
  if (usaStorage) {
    await Promise.all(arquivos.map((a, i) => enviarAoStorage(nomes[i], a)));
  } else {
    fs.mkdirSync(config.pastaUploads, { recursive: true });
    arquivos.forEach((a, i) =>
      fs.writeFileSync(path.join(config.pastaUploads, nomes[i]), a.buffer),
    );
  }
  return nomes;
}

/** Endereço para o app abrir o print: link assinado do Storage ou /uploads/nome. */
export async function linkDaEvidencia(nome) {
  if (!usaStorage) return `/uploads/${nome}`;
  const resposta = await fetch(
    `${config.supabaseUrl}/storage/v1/object/sign/${config.bucket}/${nome}`,
    {
      method: 'POST',
      headers: cabecalhos({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ expiresIn: VALIDADE_LINK }),
    },
  );
  if (!resposta.ok) {
    console.error('Storage não gerou o link:', resposta.status, await resposta.text());
    return null;
  }
  const { signedURL } = await resposta.json();
  return `${config.supabaseUrl}/storage/v1${signedURL}`;
}
