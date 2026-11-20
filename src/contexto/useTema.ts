import { useEffect, useState } from 'react';
import { resolverTema } from '../dominio/tema';
import type { Tema } from '../dominio/tema';

const CHAVE = 'cantina:tema';

function temaInicial(): Tema {
  let guardado: string | null = null;
  try {
    guardado = localStorage.getItem(CHAVE);
  } catch {
    // armazenamento bloqueado: segue o sistema
  }
  return resolverTema(guardado, window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    try {
      localStorage.setItem(CHAVE, tema);
    } catch {
      // a escolha vale só nesta sessão
    }
  }, [tema]);

  return { tema, alternar: () => setTema((atual) => (atual === 'claro' ? 'escuro' : 'claro')) };
}
