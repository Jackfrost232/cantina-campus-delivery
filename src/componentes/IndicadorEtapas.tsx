interface IndicadorEtapasProps {
  etapas: string[];
  atual: number;
}

export function IndicadorEtapas({ etapas, atual }: IndicadorEtapasProps) {
  return (
    <ol className="etapas" aria-label="Etapas do checkout">
      {etapas.map((etapa, indice) => (
        <li
          key={etapa}
          className={
            indice === atual ? 'etapas__item etapas__item--atual' : indice < atual ? 'etapas__item etapas__item--feita' : 'etapas__item'
          }
          aria-current={indice === atual ? 'step' : undefined}
        >
          <span className="etapas__numero" aria-hidden="true">
            {indice < atual ? '✓' : indice + 1}
          </span>
          <span>
            {etapa}
            {indice < atual && <span className="so-leitor"> (concluída)</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
