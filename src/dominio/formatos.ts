/** Formata centavos no padrão brasileiro: 2875 -> "R$ 28,75". */
export function formatarCentavos(centavos: number): string {
  const negativo = centavos < 0;
  const absoluto = Math.abs(Math.round(centavos));
  const reais = Math.floor(absoluto / 100);
  const resto = absoluto % 100;
  const inteiro = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negativo ? '-' : ''}R$ ${inteiro},${String(resto).padStart(2, '0')}`;
}

/** Converte o texto digitado em reais ("50", "50,00", "1.234,56") para centavos. */
export function converterReaisParaCentavos(texto: string): number | null {
  const limpo = texto.trim().replace(/^R\$\s*/i, '').replace(/\s/g, '');
  if (limpo === '') {
    return null;
  }
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  if (!/^\d+(\.\d{1,2})?$/.test(normal)) {
    return null;
  }
  return Math.round(parseFloat(normal) * 100);
}

/** Percentual arredondado com Math.round, sempre em centavos inteiros (regra C1). */
export function aplicarPercentual(valor: number, percentual: number): number {
  return Math.round((valor * percentual) / 100);
}

export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return 'Data não informada';
  }
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
