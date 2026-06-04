import { getSales, getSalesSummary } from "@/actions/orders";
import { ORDER_STATUS } from "@/lib/constants/orders";

function formatDate(date: Date) {
  return new Date(date).toLocaleString("es-SV", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_STYLES: Record<string, string> = {
  [ORDER_STATUS.PENDIENTE]: "bg-slate-100 text-slate-600",
  [ORDER_STATUS.PREPARANDO]: "bg-orange-100 text-orange-700",
  [ORDER_STATUS.ENTREGADO]: "bg-green-100 text-green-700",
};

export default async function VentasPage() {
  const [summary, sales] = await Promise.all([getSalesSummary(), getSales()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consulta de Ventas</h1>
        <p className="text-slate-500">Historial de pedidos y resumen del día.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Ingresos Hoy</span>
          <div className="mt-2 text-3xl font-bold text-orange-400">${summary.revenueToday.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Órdenes Completadas</span>
          <div className="mt-2 text-3xl font-bold text-slate-900">{summary.completedToday}</div>
        </div>
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Órdenes Activas</span>
          <div className="mt-2 text-3xl font-bold text-slate-900">{summary.activeOrders}</div>
        </div>
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
          <div className="mt-2 text-3xl font-bold text-slate-900">${summary.averageTicket.toFixed(2)}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-900">Últimos Pedidos</h2>
        </div>
        {sales.length === 0 ? (
          <div className="p-10 text-center text-slate-500">Aún no se han registrado pedidos.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Pedido</th>
                  <th className="px-6 py-3">Entrega</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Pago</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono font-semibold text-slate-900">#{sale.id.slice(0, 6).toUpperCase()}</td>
                    <td className="px-6 py-3 text-slate-600">{sale.deliveryType}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[sale.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sale.paymentStatus === "Pagado" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {sale.paymentStatus}{sale.paymentMethod ? ` · ${sale.paymentMethod}` : ""}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{formatDate(sale.createdAt)}</td>
                    <td className="px-6 py-3 text-right font-bold text-slate-900">${Number(sale.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
