import type {
  CampoCheckout,
  DadosCheckout,
  ErrosCheckout,
  ItemCardapio,
  LinhaCarrinho,
  LinhaPedido,
  NovoPedido,
} from '../tipos';
import { precoDaLinha } from './carrinho';
import { somenteDigitos, validarCep, validarCidadeEntrega, validarPedidoMinimo } from './entrega';
import { avaliarTroco } from './pagamento';
import { calcularResumo } from './precos';

export const DADOS_INICIAIS: DadosCheckout = {
  nome: '',
  telefone: '',
  modo: 'entrega',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  complemento: '',
  cidade: '',
  uf: '',
  pagamento: 'pix',
  trocoPara: '',
};

/** Ordem em que os campos aparecem na tela: o foco vai para o primeiro inválido. */
export const ORDEM_CAMPOS: CampoCheckout[] = [
  'nome',
  'telefone',
  'modo',
  'cep',
  'rua',
  'numero',
  'bairro',
  'troco',
];

export function primeiroCampoInvalido(erros: ErrosCheckout): CampoCheckout | null {
  return ORDEM_CAMPOS.find((campo) => erros[campo] !== undefined) ?? null;
}

/** Que mensagens de erro cada dado do formulário afeta. Trocar o modo muda a etapa inteira. */
const ERROS_DE_CADA_DADO: Record<keyof DadosCheckout, CampoCheckout[] | 'todos'> = {
  nome: ['nome'],
  telefone: ['telefone'],
  modo: 'todos',
  cep: ['cep'],
  cidade: ['cep'],
  uf: ['cep'],
  rua: ['rua'],
  numero: ['numero'],
  bairro: ['bairro'],
  complemento: [],
  pagamento: ['troco'],
  trocoPara: ['troco'],
};

/**
 * Ao digitar, some só o erro do campo alterado; os outros continuam ao lado dos seus campos
 * até a pessoa corrigi-los. Não altera o objeto recebido.
 */
export function limparErrosAlterados(erros: ErrosCheckout, alterados: Partial<DadosCheckout>): ErrosCheckout {
  const restantes: ErrosCheckout = { ...erros };
  for (const dado of Object.keys(alterados) as (keyof DadosCheckout)[]) {
    const afetados = ERROS_DE_CADA_DADO[dado];
    if (afetados === 'todos') {
      return {};
    }
    for (const campo of afetados) {
      delete restantes[campo];
    }
  }
  return restantes;
}

export function validarIdentificacao(dados: DadosCheckout): ErrosCheckout {
  const erros: ErrosCheckout = {};
  if (dados.nome.trim().length < 3) {
    erros.nome = 'Informe o nome, com pelo menos 3 letras';
  }
  const telefone = somenteDigitos(dados.telefone);
  if (telefone.length < 10 || telefone.length > 11) {
    erros.telefone = 'Informe o telefone com DDD, de 10 ou 11 dígitos';
  }
  return erros;
}

/** Na retirada não há o que validar; na entrega valem as regras C5. */
export function validarEntregaEtapa(dados: DadosCheckout, valorProdutos: number): ErrosCheckout {
  if (dados.modo === 'retirada') {
    return {};
  }
  const erros: ErrosCheckout = {};
  const minimo = validarPedidoMinimo(valorProdutos);
  if (minimo) {
    erros.modo = minimo;
  }
  const erroCep = validarCep(dados.cep);
  if (erroCep) {
    erros.cep = erroCep;
  } else if (dados.cidade.trim() === '') {
    erros.cep = 'Busque o CEP para continuar';
  } else {
    const foraDaArea = validarCidadeEntrega(dados.cidade, dados.uf);
    if (foraDaArea) {
      erros.cep = foraDaArea;
    }
  }
  if (dados.rua.trim() === '') {
    erros.rua = 'Informe a rua';
  }
  if (dados.numero.trim() === '') {
    erros.numero = 'Informe o número';
  }
  if (dados.bairro.trim() === '') {
    erros.bairro = 'Informe o bairro';
  }
  return erros;
}

export function validarPagamentoEtapa(dados: DadosCheckout, total: number): ErrosCheckout {
  if (dados.pagamento !== 'dinheiro') {
    return {};
  }
  const { erro } = avaliarTroco(dados.trocoPara, total);
  return erro ? { troco: erro } : {};
}

/** Monta o pedido a enviar; itens que saíram do cardápio ficam de fora. */
export function montarPedido(
  dados: DadosCheckout,
  linhas: LinhaCarrinho[],
  cardapio: ItemCardapio[],
): NovoPedido {
  const linhasPedido: LinhaPedido[] = [];
  for (const linha of linhas) {
    const item = cardapio.find((candidato) => candidato.id === linha.itemId);
    if (item) {
      linhasPedido.push({ ...linha, nome: item.nome, precoLinha: precoDaLinha(linha, cardapio) });
    }
  }
  const resumo = calcularResumo(linhas, cardapio, { modo: dados.modo, pagamento: dados.pagamento });
  return {
    cliente: { nome: dados.nome.trim(), telefone: dados.telefone.trim() },
    modo: dados.modo,
    endereco:
      dados.modo === 'entrega'
        ? {
            cep: dados.cep,
            rua: dados.rua.trim(),
            numero: dados.numero.trim(),
            bairro: dados.bairro.trim(),
            complemento: dados.complemento.trim(),
            cidade: dados.cidade,
            uf: dados.uf,
          }
        : null,
    pagamento: dados.pagamento,
    trocoPara:
      dados.pagamento === 'dinheiro' ? avaliarTroco(dados.trocoPara, resumo.total).trocoPara : null,
    linhas: linhasPedido,
    resumo,
  };
}
