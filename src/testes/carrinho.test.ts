import { describe, expect, it } from 'vitest';
import { carrinhoReducer, chaveDaLinha, itensIndisponiveis, precoDaLinha } from '../dominio/carrinho';
import type { LinhaCarrinho } from '../tipos';
import { CARDAPIO, linha } from './fixtures';

const vazio: LinhaCarrinho[] = [];

describe('carrinhoReducer (C2 e C3)', () => {
  it('C01: coxinha com e sem catupiry são duas linhas', () => {
    let estado = carrinhoReducer(vazio, { tipo: 'adicionar', linha: linha('coxinha', 1, ['catupiry']) });
    estado = carrinhoReducer(estado, { tipo: 'adicionar', linha: linha('coxinha', 1) });
    expect(estado).toHaveLength(2);
  });

  it('C02: adicionar de novo a mesma linha soma a quantidade', () => {
    let estado = carrinhoReducer(vazio, { tipo: 'adicionar', linha: linha('coxinha', 1, ['catupiry']) });
    estado = carrinhoReducer(estado, { tipo: 'adicionar', linha: linha('coxinha', 1) });
    estado = carrinhoReducer(estado, { tipo: 'adicionar', linha: linha('coxinha', 1, ['catupiry']) });
    expect(estado).toHaveLength(2);
    expect(estado.find((l) => l.adicionaisIds.includes('catupiry'))?.quantidade).toBe(2);
  });

  it('a ordem dos adicionais não cria outra linha', () => {
    expect(chaveDaLinha(linha('marmita', 1, ['ovo', 'farofa']))).toBe(chaveDaLinha(linha('marmita', 1, ['farofa', 'ovo'])));
    let estado = carrinhoReducer(vazio, { tipo: 'adicionar', linha: linha('marmita', 1, ['ovo', 'farofa']) });
    estado = carrinhoReducer(estado, { tipo: 'adicionar', linha: linha('marmita', 1, ['farofa', 'ovo']) });
    expect(estado).toHaveLength(1);
    expect(estado[0].quantidade).toBe(2);
  });

  it('a quantidade vai de 1 a 10 por linha', () => {
    let estado = carrinhoReducer(vazio, { tipo: 'adicionar', linha: linha('suco', 8) });
    estado = carrinhoReducer(estado, { tipo: 'adicionar', linha: linha('suco', 5) });
    expect(estado[0].quantidade).toBe(10);
    estado = carrinhoReducer(estado, { tipo: 'alterarQuantidade', chave: chaveDaLinha(estado[0]), quantidade: 99 });
    expect(estado[0].quantidade).toBe(10);
  });

  it('chegar a zero remove a linha', () => {
    const estado = [linha('suco', 1)];
    expect(carrinhoReducer(estado, { tipo: 'alterarQuantidade', chave: chaveDaLinha(estado[0]), quantidade: 0 })).toEqual([]);
  });

  it('remover e limpar', () => {
    const estado = [linha('suco', 1), linha('coxinha', 2)];
    expect(carrinhoReducer(estado, { tipo: 'remover', chave: chaveDaLinha(estado[0]) })).toHaveLength(1);
    expect(carrinhoReducer(estado, { tipo: 'limpar' })).toEqual([]);
  });

  it('não altera o estado anterior', () => {
    const estado = [linha('suco', 1)];
    const copia = JSON.parse(JSON.stringify(estado));
    carrinhoReducer(estado, { tipo: 'adicionar', linha: linha('suco', 2) });
    expect(estado).toEqual(copia);
  });
});

describe('precoDaLinha (C3)', () => {
  it('soma item e adicionais e multiplica pela quantidade', () => {
    expect(precoDaLinha(linha('coxinha', 2, ['catupiry']), CARDAPIO)).toBe(1600);
    expect(precoDaLinha(linha('marmita', 1, ['ovo', 'farofa']), CARDAPIO)).toBe(2150);
  });

  it('item que saiu do cardápio vale zero', () => {
    expect(precoDaLinha(linha('fantasma', 3), CARDAPIO)).toBe(0);
  });
});

describe('itensIndisponiveis', () => {
  it('aponta itens esgotados ou removidos', () => {
    expect(itensIndisponiveis([linha('empada'), linha('suco'), linha('fantasma')], CARDAPIO)).toEqual([
      'Empada de frango',
      'Item removido do cardápio',
    ]);
  });
});
