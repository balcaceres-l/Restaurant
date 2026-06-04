"use client";

import { useState } from "react";

// Mock de productos basado en el esquema
const MOCK_PRODUCTS = [
  { id: 1, nombre: "Hamburguesa Clásica", precio: 5.50, categoria: "Platos Fuertes" },
  { id: 2, nombre: "Papas Fritas", precio: 2.50, categoria: "Acompañamientos" },
  { id: 3, nombre: "Gaseosa Cola", precio: 1.50, categoria: "Bebidas" },
];

export default function CajaDashboard() {
  const [cart, setCart] = useState<{ id: number; nombre: string; precio: number; cantidad: number }[]>([]);
  const [tipoEntrega, setTipoEntrega] = useState("Mesa");

  const addToCart = (product: typeof MOCK_PRODUCTS[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
      
      {/* Catálogo de Productos */}
      <div className="flex flex-col overflow-hidden">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Toma de Órdenes</h1>
          <p className="text-slate-500">Selecciona los productos para agregarlos al pedido.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
          {MOCK_PRODUCTS.map((prod) => (
            <button 
              key={prod.id} 
              onClick={() => addToCart(prod)}
              className="text-left p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-400 hover:shadow-md transition-all"
            >
              <div className="text-xs font-semibold text-orange-500 mb-1">{prod.categoria}</div>
              <div className="font-bold text-slate-900">{prod.nombre}</div>
              <div className="mt-2 font-medium text-slate-600">${prod.precio.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Carrito de Compras (Detalle Pedido) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-lg text-slate-900">Pedido Actual</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-slate-400 mt-10">El carrito está vacío</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-slate-900">{item.nombre}</div>
                  <div className="text-sm text-slate-500">{item.cantidad} x ${item.precio.toFixed(2)}</div>
                </div>
                <div className="font-bold text-slate-900">${(item.cantidad * item.precio).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Entrega</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {["Mesa", "Para Llevar", "Domicilio"].map((tipo) => (
                <button 
                  key={tipo}
                  onClick={() => setTipoEntrega(tipo)}
                  className={`py-2 text-sm font-medium rounded-xl border ${tipoEntrega === tipo ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Total a cobrar</span>
            <span className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</span>
          </div>

          <button 
            disabled={cart.length === 0}
            className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}