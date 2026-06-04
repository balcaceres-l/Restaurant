"use client";

import { useState, useEffect } from "react";
import { getUnpaidOrders, registerPayment } from "@/actions/orders";
import { PAYMENT_METHOD_LIST } from "@/lib/constants/tables";

interface UnpaidOrder {
  id: string;
  deliveryType: string;
  status: string;
  total: string;
  createdAt: Date;
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" });
}

export default function CobrosPage() {
  const [orders, setOrders] = useState<UnpaidOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [method, setMethod] = useState<Record<string, string>>({});
  const [payingId, setPayingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getUnpaidOrders();
      setOrders(data as UnpaidOrder[]);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handlePay = async (id: string) => {
    const selected = method[id] || PAYMENT_METHOD_LIST[0];
    setPayingId(id);
    setFeedback(null);

    const res = await registerPayment(id, selected);
    if (res.success) {
      setFeedback({ type: "ok", msg: "Pago registrado correctamente." });
      await loadData();
    } else {
      setFeedback({ type: "error", msg: res.error || "No se pudo registrar el pago." });
    }
    setPayingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cobros Pendientes</h1>
        <p className="text-slate-500">Registra el pago de los pedidos.</p>
      </div>

      {feedback && (
        <div className={`text-sm font-medium rounded-xl px-4 py-3 ${feedback.type === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {feedback.msg}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">Cargando cobros...</div>
      ) : orders.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-2xl border border-slate-200 text-slate-500">
          No hay pedidos pendientes de pago.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="font-bold text-slate-900">#{order.id.slice(0, 6).toUpperCase()}</span>
                <span className="text-sm text-slate-500">{formatTime(order.createdAt)}</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-bold">{order.deliveryType}</span>
                  <span className="text-2xl font-bold text-slate-900">${Number(order.total).toFixed(2)}</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Método de pago</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {PAYMENT_METHOD_LIST.map((m) => {
                      const selected = (method[order.id] || PAYMENT_METHOD_LIST[0]) === m;
                      return (
                        <button
                          key={m}
                          onClick={() => setMethod((prev) => ({ ...prev, [order.id]: m }))}
                          className={`py-2 text-xs font-medium rounded-xl border ${selected ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handlePay(order.id)}
                  disabled={payingId === order.id}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50"
                >
                  {payingId === order.id ? "Registrando..." : "Registrar pago"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
