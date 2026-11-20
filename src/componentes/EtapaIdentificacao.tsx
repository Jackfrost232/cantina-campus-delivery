import { somenteDigitos } from '../dominio/entrega';
import type { DadosCheckout, ErrosCheckout } from '../tipos';
import { CampoTexto } from './CampoTexto';

interface EtapaProps {
  dados: DadosCheckout;
  erros: ErrosCheckout;
  aoAlterar: (parcial: Partial<DadosCheckout>) => void;
}

export function EtapaIdentificacao({ dados, erros, aoAlterar }: EtapaProps) {
  return (
    <div className="etapa-form">
      <CampoTexto
        id="campo-nome"
        rotulo="Nome"
        valor={dados.nome}
        aoAlterar={(nome) => aoAlterar({ nome })}
        erro={erros.nome}
        autoCompletar="name"
        obrigatorio
      />
      <CampoTexto
        id="campo-telefone"
        rotulo="Telefone com DDD"
        valor={dados.telefone}
        aoAlterar={(telefone) => aoAlterar({ telefone: somenteDigitos(telefone).slice(0, 11) })}
        erro={erros.telefone}
        ajuda="Só números. Ex.: 99999999999"
        tipo="tel"
        modo="tel"
        autoCompletar="tel"
        obrigatorio
      />
    </div>
  );
}
