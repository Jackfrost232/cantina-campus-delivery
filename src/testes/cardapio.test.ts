import { describe, expect, it } from 'vitest';
import { agruparPorCategoria, filtrarItens } from '../dominio/cardapio';
import { ehListaDeItens, ehListaDeLinhas, ehListaDePedidos } from '../dominio/validadores';
import { CARDAPIO, linha, pedidoExemplo } from './fixtures';

const base = { busca: '', categoria: '' as const, ordem: 'nome' as const };

describe('filtrarItens e agruparPorCategoria', () => {
  it('busca sem diferenciar maiúsculas e acentos', () => {
    expect(filtrarItens(CARDAPIO, { ...base, busca: 'CUPUACU' }).map((i) => i.id)).toEqual(['suco']);
  });

  it('filtra por categoria e ordena por preço', () => {
    const itens = filtrarItens(CARDAPIO, { ...base, categoria: 'salgado', ordem: 'preco' });
    expect(itens.map((i) => i.id)).toEqual(['empada', 'coxinha']);
  });

  it('não altera a lista original', () => {
    const copia = CARDAPIO.map((i) => i.id);
    filtrarItens(CARDAPIO, { ...base, ordem: 'preco' });
    expect(CARDAPIO.map((i) => i.id)).toEqual(copia);
  });

  it('agrupa na ordem das categorias e esconde grupos vazios', () => {
    const grupos = agruparPorCategoria(CARDAPIO.filter((i) => i.categoria !== 'doce'));
    expect(grupos.map((g) => g.categoria)).toEqual(['salgado', 'bebida', 'refeicao']);
  });
});

describe('leitura defensiva dos dados guardados (RC09, C14)', () => {
  it('aceita dados no formato certo', () => {
    expect(ehListaDeLinhas([linha('suco', 2)])).toBe(true);
    expect(ehListaDePedidos([pedidoExemplo()])).toBe(true);
    expect(ehListaDeItens(CARDAPIO)).toBe(true);
  });

  it('recusa lixo, formatos alterados à mão e valores fora do limite', () => {
    expect(ehListaDeLinhas('isso nao e json')).toBe(false);
    expect(ehListaDeLinhas([{ itemId: 1 }])).toBe(false);
    expect(ehListaDeLinhas([linha('suco', 11)])).toBe(false);
    expect(ehListaDePedidos([{ numero: 'x' }])).toBe(false);
    expect(ehListaDePedidos(null)).toBe(false);
    expect(ehListaDeItens([{ id: 'a' }])).toBe(false);
  });
});
