export type Tema = 'claro' | 'escuro';

/** Escolha guardada vale; sem ela, segue a preferência do sistema. */
export function resolverTema(guardado: unknown, sistemaPrefereEscuro: boolean): Tema {
  if (guardado === 'claro' || guardado === 'escuro') {
    return guardado;
  }
  return sistemaPrefereEscuro ? 'escuro' : 'claro';
}
