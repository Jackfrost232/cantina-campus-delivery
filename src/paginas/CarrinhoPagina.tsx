import { Link } from 'react-router-dom';
import { AguardaCardapio } from '../componentes/AguardaCardapio';
import { LinhaDoCarrinho } from '../componentes/LinhaDoCarrinho';
import { MensagemEstado } from '../componentes/MensagemEstado';
import { ResumoValores } from '../componentes/ResumoValores';
import { chaveDaLinha, itensIndisponiveis, precoDaLinha } from '../dominio/carrinho';
import { calcularResumo } from '../dominio/precos';
import { useCarrinho } from '../contexto/useCarrinho';
import { useTitulo } from '../contexto/useTitulo';
import type { ItemCardapio } from '../tipos';

export function CarrinhoPagina() {
  useTitulo('Carrinho');
  return (
    <section aria-labelledby="titulo-carrinho">
      <h1 id="titulo-carrinho" className="titulo-pagina">
        Carrinho
      </h1>
      <AguardaCardapio>{(itens) => <ConteudoDoCarrinho itens={itens} />}</AguardaCardapio>
    </section>
  );
}

function ConteudoDoCarrinho({ itens }: { itens: ItemCardapio[] }) {
  const { linhas, alterarQuantidade, remover, limpar } = useCarrinho();

  if (linhas.length === 0) {
    return (
      <MensagemEstado tipo="vazio" titulo="Seu carrinho está vazio">
        Escolha algo no <Link to="/">cardápio</Link> para começar.
      </MensagemEstado>
    );
  }

  const resumo = calcularResumo(linhas, itens, { modo: 'retirada', pagamento: 'cartao' });
  const indisponiveis = itensIndisponiveis(linhas, itens);

  return (
    <div className="layout-carrinho">
      <div>
        {indisponiveis.length > 0 && (
          <MensagemEstado tipo="erro" titulo="Há itens indisponíveis no carrinho">
            Remova para continuar: {indisponiveis.join(', ')}.
          </MensagemEstado>
        )}
        <div className="lista-linhas">
          {linhas.map((linha) => {
            const chave = chaveDaLinha(linha);
            return (
              <LinhaDoCarrinho
                key={chave}
                linha={linha}
                item={itens.find((item) => item.id === linha.itemId)}
                precoLinha={precoDaLinha(linha, itens)}
                aoAlterar={(quantidade) => alterarQuantidade(chave, quantidade)}
                aoRemover={() => remover(chave)}
              />
            );
          })}
        </div>
        <button type="button" className="botao botao--texto" onClick={limpar}>
          Limpar carrinho
        </button>
      </div>
      <aside>
        <ResumoValores resumo={resumo}>
          <p className="detalhe">A taxa de entrega e o desconto Pix são calculados no checkout.</p>
        </ResumoValores>
        {indisponiveis.length === 0 ? (
          <Link className="botao botao--primario botao--grande botao--cheio" to="/checkout">
            Ir para o checkout
          </Link>
        ) : (
          <button type="button" className="botao botao--grande botao--cheio" disabled>
            Ir para o checkout
          </button>
        )}
      </aside>
    </div>
  );
}
