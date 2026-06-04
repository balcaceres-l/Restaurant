import Link from "next/link";
import { getSalesSummary } from "@/actions/orders";

export default async function AdminDashboard() {
  const summary = await getSalesSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visión Operativa</h1>
        <p className="text-slate-500">Resumen de ventas y estado del restaurante de hoy.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Ingresos Hoy</span>
          <div className="mt-2 text-3xl font-bold text-orange-400">${summary.revenueToday.toFixed(2)}</div>
          <div className="mt-1 text-sm text-slate-300">{summary.completedToday} órdenes completadas</div>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Órdenes Activas</span>
          <div className="mt-2 text-3xl font-bold text-slate-900">{summary.activeOrders}</div>
          <div className="mt-1 text-sm text-slate-500">En proceso de preparación</div>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
          <div className="mt-2 text-3xl font-bold text-slate-900">${summary.averageTicket.toFixed(2)}</div>
          <div className="mt-1 text-sm text-slate-500">Por orden completada</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
        <p className="text-slate-500">Consulta el historial completo de pedidos y ventas.</p>
        <Link
          href="/admin/ventas"
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
        >
          Ver reporte de ventas
        </Link>
      </div>
    </div>
  );
}
