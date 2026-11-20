import type { Categoria, FormaPagamento, ItemCardapio, LinhaCarrinho, ModoEntrega, ResumoValores } from '../tipos';
import { aplicarPercentual } from './formatos';
import { precoDaLinha } from './carrinho';

export const DESCONTO_COMBO = 150;
export const PERCENTUAL_PIX = 5;
export const TAXA_ENTREGA = 500;
export const FRETE_GRATIS_A_PARTIR = 5000;
export const PEDIDO_MINIMO_ENTREGA = 1500;

export function calcularSubtotal(linhas: LinhaCarrinho[], cardapio: ItemCardapio[]): number {
  return linhas.reduce((soma, linha) => soma + precoDaLinha(linha, cardapio), 0);
}

export function contarUnidades(
  linhas: LinhaCarrinho[],
  cardapio: ItemCardapio[],
  categoria: Categoria,
): number {
  return linhas.reduce((soma, linha) => {
    const item = cardapio.find((candidato) => candidato.id === linha.itemId);
    return item?.categoria === categoria ? soma + linha.quantidade : soma;
  }, 0);
}

/** C4: cada par de um salgado e uma bebida dá R$ 1,50 de desconto. */
export function calcularDescontoCombo(linhas: LinhaCarrinho[], cardapio: ItemCardapio[]): number {
  const pares = Math.min(
    contarUnidades(linhas, cardapio, 'salgado'),
    contarUnidades(linhas, cardapio, 'bebida'),
  );
  return pares * DESCONTO_COMBO;
}

export function temFreteGratis(valorProdutos: number): boolean {
  return valorProdutos >= FRETE_GRATIS_A_PARTIR;
}

/** C5: sem taxa na retirada; R$ 5,00 na entrega, grátis a partir de R$ 50,00 em produtos. */
export function calcularTaxaEntrega(valorProdutos: number, modo: ModoEntrega): number {
  if (modo === 'retirada' || temFreteGratis(valorProdutos)) {
    return 0;
  }
  return TAXA_ENTREGA;
}

export interface OpcoesResumo {
  modo: ModoEntrega;
  pagamento: FormaPagamento;
}

/** Valor dos produtos = subtotal menos o combo. */
export function valorDosProdutos(resumo: ResumoValores): number {
  return resumo.subtotal - resumo.descontoCombo;
}

/** Os cinco valores do resumo (C6). */
export function calcularResumo(
  linhas: LinhaCarrinho[],
  cardapio: ItemCardapio[],
  opcoes: OpcoesResumo,
): ResumoValores {
  const subtotal = calcularSubtotal(linhas, cardapio);
  const descontoCombo = calcularDescontoCombo(linhas, cardapio);
  const produtos = subtotal - descontoCombo;
  const descontoPix = opcoes.pagamento === 'pix' ? aplicarPercentual(produtos, PERCENTUAL_PIX) : 0;
  const taxaEntrega = calcularTaxaEntrega(produtos, opcoes.modo);
  return {
    subtotal,
    descontoCombo,
    descontoPix,
    taxaEntrega,
    total: subtotal - descontoCombo - descontoPix + taxaEntrega,
  };
}
