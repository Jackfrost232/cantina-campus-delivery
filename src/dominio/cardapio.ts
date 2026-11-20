import type { Categoria, ItemCardapio } from '../tipos';

export const ROTULOS_CATEGORIA: Record<Categoria, string> = {
  salgado: 'Salgados',
  bebida: 'Bebidas',
  doce: 'Doces',
  refeicao: 'Refeições',
};

export const ORDEM_CATEGORIAS: Categoria[] = ['salgado', 'bebida', 'doce', 'refeicao'];

export type OrdemCardapio = 'nome' | 'preco';

export interface FiltrosCardapio {
  busca: string;
  categoria: Categoria | '';
  ordem: OrdemCardapio;
}

export function normalizarTexto(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function encontrarItem(itens: ItemCardapio[], id: string): ItemCardapio | undefined {
  return itens.find((item) => item.id === id);
}

export function filtrarItens(itens: ItemCardapio[], filtros: FiltrosCardapio): ItemCardapio[] {
  const busca = normalizarTexto(filtros.busca);
  const filtrados = itens.filter((item) => {
    const casaNome = busca === '' || normalizarTexto(item.nome).includes(busca);
    const casaCategoria = filtros.categoria === '' || item.categoria === filtros.categoria;
    return casaNome && casaCategoria;
  });
  return filtrados.sort((a, b) =>
    filtros.ordem === 'preco' && a.preco !== b.preco
      ? a.preco - b.preco
      : a.nome.localeCompare(b.nome, 'pt-BR'),
  );
}

export interface GrupoCategoria {
  categoria: Categoria;
  itens: ItemCardapio[];
}

/** Agrupa mantendo a ordem recebida dentro de cada grupo; grupos vazios somem. */
export function agruparPorCategoria(itens: ItemCardapio[]): GrupoCategoria[] {
  return ORDEM_CATEGORIAS.map((categoria) => ({
    categoria,
    itens: itens.filter((item) => item.categoria === categoria),
  })).filter((grupo) => grupo.itens.length > 0);
}
