interface CampoTextoProps {
  id: string;
  rotulo: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  erro?: string;
  ajuda?: string;
  tipo?: 'text' | 'tel' | 'email';
  modo?: 'text' | 'numeric' | 'decimal' | 'tel';
  autoCompletar?: string;
  obrigatorio?: boolean;
  somenteLeitura?: boolean;
  limite?: number;
}

export function CampoTexto({
  id,
  rotulo,
  valor,
  aoAlterar,
  erro,
  ajuda,
  tipo = 'text',
  modo,
  autoCompletar,
  obrigatorio = false,
  somenteLeitura = false,
  limite,
}: CampoTextoProps) {
  const descricao = [ajuda ? `${id}-ajuda` : '', erro ? `${id}-erro` : ''].filter(Boolean).join(' ');

  return (
    <div className={erro ? 'campo campo--erro' : 'campo'}>
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        type={tipo}
        inputMode={modo}
        autoComplete={autoCompletar}
        value={valor}
        maxLength={limite}
        readOnly={somenteLeitura}
        required={obrigatorio}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao || undefined}
        onChange={(evento) => aoAlterar(evento.target.value)}
      />
      {ajuda && (
        <p id={`${id}-ajuda`} className="campo__ajuda">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} className="campo__erro">
          {erro}
        </p>
      )}
    </div>
  );
}
