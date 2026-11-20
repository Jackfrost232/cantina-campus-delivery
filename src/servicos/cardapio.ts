import { ehListaDeItens } from '../dominio/validadores';
import type { ItemCardapio } from '../tipos';
import { ErroServico, esperar } from './erro';

// Espera artificial para o estado de carregamento ser visível (arquivo local chega rápido demais).
const ATRASO_MS = 500;

export async function buscarCardapio(): Promise<ItemCardapio[]> {
  await esperar(ATRASO_MS);
  let resposta: Response;
  try {
    resposta = await fetch(`${import.meta.env.BASE_URL}dados/cardapio.json`);
  } catch {
    throw new ErroServico('Não foi possível carregar o cardápio. Verifique sua conexão.');
  }
  if (!resposta.ok) {
    throw new ErroServico(`O cardápio respondeu com erro ${resposta.status}.`, resposta.status);
  }
  let dados: unknown;
  try {
    dados = await resposta.json();
  } catch {
    throw new ErroServico('O cardápio veio incompleto.', resposta.status);
  }
  if (!ehListaDeItens(dados)) {
    throw new ErroServico('O cardápio veio em um formato inesperado.', resposta.status);
  }
  return dados;
}
