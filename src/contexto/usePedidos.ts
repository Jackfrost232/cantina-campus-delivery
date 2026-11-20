import { useContext } from 'react';
import { PedidosContexto } from './pedidosContexto';

export function usePedidos() {
  const contexto = useContext(PedidosContexto);
  if (!contexto) {
    throw new Error('usePedidos precisa estar dentro de PedidosProvider.');
  }
  return contexto;
}
