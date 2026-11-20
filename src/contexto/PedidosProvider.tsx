import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { cancelarPedido } from '../dominio/pedido';
import { ehListaDePedidos } from '../dominio/validadores';
import { gravarArmazenado, lerArmazenado } from '../servicos/armazenamento';
import type { Pedido } from '../tipos';
import { PedidosContexto } from './pedidosContexto';
import type { PedidosValor } from './pedidosContexto';

const CHAVE = 'cantina:pedidos';

function lerPedidos(): Pedido[] {
  return lerArmazenado<Pedido[]>(CHAVE, ehListaDePedidos, []);
}

export function PedidosProvider({ children }: { children: ReactNode }) {
  const [pedidos, setPedidos] = useState<Pedido[]>(lerPedidos);

  useEffect(() => {
    gravarArmazenado(CHAVE, pedidos);
  }, [pedidos]);

  const registrarPedido = useCallback((pedido: Pedido) => {
    setPedidos((atuais) => [pedido, ...atuais.filter((item) => item.numero !== pedido.numero)]);
  }, []);

  const cancelar = useCallback((numero: number) => {
    const agora = new Date();
    setPedidos((atuais) =>
      atuais.map((pedido) => (pedido.numero === numero ? cancelarPedido(pedido, agora) : pedido)),
    );
  }, []);

  const valor = useMemo<PedidosValor>(
    () => ({
      pedidos,
      maiorNumero: pedidos.reduce((maior, pedido) => Math.max(maior, pedido.numero), 0),
      registrarPedido,
      cancelar,
    }),
    [pedidos, registrarPedido, cancelar],
  );
  return <PedidosContexto.Provider value={valor}>{children}</PedidosContexto.Provider>;
}
