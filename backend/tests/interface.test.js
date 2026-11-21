import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import bcrypt from 'bcryptjs';

import { db } from '../src/db.js';
import { forcaDoScore, nivelPublico } from '../src/services/confianca.js';
import { captchaRespondido, exemplo, formulario, iniciarApi } from './apoio.js';

describe('interface v2: link repetido, rejeição com motivo, avisos e nível sem pontos', () => {
  let api;
  let admin;
  let ana;
  let bia;

  async function cadastrar(nome, email) {
    return (await api.post('/auth/cadastro', { nome, email, senha: '123456' })).corpo.token;
  }

  async function denunciar(token, campos = {}) {
    // tira as anteriores da última hora para o anti-spam não barrar o teste
    db.exec("UPDATE denuncias SET criada_em = '2026-01-01T00:00:00.000Z'");
    const dados = { ...exemplo, ...campos, ...(await captchaRespondido(api, token)) };
    return (await api.enviar('/denuncias', formulario(dados, 1), token)).corpo;
  }

  before(async () => {
    api = await iniciarApi();
    db.prepare(
      "INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ('Admin', 'admin.v2@teste.com', ?, 'admin')",
    ).run(bcrypt.hashSync('admin123', 4));
    admin = (await api.post('/auth/login', { email: 'admin.v2@teste.com', senha: 'admin123' }))
      .corpo.token;
    ana = await cadastrar('Ana', 'ana.v2@teste.com');
    bia = await cadastrar('Bia', 'bia.v2@teste.com');
  });

  it('nível público sem pontos e força em palavras', () => {
    assert.deepEqual(nivelPublico(210), {
      nome: 'Confiável',
      ordem: 2,
      prioridade: 'MEDIA',
      proximo: 'Verificado',
      perto: true,
    });
    assert.equal(nivelPublico(120).perto, false);
    assert.equal(nivelPublico(700).proximo, null);
    assert.equal(forcaDoScore(70), 'FORTE');
    assert.equal(forcaDoScore(45), 'MEDIA');
    assert.equal(forcaDoScore(25), 'FRACA');
  });

  it('o cidadão não recebe pontos, score nem taxa de acerto', async () => {
    const criada = await denunciar(ana, { url: 'https://site-sem-pontos.com/oferta' });
    assert.equal(criada.forca, 'MEDIA');
    assert.ok(criada.dicas.includes('POUCAS_PROVAS'));

    const eu = await api.get('/auth/eu', ana);
    const detalhe = await api.get(`/denuncias/${criada.denuncia.id}`, ana);
    for (const corpo of [criada, eu.corpo, detalhe.corpo]) {
      const texto = JSON.stringify(corpo);
      for (const campo of [
        '"pontos"',
        '"score"',
        '"variacaoPontos"',
        '"taxaAcerto"',
        '"scoreMedio"',
      ]) {
        assert.equal(texto.includes(campo), false, `${campo} vazou para o cidadão`);
      }
    }
    assert.equal(eu.corpo.usuario.nivel.nome, 'Iniciante');

    // a moderação continua vendo tudo
    const doAdmin = await api.get(`/admin/denuncias/${criada.denuncia.id}`, admin);
    assert.equal(typeof doAdmin.corpo.denuncia.score, 'number');
  });

  it('avisa quantas outras pessoas já denunciaram o link, sem dizer quem', async () => {
    const url = 'https://www.instagram.com/loja.repetida/';
    await denunciar(ana, { url });

    const r = await api.post('/denuncias/verificar-link', { url }, bia);
    assert.deepEqual(r.corpo, { valido: true, jaDenunciei: false, outrosDenunciantes: 1 });

    const propria = await api.post('/denuncias/verificar-link', { url }, ana);
    assert.equal(propria.corpo.jaDenunciei, true);

    const invalida = await api.post('/denuncias/verificar-link', { url: 'nada' }, ana);
    assert.equal(invalida.corpo.valido, false);

    const semLogin = await api.post('/denuncias/verificar-link', { url });
    assert.equal(semLogin.status, 401);
  });

  it('rejeitar exige motivo e o autor vê a decisão e o aviso', async () => {
    const { denuncia } = await denunciar(bia, {
      url: 'https://desinformacao.exemplo.com/video',
      categoria: 'Segurança infantil',
    });
    assert.equal(denuncia.sensivel, true);

    const semMotivo = await api.patch(
      `/admin/denuncias/${denuncia.id}/status`,
      { status: 'REJEITADA' },
      admin,
    );
    assert.equal(semMotivo.status, 400);

    const r = await api.patch(
      `/admin/denuncias/${denuncia.id}/status`,
      { status: 'REJEITADA', motivo: 'INDICIO_INSUFICIENTE', nota: 'Faltou o print.' },
      admin,
    );
    assert.equal(r.status, 200);
    assert.equal(r.corpo.denuncia.decisao.variacaoPontos, -20);

    const doAutor = (await api.get(`/denuncias/${denuncia.id}`, bia)).corpo.denuncia;
    assert.deepEqual(
      {
        status: doAutor.decisao.status,
        motivo: doAutor.decisao.motivo,
        nota: doAutor.decisao.nota,
      },
      { status: 'REJEITADA', motivo: 'INDICIO_INSUFICIENTE', nota: 'Faltou o print.' },
    );

    const avisos = await api.get('/avisos', bia);
    assert.equal(avisos.corpo.naoLidos, 1);
    assert.equal(avisos.corpo.avisos[0].titulo, 'Sua denúncia foi rejeitada');

    // outra pessoa não vê a denúncia nem marca os avisos dela
    assert.equal((await api.get(`/denuncias/${denuncia.id}`, ana)).status, 404);
    await api.post('/avisos/lidos', { ids: [avisos.corpo.avisos[0].id] }, ana);
    assert.equal((await api.get('/avisos', bia)).corpo.naoLidos, 1);

    const marcados = await api.post('/avisos/lidos', {}, bia);
    assert.equal(marcados.corpo.naoLidos, 0);
  });

  it('subir de nível gera um aviso e os pontos aparecem só em /auth/eu/nivel', async () => {
    const { denuncia } = await denunciar(ana, { url: 'https://golpe-nivel.exemplo.com' });
    const id = (await api.get('/auth/eu', ana)).corpo.usuario.id;
    db.prepare('UPDATE usuarios SET pontos = 95 WHERE id = ?').run(id);

    await api.patch(`/admin/denuncias/${denuncia.id}/status`, { status: 'CONFIRMADA' }, admin);

    const avisos = (await api.get('/avisos?soNaoLidos=1', ana)).corpo.avisos;
    assert.ok(avisos.some((a) => a.tipo === 'NIVEL' && a.titulo === 'Você agora é Confiável'));

    const nivel = await api.get('/auth/eu/nivel', ana);
    assert.ok(nivel.corpo.pontos > 100);
    assert.equal(nivel.corpo.nivel, 'Confiável');
    assert.equal(nivel.corpo.mudancas[0].protocolo, denuncia.protocolo);
  });
});
