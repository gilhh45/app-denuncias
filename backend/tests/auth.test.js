import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { iniciarApi } from './apoio.js';

describe('autenticação', () => {
  let api;

  before(async () => {
    api = await iniciarApi();
  });

  it('cadastra, faz login e devolve o usuário logado', async () => {
    const cadastro = await api.post('/auth/cadastro', {
      nome: 'Ana Teste',
      email: 'ANA@teste.com ',
      senha: '123456',
    });
    assert.equal(cadastro.status, 201);
    assert.equal(cadastro.corpo.usuario.email, 'ana@teste.com');
    assert.equal(cadastro.corpo.usuario.senha_hash, undefined);

    const login = await api.post('/auth/login', { email: 'ana@teste.com', senha: '123456' });
    assert.equal(login.status, 200);

    const eu = await api.get('/auth/eu', login.corpo.token);
    assert.equal(eu.corpo.usuario.nome, 'Ana Teste');
    assert.equal(eu.corpo.usuario.nivel.nome, 'Iniciante');
    assert.equal(eu.corpo.estatisticas.total, 0);
  });

  it('não deixa cadastrar o mesmo e-mail duas vezes', async () => {
    const dados = { nome: 'Bruno', email: 'bruno@teste.com', senha: '123456' };
    await api.post('/auth/cadastro', dados);
    const repetido = await api.post('/auth/cadastro', dados);
    assert.equal(repetido.status, 409);
  });

  it('recusa senha errada e token inválido', async () => {
    const login = await api.post('/auth/login', { email: 'ana@teste.com', senha: 'errada' });
    assert.equal(login.status, 401);

    const eu = await api.get('/auth/eu', 'token-falso');
    assert.equal(eu.status, 401);
  });

  it('valida os campos com mensagens em português', async () => {
    const r = await api.post('/auth/cadastro', { nome: 'Al', email: 'x', senha: '1' });
    assert.equal(r.status, 400);
    assert.match(r.corpo.erro, /nome/i);
  });
});
