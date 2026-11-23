# 🛡️ App de Denúncias Mobile

Um aplicativo móvel desenvolvido para facilitar o reporte de ameaças cibernéticas, perfis falsos, discursos de ódio e sites maliciosos de forma segura e estruturada. 

Este projeto visa criar uma ponte eficiente entre o cidadão e os órgãos de moderação/segurança, aplicando regras de negócio inteligentes, como cálculo de credibilidade da denúncia e prevenção de *spam*.

## 🚀 Status do Projeto
O app agora conversa com uma **API própria** (pasta `backend`), com banco Postgres no Supabase, login com token, anti-spam e score de credibilidade calculados no servidor. A pasta `app-expo` tem o aplicativo.

## 📄 Documentação Técnica e Protótipo

- **📑 Documentação Completa (PDF):** [Visualizar Documentação Técnica - DenuncieJá](./Documentacao-DenuncieJa-Desenvolvimento-Mobile.pdf)
- **🎨 Protótipo no Figma:** [Acessar Protótipo Interativo](https://www.figma.com/make/V8PTQH9HdXkPWrMYBHzKPN/Aplicativo-de-Den%25C3%25BAncia-An%25C3%25B4nima?code-node-id=0-6&p=f&t=nZ2j6skStnItb6On-0&fullscreen=1)


## ✨ Principais Funcionalidades

Baseado no mapeamento de Casos de Uso, o sistema contempla:

- **Autenticação:** Criação de conta, login e recuperação de senha por código.
- **Formulário de Denúncia:** Coleta estruturada de dados (URL, Categoria, Descrição, Plataforma).
- **Anexo de Evidências:** Suporte para envio de prints e fotos que comprovem a violação.
- **Score de Credibilidade:** Algoritmo que calcula a relevância da denúncia (0 a 100) com base nos dados fornecidos (tamanho da descrição, presença de anexos, URLs válidas).
- **Rate Limit (Anti-Spam):** Trava de segurança que impede o envio de múltiplas denúncias em um curto período (ex: limite de envios por minuto/hora).
- **Prevenção de Duplicidade:** Verificação automática se a URL reportada já consta no sistema.
- **Histórico e Acompanhamento:** Painel para o usuário acompanhar o status de suas denúncias (Pendente, Em Análise, Concluído).

## 🏗️ Arquitetura e Casos de Uso

Abaixo apresentamos o fluxo de interação entre os atores do sistema (Usuário, Equipe de Moderação e o próprio Sistema).

<img width="1063" height="959" alt="WhatsApp Image 2026-09-28 at 17 20 21" src="https://github.com/user-attachments/assets/5c60bc51-b97e-42c6-894e-f00c9e651a8d" />


## 🛠️ Tecnologias Utilizadas

O aplicativo foi construído utilizando as seguintes tecnologias e bibliotecas:

* **[React Native](https://reactnative.dev/):** Framework principal para desenvolvimento mobile multiplataforma (iOS e Android).
* **[Expo](https://expo.dev/):** Plataforma e *toolchain* para facilitar o desenvolvimento, build e testes no React Native.
* **[Expo Router](https://docs.expo.dev/router/introduction/):** Roteamento baseado em arquivos (file-based routing) para navegação fluida.
* **Context API (React):** Gerenciamento de estado global da aplicação (Tema e Dados).
* **[Feather Icons](https://feathericons.com/):** Biblioteca de ícones vetoriais limpos e responsivos.
* **Backend:** Node.js com [Express](https://expressjs.com/), banco Postgres no [Supabase](https://supabase.com/) (driver `pg`, e PGlite nos testes), Storage do Supabase para os prints, JWT, bcrypt e zod.

## ⚙️ Como executar o projeto localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/en/) 22.13 ou mais novo (versão LTS)
* [Git](https://git-scm.com/)
* Um celular com o app **Expo Go** ou um emulador (Android Studio / Xcode). Também dá para usar o navegador.

### 1. Clone o repositório

```bash
git clone https://github.com/gilhh45/app-denuncias.git
cd app-denuncias
```

### 2. Suba a API (deixe este terminal aberto)

```bash
cd backend
npm install
npm run dev
```

A API roda em `http://localhost:3333` e na primeira vez já cria as contas e denúncias de exemplo. Detalhes em [backend/README.md](backend/README.md).

### 3. Rode o aplicativo (em outro terminal)

```bash
cd app-expo
npm install
npx expo start
```

- **No celular:** abra o **Expo Go** e escaneie o QR Code. O celular e o computador precisam estar na mesma rede Wi-Fi.
- **No navegador:** aperte `w` no terminal.
- **No emulador Android:** aperte `a` no terminal.

### Contas de exemplo

| Quem | E-mail | Senha |
| --- | --- | --- |
| Victor Mieko | victor.mieko@denuncieja.app | 123456 |
| Gilvan Ferreira | gilvan.ferreira@denuncieja.app | 123456 |
| Emille Melissa | emille.melissa@denuncieja.app | 123456 |
| Daniel Castedo | daniel.castedo@denuncieja.app | 123456 |
| Luiz Gabriel | luiz.gabriel@denuncieja.app | 123456 |
| Matheus | matheus@denuncieja.app | 123456 |
| **BIG BROTHER** (administrador) | bigbrother@denuncieja.app | admin123 |
