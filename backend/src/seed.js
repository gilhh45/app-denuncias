// Dados de exemplo para a apresentação: 6 contas de cidadão, 1 administrador e
// denúncias em vários status. Rode "npm run seed" para apagar tudo e recriar.
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';

import { db, transacao } from './db.js';
import { calcularScore } from './services/confianca.js';
import { normalizarUrl } from './services/url.js';

export const SENHA_CLIENTES = '123456';
export const SENHA_ADMIN = 'admin123';

const USUARIOS = [
  { chave: 'victor', nome: 'Victor Mieko', email: 'victor.mieko@denuncieja.app', pontos: 640 },
  {
    chave: 'gilvan',
    nome: 'Gilvan Ferreira',
    email: 'gilvan.ferreira@denuncieja.app',
    pontos: 360,
  },
  { chave: 'emille', nome: 'Emille Melissa', email: 'emille.melissa@denuncieja.app', pontos: 210 },
  { chave: 'daniel', nome: 'Daniel Castedo', email: 'daniel.castedo@denuncieja.app', pontos: 130 },
  { chave: 'luiz', nome: 'Luiz Gabriel', email: 'luiz.gabriel@denuncieja.app', pontos: 55 },
  { chave: 'matheus', nome: 'Matheus', email: 'matheus@denuncieja.app', pontos: 15 },
];

const ADMIN = { nome: 'BIG BROTHER', email: 'bigbrother@denuncieja.app' };

