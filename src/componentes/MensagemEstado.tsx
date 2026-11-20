import type { ReactNode } from 'react';

type TipoEstado = 'carregando' | 'erro' | 'vazio';

interface MensagemEstadoProps {
  tipo: TipoEstado;
  titulo: string;
  children?: ReactNode;
  aoTentarDeNovo?: () => void;
}

const ICONES: Record<TipoEstado, string> = { carregando: '◴', erro: '!', vazio: '?' };

export function MensagemEstado({ tipo, titulo, children, aoTentarDeNovo }: MensagemEstadoProps) {
  return (
    <div className={`estado estado--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <span className="estado__icone" aria-hidden="true">
        {ICONES[tipo]}
      </span>
      <div>
        <p className="estado__titulo">{titulo}</p>
        {children && <div className="estado__texto">{children}</div>}
        {tipo === 'erro' && aoTentarDeNovo && (
          <button type="button" className="botao botao--secundario" onClick={aoTentarDeNovo}>
            Tentar de novo
          </button>
        )}
      </div>
    </div>
  );
}
