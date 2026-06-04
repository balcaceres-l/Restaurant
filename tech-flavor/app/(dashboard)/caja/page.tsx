export default function CajaDashboard() {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Caja</h1>
          <p className="text-sm text-gray-500">Operaciones de cobro y gestión de pedidos</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Total en caja</div>
          <div className="mt-3 text-2xl font-semibold">$3,250</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Transacciones hoy</div>
          <div className="mt-3 text-2xl font-semibold">86</div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Pago pendiente</div>
          <div className="mt-3 text-2xl font-semibold">2</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Pedidos en curso</h3>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-2">#</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody className="mt-2 text-gray-700">
            <tr className="border-t">
              <td className="py-3">#342</td>
              <td>María P.</td>
              <td>En preparación</td>
              <td className="text-right">$24.00</td>
            </tr>
            <tr className="border-t">
              <td className="py-3">#343</td>
              <td>Delivery</td>
              <td>En entrega</td>
              <td className="text-right">$18.50</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
