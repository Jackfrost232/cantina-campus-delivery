import { describe, expect, it } from 'vitest';
import {
  DADOS_INICIAIS,
  limparErrosAlterados,
  montarPedido,
  primeiroCampoInvalido,
  validarEntregaEtapa,
  validarIdentificacao,
  validarPagamentoEtapa,
} from '../dominio/checkout';
import type { DadosCheckout } from '../tipos';
import { CARDAPIO, linha } from './fixtures';

const completo: DadosCheckout = {
  ...DADOS_INICIAIS,
  nome: 'Ana Souza',
  telefone: '89999999999',
  cep: '65800-000',
  cidade: 'Balsas',
  uf: 'MA',
  rua: 'Rua das Flores',
  numero: '10',
  bairro: 'Centro',
};

describe('identificação', () => {
  it('exige nome de 3 letras e telefone com DDD', () => {
    const erros = validarIdentificacao({ ...DADOS_INICIAIS, nome: 'Al', telefone: '123' });
    expect(erros.nome).toBeDefined();
    expect(erros.telefone).toBeDefined();
    expect(validarIdentificacao(completo)).toEqual({});
  });
});

describe('entrega (C5.4, C9 a C11)', () => {
  it('rua, número e bairro são obrigatórios; complemento não', () => {
    const erros = validarEntregaEtapa({ ...completo, rua: '', numero: ' ', bairro: '' }, 5000);
    expect(Object.keys(erros).sort()).toEqual(['bairro', 'numero', 'rua']);
  });

  it('C07: pedido mínimo bloqueia a entrega, mas não a retirada', () => {
    expect(validarEntregaEtapa(completo, 950).modo).toBe('Pedido mínimo para entrega: R$ 15,00');
    expect(validarEntregaEtapa({ ...completo, modo: 'retirada' }, 950)).toEqual({});
  });

  it('C10: CEP fora de Balsas é recusado', () => {
    const erros = validarEntregaEtapa({ ...completo, cep: '01001-000', cidade: 'São Paulo', uf: 'SP' }, 5000);
    expect(erros.cep).toBe('Entregamos apenas em Balsas-MA');
  });

  it('CEP ainda não buscado pede a busca', () => {
    expect(validarEntregaEtapa({ ...completo, cidade: '', uf: '' }, 5000).cep).toBe('Busque o CEP para continuar');
  });
});

describe('pagamento e foco', () => {
  it('só o dinheiro exige troco', () => {
    expect(validarPagamentoEtapa({ ...completo, pagamento: 'cartao' }, 5400)).toEqual({});
    expect(validarPagamentoEtapa({ ...completo, pagamento: 'dinheiro', trocoPara: '50' }, 5400).troco).toBeDefined();
    expect(validarPagamentoEtapa({ ...completo, pagamento: 'dinheiro', trocoPara: '60' }, 5400)).toEqual({});
  });

  it('o foco vai para o primeiro campo inválido, na ordem da tela', () => {
    expect(primeiroCampoInvalido({ bairro: 'x', rua: 'x', cep: 'x' })).toBe('cep');
    expect(primeiroCampoInvalido({})).toBeNull();
  });
});

describe('erros enquanto a pessoa digita', () => {
  const erros = { rua: 'Informe a rua', numero: 'Informe o número', bairro: 'Informe o bairro' };

  it('digitar num campo apaga só o erro dele; os outros continuam', () => {
    expect(limparErrosAlterados(erros, { rua: 'Rua A' })).toEqual({ numero: 'Informe o número', bairro: 'Informe o bairro' });
    expect(erros.rua).toBe('Informe a rua'); // não altera o objeto original
  });

  it('a busca do CEP limpa o erro do CEP, e o troco é limpo ao digitar ou trocar a forma de pagamento', () => {
    expect(limparErrosAlterados({ cep: 'x', rua: 'y' }, { cidade: 'Balsas', uf: 'MA' })).toEqual({ rua: 'y' });
    expect(limparErrosAlterados({ troco: 'x' }, { trocoPara: '60' })).toEqual({});
    expect(limparErrosAlterados({ troco: 'x' }, { pagamento: 'pix' })).toEqual({});
  });

  it('trocar entre entrega e retirada limpa todos os erros da etapa', () => {
    expect(limparErrosAlterados({ modo: 'x', cep: 'y', rua: 'z' }, { modo: 'retirada' })).toEqual({});
  });

  it('o complemento é opcional e não apaga nada', () => {
    expect(limparErrosAlterados(erros, { complemento: 'Apto 2' })).toEqual(erros);
  });
});

describe('montarPedido', () => {
  it('guarda nome e preço da linha e o troco em centavos', () => {
    const pedido = montarPedido(
      { ...completo, pagamento: 'dinheiro', trocoPara: '60' },
      [linha('marmita', 3)],
      CARDAPIO,
    );
    expect(pedido.linhas[0]).toMatchObject({ nome: 'Marmita de frango caipira', precoLinha: 5400 });
    expect(pedido.resumo.total).toBe(5400);
    expect(pedido.trocoPara).toBe(6000);
    expect(pedido.endereco?.cidade).toBe('Balsas');
  });

  it('retirada não leva endereço', () => {
    expect(montarPedido({ ...completo, modo: 'retirada' }, [linha('suco')], CARDAPIO).endereco).toBeNull();
  });
});
