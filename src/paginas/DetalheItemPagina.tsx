import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AguardaCardapio } from '../componentes/AguardaCardapio';
import { ControleQuantidade } from '../componentes/ControleQuantidade';
import { MensagemEstado } from '../componentes/MensagemEstado';
import { SeletorAdicionais } from '../componentes/SeletorAdicionais';
import { ROTULOS_CATEGORIA, encontrarItem } from '../dominio/cardapio';
import { precoDaLinha } from '../dominio/carrinho';
import { formatarCentavos } from '../dominio/formatos';
import { useCarrinho } from '../contexto/useCarrinho';
import { useTitulo } from '../contexto/useTitulo';
import type { ItemCardapio } from '../tipos';

export function DetalheItemPagina() {
  const { id = '' } = useParams();
  return (
    <AguardaCardapio>
      {(itens) => {
        const item = encontrarItem(itens, id);
        if (!item) {
          return (
            <MensagemEstado tipo="vazio" titulo="Item não encontrado">
              Esse item não existe no cardápio. <Link to="/">Voltar ao cardápio</Link>.
            </MensagemEstado>
          );
        }
        return <FormularioDoItem key={item.id} item={item} itens={itens} />;
      }}
    </AguardaCardapio>
  );
}

interface FormularioDoItemProps {
  item: ItemCardapio;
  itens: ItemCardapio[];
}

function FormularioDoItem({ item, itens }: FormularioDoItemProps) {
  useTitulo(item.nome);
  const { adicionar } = useCarrinho();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [observacao, setObservacao] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  const linha = { itemId: item.id, adicionaisIds: selecionados, observacao, quantidade };
  const precoLinha = precoDaLinha(linha, itens); // recalculado a cada mudança

  function alternar(adicionalId: string) {
    setSelecionados((atuais) =>
      atuais.includes(adicionalId) ? atuais.filter((atual) => atual !== adicionalId) : [...atuais, adicionalId],
    );
    setAdicionado(false);
  }

  return (
    <article className="detalhe-item">
      <Link className="voltar" to="/">
        Voltar ao cardápio
      </Link>
      <h1 className="titulo-pagina">{item.nome}</h1>
      <p className="subtitulo">
        {ROTULOS_CATEGORIA[item.categoria]} · {formatarCentavos(item.preco)}
      </p>
      <p>{item.descricao}</p>

      {!item.disponivel ? (
        <MensagemEstado tipo="vazio" titulo="Item esgotado">
          Hoje não temos esse item. Escolha outro no <Link to="/">cardápio</Link>.
        </MensagemEstado>
      ) : (
        <div className="etapa-form">
          <SeletorAdicionais adicionais={item.adicionais} selecionados={selecionados} aoAlternar={alternar} />
          <div className="campo">
            <label htmlFor="observacao">Observação (opcional)</label>
            <textarea
              id="observacao"
              rows={2}
              maxLength={140}
              placeholder="Ex.: sem cebola"
              value={observacao}
              onChange={(evento) => setObservacao(evento.target.value)}
            />
          </div>
          <div className="linha-acao">
            <ControleQuantidade
              valor={quantidade}
              rotulo={item.nome}
              minimo={1}
              aoAlterar={(novo) => {
                setQuantidade(novo);
                setAdicionado(false);
              }}
            />
            <p className="preco preco--grande" aria-live="polite">
              <span className="so-leitor">Preço da linha: </span>
              {formatarCentavos(precoLinha)}
            </p>
          </div>
          <button
            type="button"
            className="botao botao--primario botao--grande"
            onClick={() => {
              adicionar(linha);
              setAdicionado(true);
            }}
          >
            Adicionar ao carrinho
          </button>
          <p role="status" aria-live="polite">
            {adicionado && (
              <>
                Adicionado ao carrinho. <Link to="/carrinho">Ver carrinho</Link>
              </>
            )}
          </p>
        </div>
      )}
    </article>
  );
}
