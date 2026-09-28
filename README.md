# 🛡️ App de Denúncias Mobile

Um aplicativo móvel desenvolvido para facilitar o reporte de ameaças cibernéticas, perfis falsos, discursos de ódio e sites maliciosos de forma segura e estruturada. 

Este projeto visa criar uma ponte eficiente entre o cidadão e os órgãos de moderação/segurança, aplicando regras de negócio inteligentes, como cálculo de credibilidade da denúncia e prevenção de *spam*.

## 🚀 Status do Projeto: MVP (Minimum Viable Product)
Atualmente, o projeto encontra-se na fase de MVP focado no **Frontend**. 
Para viabilizar a validação de fluxo de telas e experiência do usuário (UX), a aplicação utiliza **dados simulados (Mock)** em memória local (`Context API` + `JSON`). A integração com um banco de dados relacional e uma API de backend está mapeada para as próximas iterações.

## ✨ Link do protótipo

* https://www.figma.com/make/V8PTQH9HdXkPWrMYBHzKPN/Aplicativo-de-Den%25C3%25BAncia-An%25C3%25B4nima?code-node-id=0-6&p=f&t=nZ2j6skStnItb6On-0&fullscreen=1




## ✨ Principais Funcionalidades

Baseado no mapeamento de Casos de Uso, o sistema contempla:

- **Autenticação (Em desenvolvimento):** Criação de conta e login de usuários.
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

## ⚙️ Como executar o projeto localmente

Siga as instruções abaixo para rodar o aplicativo na sua máquina.

### Pré-requisitos
Antes de começar, você precisará ter instalado em sua máquina:
* [Node.js](https://nodejs.org/en/) (Versão LTS recomendada)
* [Git](https://git-scm.com/)
* Um smartphone com o app **Expo Go** instalado (disponível na Play Store e App Store) ou um Emulador configurado (Android Studio / Xcode).

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/gilhh45/app-denuncias.git](https://github.com/gilhh45/app-denuncias.git)

   Aqui está formatado, pronto para colar direto no seu README.md:

````markdown
## 2. Acesse a pasta do projeto

```bash
cd app-denuncias/app-expo
```

## 3. Instale as dependências

```bash
npm install
```

Ou, se estiver usando yarn:

```bash
yarn install
```

## Executando o Aplicativo

Para iniciar o servidor de desenvolvimento do Expo, execute o comando:

```bash
npx expo start
```

### Como visualizar o App

- **No celular físico:** abra o aplicativo **Expo Go** e escaneie o QR Code que aparecerá no terminal ou navegador. (Certifique-se de que o celular e o computador estão na mesma rede Wi-Fi.)
- **No emulador Android:** pressione a tecla `a` no terminal após iniciar o servidor.
- **No simulador iOS:** pressione a tecla `i` no terminal (apenas disponível para macOS).
````
