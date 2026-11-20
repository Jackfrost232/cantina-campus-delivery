import { ETAPAS_DO_PEDIDO, ROTULOS_SITUACAO } from '../dominio/pedido';
import type { ModoEntrega, SituacaoPedido } from '../tipos';

interface LinhaDoTempoProps {
  modo: ModoEntrega;
  situacao: SituacaoPedido;
}

export function LinhaDoTempo({ modo, situacao }: LinhaDoTempoProps) {
  const etapas = ETAPAS_DO_PEDIDO[modo];
  const atual = etapas.indexOf(situacao);

  return (
    <ol className="tempo" aria-label="Andamento do pedido">
      {etapas.map((etapa, indice) => (
        <li
          key={etapa}
          className={
            situacao === 'cancelado'
              ? 'tempo__item'
              : indice < atual
                ? 'tempo__item tempo__item--feito'
                : indice === atual
                  ? 'tempo__item tempo__item--atual'
                  : 'tempo__item'
          }
          aria-current={indice === atual ? 'step' : undefined}
        >
          {ROTULOS_SITUACAO[etapa]}
        </li>
      ))}
    </ol>
  );
}
