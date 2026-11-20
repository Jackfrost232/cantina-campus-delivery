import { formatarCentavos } from '../dominio/formatos';
import type { Adicional } from '../tipos';

interface SeletorAdicionaisProps {
  adicionais: Adicional[];
  selecionados: string[];
  aoAlternar: (id: string) => void;
}

export function SeletorAdicionais({ adicionais, selecionados, aoAlternar }: SeletorAdicionaisProps) {
  if (adicionais.length === 0) {
    return null;
  }
  return (
    <fieldset className="grupo">
      <legend>Adicionais</legend>
      {adicionais.map((adicional) => (
        <label key={adicional.id} className="opcao">
          <input
            type="checkbox"
            checked={selecionados.includes(adicional.id)}
            onChange={() => aoAlternar(adicional.id)}
          />
          <span className="opcao__texto">
            {adicional.nome} <span className="opcao__extra">+ {formatarCentavos(adicional.preco)}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
