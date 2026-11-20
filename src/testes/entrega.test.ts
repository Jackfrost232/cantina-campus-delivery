import { describe, expect, it } from 'vitest';
import {
  cidadeAtendida,
  enderecoAposBusca,
  formatarCep, validarCep, validarCidadeEntrega, validarPedidoMinimo } from '../dominio/entrega';
import { avaliarTroco } from '../dominio/pagamento';

describe('CEP (C9 a C12)', () => {
  it('C12: CEP com 5 dígitos é recusado antes de chamar a API', () => {
    expect(validarCep('12345')).toBe('O CEP deve ter 8 dígitos');
    expect(validarCep('')).toBe('Informe o CEP');
    expect(validarCep('65800-000')).toBeNull();
  });

  it('formata o CEP enquanto digita', () => {
    expect(formatarCep('65800000')).toBe('65800-000');
    expect(formatarCep('6580')).toBe('6580');
  });
});

describe('rua e bairro depois da busca do CEP (C9)', () => {
  const nenhuma = { cep: '', rua: '', bairro: '' };
  const vazio = { rua: '', bairro: '' };
  const daSe = { cep: '01001-000', rua: 'Praça da Sé', bairro: 'Sé' };

  it('C09: Balsas devolve rua e bairro vazios e a pessoa digita', () => {
    expect(enderecoAposBusca('65800-000', vazio, nenhuma, vazio)).toEqual(vazio);
  });

  it('o que veio da busca de outro CEP é descartado', () => {
    const atual = { rua: 'Praça da Sé', bairro: 'Sé' };
    expect(enderecoAposBusca('65800-000', atual, daSe, vazio)).toEqual(vazio);
  });

  it('o que a pessoa digitou é mantido, e buscar o mesmo CEP não apaga nada', () => {
    const digitado = { rua: 'Rua Tiradentes', bairro: 'Centro' };
    expect(enderecoAposBusca('65800-000', digitado, daSe, vazio)).toEqual(digitado);
    const balsas = { cep: '65800-000', ...digitado };
    expect(enderecoAposBusca('65800000', digitado, balsas, vazio)).toEqual(digitado);
  });

  it('rua e bairro devolvidos pela API valem', () => {
    const encontrado = { rua: 'Praça da Sé', bairro: 'Sé' };
    expect(enderecoAposBusca('01001-000', vazio, nenhuma, encontrado)).toEqual(encontrado);
  });
});

describe('cidade de entrega (C5.1)', () => {
  it('C09: Balsas-MA é atendida, com ou sem acento e caixa', () => {
    expect(cidadeAtendida('Balsas', 'MA')).toBe(true);
    expect(cidadeAtendida(' BALSAS ', 'ma')).toBe(true);
  });

  it('C10: outro município é recusado', () => {
    expect(validarCidadeEntrega('São Paulo', 'SP')).toBe('Entregamos apenas em Balsas-MA');
    expect(validarCidadeEntrega('Balsas', 'PI')).toBe('Entregamos apenas em Balsas-MA');
  });
});

describe('pedido mínimo (C5.2)', () => {
  it('C07: R$ 9,50 em produtos é recusado', () => {
    expect(validarPedidoMinimo(950)).toBe('Pedido mínimo para entrega: R$ 15,00');
  });

  it('R$ 15,00 exatos é aceito', () => {
    expect(validarPedidoMinimo(1500)).toBeNull();
  });
});

describe('troco no dinheiro (C6)', () => {
  it('C05: troco para R$ 50 não cobre R$ 54,00', () => {
    expect(avaliarTroco('50', 5400).erro).toBe('O troco não cobre o total do pedido (R$ 54,00)');
  });

  it('C06: troco para R$ 60 devolve R$ 6,00', () => {
    const avaliacao = avaliarTroco('60', 5400);
    expect(avaliacao.erro).toBeNull();
    expect(avaliacao.troco).toBe(600);
    expect(avaliacao.trocoPara).toBe(6000);
  });

  it('campo obrigatório e valor inválido', () => {
    expect(avaliarTroco('', 5400).erro).toBe('Informe para quanto precisa de troco');
    expect(avaliarTroco('abc', 5400).erro).toBe('Informe um valor válido, como 50,00');
  });
});
