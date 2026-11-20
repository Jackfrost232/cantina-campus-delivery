import { ROTULOS_SITUACAO } from '../dominio/pedido';
import type { SituacaoPedido } from '../tipos';

interface SeloSituacaoProps {
  situacao: SituacaoPedido;
}

export function SeloSituacao({ situacao }: SeloSituacaoProps) {
  return <span className={`selo selo--${situacao}`}>{ROTULOS_SITUACAO[situacao]}</span>;
}
