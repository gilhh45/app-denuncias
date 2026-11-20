import { criarApp } from './app.js';
import { config } from './config.js';
import { bancoVazio, popularBanco } from './seed.js';

// na primeira vez que roda, o banco já vem com as contas e denúncias de exemplo
if (bancoVazio()) {
  popularBanco();
  console.log('Banco vazio: dados de exemplo criados (veja o README).');
}

const app = criarApp();

app.listen(config.porta, '0.0.0.0', () => {
  console.log(`API do DenuncieJá rodando na porta ${config.porta}`);
});
