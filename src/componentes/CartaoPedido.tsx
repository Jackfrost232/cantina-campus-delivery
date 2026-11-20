import { Link } from 'react-router-dom';
import { formatarCentavos, formatarDataHora } from '../dominio/formatos';
import { situacaoDoPedido } from '../dominio/pedido';
import type { Pedido } from '../tipos';
import { SeloSituacao } from './SeloSituacao';

interface CartaoPedidoProps {
  pedido: Pedido;
  agora: Date;
  podePedirDeNovo: boolean;
  aoPedirDeNovo: (pedido: Pedido) => void;
}

export function CartaoPedido({ pedido, agora, podePedirDeNovo, aoPedirDeNovo }: CartaoPedidoProps) {
  const unidades = pedido.linhas.reduce((soma, linha) => soma + linha.quantidade, 0);

  return (
    <article className="cartao-pedido">
      <div>
        <h3 className="cartao-pedido__numero">
          <Link to={`/pedidos/${pedido.numero}`}>Pedido {pedido.numero}</Link>
        </h3>
        <p className="detalhe">
          {formatarDataHora(pedido.recebidoEm)} · {unidades} {unidades === 1 ? 'item' : 'itens'} ·{' '}
          {pedido.modo === 'entrega' ? 'Entrega' : 'Retirada'}
        </p>
        <p className="detalhe">{pedido.linhas.map((linha) => `${linha.quantidade}x ${linha.nome}`).join(', ')}</p>
      </div>
      <div className="cartao-pedido__lado">
        <SeloSituacao situacao={situacaoDoPedido(pedido, agora)} />
        <p className="preco">{formatarCentavos(pedido.resumo.total)}</p>
        <button
          type="button"
          className="botao botao--secundario"
          disabled={!podePedirDeNovo}
          aria-label={`Pedir de novo o pedido ${pedido.numero}`}
          onClick={() => aoPedirDeNovo(pedido)}
        >
          Pedir de novo
        </button>
      </div>
    </article>
  );
}
