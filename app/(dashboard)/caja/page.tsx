"use client";

import { useState, useEffect, useMemo } from "react";
import { getProductos } from "@/actions/products";
import { createOrder } from "@/actions/orders";
import { getMesasDisponibles } from "@/actions/tables";
import { DELIVERY_TYPE, DELIVERY_TYPE_LIST } from "@/lib/constants/orders";
import { TABLE_STATUS } from "@/lib/constants/tables";

interface Product {
  id: string;
  name: string;
  price: string;
  categoryName: string | null;
  categoryIsActive: boolean | null;
  isActive: boolean;
}

interface Mesa {
  id: string;
  number: number;
  status: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CajaDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [tableId, setTableId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState(DELIVERY_TYPE_LIST[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productData, mesaData] = await Promise.all([getProductos(), getMesasDisponibles()]);
      setProducts(productData as Product[]);
      setMesas(mesaData as Mesa[]);
    } catch {
      setProducts([]);
      setMesas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const availableProducts = useMemo(
    () => products.filter((p) => p.isActive && p.categoryIsActive !== false),
    [products]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of availableProducts) {
      const key = p.categoryName || "Sin categoría";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [availableProducts]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
    });
  };

  const changeQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const mesasLibres = useMemo(
    () => mesas.filter((m) => m.status === TABLE_STATUS.LIBRE),
    [mesas]
  );

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    if (deliveryType === DELIVERY_TYPE.MESA && !tableId) {
      setFeedback({ type: "error", msg: "Selecciona una mesa para este pedido." });
      return;
    }
    setIsSaving(true);
    setFeedback(null);

    const res = await createOrder({
      deliveryType,
      tableId: deliveryType === DELIVERY_TYPE.MESA ? tableId : null,
      items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
    });

    if (res.success) {
      setCart([]);
      setDeliveryType(DELIVERY_TYPE_LIST[0]);
      setTableId("");
      setFeedback({ type: "ok", msg: "Pedido enviado a cocina correctamente." });
      await loadData();
    } else {
      setFeedback({ type: "error", msg: res.error || "No se pudo generar el pedido." });
    }
    setIsSaving(false);
  };

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
      <div className="flex flex-col overflow-hidden">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Toma de Órdenes</h1>
          <p className="text-slate-500">Selecciona los productos para agregarlos al pedido.</p>
        </div>

        <div className="flex-1 overflow-y-auto pb-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48 text-slate-400">Cargando menú...</div>
          ) : availableProducts.length === 0 ? (
            <div className="text-center bg-white p-10 rounded-2xl border border-slate-200 text-slate-500">
              No hay productos activos disponibles. Revisa el catálogo en el panel de administración.
            </div>
          ) : (
            grouped.map(([categoryName, items]) => (
              <div key={categoryName}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{categoryName}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => addToCart(prod)}
                      className="text-left p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-400 hover:shadow-md transition-all"
                    >
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="mt-2 font-medium text-slate-600">${Number(prod.price).toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-lg text-slate-900">Pedido Actual</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-slate-400 mt-10">El carrito está vacío</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900 truncate">{item.name}</div>
                  <div className="text-sm text-slate-500">${item.price.toFixed(2)} c/u</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeQuantity(item.id, -1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">−</button>
                  <span className="w-6 text-center font-semibold text-slate-900">{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.id, 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">+</button>
                  <button onClick={() => removeItem(item.id)} className="ml-1 text-slate-300 hover:text-red-500 font-bold">×</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4">
          {feedback && (
            <div className={`text-sm font-medium rounded-xl px-3 py-2 ${feedback.type === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {feedback.msg}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Entrega</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {DELIVERY_TYPE_LIST.map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => { setDeliveryType(tipo); setTableId(""); }}
                  className={`py-2 text-sm font-medium rounded-xl border ${deliveryType === tipo ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {deliveryType === DELIVERY_TYPE.MESA && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Mesa</label>
              {mesasLibres.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">No hay mesas libres disponibles.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {mesasLibres.map((mesa) => (
                    <button
                      key={mesa.id}
                      onClick={() => setTableId(mesa.id)}
                      className={`py-2 text-sm font-bold rounded-xl border ${tableId === mesa.id ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}
                    >
                      {mesa.number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-end pt-4 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Total a cobrar</span>
            <span className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || isSaving}
            className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Generando..." : "Generar Pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
