import { describe, expect, it } from 'vitest';
import { pedidosParaCsv } from '../dominio/exportacao';
import { resolverTema } from '../dominio/tema';
import { linha, pedidoExemplo } from './fixtures';

const agora = new Date('2026-11-09T12:00:05.000Z');

describe('resolverTema', () => {
  it('a escolha guardada vence a preferência do sistema', () => {
    expect(resolverTema('claro', true)).toBe('claro');
    expect(resolverTema('escuro', false)).toBe('escuro');
  });

  it('sem escolha, ou com valor corrompido, segue o sistema', () => {
    expect(resolverTema(null, true)).toBe('escuro');
    expect(resolverTema('azul', false)).toBe('claro');
  });
});

describe('pedidosParaCsv', () => {
  it('começa com BOM e o cabeçalho, com ; como separador', () => {
    const csv = pedidosParaCsv([], agora);
    expect(csv.startsWith('\uFEFFNúmero;Data;Situação')).toBe(true);
  });

  it('gera uma linha por pedido, com o total em reais e a situação calculada', () => {
    const linhas = pedidosParaCsv([pedidoExemplo()], agora).trim().split('\r\n');
    expect(linhas).toHaveLength(2);
    const colunas = linhas[1].split(';');
    expect(colunas[0]).toBe('1001');
    expect(colunas[2]).toBe('Recebido');
    expect(colunas[3]).toBe('Entrega');
    expect(colunas[4]).toBe('Pix');
    expect(colunas[5]).toBe('2x Coxinha de frango');
    expect(colunas[6]).toBe('17,35');
  });

  it('protege nomes com ponto e vírgula ou aspas', () => {
    const pedido = pedidoExemplo({
      linhas: [{ ...linha('x', 1), nome: 'Prato "especial"; do dia', precoLinha: 100 }],
    });
    const csv = pedidosParaCsv([pedido], agora);
    expect(csv).toContain('"1x Prato ""especial""; do dia"');
  });
});
