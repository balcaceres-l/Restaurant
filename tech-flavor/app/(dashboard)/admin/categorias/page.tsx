"use client";

import { useState, useEffect } from "react";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "@/actions/categories";

// Molde TypeScript
interface Category {
  id: string;
  name: string;
  description: string | null;
  imageBase64: string | null;
  isActive: boolean;
}

const emptyForm = { name: "", description: "", imageBase64: "", isActive: true };

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // --- CARGA DE DATOS ---
  const loadData = async () => {
    setIsLoading(true);
    const data = await getCategorias();
    setCategories(data);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // --- LÓGICA DE IMAGEN BASE64 (Adaptada de tu código) ---
  const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imageBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
    event.target.value = ""; // Limpiar input
  };

  // --- MANEJADORES DE MODAL ---
  const openCreateModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description || "",
      imageBase64: cat.imageBase64 || "",
      isActive: cat.isActive,
    });
    setEditingId(cat.id);
    setActiveDropdown(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  // --- ACCIONES BD ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (editingId) {
      await updateCategoria(editingId, form);
    } else {
      await createCategoria(form);
    }
    
    await loadData();
    closeModal();
    setIsSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar la categoría "${name}" de forma permanente?`)) {
      await deleteCategoria(id);
      await loadData();
    }
    setActiveDropdown(null);
  };

  const toggleStatus = async (cat: Category) => {
    await updateCategoria(cat.id, { isActive: !cat.isActive });
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorías del Menú</h1>
          <p className="text-slate-500">Organiza tus productos por secciones.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <span className="text-xl leading-none">+</span> Agregar Categoría
        </button>
      </div>

      {/* GRID DE CATEGORÍAS */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">Cargando catálogo...</div>
      ) : categories.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-2xl border border-slate-200">
          <p className="text-slate-500 mb-4">Aún no tienes categorías en tu menú.</p>
          <button onClick={openCreateModal} className="text-orange-600 font-bold hover:underline">¡Crea la primera!</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <article key={cat.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow flex flex-col h-full">
              
              {/* Botón de Menú (3 Puntos) */}
              <div className="absolute top-3 right-3 z-10">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === cat.id ? null : cat.id)}
                  className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white shadow-sm transition-colors"
                >
                  ⋮
                </button>
                {activeDropdown === cat.id && (
                  <div className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden">
                    <button onClick={() => openEditModal(cat)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Editar</button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Eliminar</button>
                  </div>
                )}
              </div>

              {/* Imagen */}
              <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {cat.imageBase64 ? (
                  <img src={cat.imageBase64} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl">
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {!cat.isActive && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Inactiva</span>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-slate-900 mb-1">{cat.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 flex-1">{cat.description || "Sin descripción"}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className={`text-xs font-bold ${cat.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                    {cat.isActive ? 'Visible en caja' : 'Oculta'}
                  </span>
                  {/* Switch Toggle */}
                  <button 
                    onClick={() => toggleStatus(cat)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${cat.isActive ? 'bg-orange-500' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${cat.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MODAL (Crear/Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">{editingId ? "Editar Categoría" : "Nueva Categoría"}</h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white" placeholder="Ej: Hamburguesas" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white resize-none" placeholder="Breve descripción para el menú..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Imagen (Opcional)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 shrink-0 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center text-slate-400 text-xs text-center">
                    {form.imageBase64 ? <img src={form.imageBase64} alt="Preview" className="w-full h-full object-cover" /> : "Sin foto"}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageFile} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-900 block text-sm">Disponibilidad</span>
                  <span className="text-xs text-slate-500">¿Esta categoría será visible al tomar pedidos?</span>
                </div>
                <button type="button" onClick={() => setForm({...form, isActive: !form.isActive})} className={`w-12 h-7 rounded-full relative transition-colors ${form.isActive ? 'bg-orange-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={isSaving} className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors">{isSaving ? 'Guardando...' : 'Guardar Categoría'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}