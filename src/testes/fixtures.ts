import type { ItemCardapio, LinhaCarrinho, Pedido } from '../tipos';

export const CARDAPIO: ItemCardapio[] = [
  {
    id: 'coxinha',
    nome: 'Coxinha de frango',
    categoria: 'salgado',
    preco: 650,
    disponivel: true,
    descricao: 'Frango desfiado.',
    adicionais: [{ id: 'catupiry', nome: 'Catupiry', preco: 150 }],
  },
  { id: 'suco', nome: 'Suco de cupuaçu', categoria: 'bebida', preco: 700, disponivel: true, descricao: '', adicionais: [] },
  { id: 'brigadeiro', nome: 'Brigadeiro', categoria: 'doce', preco: 250, disponivel: true, descricao: '', adicionais: [] },
  {
    id: 'marmita',
    nome: 'Marmita de frango caipira',
    categoria: 'refeicao',
    preco: 1800,
    disponivel: true,
    descricao: '',
    adicionais: [
      { id: 'ovo', nome: 'Ovo frito', preco: 200 },
      { id: 'farofa', nome: 'Farofa extra', preco: 150 },
    ],
  },
  { id: 'empada', nome: 'Empada de frango', categoria: 'salgado', preco: 550, disponivel: false, descricao: '', adicionais: [] },
];

export function linha(itemId: string, quantidade = 1, adicionaisIds: string[] = [], observacao = ''): LinhaCarrinho {
  return { itemId, adicionaisIds, observacao, quantidade };
}

export function pedidoExemplo(parcial: Partial<Pedido> = {}): Pedido {
  return {
    numero: 1001,
    recebidoEm: '2026-11-09T12:00:00.000Z',
    canceladoEm: null,
    cliente: { nome: 'Ana', telefone: '89999999999' },
    modo: 'entrega',
    endereco: null,
    pagamento: 'pix',
    trocoPara: null,
    linhas: [{ ...linha('coxinha', 2), nome: 'Coxinha de frango', precoLinha: 1300 }],
    resumo: { subtotal: 1300, descontoCombo: 0, descontoPix: 65, taxaEntrega: 500, total: 1735 },
    ...parcial,
  };
}
