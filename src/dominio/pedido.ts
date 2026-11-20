import type { ModoEntrega, Pedido, SituacaoPedido } from '../tipos';

/** O pedido avança uma etapa a cada 10 segundos (C7). */
export const INTERVALO_ETAPA_MS = 10_000;

export const ROTULOS_SITUACAO: Record<SituacaoPedido, string> = {
  recebido: 'Recebido',
  'em-preparo': 'Em preparo',
  'saiu-para-entrega': 'Saiu para entrega',
  entregue: 'Entregue',
  'pronto-para-retirada': 'Pronto para retirada',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
};

export const ETAPAS_DO_PEDIDO: Record<ModoEntrega, SituacaoPedido[]> = {
  entrega: ['recebido', 'em-preparo', 'saiu-para-entrega', 'entregue'],
  retirada: ['recebido', 'em-preparo', 'pronto-para-retirada', 'retirado'],
};

function indiceDaEtapa(pedido: Pedido, agora: Date): number {
  const decorrido = agora.getTime() - Date.parse(pedido.recebidoEm);
  const etapas = ETAPAS_DO_PEDIDO[pedido.modo].length;
  if (Number.isNaN(decorrido) || decorrido < 0) {
    return 0;
  }
  return Math.min(etapas - 1, Math.floor(decorrido / INTERVALO_ETAPA_MS));
}

/** A situação é função do tempo passado desde o recebimento: recarregar a página não a reinicia. */
export function situacaoDoPedido(pedido: Pedido, agora: Date): SituacaoPedido {
  if (pedido.canceladoEm !== null) {
    return 'cancelado';
  }
  return ETAPAS_DO_PEDIDO[pedido.modo][indiceDaEtapa(pedido, agora)];
}

/** O cancelamento só é permitido enquanto o pedido está como Recebido. */
export function podeCancelar(pedido: Pedido, agora: Date): boolean {
  return situacaoDoPedido(pedido, agora) === 'recebido';
}

export function cancelarPedido(pedido: Pedido, agora: Date): Pedido {
  return podeCancelar(pedido, agora) ? { ...pedido, canceladoEm: agora.toISOString() } : pedido;
}

/** Segundos até a próxima etapa, ou null quando o pedido já terminou ou foi cancelado. */
export function segundosParaProximaEtapa(pedido: Pedido, agora: Date): number | null {
  if (pedido.canceladoEm !== null) {
    return null;
  }
  const etapas = ETAPAS_DO_PEDIDO[pedido.modo].length;
  if (indiceDaEtapa(pedido, agora) >= etapas - 1) {
    return null;
  }
  const decorrido = Math.max(0, agora.getTime() - Date.parse(pedido.recebidoEm));
  return Math.ceil((INTERVALO_ETAPA_MS - (decorrido % INTERVALO_ETAPA_MS)) / 1000);
}

export function ehSituacaoFinal(situacao: SituacaoPedido): boolean {
  return situacao === 'entregue' || situacao === 'retirado' || situacao === 'cancelado';
}
