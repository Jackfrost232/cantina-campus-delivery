import { Link } from 'react-router-dom';
import { MensagemEstado } from '../componentes/MensagemEstado';
import { useTitulo } from '../contexto/useTitulo';

export function NaoEncontradaPagina() {
  useTitulo('Página não encontrada');
  return (
    <MensagemEstado tipo="vazio" titulo="Página não encontrada">
      O endereço que você abriu não existe. <Link to="/">Ir para o início</Link>.
    </MensagemEstado>
  );
}
