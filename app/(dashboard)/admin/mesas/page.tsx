"use client";

import { useState, useEffect } from "react";
import { getMesas, createMesa, updateMesa, deleteMesa, setMesaStatus } from "@/actions/tables";
import { TABLE_STATUS } from "@/lib/constants/tables";

interface Mesa {
  id: string;
  number: number;
  capacity: number;
  status: string;
  isActive: boolean;
}

const emptyForm = { number: 0, capacity: 4 };

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getMesas();
      setMesas(data as Mesa[]);
    } catch {
      setMesas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (mesa: Mesa) => {
    setForm({ number: mesa.number, capacity: mesa.capacity });
    setEditingId(mesa.id);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const res: { success: boolean; error?: string } = editingId
      ? await updateMesa(editingId, { number: form.number, capacity: form.capacity })
      : await createMesa(form);

    if (!res.success) {
      setError(res.error || "No se pudo guardar la mesa");
      setIsSaving(false);
      return;
    }

    await loadData();
    setIsModalOpen(false);
    setIsSaving(false);
  };

  const handleDelete = async (mesa: Mesa) => {
    if (window.confirm(`¿Eliminar la mesa ${mesa.number}?`)) {
      await deleteMesa(mesa.id);
      await loadData();
    }
  };

  const toggleStatus = async (mesa: Mesa) => {
    const next = mesa.status === TABLE_STATUS.LIBRE ? TABLE_STATUS.OCUPADA : TABLE_STATUS.LIBRE;
    await setMesaStatus(mesa.id, next);
    await loadData();
  };

  const toggleActive = async (mesa: Mesa) => {
    await updateMesa(mesa.id, { isActive: !mesa.isActive });
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Mesas</h1>
          <p className="text-slate-500">Administra las mesas y su estado de ocupación.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <span className="text-xl leading-none">+</span> Agregar Mesa
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">Cargando mesas...</div>
      ) : mesas.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-2xl border border-slate-200">
          <p className="text-slate-500 mb-4">Aún no hay mesas registradas.</p>
          <button onClick={openCreate} className="text-orange-600 font-bold hover:underline">¡Crea la primera!</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mesas.map((mesa) => {
            const ocupada = mesa.status === TABLE_STATUS.OCUPADA;
            return (
              <article key={mesa.id} className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-3 ${!mesa.isActive ? "bg-slate-50 border-slate-200 opacity-60" : ocupada ? "bg-orange-50 border-orange-200" : "bg-white border-slate-200"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold text-slate-900">Mesa {mesa.number}</div>
                    <div className="text-sm text-slate-500">{mesa.capacity} personas</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ocupada ? "bg-orange-500 text-white" : "bg-green-100 text-green-700"}`}>
                    {mesa.status}
                  </span>
                </div>

                <button
                  onClick={() => toggleStatus(mesa)}
                  disabled={!mesa.isActive}
                  className={`w-full py-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${ocupada ? "bg-green-600 hover:bg-green-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}
                >
                  {ocupada ? "Liberar mesa" : "Marcar ocupada"}
                </button>

                <div className="flex gap-2 text-xs">
                  <button onClick={() => openEdit(mesa)} className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">Editar</button>
                  <button onClick={() => toggleActive(mesa)} className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">{mesa.isActive ? "Desactivar" : "Activar"}</button>
                  <button onClick={() => handleDelete(mesa)} className="flex-1 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium">Eliminar</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">{editingId ? "Editar Mesa" : "Nueva Mesa"}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="text-sm font-medium rounded-xl px-3 py-2 bg-red-100 text-red-700">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de mesa</label>
                <input
                  required type="number" min={1} value={form.number || ""}
                  onChange={(e) => setForm({ ...form, number: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white"
                  placeholder="Ej: 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacidad (personas)</label>
                <input
                  required type="number" min={1} value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors">{isSaving ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
