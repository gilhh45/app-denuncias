import type { Feather } from '@expo/vector-icons';

import type { Cores } from '@/theme';
import type { Dica, Forca, MotivoRejeicao, Nivel } from '@/types';

export type Status = 'PENDENTE' | 'EM_ANALISE' | 'CONFIRMADA' | 'REJEITADA';

export const STATUS: Record<
  Status,
  { rotulo: string; icone: keyof typeof Feather.glyphMap; cor: keyof Cores; fundo: keyof Cores }
> = {
  PENDENTE: { rotulo: 'Pendente', icone: 'clock', cor: 'warning', fundo: 'warningSoft' },
  EM_ANALISE: { rotulo: 'Em análise', icone: 'search', cor: 'info', fundo: 'infoSoft' },
  CONFIRMADA: { rotulo: 'Confirmada', icone: 'check-circle', cor: 'success', fundo: 'successSoft' },
  REJEITADA: { rotulo: 'Rejeitada', icone: 'x-circle', cor: 'danger', fundo: 'dangerSoft' },
};

export const ORDEM_STATUS: Status[] = ['PENDENTE', 'EM_ANALISE', 'CONFIRMADA', 'REJEITADA'];

// precisam ser iguais às listas do backend (backend/src/modelos.js)
export const PLATAFORMAS: {
  valor: string;
  rotulo: string;
  icone: keyof typeof Feather.glyphMap;
}[] = [
  { valor: 'Instagram', rotulo: 'Instagram', icone: 'instagram' },
  { valor: 'X (Twitter)', rotulo: 'X (Twitter)', icone: 'twitter' },
  { valor: 'Facebook', rotulo: 'Facebook', icone: 'facebook' },
  { valor: 'TikTok', rotulo: 'TikTok', icone: 'music' },
  { valor: 'YouTube', rotulo: 'YouTube', icone: 'youtube' },
  { valor: 'WhatsApp', rotulo: 'WhatsApp', icone: 'message-circle' },
  { valor: 'Kwai', rotulo: 'Kwai', icone: 'video' },
  { valor: 'Outra', rotulo: 'Outra', icone: 'more-horizontal' },
];

export const CATEGORIAS: {
  valor: string;
  icone: keyof typeof Feather.glyphMap;
  /** Frase curta para ajudar quem não sabe classificar o que viu. */
  exemplo: string;
  /** As mais usadas aparecem no topo do seletor. */
  comum?: boolean;
}[] = [
  {
    valor: 'Golpe ou fraude',
    icone: 'dollar-sign',
    exemplo: 'Pedido de Pix, loja que não entrega',
    comum: true,
  },
  {
    valor: 'Phishing / roubo de dados',
    icone: 'key',
    exemplo: 'Link falso de banco, pedido de senha ou código',
    comum: true,
  },
  {
    valor: 'Perfil falso',
    icone: 'user-x',
    exemplo: 'Alguém usando o nome ou as fotos de outra pessoa',
    comum: true,
  },
  {
    valor: 'Discurso de ódio',
    icone: 'slash',
    exemplo: 'Ataques por raça, religião, gênero ou origem',
  },
  {
    valor: 'Assédio ou ameaça',
    icone: 'alert-triangle',
    exemplo: 'Perseguição, intimidação ou ameaça direta',
  },
  {
    valor: 'Violência ou conteúdo gráfico',
    icone: 'eye-off',
    exemplo: 'Agressões, ferimentos ou mortes',
  },
  {
    valor: 'Conteúdo sexual não consentido',
    icone: 'lock',
    exemplo: 'Fotos ou vídeos íntimos divulgados sem permissão',
  },
  {
    valor: 'Segurança infantil',
    icone: 'shield',
    exemplo: 'Qualquer risco ou exposição de crianças',
  },
  {
    valor: 'Suicídio ou automutilação',
    icone: 'heart',
    exemplo: 'Alguém em risco ou conteúdo que incentiva',
  },
  {
    valor: 'Terrorismo ou extremismo',
    icone: 'zap-off',
    exemplo: 'Apologia ou recrutamento para ataques',
  },
  { valor: 'Desinformação', icone: 'help-circle', exemplo: 'Notícia falsa que pode causar dano' },
  { valor: 'Spam', icone: 'mail', exemplo: 'Mensagens em massa ou propaganda enganosa' },
  { valor: 'Outro', icone: 'more-horizontal', exemplo: 'Não se encaixa nas opções acima' },
];

