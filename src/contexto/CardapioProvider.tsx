import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { buscarCardapio } from '../servicos/cardapio';
import { CardapioContexto } from './cardapioContexto';
import type { CardapioValor, EstadoCardapio } from './cardapioContexto';

export function CardapioProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoCardapio>({ situacao: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  // Roda de novo quando `tentativa` muda: é o que faz o botão "Tentar de novo" funcionar.
  useEffect(() => {
    let ativo = true;
    buscarCardapio()
      .then((itens) => {
        if (ativo) {
          setEstado({ situacao: 'pronto', itens });
        }
      })
      .catch((erro: Error) => {
        if (ativo) {
          setEstado({ situacao: 'erro', mensagem: erro.message });
        }
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const recarregar = useCallback(() => {
    setEstado({ situacao: 'carregando' });
    setTentativa((atual) => atual + 1);
  }, []);

  const valor = useMemo<CardapioValor>(() => ({ estado, recarregar }), [estado, recarregar]);
  return <CardapioContexto.Provider value={valor}>{children}</CardapioContexto.Provider>;
}
