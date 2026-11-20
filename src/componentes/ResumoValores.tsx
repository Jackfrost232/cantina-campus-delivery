import type { ReactNode } from 'react';
import { formatarCentavos } from '../dominio/formatos';
import type { ResumoValores as Resumo } from '../tipos';

interface ResumoValoresProps {
  resumo: Resumo;
  freteGratis?: boolean;
  children?: ReactNode;
}

/** Mostra sempre os cinco valores, mesmo os zerados (C6). */
export function ResumoValores({ resumo, freteGratis = false, children }: ResumoValoresProps) {
  return (
    <section className="resumo" aria-label="Resumo de valores">
      <dl>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatarCentavos(resumo.subtotal)}</dd>
        </div>
        <div>
          <dt>Desconto combo</dt>
          <dd>{formatarCentavos(resumo.descontoCombo)}</dd>
        </div>
        <div>
          <dt>Desconto Pix</dt>
          <dd>{formatarCentavos(resumo.descontoPix)}</dd>
        </div>
        <div>
          <dt>Taxa de entrega</dt>
          <dd>
            {formatarCentavos(resumo.taxaEntrega)}
            {freteGratis && <span className="etiqueta etiqueta--ok">Frete grátis</span>}
          </dd>
        </div>
        <div className="resumo__total">
          <dt>Total</dt>
          <dd>{formatarCentavos(resumo.total)}</dd>
        </div>
      </dl>
      {children}
    </section>
  );
}
