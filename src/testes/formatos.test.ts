import { describe, expect, it } from 'vitest';
import { aplicarPercentual, converterReaisParaCentavos, formatarCentavos } from '../dominio/formatos';

describe('formatarCentavos (C1)', () => {
  it('usa o formato brasileiro', () => {
    expect(formatarCentavos(2875)).toBe('R$ 28,75');
    expect(formatarCentavos(0)).toBe('R$ 0,00');
    expect(formatarCentavos(5)).toBe('R$ 0,05');
    expect(formatarCentavos(123456)).toBe('R$ 1.234,56');
  });
});

describe('converterReaisParaCentavos', () => {
  it('aceita as formas comuns de digitar', () => {
    expect(converterReaisParaCentavos('50')).toBe(5000);
    expect(converterReaisParaCentavos('50,00')).toBe(5000);
    expect(converterReaisParaCentavos('R$ 60,5')).toBe(6050);
    expect(converterReaisParaCentavos('1.234,56')).toBe(123456);
  });

  it('recusa texto inválido ou vazio', () => {
    expect(converterReaisParaCentavos('')).toBeNull();
    expect(converterReaisParaCentavos('abc')).toBeNull();
    expect(converterReaisParaCentavos('12,345')).toBeNull();
  });
});

describe('aplicarPercentual', () => {
  it('arredonda com Math.round', () => {
    expect(aplicarPercentual(2500, 5)).toBe(125);
    expect(aplicarPercentual(10, 5)).toBe(1);
  });
});
