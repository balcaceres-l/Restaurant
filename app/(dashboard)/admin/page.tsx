import Link from "next/link";
import { getSalesSummary, getTopProductsToday } from "@/actions/orders";
import { getTableStats } from "@/actions/tables";

export default async function AdminDashboard() {
  const [summary, topProducts, tables] = await Promise.all([
    getSalesSummary(),
    getTopProductsToday(),
    getTableStats(),
  ]);

  const occupancy = tables.active > 0 ? Math.round((tables.occupied / tables.active) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visión Operativa</h1>
        <p className="text-slate-500">Resumen de ventas y estado del restaurante de hoy.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Ingresos Hoy</span>
          <div className="mt-2 text-3xl font-bold text-orange-400 tabular-nums">${summary.revenueToday.toFixed(2)}</div>
          <div className="mt-1 text-sm text-slate-300">{summary.completedToday} órdenes pagadas</div>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Órdenes Activas</span>
          <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{summary.activeOrders}</div>
          <div className="mt-1 text-sm text-slate-500">En proceso de preparación</div>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
          <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">${summary.averageTicket.toFixed(2)}</div>
          <div className="mt-1 text-sm text-slate-500">Por orden pagada</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Más vendidos hoy</h2>
            <Link href="/admin/ventas" className="text-sm font-semibold text-orange-600 hover:underline">Ver ventas</Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">Aún no hay productos vendidos hoy.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.productName} className="flex items-center gap-3">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="flex-1 font-medium text-slate-800 truncate">{p.productName}</span>
                  <span className="text-sm text-slate-500 tabular-nums">{Number(p.quantity)} uds</span>
                  <span className="w-20 text-right font-bold text-slate-900 tabular-nums">${Number(p.revenue).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Mesas</h2>
            <Link href="/admin/mesas" className="text-sm font-semibold text-orange-600 hover:underline">Gestionar</Link>
          </div>
          {tables.active === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No hay mesas activas.</p>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <div className="text-4xl font-bold text-slate-900 tabular-nums">{tables.occupied}/{tables.active}</div>
              <span className="text-sm text-slate-500">mesas ocupadas</span>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${occupancy}%` }} />
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-semibold">{tables.free} libres</span>
                <span className="text-orange-600 font-semibold">{tables.occupied} ocupadas</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
