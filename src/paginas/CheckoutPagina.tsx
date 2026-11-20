import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AguardaCardapio } from '../componentes/AguardaCardapio';
import { EtapaEntrega } from '../componentes/EtapaEntrega';
import { EtapaIdentificacao } from '../componentes/EtapaIdentificacao';
import { EtapaPagamento } from '../componentes/EtapaPagamento';
import { EtapaRevisao } from '../componentes/EtapaRevisao';
import { IndicadorEtapas } from '../componentes/IndicadorEtapas';
import { MensagemEstado } from '../componentes/MensagemEstado';
import { ResumoValores } from '../componentes/ResumoValores';
import { itensIndisponiveis } from '../dominio/carrinho';
import {
  DADOS_INICIAIS,
  montarPedido,
  primeiroCampoInvalido,
  validarEntregaEtapa,
  validarIdentificacao,
  validarPagamentoEtapa,
} from '../dominio/checkout';
import { calcularResumo, temFreteGratis, valorDosProdutos } from '../dominio/precos';
import { useCarrinho } from '../contexto/useCarrinho';
import { usePedidos } from '../contexto/usePedidos';
import { useTitulo } from '../contexto/useTitulo';
import { enviarPedido } from '../servicos/pedidos';
import type { DadosCheckout, ErrosCheckout, ItemCardapio } from '../tipos';

const ETAPAS = ['Identificação', 'Entrega', 'Pagamento', 'Revisão'];

export function CheckoutPagina() {
  useTitulo('Checkout');
  return (
    <section aria-labelledby="titulo-checkout">
      <h1 id="titulo-checkout" className="titulo-pagina">
        Checkout
      </h1>
      <AguardaCardapio>{(itens) => <FluxoDoCheckout itens={itens} />}</AguardaCardapio>
    </section>
  );
}

interface FluxoDoCheckoutProps {
  itens: ItemCardapio[];
}

function FluxoDoCheckout({ itens }: FluxoDoCheckoutProps) {
  const navegar = useNavigate();
  const { linhas, limpar } = useCarrinho();
  const { registrarPedido, maiorNumero } = usePedidos();
  const [etapa, setEtapa] = useState(0);
  const [dados, setDados] = useState<DadosCheckout>(DADOS_INICIAIS);
  const [erros, setErros] = useState<ErrosCheckout>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const tituloEtapa = useRef<HTMLHeadingElement>(null);

  const resumo = useMemo(
    () => calcularResumo(linhas, itens, { modo: dados.modo, pagamento: dados.pagamento }),
    [linhas, itens, dados.modo, dados.pagamento],
  );
  const produtos = valorDosProdutos(resumo);
  const freteGratis = dados.modo === 'entrega' && temFreteGratis(produtos);
  const indisponiveis = itensIndisponiveis(linhas, itens);

  // Ao trocar de etapa, o foco vai para o título dela (leitor de tela e teclado).
  useEffect(() => {
    tituloEtapa.current?.focus();
  }, [etapa]);

  if (linhas.length === 0) {
    return (
      <MensagemEstado tipo="vazio" titulo="Seu carrinho está vazio">
        Adicione itens no <Link to="/">cardápio</Link> antes de finalizar.
      </MensagemEstado>
    );
  }
  if (indisponiveis.length > 0) {
    return (
      <MensagemEstado tipo="erro" titulo="Há itens indisponíveis no carrinho">
        Remova no <Link to="/carrinho">carrinho</Link>: {indisponiveis.join(', ')}.
      </MensagemEstado>
    );
  }

  function alterar(parcial: Partial<DadosCheckout>) {
    setDados((atuais) => ({ ...atuais, ...parcial }));
    setErros({});
  }

  function validar(numeroEtapa: number): ErrosCheckout {
    if (numeroEtapa === 0) return validarIdentificacao(dados);
    if (numeroEtapa === 1) return validarEntregaEtapa(dados, produtos);
    if (numeroEtapa === 2) return validarPagamentoEtapa(dados, resumo.total);
    return {};
  }

  function mostrarErros(novos: ErrosCheckout): boolean {
    setErros(novos);
    const primeiro = primeiroCampoInvalido(novos);
    if (primeiro) {
      document.getElementById(`campo-${primeiro}`)?.focus(); // foco no primeiro campo inválido
      return true;
    }
    return false;
  }

  function avancar() {
    if (!mostrarErros(validar(etapa))) {
      setEtapa(etapa + 1);
    }
  }

  function irParaEtapa(numero: number) {
    setErros({});
    setErroEnvio('');
    setEtapa(numero);
  }

  async function confirmar() {
    // Revalida tudo: se algo ficou inválido, volta para a primeira etapa com problema.
    for (let numero = 0; numero < 3; numero += 1) {
      const encontrados = validar(numero);
      if (Object.keys(encontrados).length > 0) {
        setEtapa(numero);
        setTimeout(() => mostrarErros(encontrados), 0);
        return;
      }
    }
    setEnviando(true);
    setErroEnvio('');
    try {
      const pedido = await enviarPedido(montarPedido(dados, linhas, itens), maiorNumero);
      registrarPedido(pedido);
      limpar();
      navegar(`/pedidos/${pedido.numero}`, { replace: true });
    } catch (erro) {
      // O carrinho continua como estava (C13).
      setErroEnvio(erro instanceof Error ? erro.message : 'Falha no envio do pedido.');
      setEnviando(false);
    }
  }

  const ultima = etapa === ETAPAS.length - 1;

  return (
    <>
      <IndicadorEtapas etapas={ETAPAS} atual={etapa} />
      <div className="layout-checkout">
        <div className="painel">
          <h2 className="painel__titulo" tabIndex={-1} ref={tituloEtapa}>
            {etapa + 1}. {ETAPAS[etapa]}
          </h2>

          {etapa === 0 && <EtapaIdentificacao dados={dados} erros={erros} aoAlterar={alterar} />}
          {etapa === 1 && <EtapaEntrega dados={dados} erros={erros} aoAlterar={alterar} />}
          {etapa === 2 && (
            <EtapaPagamento dados={dados} erros={erros} resumo={resumo} freteGratis={freteGratis} aoAlterar={alterar} />
          )}
          {etapa === 3 && (
            <EtapaRevisao pedido={montarPedido(dados, linhas, itens)} freteGratis={freteGratis} aoEditar={irParaEtapa} />
          )}

          {erroEnvio && (
            <MensagemEstado tipo="erro" titulo="Não foi possível enviar o pedido">
              {erroEnvio} Seu carrinho foi mantido.
            </MensagemEstado>
          )}

          <div className="acoes">
            {etapa > 0 && (
              <button type="button" className="botao" onClick={() => irParaEtapa(etapa - 1)} disabled={enviando}>
                Voltar
              </button>
            )}
            {ultima ? (
              <button
                type="button"
                className="botao botao--primario botao--grande"
                onClick={confirmar}
                disabled={enviando}
                aria-busy={enviando}
              >
                {enviando ? 'Enviando pedido…' : 'Confirmar pedido'}
              </button>
            ) : (
              <button type="button" className="botao botao--primario" onClick={avancar}>
                Continuar
              </button>
            )}
          </div>
        </div>

        {etapa < 2 && (
          <aside>
            <ResumoValores resumo={resumo} freteGratis={freteGratis}>
              <p className="detalhe">
                <Link to="/carrinho">Editar carrinho</Link>
              </p>
            </ResumoValores>
          </aside>
        )}
      </div>
    </>
  );
}
