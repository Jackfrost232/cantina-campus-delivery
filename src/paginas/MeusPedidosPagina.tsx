import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CartaoPedido } from '../componentes/CartaoPedido';
import { MensagemEstado } from '../componentes/MensagemEstado';
import { pedidosParaCsv } from '../dominio/exportacao';
import { reporLinhasDoPedido } from '../dominio/pedirDeNovo';
import { useAgora } from '../contexto/useAgora';
import { useCardapio } from '../contexto/useCardapio';
import { useCarrinho } from '../contexto/useCarrinho';
import { usePedidos } from '../contexto/usePedidos';
import { useTitulo } from '../contexto/useTitulo';
import type { Pedido } from '../tipos';

interface AvisoReposicao {
  numero: number;
  repostas: number;
  ignorados: string[];
}

export function MeusPedidosPagina() {
  useTitulo('Meus pedidos');
  const { pedidos } = usePedidos();
  const { estado } = useCardapio();
  const { adicionar } = useCarrinho();
  const agora = useAgora(1000);
  const [aviso, setAviso] = useState<AvisoReposicao | null>(null);

  function pedirDeNovo(pedido: Pedido) {
    if (estado.situacao !== 'pronto') {
      return;
    }
    const { linhas, ignorados } = reporLinhasDoPedido(pedido, estado.itens);
    linhas.forEach((linha) => adicionar(linha));
    setAviso({ numero: pedido.numero, repostas: linhas.length, ignorados });
  }

  function exportarCsv() {
    const blob = new Blob([pedidosParaCsv(pedidos, new Date())], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meus-pedidos.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section aria-labelledby="titulo-pedidos">
      <h1 id="titulo-pedidos" className="titulo-pagina">
        Meus pedidos
      </h1>

      {pedidos.length > 0 && (
        <button type="button" className="botao botao--secundario" onClick={exportarCsv}>
          Exportar histórico em CSV
        </button>
      )}

      {aviso && (
        <div className="aviso" role="status">
          {aviso.repostas > 0 ? (
            <p>
              Itens do pedido {aviso.numero} repostos no carrinho. <Link to="/carrinho">Ver carrinho</Link>
            </p>
          ) : (
            <p>Nenhum item do pedido {aviso.numero} está disponível hoje.</p>
          )}
          {aviso.ignorados.length > 0 && (
            <p>
              Ficaram de fora, por estarem esgotados: <strong>{aviso.ignorados.join(', ')}</strong>.
            </p>
          )}
        </div>
      )}

      {pedidos.length === 0 ? (
        <MensagemEstado tipo="vazio" titulo="Você ainda não fez pedidos">
          Quando fizer o primeiro, ele aparece aqui. Comece pelo <Link to="/">cardápio</Link>.
        </MensagemEstado>
      ) : (
        <div className="lista-pedidos">
          {pedidos.map((pedido) => (
            <CartaoPedido
              key={pedido.numero}
              pedido={pedido}
              agora={agora}
              podePedirDeNovo={estado.situacao === 'pronto'}
              aoPedirDeNovo={pedirDeNovo}
            />
          ))}
        </div>
      )}
      {estado.situacao === 'erro' && pedidos.length > 0 && (
        <p className="detalhe">O cardápio não carregou, então “Pedir de novo” está indisponível por enquanto.</p>
      )}
    </section>
  );
}
