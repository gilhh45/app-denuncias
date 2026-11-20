/** Aceita só endereços http(s) com domínio, ex.: https://site.com/pagina */
export function urlValida(texto) {
  try {
    const url = new URL(texto.trim());
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.');
  } catch {
    return false;
  }
}

/**
 * Deixa a URL num formato padrão para comparar denúncias repetidas:
 * sem "www.", sem barra no fim, sem parâmetros de rastreio (utm_*, fbclid...).
 */
export function normalizarUrl(texto) {
  const url = new URL(texto.trim());
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  for (const chave of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid|gclid|igshid|si$)/i.test(chave)) url.searchParams.delete(chave);
  }
  url.searchParams.sort();
  const busca = url.searchParams.toString();
  const caminho = url.pathname.replace(/\/+$/, '');
  return `${host}${caminho}${busca ? `?${busca}` : ''}`;
}
