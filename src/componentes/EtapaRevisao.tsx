import { formatarCentavos } from '../dominio/formatos';
import { ResumoValores } from './ResumoValores';
import type { NovoPedido } from '../tipos';

interface EtapaRevisaoProps {
  pedido: NovoPedido;
  freteGratis: boolean;
  aoEditar: (etapa: number) => void;
}

const ROTULO_PAGAMENTO = { pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro' } as const;

export function EtapaRevisao({ pedido, freteGratis, aoEditar }: EtapaRevisaoProps) {
  const { cliente, endereco, linhas } = pedido;

  return (
    <div className="etapa-form">
      <section className="bloco" aria-labelledby="rev-itens">
        <h3 id="rev-itens">Itens</h3>
        <ul className="lista-simples">
          {linhas.map((linha) => (
            <li key={`${linha.itemId}-${linha.adicionaisIds.join('+')}`}>
              <span>
                {linha.quantidade}x {linha.nome}
                {linha.observacao && <small className="detalhe"> (obs.: {linha.observacao})</small>}
              </span>
              <span>{formatarCentavos(linha.precoLinha)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bloco" aria-labelledby="rev-cliente">
        <h3 id="rev-cliente">Cliente</h3>
        <p>{cliente.nome}</p>
        <p>{cliente.telefone}</p>
        <button type="button" className="botao botao--texto" onClick={() => aoEditar(0)}>
          Editar identificação
        </button>
      </section>

      <section className="bloco" aria-labelledby="rev-entrega">
        <h3 id="rev-entrega">{pedido.modo === 'entrega' ? 'Entrega' : 'Retirada no balcão'}</h3>
        {endereco ? (
          <p>
            {endereco.rua}, {endereco.numero}
            {endereco.complemento && ` (${endereco.complemento})`} · {endereco.bairro}
            <br />
            {endereco.cidade}-{endereco.uf} · CEP {endereco.cep}
          </p>
        ) : (
          <p>Retire seu pedido no balcão da cantina.</p>
        )}
        <button type="button" className="botao botao--texto" onClick={() => aoEditar(1)}>
          Editar entrega
        </button>
      </section>

      <section className="bloco" aria-labelledby="rev-pagamento">
        <h3 id="rev-pagamento">Pagamento</h3>
        <p>
          {ROTULO_PAGAMENTO[pedido.pagamento]}
          {pedido.trocoPara !== null &&
            ` · troco para ${formatarCentavos(pedido.trocoPara)} (troco de ${formatarCentavos(pedido.trocoPara - pedido.resumo.total)})`}
        </p>
        <button type="button" className="botao botao--texto" onClick={() => aoEditar(2)}>
          Editar pagamento
        </button>
      </section>

      <ResumoValores resumo={pedido.resumo} freteGratis={freteGratis} />
    </div>
  );
}
