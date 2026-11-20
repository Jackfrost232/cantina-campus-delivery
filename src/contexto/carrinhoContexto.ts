import { createContext } from 'react';
import type { LinhaCarrinho } from '../tipos';

export interface CarrinhoValor {
  linhas: LinhaCarrinho[];
  totalUnidades: number;
  adicionar: (linha: LinhaCarrinho) => void;
  alterarQuantidade: (chave: string, quantidade: number) => void;
  remover: (chave: string) => void;
  limpar: () => void;
}

export const CarrinhoContexto = createContext<CarrinhoValor | null>(null);
