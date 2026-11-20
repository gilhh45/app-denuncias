import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { exemplo, formulario, iniciarApi } from './apoio.js';

describe('denúncias', () => {
  let api;
  let token;

  before(async () => {
    api = await iniciarApi();
    const r = await api.post('/auth/cadastro', {
      nome: 'Davi',
      email: 'davi@teste.com',
      senha: '123456',
    });
    token = r.corpo.token;
  });

  it('cria uma denúncia com evidências e lista para o dono', async () => {
    const r = await api.enviar('/denuncias', formulario(exemplo, 2), token);
    assert.equal(r.status, 201);
    assert.match(r.corpo.denuncia.protocolo, /^DJ-[0-9A-F]{6}$/);
    assert.equal(r.corpo.denuncia.status, 'PENDENTE');
    assert.equal(r.corpo.denuncia.evidencias.length, 2);

    const lista = await api.get('/denuncias', token);
    assert.equal(lista.corpo.denuncias.length, 1);
    assert.equal(lista.corpo.denuncias[0].totalEvidencias, 2);

    const imagem = await api.get(r.corpo.denuncia.evidencias[0]);
    assert.equal(imagem.status, 200);
  });

  it('valida link, categoria e plataforma', async () => {
    const semLink = await api.enviar(
      '/denuncias',
      formulario({ ...exemplo, url: 'site.com' }),
      token,
    );
    assert.equal(semLink.status, 400);
    assert.match(semLink.corpo.erro, /link/);

    const semPlataforma = await api.enviar(
      '/denuncias',
      formulario({ ...exemplo, plataforma: '' }),
      token,
    );
    assert.equal(semPlataforma.status, 400);
  });

  it('não mostra a denúncia de outra pessoa', async () => {
    const outro = await api.post('/auth/cadastro', {
      nome: 'Eva',
      email: 'eva@teste.com',
      senha: '123456',
    });
    const r = await api.get('/denuncias/1', outro.corpo.token);
    assert.equal(r.status, 404);
  });
});
