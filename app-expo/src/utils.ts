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
