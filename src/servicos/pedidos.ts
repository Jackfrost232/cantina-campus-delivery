import type { NovoPedido, Pedido } from '../tipos';
import { ErroServico, esperar } from './erro';

const CHAVE_ULTIMO_NUMERO = 'cantina:ultimo-numero';
const PRIMEIRO_NUMERO = 1000;
const ATRASO_MS = 1500;

function proximoNumero(maiorConhecido: number): number {
  let ultimo = PRIMEIRO_NUMERO;
  try {
    const bruto = Number(localStorage.getItem(CHAVE_ULTIMO_NUMERO));
    if (Number.isInteger(bruto) && bruto >= PRIMEIRO_NUMERO) {
      ultimo = bruto;
    }
  } catch {
    // armazenamento indisponível: cai no valor inicial
  }
  const numero = Math.max(ultimo, maiorConhecido) + 1;
  try {
    localStorage.setItem(CHAVE_ULTIMO_NUMERO, String(numero));
  } catch {
    // sem persistência do contador nesta sessão
  }
  return numero;
}

/**
 * Servidor simulado: espera 1,5 s, devolve o pedido com número sequencial (que persiste entre
 * recargas) e a data/hora de recebimento. Falha quando o nome do cliente é "erro".
 */
export async function enviarPedido(novo: NovoPedido, maiorNumeroConhecido = 0): Promise<Pedido> {
  await esperar(ATRASO_MS);
  if (novo.cliente.nome.trim().toLowerCase() === 'erro') {
    throw new ErroServico('Não foi possível enviar o pedido. Tente novamente em instantes.', 500);
  }
  return {
    ...novo,
    numero: proximoNumero(maiorNumeroConhecido),
    recebidoEm: new Date().toISOString(),
    canceladoEm: null,
  };
}
