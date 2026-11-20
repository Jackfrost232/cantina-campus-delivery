import { Link } from 'react-router-dom';
import { ROTULOS_CATEGORIA } from '../dominio/cardapio';
import { formatarCentavos } from '../dominio/formatos';
import type { Categoria, ItemCardapio } from '../tipos';

interface CartaoItemProps {
  item: ItemCardapio;
  aoAdicionar: (item: ItemCardapio) => void;
}

const ICONES_CATEGORIA: Record<Categoria, string> = {
  salgado: '🥟',
  bebida: '🥤',
  doce: '🍫',
  refeicao: '🍛',
};

export function CartaoItem({ item, aoAdicionar }: CartaoItemProps) {
  const temAdicionais = item.adicionais.length > 0;

  return (
    <article className={item.disponivel ? 'cartao-item' : 'cartao-item cartao-item--esgotado'}>
      <span className="cartao-item__icone" aria-hidden="true">
        {ICONES_CATEGORIA[item.categoria]}
      </span>
      <div className="cartao-item__corpo">
        <h3 className="cartao-item__nome">
          {item.disponivel ? <Link to={`/itens/${item.id}`}>{item.nome}</Link> : item.nome}
        </h3>
        <p className="cartao-item__descricao">{item.descricao}</p>
        <p className="cartao-item__meta">
          <span className="etiqueta">{ROTULOS_CATEGORIA[item.categoria]}</span>
          {temAdicionais && <span className="etiqueta">Com adicionais</span>}
        </p>
      </div>
      <div className="cartao-item__acao">
        <p className="preco">{formatarCentavos(item.preco)}</p>
        {!item.disponivel ? (
          <button type="button" className="botao" disabled>
            Esgotado
          </button>
        ) : temAdicionais ? (
          <Link className="botao botao--secundario" to={`/itens/${item.id}`}>
            Personalizar
            <span className="so-leitor"> {item.nome}</span>
          </Link>
        ) : (
          <button
            type="button"
            className="botao botao--primario"
            aria-label={`Adicionar ${item.nome} ao carrinho`}
            onClick={() => aoAdicionar(item)}
          >
            Adicionar
          </button>
        )}
      </div>
    </article>
  );
}
