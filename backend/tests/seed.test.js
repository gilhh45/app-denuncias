import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { popularBanco, SENHA_ADMIN, SENHA_CLIENTES } from '../src/seed.js';
import { iniciarApi } from './apoio.js';

describe('dados de exemplo', () => {
  let api;

  before(async () => {
    await popularBanco();
    api = await iniciarApi();
  });

  it('cria as contas da apresentação', async () => {
    const admin = await api.post('/auth/login', {
      email: 'bigbrother@denuncieja.app',
      senha: SENHA_ADMIN,
    });
    assert.equal(admin.corpo.usuario.papel, 'admin');
    assert.equal(admin.corpo.usuario.nome, 'BIG BROTHER');

    const usuarios = await api.get('/admin/usuarios', admin.corpo.token);
    assert.equal(usuarios.corpo.usuarios.length, 6);

    const victor = await api.post('/auth/login', {
      email: 'victor.mieko@denuncieja.app',
      senha: SENHA_CLIENTES,
    });
    assert.equal(victor.corpo.usuario.nivel.nome, 'Especialista');
  });

  it('as denúncias de exemplo não travam o anti-spam', async () => {
    const r = await api.post('/auth/login', {
      email: 'matheus@denuncieja.app',
      senha: SENHA_CLIENTES,
    });
    const limite = await api.get('/denuncias/limite', r.corpo.token);
    assert.equal(limite.corpo.podeEnviar, true);
  });
});
