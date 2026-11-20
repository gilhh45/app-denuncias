import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import bcrypt from 'bcryptjs';
import { strFromU8, unzipSync } from 'fflate';

import { db } from '../src/db.js';
import { captchaRespondido, exemplo, formulario, iniciarApi } from './apoio.js';

describe('exportação', () => {
  let api;
  let admin;

  async function cidadaoComPontos(nome, pontos, url) {
    const r = await api.post('/auth/cadastro', {
      nome,
      email: `${nome.toLowerCase()}@teste.com`,
      senha: '123456',
    });
    db.prepare('UPDATE usuarios SET pontos = ? WHERE id = ?').run(pontos, r.corpo.usuario.id);
    const campos = { ...exemplo, url, ...(await captchaRespondido(api, r.corpo.token)) };
    await api.enviar('/denuncias', formulario(campos), r.corpo.token);
  }

  before(async () => {
    api = await iniciarApi();
    db.prepare(
      "INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ('Admin', 'admin@teste.com', ?, 'admin')",
    ).run(bcrypt.hashSync('admin123', 4));
    admin = (await api.post('/auth/login', { email: 'admin@teste.com', senha: 'admin123' })).corpo
      .token;

    await cidadaoComPontos('Iara', 0, 'https://golpe.com/a');
    await cidadaoComPontos('Joana', 650, 'https://golpe.com/b');
    await cidadaoComPontos('Kaio', 150, 'https://golpe.com/c');
  });

  it('mostra a prévia com a contagem por prioridade', async () => {
    const r = await api.get('/admin/exportacao/previa?dias=30', admin);
    assert.equal(r.corpo.total, 3);
    assert.deepEqual(r.corpo.porPrioridade, { ALTA: 1, MEDIA: 1, BAIXA: 1 });
  });

  it('gera um zip com o CSV ordenado por prioridade', async () => {
    const r = await api.get('/admin/exportacao?dias=30', admin);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-type'), 'application/zip');

    const arquivos = unzipSync(new Uint8Array(r.corpo));
    assert.ok(arquivos['LEIA-ME.txt']);

    const linhas = strFromU8(arquivos['denuncias.csv']).trim().split('\r\n');
    assert.equal(linhas.length, 4);
    assert.match(linhas[1], /^Alta;/);
    assert.match(linhas[2], /^Média;/);
    assert.match(linhas[3], /^Baixa;/);
    // o nome de quem denunciou não vai para o arquivo
    assert.ok(!linhas.join().includes('Joana'));
  });

  it('também entrega em base64 para o celular', async () => {
    const r = await api.get('/admin/exportacao?formato=base64', admin);
    assert.match(r.corpo.nomeArquivo, /^denuncieja-\d{4}-\d{2}-\d{2}\.zip$/);
    assert.ok(r.corpo.base64.length > 100);
  });
});
