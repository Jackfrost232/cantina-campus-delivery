import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AguardaCardapio } from '../componentes/AguardaCardapio';
import { CartaoItem } from '../componentes/CartaoItem';
import { FiltrosCardapio } from '../componentes/FiltrosCardapio';
import { MensagemEstado } from '../componentes/MensagemEstado';
import { agruparPorCategoria, filtrarItens, ROTULOS_CATEGORIA } from '../dominio/cardapio';
import type { FiltrosCardapio as Filtros } from '../dominio/cardapio';
import { useCarrinho } from '../contexto/useCarrinho';
import { useTitulo } from '../contexto/useTitulo';
import type { ItemCardapio } from '../tipos';

export function CardapioPagina() {
  useTitulo('Cardápio');
  return (
    <section aria-labelledby="titulo-cardapio">
      <h1 id="titulo-cardapio" className="titulo-pagina">
        Cardápio
      </h1>
      <p className="subtitulo">Peça pelo celular e receba em Balsas ou retire no balcão.</p>
      <AguardaCardapio>{(itens) => <ListaDoCardapio itens={itens} />}</AguardaCardapio>
    </section>
  );
}

interface ListaDoCardapioProps {
  itens: ItemCardapio[];
}

function ListaDoCardapio({ itens }: ListaDoCardapioProps) {
  const { adicionar } = useCarrinho();
  const [filtros, setFiltros] = useState<Filtros>({ busca: '', categoria: '', ordem: 'nome' });
  const [aviso, setAviso] = useState('');

  const grupos = useMemo(() => agruparPorCategoria(filtrarItens(itens, filtros)), [itens, filtros]);
  const total = grupos.reduce((soma, grupo) => soma + grupo.itens.length, 0);

  function adicionarRapido(item: ItemCardapio) {
    adicionar({ itemId: item.id, adicionaisIds: [], observacao: '', quantidade: 1 });
    setAviso(`${item.nome} adicionado ao carrinho.`);
  }

  return (
    <>
      <FiltrosCardapio filtros={filtros} aoMudar={(parcial) => setFiltros({ ...filtros, ...parcial })} />
      <p className="resultados" role="status" aria-live="polite">
        {aviso || `${total} ${total === 1 ? 'item' : 'itens'} no cardápio`}
        {aviso && (
          <>
            {' '}
            <Link to="/carrinho">Ver carrinho</Link>
          </>
        )}
      </p>
      {grupos.length === 0 ? (
        <MensagemEstado tipo="vazio" titulo="Nenhum item encontrado">
          Tente outro nome ou escolha todas as categorias.
        </MensagemEstado>
      ) : (
        grupos.map((grupo) => (
          <section key={grupo.categoria} className="categoria" aria-labelledby={`cat-${grupo.categoria}`}>
            <h2 id={`cat-${grupo.categoria}`} className="categoria__titulo">
              {ROTULOS_CATEGORIA[grupo.categoria]}
            </h2>
            <div className="lista-itens">
              {grupo.itens.map((item) => (
                <CartaoItem key={item.id} item={item} aoAdicionar={adicionarRapido} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
