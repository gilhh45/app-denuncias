import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { FiltrosExportacao } from '@/services/admin';
import { api } from '@/services/api';

type Resposta = { nomeArquivo: string; total: number; bytes: number; base64: string };

function consulta({ dias, incluirRejeitadas }: FiltrosExportacao) {
  const p = new URLSearchParams({
    formato: 'base64',
    incluirRejeitadas: String(incluirRejeitadas),
  });
  if (dias) p.set('dias', String(dias));
  return `/admin/exportacao?${p.toString()}`;
}

function baixarNoNavegador(nome: string, base64: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Gera o .zip na API e entrega para a pessoa: no navegador baixa direto e no
 * celular salva no cache e abre a tela de compartilhar (e-mail, Drive, WhatsApp...).
 */
export async function exportarDenuncias(filtros: FiltrosExportacao) {
  const r = await api.get<Resposta>(consulta(filtros));

  if (Platform.OS === 'web') {
    baixarNoNavegador(r.nomeArquivo, r.base64);
    return r;
  }

  const arquivo = new File(Paths.cache, r.nomeArquivo);
  if (arquivo.exists) arquivo.delete();
  arquivo.create();
  arquivo.write(r.base64, { encoding: 'base64' });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(arquivo.uri, {
      mimeType: 'application/zip',
      dialogTitle: 'Enviar exportação',
      UTI: 'public.zip-archive',
    });
  }
  return r;
}
