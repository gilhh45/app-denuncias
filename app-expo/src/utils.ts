import { Alert, Platform } from 'react-native';

export function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Mesma regra da API: link http(s) completo, com domínio. */
export function urlValida(texto: string) {
  try {
    const url = new URL(texto.trim());
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.');
  } catch {
    return false;
  }
}

export type PreviaDoScore = {
  score: number;
  itens: { rotulo: string; pontos: number; ok: boolean }[];
};

/**
 * Mesma conta do backend (services/confianca.js), só para mostrar a prévia
 * enquanto a pessoa preenche. O valor oficial vem da API.
 */
export function previaScore(
  url: string,
  descricao: string,
  evidencias: number,
  bonusNivel: number,
  nomeNivel: string,
): PreviaDoScore {
  const tamanho = descricao.trim().length;
  const itens = [
    {
      rotulo: 'Link seguro (https)',
      pontos: 10,
      ok: url.trim().toLowerCase().startsWith('https://'),
    },
    {
      rotulo: tamanho >= 150 ? 'Descrição detalhada' : 'Descrição com 60+ letras (150+ vale mais)',
      pontos: tamanho >= 150 ? 25 : 15,
      ok: tamanho >= 60,
    },
    {
      rotulo: evidencias >= 3 ? '3 ou mais evidências' : 'Pelo menos 1 evidência (3+ vale mais)',
      pontos: evidencias >= 3 ? 25 : 15,
      ok: evidencias >= 1,
    },
  ];
  if (bonusNivel > 0)
    itens.push({ rotulo: `Bônus do nível ${nomeNivel}`, pontos: bonusNivel, ok: true });

  const score = Math.min(100, 25 + itens.reduce((s, i) => s + (i.ok ? i.pontos : 0), 0));
  return { score, itens };
}

export function corDoScore(score: number) {
  if (score >= 70) return 'success' as const;
  if (score >= 45) return 'warning' as const;
  return 'danger' as const;
}

/** 75 -> "1:15", 3600 -> "60:00" */
export function formatarEspera(segundos: number) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min}:${String(seg).padStart(2, '0')}`;
}

/** Pergunta de sim/não que funciona no celular (Alert) e no navegador (confirm). */
export function confirmar(titulo: string, mensagem: string, textoConfirmar = 'Confirmar') {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.(`${titulo}\n\n${mensagem}`) ?? true);
  }
  return new Promise<boolean>((resolver) =>
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
        { text: textoConfirmar, style: 'destructive', onPress: () => resolver(true) },
      ],
      { cancelable: true, onDismiss: () => resolver(false) },
    ),
  );
}

const DOMINIOS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)(x|twitter)\.com$/, 'X (Twitter)'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.watch)$/, 'Facebook'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube'],
  [/(^|\.)(wa\.me|whatsapp\.com)$/, 'WhatsApp'],
  [/(^|\.)kwai\.com$/, 'Kwai'],
];

/** Descobre a rede social pelo endereço colado (ex.: instagram.com -> Instagram). */
export function plataformaDoLink(texto: string) {
  try {
    const host = new URL(texto.trim()).hostname.toLowerCase();
    return DOMINIOS.find(([regra]) => regra.test(host))?.[1] ?? null;
  } catch {
    return null;
  }
}

/** "site.com/pagina" -> "https://site.com/pagina" */
export function completarLink(texto: string) {
  const limpo = texto.trim();
  if (!limpo || /^https?:\/\//i.test(limpo)) return limpo;
  return `https://${limpo.replace(/^\/+/, '')}`;
}
