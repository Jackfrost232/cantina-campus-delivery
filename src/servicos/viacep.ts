import { somenteDigitos, validarCep } from '../dominio/entrega';
import { ehRegistro } from '../dominio/validadores';
import { ErroServico } from './erro';

export interface EnderecoViaCep {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : '';
}

/**
 * Busca o endereço pelo CEP. Valida o formato antes de chamar a API (C12) e confere o campo
 * `erro`, porque a ViaCEP responde CEP inexistente com status 200 (C11).
 */
export async function buscarCep(cep: string, sinal?: AbortSignal): Promise<EnderecoViaCep> {
  const erroFormato = validarCep(cep);
  if (erroFormato) {
    throw new ErroServico(erroFormato);
  }
  let resposta: Response;
  try {
    resposta = await fetch(`https://viacep.com.br/ws/${somenteDigitos(cep)}/json/`, { signal: sinal });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') {
      throw erro;
    }
    throw new ErroServico('Não foi possível consultar o CEP. Verifique sua conexão.');
  }
  if (!resposta.ok) {
    throw new ErroServico('Não foi possível consultar o CEP agora.', resposta.status);
  }
  let dados: unknown;
  try {
    dados = await resposta.json();
  } catch {
    throw new ErroServico('A resposta da consulta de CEP veio incompleta.', resposta.status);
  }
  if (!ehRegistro(dados) || dados.erro !== undefined) {
    throw new ErroServico('CEP não encontrado');
  }
  return {
    logradouro: texto(dados.logradouro),
    bairro: texto(dados.bairro),
    cidade: texto(dados.localidade),
    uf: texto(dados.uf),
  };
}
