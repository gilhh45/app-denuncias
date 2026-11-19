import { criarApp } from './app.js';
import { config } from './config.js';

const app = criarApp();

app.listen(config.porta, '0.0.0.0', () => {
  console.log(`API do DenuncieJá rodando na porta ${config.porta}`);
});
