# API do DenuncieJá

API em Node.js (Express 5 + SQLite nativo do Node) usada pelo app.

## Como rodar

Precisa do **Node.js 22.13 ou mais novo**.

```bash
cd backend
npm install
npm run dev
```

A API sobe em `http://localhost:3333`. Na primeira vez o banco (`dados/denuncieja.db`) é criado já com os dados de exemplo.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | sobe a API e reinicia sozinha quando um arquivo muda |
| `npm start` | sobe a API sem o modo de desenvolvimento |
| `npm run seed` | apaga o banco e recria os dados de exemplo |
| `npm test` | roda os testes (usa um banco em memória) |

Configurações opcionais ficam num arquivo `.env` (veja `.env.example`).

## Contas de exemplo

| Nome | E-mail | Senha | Nível |
| --- | --- | --- | --- |
| Victor Mieko | victor.mieko@denuncieja.app | 123456 | Especialista |
| Gilvan Ferreira | gilvan.ferreira@denuncieja.app | 123456 | Verificado |
| Emille Melissa | emille.melissa@denuncieja.app | 123456 | Confiável |
| Daniel Castedo | daniel.castedo@denuncieja.app | 123456 | Confiável |
| Luiz Gabriel | luiz.gabriel@denuncieja.app | 123456 | Iniciante |
| Matheus | matheus@denuncieja.app | 123456 | Iniciante |
| **BIG BROTHER** (admin) | bigbrother@denuncieja.app | admin123 | — |

## Rotas

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/saude` | confere se a API está no ar |
| POST | `/auth/cadastro` | cria conta (`nome`, `email`, `senha`) |
| POST | `/auth/login` | entra e recebe o token |
| GET | `/auth/eu` | usuário logado, nível e estatísticas |
| POST | `/auth/recuperar` | gera o código de recuperação de senha |
| POST | `/auth/verificar-codigo` | confere o código e libera a troca |
| POST | `/auth/redefinir` | grava a nova senha |
| GET | `/denuncias` | denúncias do usuário (`?status=`) |
| GET | `/denuncias/:id` | detalhe com evidências e histórico |
| GET | `/denuncias/limite` | quantas denúncias ainda dá para enviar |
| GET | `/denuncias/captcha` | conta para a verificação anti-robô |
| POST | `/denuncias` | nova denúncia (multipart, até 5 imagens em `evidencias`) |
| GET | `/admin/resumo` | números do fluxo de denúncias |
| GET | `/admin/denuncias` | fila por prioridade (`?status=&prioridade=&busca=`) |
| GET | `/admin/denuncias/:id` | detalhe com autor |
| PATCH | `/admin/denuncias/:id/status` | muda o status e atualiza a confiança do autor |
| GET | `/admin/usuarios` | lista de usuários (`?busca=`) |
| GET | `/admin/usuarios/:id` | análise do usuário |
| PATCH | `/admin/usuarios/:id/bloqueio` | bloqueia ou desbloqueia |
| GET | `/admin/exportacao/previa` | prévia da exportação (`?dias=`) |
| GET | `/admin/exportacao` | arquivo `.zip` (ou `?formato=base64`) |

Rotas de `/denuncias` e `/auth/eu` pedem o cabeçalho `Authorization: Bearer <token>`; as de `/admin` só funcionam com a conta de administrador.

## Regras

- **Anti-spam:** 3 denúncias por hora, 1 minuto entre elas, o mesmo link não pode ser denunciado duas vezes pela mesma pessoa e cada envio exige um captcha (conta simples, validada no servidor).
- **Score de credibilidade (0 a 100):** 25 de base, +10 se o link é https, +15/+25 pela descrição, +15/+25 pelas evidências e um bônus pelo nível de quem denuncia.
- **Confiança do usuário:** denúncia confirmada dá `10 + 30% do score` em pontos; rejeitada tira 20. Níveis: Iniciante (0), Confiável (100), Verificado (300), Especialista (600).
- **Prioridade na exportação:** alta para Verificado/Especialista, média para Confiável e baixa para Iniciante ou contas bloqueadas.
