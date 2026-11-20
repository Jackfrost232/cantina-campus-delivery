import type { Pedido } from '../tipos';
import { formatarDataHora } from './formatos';
import { ROTULOS_SITUACAO, situacaoDoPedido } from './pedido';

const CABECALHO = ['Número', 'Data', 'Situação', 'Tipo', 'Pagamento', 'Itens', 'Total (R$)'];
const PAGAMENTOS = { pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro' } as const;

function celula(valor: string): string {
  return /[;"\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor;
}

function reais(centavos: number): string {
  return `${Math.floor(centavos / 100)},${String(centavos % 100).padStart(2, '0')}`;
}

/** CSV com ponto e vírgula e BOM, para abrir direto no Excel em português. */
export function pedidosParaCsv(pedidos: Pedido[], agora: Date): string {
  const linhas = pedidos.map((pedido) =>
    [
      String(pedido.numero),
      formatarDataHora(pedido.recebidoEm),
      ROTULOS_SITUACAO[situacaoDoPedido(pedido, agora)],
      pedido.modo === 'entrega' ? 'Entrega' : 'Retirada',
      PAGAMENTOS[pedido.pagamento],
      pedido.linhas.map((linha) => `${linha.quantidade}x ${linha.nome}`).join(' + '),
      reais(pedido.resumo.total),
    ]
      .map(celula)
      .join(';'),
  );
  return `\uFEFF${[CABECALHO.join(';'), ...linhas].join('\r\n')}\r\n`;
}
