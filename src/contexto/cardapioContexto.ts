import { createContext } from 'react';
import type { ItemCardapio } from '../tipos';

export type EstadoCardapio =
  | { situacao: 'carregando' }
  | { situacao: 'erro'; mensagem: string }
  | { situacao: 'pronto'; itens: ItemCardapio[] };

export interface CardapioValor {
  estado: EstadoCardapio;
  recarregar: () => void;
}

export const CardapioContexto = createContext<CardapioValor | null>(null);
