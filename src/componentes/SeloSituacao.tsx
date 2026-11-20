import { ROTULOS_SITUACAO } from '../dominio/pedido';
import type { SituacaoPedido } from '../tipos';

export function SeloSituacao({ situacao }: { situacao: SituacaoPedido }) {
  return <span className={`selo selo--${situacao}`}>{ROTULOS_SITUACAO[situacao]}</span>;
}
