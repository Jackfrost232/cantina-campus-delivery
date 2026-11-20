import { describe, expect, it } from 'vitest';
import { calcularResumo, calcularTaxaEntrega, valorDosProdutos } from '../dominio/precos';
import { CARDAPIO, linha } from './fixtures';

describe('calcularResumo (C4, C5, C6)', () => {
  it('C03: 3 coxinhas e 1 suco, entrega, Pix', () => {
    const resumo = calcularResumo([linha('coxinha', 3), linha('suco', 1)], CARDAPIO, { modo: 'entrega', pagamento: 'pix' });
    expect(resumo).toEqual({ subtotal: 2650, descontoCombo: 150, descontoPix: 125, taxaEntrega: 500, total: 2875 });
  });

  it('C04: 2 coxinhas com catupiry e 2 sucos, entrega, cartão', () => {
    const resumo = calcularResumo([linha('coxinha', 2, ['catupiry']), linha('suco', 2)], CARDAPIO, {
      modo: 'entrega',
      pagamento: 'cartao',
    });
    expect(resumo).toEqual({ subtotal: 3000, descontoCombo: 300, descontoPix: 0, taxaEntrega: 500, total: 3200 });
  });

  it('C05: 3 marmitas têm frete grátis', () => {
    const resumo = calcularResumo([linha('marmita', 3)], CARDAPIO, { modo: 'entrega', pagamento: 'dinheiro' });
    expect(resumo).toEqual({ subtotal: 5400, descontoCombo: 0, descontoPix: 0, taxaEntrega: 0, total: 5400 });
  });

  it('C08: suco e brigadeiro na retirada, cartão', () => {
    const resumo = calcularResumo([linha('suco'), linha('brigadeiro')], CARDAPIO, { modo: 'retirada', pagamento: 'cartao' });
    expect(resumo.total).toBe(950);
    expect(resumo.taxaEntrega).toBe(0);
  });

  it('doce não forma combo com bebida', () => {
    const resumo = calcularResumo([linha('suco'), linha('brigadeiro')], CARDAPIO, { modo: 'entrega', pagamento: 'cartao' });
    expect(resumo.descontoCombo).toBe(0);
  });

  it('o combo usa o menor entre salgados e bebidas, somando linhas diferentes', () => {
    const resumo = calcularResumo([linha('coxinha', 2), linha('coxinha', 1, ['catupiry']), linha('suco', 2)], CARDAPIO, {
      modo: 'retirada',
      pagamento: 'cartao',
    });
    expect(resumo.descontoCombo).toBe(300);
  });

  it('o Pix incide sobre os produtos e não sobre a taxa de entrega', () => {
    const resumo = calcularResumo([linha('marmita', 1)], CARDAPIO, { modo: 'entrega', pagamento: 'pix' });
    expect(resumo.descontoPix).toBe(90);
    expect(resumo.taxaEntrega).toBe(500);
    expect(resumo.total).toBe(1800 - 90 + 500);
    expect(valorDosProdutos(resumo)).toBe(1800);
  });

  it('carrinho vazio zera tudo', () => {
    expect(calcularResumo([], CARDAPIO, { modo: 'entrega', pagamento: 'pix' }).subtotal).toBe(0);
  });
});

describe('calcularTaxaEntrega (C5.3)', () => {
  it('R$ 5,00 abaixo de R$ 50,00 e grátis a partir dele', () => {
    expect(calcularTaxaEntrega(4999, 'entrega')).toBe(500);
    expect(calcularTaxaEntrega(5000, 'entrega')).toBe(0);
    expect(calcularTaxaEntrega(100, 'retirada')).toBe(0);
  });
});
