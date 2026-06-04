export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visión Operativa</h1>
        <p className="text-slate-500">Resumen de ventas y estado del restaurante de hoy.</p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Ingresos Hoy</span>
          <div className="mt-2 text-3xl font-bold text-orange-400">$450.00</div>
          <div className="mt-1 text-sm text-slate-300">24 órdenes completadas</div>
        </div>
        
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Órdenes Activas</span>
          <div className="mt-2 text-3xl font-bold text-slate-900">5</div>
          <div className="mt-1 text-sm text-slate-500">En proceso de preparación</div>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
          <div className="mt-2 text-3xl font-bold text-slate-900">$18.75</div>
          <div className="mt-1 text-sm text-slate-500">Por orden completada</div>
        </div>
      </div>

      {/* Gráfico / Tabla Placeholder */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm h-64 flex items-center justify-center">
        <p className="text-slate-400">Aquí integraremos el gráfico de ventas por hora cuando conectemos la BD.</p>
      </div>
    </div>
  );
}