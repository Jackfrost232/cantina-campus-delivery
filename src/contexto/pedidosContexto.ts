import { createContext } from 'react';
import type { Pedido } from '../tipos';

export interface PedidosValor {
  pedidos: Pedido[];
  maiorNumero: number;
  registrarPedido: (pedido: Pedido) => void;
  cancelar: (numero: number) => void;
}

export const PedidosContexto = createContext<PedidosValor | null>(null);
