"use client";

import { useState, useEffect, useMemo } from "react";
import { getProductos, createProducto, updateProducto, deleteProducto } from "@/actions/products";
import { getCategorias } from "@/actions/categories";

// Moldes TypeScript
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  categoryId: string;
  categoryName: string | null;
  categoryIsActive: boolean | null; // Nuevo campo del JOIN
  imageBase64: string | null;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean; // Ahora traemos el estado real
}

const emptyForm = { name: "", description: "", price: "", categoryId: "", imageBase64: "", isActive: true };

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Calculamos si la categoría seleccionada actualmente en el form está inactiva
  const selectedCategory = categories.find(c => c.id === form.categoryId);
  const isCategoryInactive = selectedCategory ? !selectedCategory.isActive : false;

  const loadData = async () => {
    setIsLoading(true);
    const [prodData, catData] = await Promise.all([getProductos(), getCategorias()]);
    setProducts(prodData as Product[]);
    setCategories(catData as Category[]);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(query) || (p.categoryName && p.categoryName.toLowerCase().includes(query)));
  }, [products, searchQuery]);

  const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((prev) => ({ ...prev, imageBase64: reader.result as string }));
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setForm({
      name: prod.name,
      description: prod.description || "",
      price: prod.price,
      categoryId: prod.categoryId,
      imageBase64: prod.imageBase64 || "",
      isActive: prod.isActive,
    });
    setEditingId(prod.id);
    setActiveDropdown(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Doble validación antes de guardar: si la categoría está inactiva, forzamos isActive a false
    const finalForm = { ...form, isActive: isCategoryInactive ? false : form.isActive };

    if (editingId) {
      await updateProducto(editingId, finalForm);
    } else {
      await createProducto(finalForm);
    }
    await loadData();
    closeModal();
    setIsSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${name}" permanentemente?`)) {
      await deleteProducto(id);
      await loadData();
    }
    setActiveDropdown(null);
  };

  const toggleStatus = async (prod: Product) => {
    // Validación de la tarjeta: Bloqueamos encenderlo si su categoría está inactiva
    if (!prod.isActive && prod.categoryIsActive === false) {
      alert(`No puedes activar este producto porque la categoría "${prod.categoryName}" está inactiva.`);
      return;
    }
    await updateProducto(prod.id, { isActive: !prod.isActive });
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Productos</h1>
          <p className="text-slate-500">Gestiona los platillos, bebidas y precios del menú.</p>
        </div>
        <button 
          onClick={openCreateModal}
          disabled={categories.length === 0}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl leading-none">+</span> Agregar Producto
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative w-full max-w-md">
          <input
            type="search"
            placeholder="Buscar producto por nombre o categoría..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">Cargando catálogo...</div>
      ) : products.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-2xl border border-slate-200">
          <p className="text-slate-500 mb-4">Aún no tienes productos registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <article key={prod.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow flex flex-col h-full">
              
              <div className="absolute top-3 right-3 z-10">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === prod.id ? null : prod.id)}
                  className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white shadow-sm transition-colors"
                >
                  ⋮
                </button>
                {activeDropdown === prod.id && (
                  <div className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden">
                    <button onClick={() => openEditModal(prod)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Editar</button>
                    <button onClick={() => handleDelete(prod.id, prod.name)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Eliminar</button>
                  </div>
                )}
              </div>

              <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                {prod.categoryName} {prod.categoryIsActive === false && <span className="text-red-400 ml-1">(Inactiva)</span>}
              </div>

              <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {prod.imageBase64 ? (
                  <img src={prod.imageBase64} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl">
                    {prod.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {!prod.isActive && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Agotado / Oculto</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{prod.name}</h3>
                  <span className="font-bold text-orange-600 text-lg">${Number(prod.price).toFixed(2)}</span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 flex-1">{prod.description || "Sin descripción"}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className={`text-xs font-bold ${prod.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                    {prod.isActive ? 'Disponible en caja' : 'Oculto en caja'}
                  </span>
                  <button 
                    onClick={() => toggleStatus(prod)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${prod.isActive ? 'bg-orange-500' : 'bg-slate-300'} ${prod.categoryIsActive === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={prod.categoryIsActive === false ? "Categoría inactiva" : ""}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${prod.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
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
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-lg text-slate-900">{editingId ? "Editar Producto" : "Nuevo Producto"}</h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del producto</label>
                  <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white" placeholder="Ej: Hamburguesa Doble" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Precio ($)</label>
                    <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                    <select 
                      required 
                      value={form.categoryId} 
                      onChange={e => {
                        const newCatId = e.target.value;
                        const newCat = categories.find(c => c.id === newCatId);
                        // Si cambia a una categoría inactiva, apagamos el producto automáticamente
                        setForm(prev => ({
                          ...prev, 
                          categoryId: newCatId,
                          isActive: newCat && !newCat.isActive ? false : prev.isActive
                        }));
                      }} 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white"
                    >
                      <option value="" disabled>Selecciona una...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {!c.isActive ? "(Inactiva)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción corta</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white resize-none" placeholder="Ingredientes o detalle del plato..." />
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

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
                  <div>
                    <span className="font-semibold text-slate-900 block text-sm">Disponibilidad en menú</span>
                    <span className="text-xs text-slate-500">
                      {isCategoryInactive ? (
                        <span className="text-red-500 font-medium">Bloqueado. La categoría seleccionada está inactiva.</span>
                      ) : (
                        "Puedes ocultarlo si no hay existencias."
                      )}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    disabled={isCategoryInactive} // Bloqueamos el click si la categoría está inactiva
                    onClick={() => setForm({...form, isActive: !form.isActive})} 
                    className={`w-12 h-7 rounded-full relative transition-colors ${form.isActive ? 'bg-orange-500' : 'bg-slate-300'} ${isCategoryInactive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white shrink-0 flex gap-3">
              <button type="button" onClick={closeModal} disabled={isSaving} className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
              <button type="submit" form="productForm" disabled={isSaving} className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors">{isSaving ? 'Guardando...' : 'Guardar Producto'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}