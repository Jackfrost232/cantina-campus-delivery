import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { carrinhoReducer } from '../dominio/carrinho';
import { ehListaDeLinhas } from '../dominio/validadores';
import { gravarArmazenado, lerArmazenado } from '../servicos/armazenamento';
import type { LinhaCarrinho } from '../tipos';
import { CarrinhoContexto } from './carrinhoContexto';
import type { CarrinhoValor } from './carrinhoContexto';

const CHAVE = 'cantina:carrinho';

function lerCarrinho(): LinhaCarrinho[] {
  return lerArmazenado<LinhaCarrinho[]>(CHAVE, ehListaDeLinhas, []);
}

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [linhas, despachar] = useReducer(carrinhoReducer, undefined, lerCarrinho);

  useEffect(() => {
    gravarArmazenado(CHAVE, linhas);
  }, [linhas]);

  const adicionar = useCallback((linha: LinhaCarrinho) => despachar({ tipo: 'adicionar', linha }), []);
  const alterarQuantidade = useCallback(
    (chave: string, quantidade: number) => despachar({ tipo: 'alterarQuantidade', chave, quantidade }),
    [],
  );
  const remover = useCallback((chave: string) => despachar({ tipo: 'remover', chave }), []);
  const limpar = useCallback(() => despachar({ tipo: 'limpar' }), []);

  const valor = useMemo<CarrinhoValor>(
    () => ({
      linhas,
      totalUnidades: linhas.reduce((soma, linha) => soma + linha.quantidade, 0),
      adicionar,
      alterarQuantidade,
      remover,
      limpar,
    }),
    [linhas, adicionar, alterarQuantidade, remover, limpar],
  );
  return <CarrinhoContexto.Provider value={valor}>{children}</CarrinhoContexto.Provider>;
}
