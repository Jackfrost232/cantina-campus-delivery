import type { ItemCardapio, LinhaCarrinho } from '../tipos';

export const QUANTIDADE_MAXIMA = 10;

export type AcaoCarrinho =
  | { tipo: 'adicionar'; linha: LinhaCarrinho }
  | { tipo: 'alterarQuantidade'; chave: string; quantidade: number }
  | { tipo: 'remover'; chave: string }
  | { tipo: 'limpar' };

/** Duas linhas são a mesma quando têm o mesmo item e os mesmos adicionais, em qualquer ordem (C3). */
export function chaveDaLinha(linha: Pick<LinhaCarrinho, 'itemId' | 'adicionaisIds'>): string {
  return `${linha.itemId}|${[...new Set(linha.adicionaisIds)].sort().join(',')}`;
}

function limitar(quantidade: number): number {
  return Math.min(QUANTIDADE_MAXIMA, Math.max(1, Math.trunc(quantidade)));
}

export function carrinhoReducer(estado: LinhaCarrinho[], acao: AcaoCarrinho): LinhaCarrinho[] {
  switch (acao.tipo) {
    case 'adicionar': {
      const nova: LinhaCarrinho = {
        ...acao.linha,
        adicionaisIds: [...new Set(acao.linha.adicionaisIds)].sort(),
        quantidade: limitar(acao.linha.quantidade),
      };
      const chave = chaveDaLinha(nova);
      const existe = estado.some((linha) => chaveDaLinha(linha) === chave);
      if (!existe) {
        return [...estado, nova];
      }
      return estado.map((linha) =>
        chaveDaLinha(linha) === chave
          ? {
              ...linha,
              quantidade: limitar(linha.quantidade + nova.quantidade),
              observacao: linha.observacao || nova.observacao,
            }
          : linha,
      );
    }
    case 'alterarQuantidade': {
      if (acao.quantidade <= 0) {
        return estado.filter((linha) => chaveDaLinha(linha) !== acao.chave);
      }
      return estado.map((linha) =>
        chaveDaLinha(linha) === acao.chave
          ? { ...linha, quantidade: limitar(acao.quantidade) }
          : linha,
      );
    }
    case 'remover':
      return estado.filter((linha) => chaveDaLinha(linha) !== acao.chave);
    case 'limpar':
      return [];
  }
}

/** Preço da linha: (preço do item + adicionais) x quantidade. Item que saiu do cardápio vale 0. */
export function precoDaLinha(linha: LinhaCarrinho, cardapio: ItemCardapio[]): number {
  const item = cardapio.find((candidato) => candidato.id === linha.itemId);
  if (!item) {
    return 0;
  }
  const extras = item.adicionais
    .filter((adicional) => linha.adicionaisIds.includes(adicional.id))
    .reduce((soma, adicional) => soma + adicional.preco, 0);
  return (item.preco + extras) * linha.quantidade;
}

/** Nomes dos itens do carrinho que não existem mais ou estão esgotados. */
export function itensIndisponiveis(linhas: LinhaCarrinho[], cardapio: ItemCardapio[]): string[] {
  const nomes = linhas
    .map((linha) => {
      const item = cardapio.find((candidato) => candidato.id === linha.itemId);
      return !item ? 'Item removido do cardápio' : item.disponivel ? null : item.nome;
    })
    .filter((nome): nome is string => nome !== null);
  return [...new Set(nomes)];
}
