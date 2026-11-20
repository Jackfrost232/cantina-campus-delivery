import { useRef, useState } from 'react';
import { enderecoAposBusca, formatarCep, validarCep } from '../dominio/entrega';
import type { BuscaAnterior } from '../dominio/entrega';
import { formatarCentavos } from '../dominio/formatos';
import { FRETE_GRATIS_A_PARTIR, PEDIDO_MINIMO_ENTREGA, TAXA_ENTREGA } from '../dominio/precos';
import { buscarCep } from '../servicos/viacep';
import type { DadosCheckout, ErrosCheckout, ModoEntrega } from '../tipos';
import { CampoTexto } from './CampoTexto';
import { GrupoOpcoes } from './GrupoOpcoes';

interface EtapaEntregaProps {
  dados: DadosCheckout;
  erros: ErrosCheckout;
  aoAlterar: (parcial: Partial<DadosCheckout>) => void;
}

type SituacaoCep = 'ocioso' | 'buscando' | 'encontrado' | 'erro';

export function EtapaEntrega({ dados, erros, aoAlterar }: EtapaEntregaProps) {
  const [situacao, setSituacao] = useState<SituacaoCep>(dados.cidade ? 'encontrado' : 'ocioso');
  const [mensagem, setMensagem] = useState('');
  const requisicao = useRef<AbortController | null>(null);
  // Ao voltar para esta etapa, o endereço na tela é tratado como vindo do CEP já buscado.
  const buscaAnterior = useRef<BuscaAnterior>({
    cep: dados.cidade ? dados.cep : '',
    rua: dados.cidade ? dados.rua : '',
    bairro: dados.cidade ? dados.bairro : '',
  });

  async function consultar() {
    const erroFormato = validarCep(dados.cep);
    if (erroFormato) {
      setSituacao('erro');
      setMensagem(erroFormato); // sem chamar a API (C12)
      aoAlterar({ cidade: '', uf: '' });
      return;
    }
    requisicao.current?.abort();
    const controle = new AbortController();
    requisicao.current = controle;
    setSituacao('buscando');
    setMensagem('');
    try {
      const endereco = await buscarCep(dados.cep, controle.signal);
      // Balsas tem CEP único: rua e bairro podem vir vazios, e a pessoa digita.
      // O que sobrou da busca de outro CEP é descartado.
      const { rua, bairro } = enderecoAposBusca(
        dados.cep,
        { rua: dados.rua, bairro: dados.bairro },
        buscaAnterior.current,
        { rua: endereco.logradouro, bairro: endereco.bairro },
      );
      buscaAnterior.current = { cep: dados.cep, rua, bairro };
      aoAlterar({ cidade: endereco.cidade, uf: endereco.uf, rua, bairro });
      setSituacao('encontrado');
    } catch (erro) {
      if (controle.signal.aborted) {
        return;
      }
      aoAlterar({ cidade: '', uf: '' });
      setSituacao('erro');
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível consultar o CEP.');
    }
  }

  return (
    <div className="etapa-form">
      <GrupoOpcoes<ModoEntrega>
        nome="modo"
        legenda="Como você quer receber?"
        selecionado={dados.modo}
        aoSelecionar={(modo) => aoAlterar({ modo })}
        idPrimeiraOpcao="campo-modo"
        erro={erros.modo}
        opcoes={[
          {
            valor: 'entrega',
            rotulo: 'Entrega em Balsas-MA',
            descricao: `Pedido mínimo de ${formatarCentavos(PEDIDO_MINIMO_ENTREGA)} em produtos. Taxa de ${formatarCentavos(TAXA_ENTREGA)}, grátis a partir de ${formatarCentavos(FRETE_GRATIS_A_PARTIR)}.`,
          },
          { valor: 'retirada', rotulo: 'Retirada no balcão', descricao: 'Sem taxa de entrega.' },
        ]}
      />

      {dados.modo === 'entrega' && (
        <>
          <div className="campo-com-botao">
            <CampoTexto
              id="campo-cep"
              rotulo="CEP"
              valor={dados.cep}
              aoAlterar={(cep) => aoAlterar({ cep: formatarCep(cep), cidade: '', uf: '' })}
              erro={erros.cep ?? (situacao === 'erro' ? mensagem : undefined)}
              ajuda="Para Balsas, use 65800-000."
              modo="numeric"
              autoCompletar="postal-code"
              obrigatorio
            />
            <button
              type="button"
              className="botao botao--secundario"
              onClick={consultar}
              disabled={situacao === 'buscando'}
            >
              {situacao === 'buscando' ? 'Buscando…' : 'Buscar CEP'}
            </button>
          </div>
          <p className="so-leitor" role="status">
            {situacao === 'buscando' ? 'Buscando o CEP' : situacao === 'encontrado' ? 'CEP encontrado' : ''}
          </p>

          <div className="duas-colunas">
            <CampoTexto id="campo-cidade" rotulo="Cidade" valor={dados.cidade} aoAlterar={() => {}} somenteLeitura />
            <CampoTexto id="campo-uf" rotulo="Estado" valor={dados.uf} aoAlterar={() => {}} somenteLeitura />
          </div>
          <CampoTexto
            id="campo-rua"
            rotulo="Rua"
            valor={dados.rua}
            aoAlterar={(rua) => aoAlterar({ rua })}
            erro={erros.rua}
            autoCompletar="address-line1"
            obrigatorio
          />
          <div className="duas-colunas">
            <CampoTexto
              id="campo-numero"
              rotulo="Número"
              valor={dados.numero}
              aoAlterar={(numero) => aoAlterar({ numero })}
              erro={erros.numero}
              obrigatorio
            />
            <CampoTexto
              id="campo-bairro"
              rotulo="Bairro"
              valor={dados.bairro}
              aoAlterar={(bairro) => aoAlterar({ bairro })}
              erro={erros.bairro}
              obrigatorio
            />
          </div>
          <CampoTexto
            id="campo-complemento"
            rotulo="Complemento (opcional)"
            valor={dados.complemento}
            aoAlterar={(complemento) => aoAlterar({ complemento })}
            autoCompletar="address-line2"
          />
        </>
      )}
    </div>
  );
}