export const CATEGORIA_CVV = 'Suicídio ou automutilação';

// etapas da trilha dos cartões: enviada, na fila, em análise, decisão
export const ETAPA_STATUS: Record<Status, 2 | 3 | 4> = {
  PENDENTE: 2,
  EM_ANALISE: 3,
  CONFIRMADA: 4,
  REJEITADA: 4,
};

export const FORCA: Record<Forca, { rotulo: string; cor: keyof Cores; barras: 1 | 2 | 3 }> = {
  FRACA: { rotulo: 'Fraca', cor: 'danger', barras: 1 },
  MEDIA: { rotulo: 'Média', cor: 'warning', barras: 2 },
  FORTE: { rotulo: 'Forte', cor: 'success', barras: 3 },
};

export const DICAS: Record<Dica, string> = {
  LINK_HTTPS: 'Use o link completo, começando com https://',
  DESCRICAO_CURTA: 'Conte com detalhes: data, valor e como você chegou ao perfil',
  POUCAS_PROVAS: 'Anexe prints da publicação ou da conversa',
};

export const MOTIVOS: Record<MotivoRejeicao, { rotulo: string; explicacao: string }> = {
  INDICIO_INSUFICIENTE: {
    rotulo: 'Indício insuficiente',
    explicacao: 'Não foi possível confirmar no link o que o relato descreve.',
  },
  FORA_DAS_REGRAS: {
    rotulo: 'Fora das regras',
    explicacao: 'O conteúdo não viola as regras do DenuncieJá.',
  },
  DUPLICADA: { rotulo: 'Denúncia duplicada', explicacao: 'Esse caso já tinha sido analisado.' },
  LINK_FORA_DO_AR: {
    rotulo: 'Link fora do ar',
    explicacao: 'O endereço não abria mais quando a moderação foi conferir.',
  },
};

// os 4 níveis, só por escrito: o cidadão não vê os pontos de cada um
export const NIVEIS: {
  nome: Nivel['nome'];
  icone: keyof typeof Feather.glyphMap;
  texto: string;
}[] = [
  {
    nome: 'Iniciante',
    icone: 'user',
    texto: 'Para quem está começando. Prioridade baixa na fila.',
  },
  { nome: 'Confiável', icone: 'thumbs-up', texto: 'Prioridade média na fila.' },
  { nome: 'Verificado', icone: 'check-circle', texto: 'Prioridade alta na fila.' },
  {
    nome: 'Especialista',
    icone: 'award',
    texto: 'Prioridade alta na fila e nos relatórios ao órgão regulador.',
  },
];

export const PRIORIDADE: Record<
  'ALTA' | 'MEDIA' | 'BAIXA',
  { rotulo: string; cor: keyof Cores; fundo: keyof Cores; explicacao: string }
> = {
  ALTA: {
    rotulo: 'Alta',
    cor: 'danger',
    fundo: 'dangerSoft',
    explicacao: 'Autor Verificado ou Especialista',
  },
  MEDIA: { rotulo: 'Média', cor: 'warning', fundo: 'warningSoft', explicacao: 'Autor Confiável' },
  BAIXA: {
    rotulo: 'Baixa',
    cor: 'textMuted',
    fundo: 'cardAlt',
    explicacao: 'Autor Iniciante ou bloqueado',
  },
};
