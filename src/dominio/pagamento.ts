import { converterReaisParaCentavos, formatarCentavos } from './formatos';

export interface AvaliacaoTroco {
  trocoPara: number | null; // centavos
  troco: number | null; // centavos
  erro: string | null;
}

/** C6: no dinheiro, "Troco para quanto?" é obrigatório e precisa cobrir o total. */
export function avaliarTroco(texto: string, total: number): AvaliacaoTroco {
  if (texto.trim() === '') {
    return { trocoPara: null, troco: null, erro: 'Informe para quanto precisa de troco' };
  }
  const trocoPara = converterReaisParaCentavos(texto);
  if (trocoPara === null) {
    return { trocoPara: null, troco: null, erro: 'Informe um valor válido, como 50,00' };
  }
  if (trocoPara < total) {
    return {
      trocoPara,
      troco: null,
      erro: `O troco não cobre o total do pedido (${formatarCentavos(total)})`,
    };
  }
  return { trocoPara, troco: trocoPara - total, erro: null };
}
