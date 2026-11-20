export type Categoria = 'salgado' | 'bebida' | 'doce' | 'refeicao';

export interface Adicional {
  id: string;
  nome: string;
  preco: number; // centavos
}

export interface ItemCardapio {
  id: string;
  nome: string;
  categoria: Categoria;
  preco: number; // centavos
  disponivel: boolean;
  descricao: string;
  adicionais: Adicional[];
}

export interface LinhaCarrinho {
  itemId: string;
  adicionaisIds: string[];
  observacao: string;
  quantidade: number;
}

export type ModoEntrega = 'entrega' | 'retirada';
export type FormaPagamento = 'pix' | 'cartao' | 'dinheiro';

export interface ResumoValores {
  subtotal: number;
  descontoCombo: number;
  descontoPix: number;
  taxaEntrega: number;
  total: number;
}

export interface Cliente {
  nome: string;
  telefone: string;
}

export interface EnderecoEntrega {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  uf: string;
}

/** Linha do pedido: guarda uma cópia do nome e do preço da hora da compra. */
export interface LinhaPedido extends LinhaCarrinho {
  nome: string;
  precoLinha: number;
}

export type SituacaoPedido =
  | 'recebido'
  | 'em-preparo'
  | 'saiu-para-entrega'
  | 'entregue'
  | 'pronto-para-retirada'
  | 'retirado'
  | 'cancelado';

export interface Pedido {
  numero: number;
  recebidoEm: string; // data e hora ISO: a situação é calculada a partir dela
  canceladoEm: string | null;
  cliente: Cliente;
  modo: ModoEntrega;
  endereco: EnderecoEntrega | null;
  pagamento: FormaPagamento;
  trocoPara: number | null; // centavos
  linhas: LinhaPedido[];
  resumo: ResumoValores;
}

/** O que o checkout monta; número e data de recebimento vêm do "servidor". */
export type NovoPedido = Omit<Pedido, 'numero' | 'recebidoEm' | 'canceladoEm'>;

export interface DadosCheckout {
  nome: string;
  telefone: string;
  modo: ModoEntrega;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  uf: string;
  pagamento: FormaPagamento;
  trocoPara: string; // texto digitado, em reais
}

export type CampoCheckout =
  | 'nome'
  | 'telefone'
  | 'modo'
  | 'cep'
  | 'rua'
  | 'numero'
  | 'bairro'
  | 'troco';

export type ErrosCheckout = Partial<Record<CampoCheckout, string>>;
