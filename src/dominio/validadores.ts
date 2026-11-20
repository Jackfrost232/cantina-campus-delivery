import type { ItemCardapio, LinhaCarrinho, Pedido } from '../tipos';
import { QUANTIDADE_MAXIMA } from './carrinho';

type Registro = Record<string, unknown>;

export function ehRegistro(valor: unknown): valor is Registro {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function ehTexto(valor: unknown): valor is string {
  return typeof valor === 'string';
}

function ehNumero(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function ehInteiroEntre(valor: unknown, minimo: number, maximo: number): boolean {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= minimo && valor <= maximo;
}

function ehListaDe<T>(valor: unknown, validar: (item: unknown) => item is T): valor is T[] {
  return Array.isArray(valor) && valor.every(validar);
}

export function ehLinhaCarrinho(valor: unknown): valor is LinhaCarrinho {
  return (
    ehRegistro(valor) &&
    ehTexto(valor.itemId) &&
    ehListaDe(valor.adicionaisIds, ehTexto) &&
    ehTexto(valor.observacao) &&
    ehInteiroEntre(valor.quantidade, 1, QUANTIDADE_MAXIMA)
  );
}

export function ehListaDeLinhas(valor: unknown): valor is LinhaCarrinho[] {
  return ehListaDe(valor, ehLinhaCarrinho);
}

function ehItemCardapio(valor: unknown): valor is ItemCardapio {
  return (
    ehRegistro(valor) &&
    ehTexto(valor.id) &&
    ehTexto(valor.nome) &&
    ['salgado', 'bebida', 'doce', 'refeicao'].includes(String(valor.categoria)) &&
    ehInteiroEntre(valor.preco, 0, Number.MAX_SAFE_INTEGER) &&
    typeof valor.disponivel === 'boolean' &&
    ehTexto(valor.descricao) &&
    ehListaDe(
      valor.adicionais,
      (adicional): adicional is { id: string; nome: string; preco: number } =>
        ehRegistro(adicional) &&
        ehTexto(adicional.id) &&
        ehTexto(adicional.nome) &&
        ehInteiroEntre(adicional.preco, 0, Number.MAX_SAFE_INTEGER),
    )
  );
}

export function ehListaDeItens(valor: unknown): valor is ItemCardapio[] {
  return ehListaDe(valor, ehItemCardapio);
}

function ehLinhaPedido(valor: unknown): boolean {
  return ehLinhaCarrinho(valor) && ehRegistro(valor) && ehTexto(valor.nome) && ehNumero(valor.precoLinha);
}

function ehResumo(valor: unknown): boolean {
  return (
    ehRegistro(valor) &&
    ['subtotal', 'descontoCombo', 'descontoPix', 'taxaEntrega', 'total'].every((campo) =>
      ehNumero(valor[campo]),
    )
  );
}

export function ehPedido(valor: unknown): valor is Pedido {
  return (
    ehRegistro(valor) &&
    ehInteiroEntre(valor.numero, 1, Number.MAX_SAFE_INTEGER) &&
    ehTexto(valor.recebidoEm) &&
    !Number.isNaN(Date.parse(valor.recebidoEm)) &&
    (valor.canceladoEm === null || ehTexto(valor.canceladoEm)) &&
    ehRegistro(valor.cliente) &&
    ehTexto(valor.cliente.nome) &&
    ['entrega', 'retirada'].includes(String(valor.modo)) &&
    (valor.endereco === null || ehRegistro(valor.endereco)) &&
    ['pix', 'cartao', 'dinheiro'].includes(String(valor.pagamento)) &&
    (valor.trocoPara === null || ehNumero(valor.trocoPara)) &&
    Array.isArray(valor.linhas) &&
    valor.linhas.every(ehLinhaPedido) &&
    ehResumo(valor.resumo)
  );
}

export function ehListaDePedidos(valor: unknown): valor is Pedido[] {
  return ehListaDe(valor, ehPedido);
}
