/** Leitura defensiva: chave ausente, JSON quebrado ou formato inesperado viram o valor padrão. */
export function lerArmazenado<T>(
  chave: string,
  validar: (valor: unknown) => valor is T,
  padrao: T,
): T {
  try {
    const bruto = localStorage.getItem(chave);
    if (bruto === null) {
      return padrao;
    }
    const valor: unknown = JSON.parse(bruto);
    return validar(valor) ? valor : padrao;
  } catch {
    return padrao;
  }
}

/** Escrita protegida: sem espaço ou com armazenamento bloqueado, a sessão segue valendo. */
export function gravarArmazenado(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // ignora: os dados continuam na memória até recarregar
  }
}
