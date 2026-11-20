import { Link, NavLink } from 'react-router-dom';
import { useCarrinho } from '../contexto/useCarrinho';
import { useTema } from '../contexto/useTema';

export function Cabecalho() {
  const { totalUnidades } = useCarrinho();
  const { tema, alternar } = useTema();

  return (
    <header className="cabecalho">
      <div className="cabecalho__interno">
        <Link to="/" className="marca" aria-label="Cantina do Campus Delivery, cardápio">
          <span aria-hidden="true">🍴</span>
          <span>
            Cantina do Campus <small>Delivery</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Navegação principal">
          <NavLink to="/" end>
            Cardápio
          </NavLink>
          <NavLink to="/pedidos">Meus pedidos</NavLink>
          <NavLink to="/carrinho">
            Carrinho
            {totalUnidades > 0 && (
              <span className="contador" aria-label={`${totalUnidades} itens no carrinho`}>
                {totalUnidades}
              </span>
            )}
          </NavLink>
        </nav>
        <button
          type="button"
          className="botao-tema"
          aria-pressed={tema === 'escuro'}
          onClick={alternar}
        >
          <span aria-hidden="true">{tema === 'escuro' ? '☀️' : '🌙'}</span> Modo escuro
        </button>
      </div>
    </header>
  );
}
