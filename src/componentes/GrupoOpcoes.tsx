export interface OpcaoDoGrupo<T extends string> {
  valor: T;
  rotulo: string;
  descricao?: string;
}

interface GrupoOpcoesProps<T extends string> {
  nome: string;
  legenda: string;
  opcoes: OpcaoDoGrupo<T>[];
  selecionado: T;
  aoSelecionar: (valor: T) => void;
  idPrimeiraOpcao?: string;
  erro?: string;
}

export function GrupoOpcoes<T extends string>({
  nome,
  legenda,
  opcoes,
  selecionado,
  aoSelecionar,
  idPrimeiraOpcao,
  erro,
}: GrupoOpcoesProps<T>) {
  return (
    <fieldset className="grupo" aria-describedby={erro ? `${nome}-erro` : undefined}>
      <legend>{legenda}</legend>
      {opcoes.map((opcao, indice) => (
        <label key={opcao.valor} className="opcao">
          <input
            type="radio"
            name={nome}
            id={indice === 0 ? idPrimeiraOpcao : undefined}
            value={opcao.valor}
            checked={selecionado === opcao.valor}
            onChange={() => aoSelecionar(opcao.valor)}
          />
          <span className="opcao__texto">
            {opcao.rotulo}
            {opcao.descricao && <span className="opcao__extra">{opcao.descricao}</span>}
          </span>
        </label>
      ))}
      {erro && (
        <p id={`${nome}-erro`} className="campo__erro">
          {erro}
        </p>
      )}
    </fieldset>
  );
}
