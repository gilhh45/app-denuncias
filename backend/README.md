# API do DenuncieJá

API em Node.js (Express 5) usada pelo app. Os dados ficam no **Postgres do Supabase** e os prints das denúncias no **Storage** do Supabase (bucket privado `evidencias`).

## Como rodar

Precisa do **Node.js 22.13 ou mais novo**.

```bash
cd backend
npm install
npm run dev
```

A API sobe em `http://localhost:3333`. Na primeira vez ela cria as tabelas (`supabase/esquema.sql`) e os dados de exemplo.

## Ligando no Supabase

1. Crie um projeto no Supabase e um bucket **privado** chamado `evidencias` (Storage → New bucket).
2. Copie `.env.example` para `.env` e preencha:
   - `DATABASE_URL`: botão **Connect** → **Session pooler** (troque `[YOUR-PASSWORD]` pela senha do banco);
   - `SUPABASE_URL`: a Project URL do projeto;
   - `SUPABASE_SECRET_KEY`: Project Settings → API Keys → chave **secret**;
   - `JWT_SECRET`: uma frase longa e aleatória.
3. Rode `npm run dev`. As tabelas aparecem no **Table Editor** do Supabase.

O RLS fica ligado em todas as tabelas, sem regras de acesso: a API automática do Supabase não lê nada. Só esta API mexe nos dados, conectando direto no Postgres. A senha do banco e a chave secret ficam só no `.env` (fora do Git) ou nas variáveis do servidor.

Sem `DATABASE_URL`, a API usa o **PGlite** (um Postgres que roda dentro do Node, em memória) e os prints vão para a pasta `uploads/`. É assim que os testes rodam, sem internet.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | sobe a API e reinicia sozinha quando um arquivo muda |
| `npm start` | sobe a API sem o modo de desenvolvimento |
| `npm run seed` | apaga os dados e recria os de exemplo (no Supabase também) |
| `npm test` | roda os testes (Postgres embutido, sem Supabase) |

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
