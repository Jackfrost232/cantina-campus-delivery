import { useContext } from 'react';
import { CarrinhoContexto } from './carrinhoContexto';

export function useCarrinho() {
  const contexto = useContext(CarrinhoContexto);
  if (!contexto) {
    throw new Error('useCarrinho precisa estar dentro de CarrinhoProvider.');
  }
  return contexto;
}
