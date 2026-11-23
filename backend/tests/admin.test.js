import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import bcrypt from 'bcryptjs';

import { db } from '../src/db.js';
import { captchaRespondido, exemplo, formulario, iniciarApi } from './apoio.js';

describe('administração', () => {
  let api;
  let admin;
  let cidadao;
  let denunciaId;

  before(async () => {
    api = await iniciarApi();
    await db.run(
      "INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ('Admin', 'admin@teste.com', ?, 'admin')",
      bcrypt.hashSync('admin123', 4),
    );
    admin = (await api.post('/auth/login', { email: 'admin@teste.com', senha: 'admin123' })).corpo
      .token;

    const r = await api.post('/auth/cadastro', {
      nome: 'Gabi',
      email: 'gabi@teste.com',
      senha: '123456',
    });
    cidadao = r.corpo.token;
    const campos = { ...exemplo, ...(await captchaRespondido(api, cidadao)) };
    denunciaId = (await api.enviar('/denuncias', formulario(campos, 1), cidadao)).corpo.denuncia.id;
  });

  it('bloqueia quem não é admin', async () => {
    const r = await api.get('/admin/resumo', cidadao);
    assert.equal(r.status, 403);
  });

  it('mostra o resumo do fluxo e a fila por prioridade', async () => {
    const resumo = await api.get('/admin/resumo', admin);
    assert.equal(resumo.corpo.totais.total, 1);
    assert.equal(resumo.corpo.porDia.length, 14);
    assert.equal(resumo.corpo.abertasPorPrioridade.BAIXA, 1);

    const fila = await api.get('/admin/denuncias?status=PENDENTE', admin);
    assert.equal(fila.corpo.denuncias[0].autor.nome, 'Gabi');
  });

  it('confirmar a denúncia dá pontos ao autor', async () => {
    const analise = await api.patch(
      `/admin/denuncias/${denunciaId}/status`,
      { status: 'EM_ANALISE' },
      admin,
    );
    assert.equal(analise.status, 200);

    const r = await api.patch(
      `/admin/denuncias/${denunciaId}/status`,
      { status: 'CONFIRMADA', nota: 'Perfil removido pela plataforma' },
      admin,
    );
    assert.ok(r.corpo.variacaoPontos > 0);
    assert.equal(r.corpo.denuncia.historico.length, 3);

    // o cidadão só vê os pontos na tela "como meu nível é calculado"
    const nivel = await api.get('/auth/eu/nivel', cidadao);
    assert.equal(nivel.corpo.pontos, r.corpo.variacaoPontos);
    const lista = await api.get('/admin/usuarios?busca=gabi', admin);
    assert.equal(lista.corpo.usuarios[0].estatisticas.taxaAcerto, 100);

    // depois de confirmada não volta atrás
    const volta = await api.patch(
      `/admin/denuncias/${denunciaId}/status`,
      { status: 'REJEITADA', motivo: 'INDICIO_INSUFICIENTE' },
      admin,
    );
    assert.equal(volta.status, 409);
  });

  it('lista, analisa e bloqueia usuários', async () => {
    const lista = await api.get('/admin/usuarios?busca=gabi', admin);
    assert.equal(lista.corpo.usuarios.length, 1);
    const id = lista.corpo.usuarios[0].id;

    const analise = await api.get(`/admin/usuarios/${id}`, admin);
    assert.equal(analise.corpo.denuncias.length, 1);

    await api.patch(`/admin/usuarios/${id}/bloqueio`, { bloqueado: true }, admin);
    const login = await api.post('/auth/login', { email: 'gabi@teste.com', senha: '123456' });
    assert.equal(login.status, 403);
  });
});