// [autor, dias atrás, status final, nota da moderação, denúncia]
const DENUNCIAS = [
  [
    'victor',
    26,
    'CONFIRMADA',
    'Página derrubada após contato com o provedor.',
    {
      tipo: 'SITE',
      categoria: 'Phishing / roubo de dados',
      titulo: 'Página falsa de banco pedindo token e senha',
      url: 'https://atualizacao-cadastral-seguro.com/login',
      descricao:
        'Recebi um SMS dizendo que minha conta seria bloqueada e com um link para esta página. Ela copia o visual do internet banking, pede agência, conta, senha de 6 dígitos e o código do token. Depois de enviar, redireciona para o site verdadeiro do banco.',
    },
  ],
  [
    'victor',
    20,
    'CONFIRMADA',
    'Perfil removido pela plataforma.',
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'Instagram',
      perfil: '@promo.iphone.oficial',
      categoria: 'Golpe ou fraude',
      titulo: 'Loja falsa vendendo iPhone pela metade do preço',
      url: 'https://instagram.com/promo.iphone.oficial',
      descricao:
        'O perfil anuncia iPhones novos por menos da metade do preço, só aceita Pix e bloqueia quem pergunta pela nota fiscal. Nos comentários várias pessoas dizem que pagaram e não receberam nada.',
    },
  ],
  [
    'victor',
    12,
    'CONFIRMADA',
    'Encaminhada ao órgão responsável por jogos e apostas.',
    {
      tipo: 'SITE',
      categoria: 'Golpe ou fraude',
      titulo: 'Site de apostas usando a marca de uma loteria oficial',
      url: 'https://loterias-premiadas-online.net/',
      descricao:
        'Site usa o nome e as cores de uma loteria oficial para vender "bilhetes premiados". Depois do pagamento pede uma taxa de liberação do prêmio, que nunca é liberado.',
    },
  ],
  [
    'victor',
    3,
    'EM_ANALISE',
    null,
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'WhatsApp',
      perfil: 'Número desconhecido',
      categoria: 'Golpe ou fraude',
      titulo: 'Golpe do falso parente pedindo Pix',
      url: 'https://wa.me/5511900000000',
      descricao:
        'Mensagem com a foto do meu primo dizendo que trocou de número e precisava pagar um boleto urgente. Pediu transferência via Pix para conta de terceiro.',
    },
  ],
  [
    'victor',
    1,
    'PENDENTE',
    null,
    {
      tipo: 'SITE',
      categoria: 'Golpe ou fraude',
      titulo: 'Loja virtual que cobra e não entrega',
      url: 'https://megaofertas-eletronicos.store/',
      descricao:
        'Loja aberta há poucas semanas com preços muito baixos. Não tem CNPJ no rodapé e o telefone de contato não existe. Fiz o pedido e o rastreio nunca foi atualizado.',
    },
  ],
  [
    'gilvan',
    18,
    'CONFIRMADA',
    'Vídeo removido por golpe financeiro.',
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'YouTube',
      perfil: 'Renda Extra Garantida',
      categoria: 'Golpe ou fraude',
      titulo: 'Vídeo prometendo lucro garantido com robô de investimentos',
      url: 'https://youtube.com/watch?v=robo-lucro-garantido',
      descricao:
        'O vídeo promete 30% de lucro por semana com um robô e manda depositar num site que não tem registro na CVM. Nos comentários os relatos são de quem não conseguiu sacar.',
    },
  ],
  [
    'gilvan',
    9,
    'CONFIRMADA',
    'Conteúdo marcado como enganoso.',
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'TikTok',
      perfil: '@verdade.revelada',
      categoria: 'Desinformação',
      titulo: 'Vídeo editado com informação falsa sobre a eleição',
      url: 'https://tiktok.com/@verdade.revelada/video/123',
      descricao:
        'Vídeo com cortes de uma entrevista montados para parecer que o candidato disse algo que não disse. Já tem milhares de compartilhamentos.',
    },
  ],
  [
    'gilvan',
    2,
    'EM_ANALISE',
    null,
    {
      tipo: 'SITE',
      categoria: 'Phishing / roubo de dados',
      titulo: 'Site falso de rastreio de encomendas cobrando taxa',
      url: 'https://rastreio-encomendas-taxa.com/pagamento',
      descricao:
        'SMS avisando que minha encomenda estava retida e que eu precisava pagar R$ 19,90 de taxa. A página pede dados do cartão de crédito.',
    },
  ],
  [
    'gilvan',
    0,
    'PENDENTE',
    null,
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'X (Twitter)',
      perfil: '@prefeitura_avisos',
      categoria: 'Perfil falso',
      titulo: 'Perfil se passando pela prefeitura',
      url: 'https://x.com/prefeitura_avisos',
      descricao:
        'Perfil com o brasão da prefeitura publicando links de "auxílio emergencial" que pedem CPF e dados bancários.',
    },
  ],
  [
    'emille',
    15,
    'CONFIRMADA',
    'Perfil removido por falsidade ideológica.',
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'Instagram',
      perfil: '@emille.oficial2',
      categoria: 'Perfil falso',
      titulo: 'Perfil falso usando minhas fotos',
      url: 'https://instagram.com/emille.oficial2',
      descricao:
        'Criaram um perfil com as minhas fotos e estão mandando mensagem para meus amigos pedindo dinheiro emprestado.',
    },
  ],
  [
    'emille',
    7,
    'CONFIRMADA',
    'Grupo suspenso por discurso de ódio.',
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'Facebook',
      perfil: 'Grupo Verdades do Sul',
      categoria: 'Discurso de ódio',
      titulo: 'Grupo com ataques a pessoas nordestinas',
      url: 'https://facebook.com/groups/verdadesdosul',
      descricao:
        'O grupo publica todos os dias mensagens ofensivas contra nordestinos, com xingamentos e incentivo à exclusão. Os administradores aprovam as postagens.',
    },
  ],
  [
    'emille',
    1,
    'EM_ANALISE',
    null,
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'TikTok',
      perfil: '@anonimo_9981',
      categoria: 'Assédio ou ameaça',
      titulo: 'Comentários com ameaças a uma criadora de conteúdo',
      url: 'https://tiktok.com/@anonimo_9981',
      descricao:
        'Conta comenta em todos os vídeos de uma criadora com ameaças e o endereço do bairro dela.',
    },
  ],
  [
    'emille',
    0,
    'PENDENTE',
    null,
    {
      tipo: 'SITE',
      categoria: 'Outro',
      titulo: 'Site vendendo remédio controlado sem receita',
      url: 'https://farmacia-sem-receita.shop/',
      descricao: 'Site vende remédios tarja preta sem pedir receita e entrega por motoboy.',
    },
  ],
  [
    'daniel',
    11,
    'CONFIRMADA',
    'Vídeos removidos.',
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'Kwai',
      perfil: '@brigas_de_rua',
      categoria: 'Violência ou conteúdo gráfico',
      titulo: 'Vídeos de violência explícita sem aviso',
      url: 'https://kwai.com/@brigas_de_rua',
      descricao:
        'Conta posta vídeos de brigas com pessoas feridas e sangue, sem nenhum aviso de conteúdo sensível, e aparece no feed de qualquer um.',
    },
  ],
  [
    'daniel',
    5,
    'CONFIRMADA',
    'Domínio denunciado ao registro.br.',
    {
      tipo: 'SITE',
      categoria: 'Phishing / roubo de dados',
      titulo: 'Cupom falso de supermercado circulando no WhatsApp',
      url: 'https://cupom-aniversario-supermercado.com/',
      descricao:
        'Mensagem diz que o supermercado está dando R$ 500 de aniversário. O site pede para responder um questionário e preencher dados pessoais e do cartão.',
    },
  ],
  [
    'daniel',
    2,
    'PENDENTE',
    null,
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'X (Twitter)',
      perfil: '@ganhe_seguidores_ja',
      categoria: 'Spam',
      titulo: 'Spam de links encurtados nas respostas',
      url: 'https://x.com/ganhe_seguidores_ja',
      descricao:
        'Conta responde posts populares com o mesmo link encurtado prometendo seguidores grátis.',
    },
  ],
  [
    'daniel',
    1,
    'EM_ANALISE',
    null,
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'Instagram',
      perfil: '@sorteio.premiado.br',
      categoria: 'Golpe ou fraude',
      titulo: 'Sorteio falso pedindo dados do cartão',
      url: 'https://instagram.com/sorteio.premiado.br',
      descricao:
        'Perfil marca pessoas dizendo que ganharam um sorteio e manda pagar o frete com cartão num link externo.',
    },
  ],
  [
    'luiz',
    8,
    'CONFIRMADA',
    'Anúncio removido.',
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'Facebook',
      perfil: 'Vagas Home Office BR',
      categoria: 'Golpe ou fraude',
      titulo: 'Vaga de emprego que cobra taxa de cadastro',
      url: 'https://facebook.com/vagashomeofficebr',
      descricao:
        'Página anuncia vagas de digitador em casa, mas para participar é preciso pagar um "kit de treinamento" de R$ 97.',
    },
  ],
  [
    'luiz',
    6,
    'REJEITADA',
    'Não há violação: o site informa que é um agregador.',
    {
      tipo: 'SITE',
      categoria: 'Outro',
      titulo: 'Site de filmes com muita propaganda',
      url: 'https://filmes-online-gratis.tv/',
      descricao: 'O site tem muitas propagandas que abrem sozinhas.',
    },
  ],
  [
    'luiz',
    1,
    'PENDENTE',
    null,
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'YouTube',
      perfil: 'Truques Bancários',
      categoria: 'Golpe ou fraude',
      titulo: 'Canal ensinando a usar cartão clonado',
      url: 'https://youtube.com/@truquesbancarios',
      descricao:
        'Canal publica tutoriais de como comprar com cartões de outras pessoas e vende listas de cartões.',
    },
  ],
  [
    'matheus',
    10,
    'REJEITADA',
    'Opinião política, sem discurso de ódio.',
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'X (Twitter)',
      perfil: '@opiniao_forte',
      categoria: 'Discurso de ódio',
      titulo: 'Perfil com opinião política que discordo',
      url: 'https://x.com/opiniao_forte',
      descricao: 'Perfil fala mal do meu candidato o dia inteiro.',
    },
  ],
  [
    'matheus',
    4,
    'REJEITADA',
    'Humor sem ataque a grupo protegido.',
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'Instagram',
      perfil: '@memes_do_dia',
      categoria: 'Discurso de ódio',
      titulo: 'Meme ofensivo sobre time de futebol',
      url: 'https://instagram.com/memes_do_dia',
      descricao: 'Página postou meme zoando meu time depois do jogo.',
    },
  ],
  [
    'matheus',
    3,
    'CONFIRMADA',
    'Página clonada derrubada.',
    {
      tipo: 'SITE',
      categoria: 'Phishing / roubo de dados',
      titulo: 'Página clonada de loja de tênis',
      url: 'https://tenis-originais-outlet.com/',
      descricao:
        'Site copia o layout de uma loja conhecida de tênis, com preços 70% menores. O domínio foi registrado semana passada e o pagamento só é por Pix.',
    },
  ],
  [
    'matheus',
    0,
    'PENDENTE',
    null,
    {
      tipo: 'REDE_SOCIAL',
      plataforma: 'TikTok',
      perfil: '@desafio_extremo',
      categoria: 'Suicídio ou automutilação',
      titulo: 'Desafio perigoso incentivando automutilação',
      url: 'https://tiktok.com/@desafio_extremo',
      descricao:
        'Conta incentiva adolescentes a fazer um "desafio" que envolve se machucar e postar o resultado.',
    },
  ],
];

