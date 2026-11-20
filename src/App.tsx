import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Cabecalho } from './componentes/Cabecalho';
import { Rodape } from './componentes/Rodape';
import { CardapioProvider } from './contexto/CardapioProvider';
import { CarrinhoProvider } from './contexto/CarrinhoProvider';
import { PedidosProvider } from './contexto/PedidosProvider';
import { AcompanhamentoPagina } from './paginas/AcompanhamentoPagina';
import { CardapioPagina } from './paginas/CardapioPagina';
import { CarrinhoPagina } from './paginas/CarrinhoPagina';
import { CheckoutPagina } from './paginas/CheckoutPagina';
import { DetalheItemPagina } from './paginas/DetalheItemPagina';
import { MeusPedidosPagina } from './paginas/MeusPedidosPagina';
import { NaoEncontradaPagina } from './paginas/NaoEncontradaPagina';

function RolagemAoTopo() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <CardapioProvider>
      <CarrinhoProvider>
        <PedidosProvider>
          {/* HashRouter funciona em qualquer hospedagem estática, inclusive ao recarregar uma rota. */}
          <HashRouter>
            <RolagemAoTopo />
            <button
              type="button"
              className="pular"
              onClick={() => document.getElementById('conteudo')?.focus()}
            >
              Pular para o conteúdo
            </button>
            <Cabecalho />
            <main id="conteudo" className="principal" tabIndex={-1}>
              <Routes>
                <Route path="/" element={<CardapioPagina />} />
                <Route path="/itens/:id" element={<DetalheItemPagina />} />
                <Route path="/carrinho" element={<CarrinhoPagina />} />
                <Route path="/checkout" element={<CheckoutPagina />} />
                <Route path="/pedidos" element={<MeusPedidosPagina />} />
                <Route path="/pedidos/:numero" element={<AcompanhamentoPagina />} />
                <Route path="*" element={<NaoEncontradaPagina />} />
              </Routes>
            </main>
            <Rodape />
          </HashRouter>
        </PedidosProvider>
      </CarrinhoProvider>
    </CardapioProvider>
  );
}
