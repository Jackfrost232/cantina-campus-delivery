import { ROTULOS_CATEGORIA, ORDEM_CATEGORIAS } from '../dominio/cardapio';
import type { FiltrosCardapio as Filtros, OrdemCardapio } from '../dominio/cardapio';
import type { Categoria } from '../tipos';

interface FiltrosCardapioProps {
  filtros: Filtros;
  aoMudar: (parcial: Partial<Filtros>) => void;
}

export function FiltrosCardapio({ filtros, aoMudar }: FiltrosCardapioProps) {
  return (
    <div className="filtros">
      <div className="campo">
        <label htmlFor="filtro-busca">Buscar pelo nome</label>
        <input
          id="filtro-busca"
          type="search"
          autoComplete="off"
          placeholder="Ex.: coxinha"
          value={filtros.busca}
          onChange={(evento) => aoMudar({ busca: evento.target.value })}
        />
      </div>
      <div className="campo">
        <label htmlFor="filtro-categoria">Categoria</label>
        <select
          id="filtro-categoria"
          value={filtros.categoria}
          onChange={(evento) => aoMudar({ categoria: evento.target.value as Categoria | '' })}
        >
          <option value="">Todas as categorias</option>
          {ORDEM_CATEGORIAS.map((categoria) => (
            <option key={categoria} value={categoria}>
              {ROTULOS_CATEGORIA[categoria]}
            </option>
          ))}
        </select>
      </div>
      <div className="campo">
        <label htmlFor="filtro-ordem">Ordenar por</label>
        <select
          id="filtro-ordem"
          value={filtros.ordem}
          onChange={(evento) => aoMudar({ ordem: evento.target.value as OrdemCardapio })}
        >
          <option value="nome">Nome, de A a Z</option>
          <option value="preco">Menor preço</option>
        </select>
      </div>
    </div>
  );
}
