import { Alert, Platform } from 'react-native';

import type { Forca } from '@/types';

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

export type PreviaDaForca = {
  forca: Forca;
  itens: { rotulo: string; ok: boolean }[];
};

/**
 * Mesma conta do backend (services/confianca.js), só para mostrar a força enquanto a
 * pessoa preenche. Fica sem o bônus do nível, que não depende da denúncia.
 * O cidadão vê só a força em palavras, nunca o número.
 */
export function previaForca(url: string, descricao: string, evidencias: number): PreviaDaForca {
  const tamanho = descricao.trim().length;
  const https = url.trim().toLowerCase().startsWith('https://');
  const score =
    25 +
    (https ? 10 : 0) +
    (tamanho >= 150 ? 25 : tamanho >= 60 ? 15 : 0) +
    (evidencias >= 3 ? 25 : evidencias >= 1 ? 15 : 0);
  return {
    forca: forcaDoScore(score),
    itens: [
      { rotulo: 'Link completo, com https', ok: https },
      { rotulo: 'Relato com detalhes (data, valor, como aconteceu)', ok: tamanho >= 150 },
      { rotulo: 'Pelo menos 3 prints', ok: evidencias >= 3 },
    ],
  };
}

/** Mesmos cortes do backend: 70+ forte, 40+ média. */
export function forcaDoScore(score: number): Forca {
  if (score >= 70) return 'FORTE';
  if (score >= 40) return 'MEDIA';
  return 'FRACA';
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

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "hoje, 14:32", "ontem, 09:10" ou "12 out 2026" */
export function formatarData(iso: string, comHora = true) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  const hora = `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;

  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  if (mesmoDia(data, hoje)) return comHora ? `hoje, ${hora}` : 'hoje';
  if (mesmoDia(data, ontem)) return comHora ? `ontem, ${hora}` : 'ontem';
  return `${data.getDate()} ${MESES[data.getMonth()]} ${data.getFullYear()}`;
}

/** Texto curto para a linha de detalhes do cartão: "Instagram · Perfil falso" */
export function resumoDenuncia(d: { tipo: string; plataforma: string | null; categoria: string }) {
  return [d.tipo === 'SITE' ? 'Site' : d.plataforma, d.categoria].filter(Boolean).join(' · ');
}
