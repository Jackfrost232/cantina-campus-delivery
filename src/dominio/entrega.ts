import { normalizarTexto } from './cardapio';
import { formatarCentavos } from './formatos';
import { PEDIDO_MINIMO_ENTREGA } from './precos';

export const CIDADE_ATENDIDA = 'Balsas';
export const UF_ATENDIDA = 'MA';
export const MENSAGEM_FORA_DA_AREA = 'Entregamos apenas em Balsas-MA';

export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

/** Valida o formato antes de chamar a API: oito dígitos (C12). */
export function validarCep(texto: string): string | null {
  const digitos = somenteDigitos(texto);
  if (digitos.length === 0) {
    return 'Informe o CEP';
  }
  return digitos.length === 8 ? null : 'O CEP deve ter 8 dígitos';
}

export function formatarCep(texto: string): string {
  const digitos = somenteDigitos(texto).slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

export function cidadeAtendida(cidade: string, uf: string): boolean {
  return (
    normalizarTexto(cidade) === normalizarTexto(CIDADE_ATENDIDA) &&
    uf.trim().toUpperCase() === UF_ATENDIDA
  );
}

export interface RuaEBairro {
  rua: string;
  bairro: string;
}

/** O que a última busca de CEP bem-sucedida deixou nos campos. */
export interface BuscaAnterior extends RuaEBairro {
  cep: string;
}

/**
 * Decide rua e bairro depois de buscar um CEP (C9).
 * - O que a API devolve preenchido vale.
 * - Quando a API devolve vazio (CEP único de Balsas), o campo fica para a pessoa digitar:
 *   mantém o que ela digitou, mas descarta o que veio da busca de outro CEP.
 * - Buscar de novo o mesmo CEP não apaga nada.
 */
export function enderecoAposBusca(
  cepBuscado: string,
  atual: RuaEBairro,
  anterior: BuscaAnterior,
  encontrado: RuaEBairro,
): RuaEBairro {
  const mesmoCep = anterior.cep !== '' && somenteDigitos(anterior.cep) === somenteDigitos(cepBuscado);
  function decidir(campo: keyof RuaEBairro): string {
    if (encontrado[campo] !== '') {
      return encontrado[campo];
    }
    const veioDaBuscaAnterior = anterior[campo] !== '' && atual[campo] === anterior[campo];
    return veioDaBuscaAnterior && !mesmoCep ? '' : atual[campo];
  }
  return { rua: decidir('rua'), bairro: decidir('bairro') };
}

/** C5.1: só há entrega em Balsas-MA. */
export function validarCidadeEntrega(cidade: string, uf: string): string | null {
  return cidadeAtendida(cidade, uf) ? null : MENSAGEM_FORA_DA_AREA;
}

/** C5.2: valor dos produtos (subtotal menos combo) de pelo menos R$ 15,00. */
export function validarPedidoMinimo(valorProdutos: number): string | null {
  return valorProdutos >= PEDIDO_MINIMO_ENTREGA
    ? null
    : `Pedido mínimo para entrega: ${formatarCentavos(PEDIDO_MINIMO_ENTREGA)}`;
}
