"use client";

import { useState } from "react";
import { getOrderDetails } from "@/actions/orders";
import { ORDER_STATUS } from "@/lib/constants/orders";

interface Sale {
  id: string;
  deliveryType: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  total: string;
  createdAt: Date;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
}

interface OrderDetail extends Sale {
  items: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  [ORDER_STATUS.PENDIENTE]: "bg-slate-100 text-slate-600",
  [ORDER_STATUS.PREPARANDO]: "bg-orange-100 text-orange-700",
  [ORDER_STATUS.ENTREGADO]: "bg-green-100 text-green-700",
  [ORDER_STATUS.CANCELADO]: "bg-red-100 text-red-700",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleString("es-SV", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SalesTable({ sales }: { sales: Sale[] }) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const openDetail = async (id: string) => {
    setLoadingId(id);
    const data = await getOrderDetails(id);
    if (data) setDetail(data as OrderDetail);
    setLoadingId(null);
  };

  return (
    <>
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
              <tr
                key={sale.id}
                onClick={() => openDetail(sale.id)}
                className={`cursor-pointer transition-colors ${loadingId === sale.id ? "bg-orange-50" : "hover:bg-slate-50"}`}
              >
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
                <td className="px-6 py-3 text-right font-bold text-slate-900 tabular-nums">${Number(sale.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Pedido #{detail.id.slice(0, 6).toUpperCase()}</h3>
                <p className="text-xs text-slate-500">{formatDate(detail.createdAt)} · {detail.deliveryType}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[detail.status] ?? "bg-slate-100 text-slate-600"}`}>{detail.status}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${detail.paymentStatus === "Pagado" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {detail.paymentStatus}{detail.paymentMethod ? ` · ${detail.paymentMethod}` : ""}
                </span>
              </div>

              <ul className="divide-y divide-slate-100">
                {detail.items.map((item) => (
                  <li key={item.id} className="flex justify-between items-center py-2.5">
                    <span className="text-slate-800">
                      <span className="font-bold text-slate-900">{item.quantity}×</span> {item.productName}
                    </span>
                    <span className="text-slate-600 tabular-nums">${(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-200">
                <span className="font-medium text-slate-500">Total</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">${Number(detail.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
