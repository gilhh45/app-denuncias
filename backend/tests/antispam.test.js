import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { db } from '../src/db.js';
import { normalizarUrl } from '../src/services/url.js';
import { captchaRespondido, exemplo, formulario, iniciarApi } from './apoio.js';

describe('anti-spam', () => {
  let api;
  let token;

  const enviar = async (extra = {}, captcha) =>
    api.enviar(
      '/denuncias',
      formulario({ ...exemplo, ...extra, ...(captcha ?? (await captchaRespondido(api, token))) }),
      token,
    );

  // "volta no tempo" as denúncias já enviadas para não precisar esperar nos testes
  const voltarMinutos = (min) =>
    db
      .prepare('UPDATE denuncias SET criada_em = ?')
      .run(new Date(Date.now() - min * 60_000).toISOString());

  before(async () => {
    api = await iniciarApi();
    const r = await api.post('/auth/cadastro', {
      nome: 'Fábio',
      email: 'fabio@teste.com',
      senha: '123456',
    });
    token = r.corpo.token;
  });

  it('normaliza links para achar repetidos', () => {
    assert.equal(
      normalizarUrl('https://WWW.Site.com/promo/?utm_source=zap&b=2&a=1'),
      normalizarUrl('http://site.com/promo?a=1&b=2'),
    );
  });

  it('recusa captcha errado sem gastar o limite', async () => {
    const { captchaId } = await captchaRespondido(api, token);
    const r = await enviar({}, { captchaId, captchaResposta: '999' });
    assert.equal(r.status, 400);
    assert.equal(r.corpo.campo, 'captcha');

    const limite = await api.get('/denuncias/limite', token);
    assert.equal(limite.corpo.restantesNaHora, 3);
  });

  it('exige 1 minuto entre denúncias e bloqueia link repetido', async () => {
    assert.equal((await enviar()).status, 201);

    const rapida = await enviar({ url: 'https://outro-site.com' });
    assert.equal(rapida.status, 429);
    assert.ok(rapida.corpo.esperarSegundos > 0);

    voltarMinutos(2);
    const repetida = await enviar({ url: 'https://instagram.com/loja.falsa?utm_source=x' });
    assert.equal(repetida.status, 409);
  });

  it('permite no máximo 3 por hora', async () => {
    voltarMinutos(2);
    assert.equal((await enviar({ url: 'https://dois.com' })).status, 201);
    voltarMinutos(2);
    assert.equal((await enviar({ url: 'https://tres.com' })).status, 201);
    voltarMinutos(2);

    const quarta = await enviar({ url: 'https://quatro.com' });
    assert.equal(quarta.status, 429);
    assert.match(quarta.corpo.erro, /3 denúncias/);

    const limite = await api.get('/denuncias/limite', token);
    assert.equal(limite.corpo.podeEnviar, false);
    assert.equal(limite.corpo.restantesNaHora, 0);
  });
});
