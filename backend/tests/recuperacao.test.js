import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { iniciarApi } from './apoio.js';

describe('recuperação de senha', () => {
  let api;
  const email = 'carla@teste.com';

  before(async () => {
    api = await iniciarApi();
    await api.post('/auth/cadastro', { nome: 'Carla', email, senha: 'antiga1' });
  });

  it('troca a senha usando o código de 6 números', async () => {
    const pedido = await api.post('/auth/recuperar', { email });
    assert.match(pedido.corpo.codigoDemo, /^\d{6}$/);

    const verificado = await api.post('/auth/verificar-codigo', {
      email,
      codigo: pedido.corpo.codigoDemo,
    });
    assert.equal(verificado.status, 200);

    const troca = await api.post('/auth/redefinir', {
      tokenRedefinicao: verificado.corpo.tokenRedefinicao,
      senha: 'nova123',
    });
    assert.equal(troca.status, 200);

    const login = await api.post('/auth/login', { email, senha: 'nova123' });
    assert.equal(login.status, 200);

    // o mesmo código não pode ser usado duas vezes
    const repetido = await api.post('/auth/redefinir', {
      tokenRedefinicao: verificado.corpo.tokenRedefinicao,
      senha: 'outra123',
    });
    assert.equal(repetido.status, 400);
  });

  it('não revela se o e-mail existe', async () => {
    const r = await api.post('/auth/recuperar', { email: 'ninguem@teste.com' });
    assert.equal(r.status, 200);
    assert.equal(r.corpo.codigoDemo, undefined);
  });

  it('bloqueia depois de 5 códigos errados', async () => {
    await api.post('/auth/recuperar', { email });
    for (let i = 0; i < 5; i++) {
      await api.post('/auth/verificar-codigo', { email, codigo: '000000' });
    }
    const r = await api.post('/auth/verificar-codigo', { email, codigo: '000000' });
    assert.match(r.corpo.erro, /muitas vezes/);
  });
});
