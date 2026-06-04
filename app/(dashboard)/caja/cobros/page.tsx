"use client";

import { useState, useEffect } from "react";
import { getUnpaidOrders, registerPayment, cancelOrder, getCashierDaySummary } from "@/actions/orders";
import { PAYMENT_METHOD_LIST } from "@/lib/constants/tables";

interface UnpaidOrder {
  id: string;
  deliveryType: string;
  status: string;
  total: string;
  createdAt: Date;
}

interface DaySummary {
  collectedToday: number;
  paidCount: number;
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" });
}

export default function CobrosPage() {
  const [orders, setOrders] = useState<UnpaidOrder[]>([]);
  const [summary, setSummary] = useState<DaySummary>({ collectedToday: 0, paidCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [method, setMethod] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<UnpaidOrder | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [data, sum] = await Promise.all([getUnpaidOrders(), getCashierDaySummary()]);
      setOrders(data as UnpaidOrder[]);
      setSummary(sum);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const confirmPay = async () => {
    if (!confirming) return;
    const order = confirming;
    const selected = method[order.id] || PAYMENT_METHOD_LIST[0];
    setConfirming(null);
    setBusyId(order.id);
    setFeedback(null);

    const res = await registerPayment(order.id, selected);
    if (res.success) {
      setFeedback({ type: "ok", msg: `Pago de $${Number(order.total).toFixed(2)} registrado (${selected}).` });
      await loadData();
    } else {
      setFeedback({ type: "error", msg: res.error || "No se pudo registrar el pago." });
    }
    setBusyId(null);
  };

  const handleCancel = async (order: UnpaidOrder) => {
    if (!window.confirm(`¿Cancelar el pedido #${order.id.slice(0, 6).toUpperCase()}? Esta acción libera la mesa y no se puede deshacer.`)) {
      return;
    }
    setBusyId(order.id);
    setFeedback(null);

    const res = await cancelOrder(order.id);
    if (res.success) {
      setFeedback({ type: "ok", msg: "Pedido cancelado." });
      await loadData();
    } else {
      setFeedback({ type: "error", msg: res.error || "No se pudo cancelar el pedido." });
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cobros Pendientes</h1>
          <p className="text-slate-500">Registra el pago de los pedidos.</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-6 py-3 text-white">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cobrado hoy</span>
          <div className="text-2xl font-bold text-orange-400 tabular-nums">${summary.collectedToday.toFixed(2)}</div>
          <span className="text-xs text-slate-300">{summary.paidCount} pedidos cobrados</span>
        </div>
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
          {orders.map((order) => {
            const busy = busyId === order.id;
            return (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="font-bold text-slate-900">#{order.id.slice(0, 6).toUpperCase()}</span>
                  <span className="text-sm text-slate-500">{formatTime(order.createdAt)}</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-bold">{order.deliveryType}</span>
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">${Number(order.total).toFixed(2)}</span>
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancel(order)}
                      disabled={busy}
                      className="px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setConfirming(order)}
                      disabled={busy}
                      className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50"
                    >
                      {busy ? "Procesando..." : "Registrar pago"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6 space-y-2 text-center">
              <h3 className="font-bold text-lg text-slate-900">Confirmar cobro</h3>
              <p className="text-slate-500 text-sm">
                Pedido #{confirming.id.slice(0, 6).toUpperCase()} · {method[confirming.id] || PAYMENT_METHOD_LIST[0]}
              </p>
              <div className="text-4xl font-bold text-slate-900 tabular-nums py-2">${Number(confirming.total).toFixed(2)}</div>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setConfirming(null)} className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={confirmPay} className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
