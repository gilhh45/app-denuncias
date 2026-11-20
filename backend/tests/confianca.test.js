import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calcularScore, nivelPorPontos, pontosPorConfirmacao } from '../src/services/confianca.js';

describe('níveis de confiança e score', () => {
  it('escolhe o nível pelos pontos e calcula o progresso', () => {
    assert.equal(nivelPorPontos(0).nome, 'Iniciante');
    assert.equal(nivelPorPontos(150).nome, 'Confiável');
    assert.equal(nivelPorPontos(150).progresso, 0.25);
    assert.equal(nivelPorPontos(300).nome, 'Verificado');
    assert.equal(nivelPorPontos(900).nome, 'Especialista');
    assert.equal(nivelPorPontos(900).proximo, null);
  });

  it('dá mais score para denúncias completas', () => {
    const simples = calcularScore(
      { url: 'http://a.com', descricao: 'x'.repeat(20), evidencias: 0 },
      0,
    );
    const completa = calcularScore(
      { url: 'https://a.com', descricao: 'x'.repeat(200), evidencias: 3 },
      0,
    );
    assert.equal(simples.score, 25);
    assert.equal(completa.score, 85);
  });

  it('soma o bônus do nível sem passar de 100', () => {
    const r = calcularScore(
      { url: 'https://a.com', descricao: 'x'.repeat(200), evidencias: 4 },
      700,
    );
    assert.equal(r.score, 100);
    assert.ok(r.detalhes.some((d) => d.rotulo === 'Usuário Especialista'));
  });

  it('pontos por confirmação crescem com o score', () => {
    assert.equal(pontosPorConfirmacao(0), 10);
    assert.equal(pontosPorConfirmacao(100), 40);
  });
});
