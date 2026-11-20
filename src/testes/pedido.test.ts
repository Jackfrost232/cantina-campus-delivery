import { describe, expect, it } from 'vitest';
import { cancelarPedido, podeCancelar, segundosParaProximaEtapa, situacaoDoPedido } from '../dominio/pedido';
import { reporLinhasDoPedido } from '../dominio/pedirDeNovo';
import { CARDAPIO, linha, pedidoExemplo } from './fixtures';

const inicio = Date.parse('2026-11-09T12:00:00.000Z');
const apos = (segundos: number) => new Date(inicio + segundos * 1000);

describe('situacaoDoPedido (C7 e C14)', () => {
  it('entrega: avança a cada 10 segundos', () => {
    const pedido = pedidoExemplo();
    expect(situacaoDoPedido(pedido, apos(0))).toBe('recebido');
    expect(situacaoDoPedido(pedido, apos(9.9))).toBe('recebido');
    expect(situacaoDoPedido(pedido, apos(10))).toBe('em-preparo');
    expect(situacaoDoPedido(pedido, apos(20))).toBe('saiu-para-entrega');
    expect(situacaoDoPedido(pedido, apos(30))).toBe('entregue');
  });

  it('para na última etapa, sem passar do fim', () => {
    expect(situacaoDoPedido(pedidoExemplo(), apos(3600))).toBe('entregue');
  });

  it('retirada tem os próprios nomes de etapa', () => {
    const pedido = pedidoExemplo({ modo: 'retirada' });
    expect(situacaoDoPedido(pedido, apos(20))).toBe('pronto-para-retirada');
    expect(situacaoDoPedido(pedido, apos(40))).toBe('retirado');
  });

  it('relógio antes do recebimento não quebra', () => {
    expect(situacaoDoPedido(pedidoExemplo(), apos(-5))).toBe('recebido');
  });

  it('é função do tempo: o resultado não depende de quantas vezes foi chamada', () => {
    const pedido = pedidoExemplo();
    expect(situacaoDoPedido(pedido, apos(15))).toBe(situacaoDoPedido(pedido, apos(15)));
  });

  it('conta regressiva até a próxima etapa', () => {
    expect(segundosParaProximaEtapa(pedidoExemplo(), apos(3))).toBe(7);
    expect(segundosParaProximaEtapa(pedidoExemplo(), apos(35))).toBeNull();
  });
});

describe('cancelamento (C7 e C14)', () => {
  it('só enquanto está Recebido', () => {
    const pedido = pedidoExemplo();
    expect(podeCancelar(pedido, apos(5))).toBe(true);
    expect(podeCancelar(pedido, apos(10))).toBe(false);
  });

  it('cancelar muda a situação; depois do prazo não faz nada', () => {
    const pedido = pedidoExemplo();
    const cancelado = cancelarPedido(pedido, apos(5));
    expect(situacaoDoPedido(cancelado, apos(60))).toBe('cancelado');
    expect(cancelarPedido(pedido, apos(12))).toBe(pedido);
  });
});

describe('pedir de novo (C8 e C15)', () => {
  it('repõe os disponíveis e avisa quais ficaram de fora', () => {
    const pedido = pedidoExemplo({
      linhas: [
        { ...linha('coxinha', 2, ['catupiry']), nome: 'Coxinha de frango', precoLinha: 1600 },
        { ...linha('empada', 1), nome: 'Empada de frango', precoLinha: 550 },
      ],
    });
    const { linhas, ignorados } = reporLinhasDoPedido(pedido, CARDAPIO);
    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toMatchObject({ itemId: 'coxinha', quantidade: 2, adicionaisIds: ['catupiry'] });
    expect(ignorados).toEqual(['Empada de frango']);
  });

  it('descarta adicionais que não existem mais', () => {
    const pedido = pedidoExemplo({
      linhas: [{ ...linha('coxinha', 1, ['catupiry', 'bacon']), nome: 'Coxinha de frango', precoLinha: 800 }],
    });
    expect(reporLinhasDoPedido(pedido, CARDAPIO).linhas[0].adicionaisIds).toEqual(['catupiry']);
  });
});
