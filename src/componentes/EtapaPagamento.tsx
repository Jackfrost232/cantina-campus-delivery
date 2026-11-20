import { formatarCentavos } from '../dominio/formatos';
import { avaliarTroco } from '../dominio/pagamento';
import { PERCENTUAL_PIX } from '../dominio/precos';
import type { DadosCheckout, ErrosCheckout, FormaPagamento, ResumoValores as Resumo } from '../tipos';
import { CampoTexto } from './CampoTexto';
import { GrupoOpcoes } from './GrupoOpcoes';
import { ResumoValores } from './ResumoValores';

interface EtapaPagamentoProps {
  dados: DadosCheckout;
  erros: ErrosCheckout;
  resumo: Resumo;
  freteGratis: boolean;
  aoAlterar: (parcial: Partial<DadosCheckout>) => void;
}

export function EtapaPagamento({ dados, erros, resumo, freteGratis, aoAlterar }: EtapaPagamentoProps) {
  const avaliacao = avaliarTroco(dados.trocoPara, resumo.total);

  return (
    <div className="etapa-form">
      <GrupoOpcoes<FormaPagamento>
        nome="pagamento"
        legenda="Forma de pagamento"
        selecionado={dados.pagamento}
        aoSelecionar={(pagamento) => aoAlterar({ pagamento })}
        opcoes={[
          {
            valor: 'pix',
            rotulo: 'Pix',
            descricao: `${PERCENTUAL_PIX}% de desconto sobre os produtos (a taxa de entrega não tem desconto).`,
          },
          { valor: 'cartao', rotulo: 'Cartão', descricao: 'Pague na entrega ou na retirada, sem desconto.' },
          { valor: 'dinheiro', rotulo: 'Dinheiro', descricao: 'Informe para quanto precisa de troco.' },
        ]}
      />

      {dados.pagamento === 'dinheiro' && (
        <div>
          <CampoTexto
            id="campo-troco"
            rotulo="Troco para quanto?"
            valor={dados.trocoPara}
            aoAlterar={(trocoPara) => aoAlterar({ trocoPara })}
            erro={erros.troco}
            ajuda="Em reais. Ex.: 50 ou 50,00"
            modo="decimal"
            obrigatorio
          />
          <p className="troco" role="status" aria-live="polite">
            {avaliacao.troco !== null ? `Troco: ${formatarCentavos(avaliacao.troco)}` : ''}
          </p>
        </div>
      )}

      <ResumoValores resumo={resumo} freteGratis={freteGratis} />
    </div>
  );
}
