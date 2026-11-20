import { useEffect, useState } from 'react';

/** Devolve a hora atual, atualizada a cada `intervaloMs`. O intervalo é limpo ao sair da tela. */
export function useAgora(intervaloMs = 1000): Date {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);

  return agora;
}
