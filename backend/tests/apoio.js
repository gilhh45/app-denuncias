import { criarApp } from '../src/app.js';

/** Sobe a API numa porta livre e devolve funções curtas para chamar as rotas. */
export async function iniciarApi() {
  const servidor = criarApp().listen(0);
  await new Promise((ok) => servidor.once('listening', ok));
  // unref deixa o processo do teste terminar sem precisar fechar o servidor
  servidor.unref();

  const base = `http://127.0.0.1:${servidor.address().port}`;

  async function chamar(metodo, caminho, { corpo, token, form } = {}) {
    const headers = {};
    if (token) headers.authorization = `Bearer ${token}`;
    if (corpo) headers['content-type'] = 'application/json';

    const resposta = await fetch(base + caminho, {
      method: metodo,
      headers,
      body: form ?? (corpo ? JSON.stringify(corpo) : undefined),
    });
    const tipo = resposta.headers.get('content-type') ?? '';
    const dados = tipo.includes('json') ? await resposta.json() : await resposta.arrayBuffer();
    return { status: resposta.status, corpo: dados, headers: resposta.headers };
  }

  return {
    base,
    get: (caminho, token) => chamar('GET', caminho, { token }),
    post: (caminho, corpo, token) => chamar('POST', caminho, { corpo, token }),
    patch: (caminho, corpo, token) => chamar('PATCH', caminho, { corpo, token }),
    enviar: (caminho, form, token) => chamar('POST', caminho, { form, token }),
  };
}

export function formulario(campos, imagens = 0) {
  const form = new FormData();
  for (const [chave, valor] of Object.entries(campos)) form.append(chave, valor);
  for (let i = 0; i < imagens; i++) {
    form.append(
      'evidencias',
      new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' }),
      `p${i}.jpg`,
    );
  }
  return form;
}

export const exemplo = {
  tipo: 'REDE_SOCIAL',
  plataforma: 'Instagram',
  perfil: '@loja.falsa',
  categoria: 'Golpe ou fraude',
  titulo: 'Loja falsa vendendo celulares',
  url: 'https://www.instagram.com/loja.falsa/',
  descricao: 'Perfil anuncia celulares muito abaixo do preço e some depois do Pix.',
};