const HORA = 3_600_000;
const iso = (ms) => new Date(ms).toISOString();

export function limparBanco() {
  db.exec(`
    DELETE FROM historico_status; DELETE FROM evidencias; DELETE FROM denuncias;
    DELETE FROM codigos_recuperacao; DELETE FROM usuarios;
    DELETE FROM sqlite_sequence;
  `);
}

export function popularBanco() {
  const agora = Date.now();
  const hashCliente = bcrypt.hashSync(SENHA_CLIENTES, 10);

  transacao(() => {
    const inserirUsuario = db.prepare(
      'INSERT INTO usuarios (nome, email, senha_hash, papel, pontos, criado_em) VALUES (?, ?, ?, ?, ?, ?)',
    );
    inserirUsuario.run(
      ADMIN.nome,
      ADMIN.email,
      bcrypt.hashSync(SENHA_ADMIN, 10),
      'admin',
      0,
      iso(agora - 40 * 24 * HORA),
    );

    const ids = {};
    for (const u of USUARIOS) {
      ids[u.chave] = inserirUsuario.run(
        u.nome,
        u.email,
        hashCliente,
        'cidadao',
        u.pontos,
        iso(agora - 35 * 24 * HORA),
      ).lastInsertRowid;
    }

    const inserirDenuncia = db.prepare(
      `INSERT INTO denuncias (protocolo, usuario_id, tipo, plataforma, perfil, categoria, titulo, url,
         url_normalizada, descricao, score, status, criada_em, atualizada_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const inserirHistorico = db.prepare(
      'INSERT INTO historico_status (denuncia_id, status, nota, criado_em) VALUES (?, ?, ?, ?)',
    );

    DENUNCIAS.forEach(([chave, dias, status, nota, d], i) => {
      const autor = USUARIOS.find((u) => u.chave === chave);
      // espalha os horários para não ficar tudo no mesmo minuto (e nenhuma dentro da última hora)
      const criada = agora - dias * 24 * HORA - (3 + (i % 7)) * HORA;
      const { score } = calcularScore(
        { url: d.url, descricao: d.descricao, evidencias: 0 },
        autor.pontos,
      );

      const passos = [['PENDENTE', 'Denúncia recebida', criada]];
      if (status !== 'PENDENTE') passos.push(['EM_ANALISE', null, criada + 2 * HORA]);
      if (status === 'CONFIRMADA' || status === 'REJEITADA') {
        passos.push([status, nota, Math.min(criada + 30 * HORA, agora - HORA)]);
      }
      const ultima = passos.at(-1)[2];

      const { lastInsertRowid } = inserirDenuncia.run(
        `DJ-${randomBytes(3).toString('hex').toUpperCase()}`,
        ids[chave],
        d.tipo,
        d.plataforma ?? null,
        d.perfil ?? null,
        d.categoria,
        d.titulo,
        d.url,
        normalizarUrl(d.url),
        d.descricao,
        score,
        status,
        iso(criada),
        iso(ultima),
      );
      for (const [s, n, em] of passos) inserirHistorico.run(lastInsertRowid, s, n, iso(em));
    });
  });
}

export function bancoVazio() {
  return db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total === 0;
}

// "npm run seed": apaga e recria os dados de exemplo
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  limparBanco();
  popularBanco();
  console.log(
    `Banco recriado com ${USUARIOS.length} cidadãos, 1 administrador e ${DENUNCIAS.length} denúncias.`,
  );
  console.log(`Senha dos cidadãos: ${SENHA_CLIENTES} | Admin: ${ADMIN.email} / ${SENHA_ADMIN}`);
}
