"use client";

// Mock de pedidos según la base de datos
const MOCK_ORDERS = [
  { id: 101, tipo_entrega: "Mesa 4", estado: "Pendiente", hora: "12:30 PM", items: [{ cant: 2, nom: "Hamburguesa Clásica" }, { cant: 1, nom: "Gaseosa Cola" }] },
  { id: 102, tipo_entrega: "Para Llevar", estado: "Preparando", hora: "12:35 PM", items: [{ cant: 1, nom: "Papas Fritas" }] },
];

export default function CocinaDashboard() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tablero de Cocina</h1>
          <p className="text-slate-500">Órdenes activas enviadas por caja.</p>
        </div>
        <div className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-bold text-sm">
          {MOCK_ORDERS.length} Pedidos en cola
        </div>
      </div>

      {/* Grid de Tickets de Cocina */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
        {MOCK_ORDERS.map((order) => (
          <div key={order.id} className={`rounded-2xl border shadow-sm overflow-hidden ${order.estado === 'Pendiente' ? 'bg-white border-slate-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className={`p-3 text-white flex justify-between items-center ${order.estado === 'Pendiente' ? 'bg-slate-800' : 'bg-orange-500'}`}>
              <span className="font-bold text-lg">#{order.id}</span>
              <span className="text-sm font-medium">{order.hora}</span>
            </div>
            
            <div className="p-4">
              <div className="mb-4 inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-bold">
                {order.tipo_entrega}
              </div>
              
              <ul className="space-y-3 mb-6">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-lg text-slate-800">
                    <span className="font-bold text-slate-900">{item.cant}x</span>
                    <span className="leading-tight">{item.nom}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${order.estado === 'Pendiente' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}>
                {order.estado === 'Pendiente' ? 'Iniciar Preparación' : 'Marcar como Listo'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}