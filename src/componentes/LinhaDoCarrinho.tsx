import { formatarCentavos } from '../dominio/formatos';
import type { ItemCardapio, LinhaCarrinho } from '../tipos';
import { ControleQuantidade } from './ControleQuantidade';

interface LinhaDoCarrinhoProps {
  linha: LinhaCarrinho;
  item: ItemCardapio | undefined;
  precoLinha: number;
  aoAlterar: (quantidade: number) => void;
  aoRemover: () => void;
}

export function LinhaDoCarrinho({ linha, item, precoLinha, aoAlterar, aoRemover }: LinhaDoCarrinhoProps) {
  const nome = item?.nome ?? 'Item removido do cardápio';
  const adicionais = item
    ? item.adicionais.filter((adicional) => linha.adicionaisIds.includes(adicional.id))
    : [];

  return (
    <article className="linha-carrinho">
      <div className="linha-carrinho__texto">
        <h3 className="linha-carrinho__nome">{nome}</h3>
        {item && !item.disponivel && <p className="aviso-linha">Esgotado: remova para continuar.</p>}
        {adicionais.length > 0 && (
          <p className="linha-carrinho__detalhe">
            Com {adicionais.map((adicional) => adicional.nome.toLowerCase()).join(', ')}
          </p>
        )}
        {linha.observacao && <p className="linha-carrinho__detalhe">Obs.: {linha.observacao}</p>}
      </div>
      <ControleQuantidade valor={linha.quantidade} rotulo={nome} minimo={0} aoAlterar={aoAlterar} />
      <p className="preco">{formatarCentavos(precoLinha)}</p>
      <button
        type="button"
        className="botao botao--texto"
        aria-label={`Remover ${nome} do carrinho`}
        onClick={aoRemover}
      >
        Remover
      </button>
    </article>
  );
}
