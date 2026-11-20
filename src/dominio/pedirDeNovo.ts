import type { ItemCardapio, LinhaCarrinho, Pedido } from '../tipos';

export interface ReposicaoDoPedido {
  linhas: LinhaCarrinho[];
  ignorados: string[]; // nomes dos itens que ficaram de fora
}

/** C8: repõe as linhas de um pedido antigo, ignorando os itens hoje esgotados ou removidos. */
export function reporLinhasDoPedido(pedido: Pedido, cardapio: ItemCardapio[]): ReposicaoDoPedido {
  const linhas: LinhaCarrinho[] = [];
  const ignorados: string[] = [];
  for (const linha of pedido.linhas) {
    const item = cardapio.find((candidato) => candidato.id === linha.itemId);
    if (!item || !item.disponivel) {
      if (!ignorados.includes(linha.nome)) {
        ignorados.push(linha.nome);
      }
      continue;
    }
    linhas.push({
      itemId: linha.itemId,
      adicionaisIds: linha.adicionaisIds.filter((id) =>
        item.adicionais.some((adicional) => adicional.id === id),
      ),
      observacao: linha.observacao,
      quantidade: linha.quantidade,
    });
  }
  return { linhas, ignorados };
}
