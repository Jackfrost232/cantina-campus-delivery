import { Link, useParams } from 'react-router-dom';
import { LinhaDoTempo } from '../componentes/LinhaDoTempo';
import { MensagemEstado } from '../componentes/MensagemEstado';
import { ResumoValores } from '../componentes/ResumoValores';
import { SeloSituacao } from '../componentes/SeloSituacao';
import { formatarCentavos, formatarDataHora } from '../dominio/formatos';
import { ehSituacaoFinal, podeCancelar, segundosParaProximaEtapa, situacaoDoPedido } from '../dominio/pedido';
import { temFreteGratis, valorDosProdutos } from '../dominio/precos';
import { useAgora } from '../contexto/useAgora';
import { usePedidos } from '../contexto/usePedidos';
import { useTitulo } from '../contexto/useTitulo';

export function AcompanhamentoPagina() {
  const { numero } = useParams();
  const { pedidos, cancelar } = usePedidos();
  const agora = useAgora(1000);
  const pedido = pedidos.find((candidato) => String(candidato.numero) === numero);
  useTitulo(pedido ? `Pedido ${pedido.numero}` : 'Pedido não encontrado');

  if (!pedido) {
    return (
      <MensagemEstado tipo="vazio" titulo="Pedido não encontrado">
        Não achamos o pedido {numero} neste navegador. <Link to="/pedidos">Ver meus pedidos</Link>.
      </MensagemEstado>
    );
  }

  const situacao = situacaoDoPedido(pedido, agora);
  const segundos = segundosParaProximaEtapa(pedido, agora);

  return (
    <article aria-labelledby="titulo-pedido">
      <Link className="voltar" to="/pedidos">
        Meus pedidos
      </Link>
      <h1 id="titulo-pedido" className="titulo-pagina">
        Pedido {pedido.numero}
      </h1>
      <p className="subtitulo">
        Recebido em {formatarDataHora(pedido.recebidoEm)} · {pedido.modo === 'entrega' ? 'Entrega' : 'Retirada no balcão'}
      </p>

      <div className="painel">
        <p className="situacao" role="status" aria-live="polite">
          Situação: <SeloSituacao situacao={situacao} />
        </p>
        {situacao !== 'cancelado' && <LinhaDoTempo modo={pedido.modo} situacao={situacao} />}
        {segundos !== null && <p className="detalhe">Próxima etapa em cerca de {segundos} s.</p>}
        {situacao === 'cancelado' && <p>Este pedido foi cancelado.</p>}
        {ehSituacaoFinal(situacao) && situacao !== 'cancelado' && <p>Pedido finalizado. Bom apetite!</p>}
        {podeCancelar(pedido, agora) && (
          <button type="button" className="botao botao--perigo" onClick={() => cancelar(pedido.numero)}>
            Cancelar pedido
          </button>
        )}
      </div>

      <div className="layout-checkout">
        <section className="painel" aria-labelledby="itens-pedido">
          <h2 id="itens-pedido" className="painel__titulo">
            Itens
          </h2>
          <ul className="lista-simples">
            {pedido.linhas.map((linha) => (
              <li key={`${linha.itemId}-${linha.adicionaisIds.join('+')}`}>
                <span>
                  {linha.quantidade}x {linha.nome}
                </span>
                <span>{formatarCentavos(linha.precoLinha)}</span>
              </li>
            ))}
          </ul>
          {pedido.endereco && (
            <p className="detalhe">
              Entrega em {pedido.endereco.rua}, {pedido.endereco.numero} · {pedido.endereco.bairro},{' '}
              {pedido.endereco.cidade}-{pedido.endereco.uf}
            </p>
          )}
        </section>
        <aside>
          <ResumoValores
            resumo={pedido.resumo}
            freteGratis={pedido.modo === 'entrega' && temFreteGratis(valorDosProdutos(pedido.resumo))}
          />
        </aside>
      </div>
    </article>
  );
}
