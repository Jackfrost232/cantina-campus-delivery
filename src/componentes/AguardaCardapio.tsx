import type { ReactNode } from 'react';
import { useCardapio } from '../contexto/useCardapio';
import type { ItemCardapio } from '../tipos';
import { MensagemEstado } from './MensagemEstado';

interface AguardaCardapioProps {
  children: (itens: ItemCardapio[]) => ReactNode;
}

/** Mostra carregando, erro com "Tentar de novo" ou lista vazia; só então entrega os itens (RC07). */
export function AguardaCardapio({ children }: AguardaCardapioProps) {
  const { estado, recarregar } = useCardapio();

  if (estado.situacao === 'carregando') {
    return (
      <MensagemEstado tipo="carregando" titulo="Carregando o cardápio">
        Buscando os itens da cantina.
      </MensagemEstado>
    );
  }
  if (estado.situacao === 'erro') {
    return (
      <MensagemEstado tipo="erro" titulo="Não foi possível carregar o cardápio" aoTentarDeNovo={recarregar}>
        {estado.mensagem}
      </MensagemEstado>
    );
  }
  if (estado.itens.length === 0) {
    return (
      <MensagemEstado tipo="vazio" titulo="O cardápio está vazio">
        A cantina ainda não cadastrou itens. Volte mais tarde.
      </MensagemEstado>
    );
  }
  return <>{children(estado.itens)}</>;
}
