import { getSales, getSalesSummary } from "@/actions/orders";
import { SalesTable } from "@/components/admin/SalesTable";

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
          <div className="mt-2 text-3xl font-bold text-orange-400 tabular-nums">${summary.revenueToday.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Órdenes Pagadas</span>
          <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{summary.completedToday}</div>
        </div>
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Órdenes Activas</span>
          <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{summary.activeOrders}</div>
        </div>
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
          <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">${summary.averageTicket.toFixed(2)}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Últimos Pedidos</h2>
          <span className="text-xs text-slate-400">Clic en un pedido para ver el detalle</span>
        </div>
        {sales.length === 0 ? (
          <div className="p-10 text-center text-slate-500">Aún no se han registrado pedidos.</div>
        ) : (
          <SalesTable sales={sales} />
        )}
      </div>
    </div>
  );
}
