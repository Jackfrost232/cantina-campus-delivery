import { useContext } from 'react';
import { CardapioContexto } from './cardapioContexto';

export function useCardapio() {
  const contexto = useContext(CardapioContexto);
  if (!contexto) {
    throw new Error('useCardapio precisa estar dentro de CardapioProvider.');
  }
  return contexto;
}
