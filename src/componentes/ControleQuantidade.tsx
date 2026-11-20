import { QUANTIDADE_MAXIMA } from '../dominio/carrinho';

interface ControleQuantidadeProps {
  valor: number;
  rotulo: string;
  minimo: number;
  aoAlterar: (quantidade: number) => void;
}

export function ControleQuantidade({ valor, rotulo, minimo, aoAlterar }: ControleQuantidadeProps) {
  return (
    <div className="quantidade" role="group" aria-label={`Quantidade de ${rotulo}`}>
      <button
        type="button"
        className="quantidade__botao"
        aria-label={`Diminuir quantidade de ${rotulo}`}
        disabled={valor <= minimo}
        onClick={() => aoAlterar(valor - 1)}
      >
        −
      </button>
      <output className="quantidade__valor" aria-live="polite">
        {valor}
      </output>
      <button
        type="button"
        className="quantidade__botao"
        aria-label={`Aumentar quantidade de ${rotulo}`}
        disabled={valor >= QUANTIDADE_MAXIMA}
        onClick={() => aoAlterar(valor + 1)}
      >
        +
      </button>
    </div>
  );
}
