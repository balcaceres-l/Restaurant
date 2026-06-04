"use client";

import { useState, useEffect, useTransition } from "react";
import { getActiveOrders, updateOrderStatus } from "@/actions/orders";
import { ORDER_STATUS } from "@/lib/constants/orders";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
}

interface ActiveOrder {
  id: string;
  deliveryType: string;
  status: string;
  total: string;
  createdAt: Date;
  items: OrderItem[];
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" });
}

function elapsedMinutes(date: Date, now: number) {
  return Math.max(0, Math.floor((now - new Date(date).getTime()) / 60000));
}

const URGENCY = {
  normal: { badge: "bg-slate-100 text-slate-600", ring: "" },
  warning: { badge: "bg-amber-100 text-amber-700", ring: "ring-1 ring-amber-300" },
  late: { badge: "bg-red-100 text-red-700 animate-pulse", ring: "ring-2 ring-red-400" },
};

function urgencyLevel(minutes: number): keyof typeof URGENCY {
  if (minutes >= 10) return "late";
  if (minutes >= 5) return "warning";
  return "normal";
}

export default function CocinaDashboard() {
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      const data = await getActiveOrders();
      setOrders(data as ActiveOrder[]);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const dataInterval = setInterval(loadData, 10000);
    const clockInterval = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const advance = (order: ActiveOrder) => {
    const next = order.status === ORDER_STATUS.PENDIENTE ? ORDER_STATUS.PREPARANDO : ORDER_STATUS.ENTREGADO;
    startTransition(async () => {
      await updateOrderStatus(order.id, next);
      await loadData();
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tablero de Cocina</h1>
          <p className="text-slate-500">Órdenes activas enviadas por caja.</p>
        </div>
        <div className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-bold text-sm">
          {orders.length} Pedidos en cola
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">Cargando órdenes...</div>
      ) : orders.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-2xl border border-slate-200 text-slate-500">
          No hay órdenes activas en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {orders.map((order) => {
            const isPendiente = order.status === ORDER_STATUS.PENDIENTE;
            const minutes = elapsedMinutes(order.createdAt, now);
            const urgency = URGENCY[urgencyLevel(minutes)];
            return (
              <div key={order.id} className={`rounded-2xl border shadow-sm overflow-hidden ${urgency.ring} ${isPendiente ? "bg-white border-slate-200" : "bg-orange-50 border-orange-200"}`}>
                <div className={`p-3 text-white flex justify-between items-center ${isPendiente ? "bg-slate-800" : "bg-orange-500"}`}>
                  <span className="font-bold text-lg">#{order.id.slice(0, 6).toUpperCase()}</span>
                  <span className="text-sm font-medium">{formatTime(order.createdAt)}</span>
                </div>

                <div className="p-4">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-bold">
                      {order.deliveryType}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold tabular-nums ${urgency.badge}`} title="Tiempo en cola">
                      {minutes} min
                    </span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex gap-3 text-lg text-slate-800">
                        <span className="font-bold text-slate-900">{item.quantity}x</span>
                        <span className="leading-tight">{item.productName}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => advance(order)}
                    disabled={isPending}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-colors disabled:opacity-50 ${isPendiente ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"}`}
                  >
                    {isPendiente ? "Iniciar Preparación" : "Marcar como Entregado"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
