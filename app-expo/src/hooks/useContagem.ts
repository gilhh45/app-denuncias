import { useEffect, useState } from 'react';

/**
 * Contagem regressiva em segundos. Quando chega a zero chama `aoTerminar`.
 * `chave` reinicia a contagem mesmo que o total seja igual (ex.: dados novos da API).
 */
export function useContagem(total: number, aoTerminar?: () => void, chave?: unknown) {
  const [estado, setEstado] = useState({ total, chave, restante: total });

  // valor novo vindo de fora: recomeça a contagem (ajuste de estado durante o render)
  if (estado.total !== total || estado.chave !== chave) {
    setEstado({ total, chave, restante: total });
  }

  const restante = Math.max(0, estado.restante);

  useEffect(() => {
    if (restante <= 0) return;
    const t = setTimeout(() => {
      setEstado((e) => ({ ...e, restante: e.restante - 1 }));
      if (restante === 1) aoTerminar?.();
    }, 1000);
    return () => clearTimeout(t);
  }, [restante, aoTerminar]);

  return restante;
}
