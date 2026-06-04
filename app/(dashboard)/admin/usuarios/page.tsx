"use client";

import { useState, useMemo, useEffect } from "react";
import { ROLES } from "@/lib/constants/roles";
import { getUsuarios, toggleUserStatus, updateUsuario } from "@/actions/users";
import { signUp } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
  banned: boolean | null;
}

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: "Administrador" },
  { value: ROLES.CAJERO, label: "Cajero" },
  { value: ROLES.COCINA, label: "Cocina" },
];

const initialForm = { name: "", email: "", password: "", role: ROLES.CAJERO as string };

export default function UsuariosPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState(initialForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Estados para ver/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await getUsuarios();
    setEmployees(data as User[]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return employees.filter((emp) => {
      const matchesSearch = !query || emp.name.toLowerCase().includes(query) || emp.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || emp.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [employees, roleFilter, searchQuery]);

  // --- MANEJADORES DE MODALES Y LIMPIEZA ---
  const openCreateModal = () => {
    setForm(initialForm); // Aseguramos que inicie en blanco
    setShowPassword(false); // Ocultamos la contraseña por defecto
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setForm(initialForm); // Limpiamos si el usuario cancela
    setShowPassword(false);
    setIsCreateOpen(false);
  };

  const openEditModal = (emp: User) => {
    setEditingUser({
      id: emp.id,
      name: emp.name,
      role: emp.role || ROLES.CAJERO,
      banned: emp.banned || false,
      newPassword: ""
    });
    setShowEditPassword(false);
    setActiveMenu(null);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setShowEditPassword(false);
  };

  // --- ACCIONES DE BASE DE DATOS ---
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const { error } = await signUp.email({
      email: form.email,
      password: form.password,
      name: form.name,
    });

    if (!error) {
      const updatedList = await getUsuarios();
      const justCreated = updatedList.find(u => u.email === form.email);
      if (justCreated) {
        await updateUsuario(justCreated.id, { name: form.name, role: form.role });
      }
      await loadUsers();
      closeCreateModal(); // Esto ahora limpia la data y cierra el modal
    } else {
      alert(error.message);
    }
    setIsSaving(false);
  };

  const handleSoftDelete = async (id: string, name: string, isCurrentlyBanned: boolean) => {
    const actionText = isCurrentlyBanned ? "reactivar" : "desactivar";
    if (window.confirm(`¿Estás seguro de que deseas ${actionText} a ${name}?`)) {
      await toggleUserStatus(id, !isCurrentlyBanned);
      await loadUsers();
    }
    setActiveMenu(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    await updateUsuario(editingUser.id, { name: editingUser.name, role: editingUser.role });
    await toggleUserStatus(editingUser.id, editingUser.banned);

    if (editingUser.newPassword.trim().length >= 8) {
        console.log("Se solicitó cambio de contraseña para:", editingUser.id);
    }

    await loadUsers();
    closeEditModal(); 
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-500">Administra los accesos y roles de tu equipo.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <span className="text-xl leading-none">+</span> Nuevo Usuario
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <input
            type="search"
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 min-w-40"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Todos los roles</option>
          {ROLE_OPTIONS.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-75">
        {isLoading ? (
          <div className="flex justify-center items-center h-48 text-slate-400">Cargando base de datos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${emp.banned ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-semibold ${emp.banned ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{emp.name}</div>
                          <div className="text-sm text-slate-500">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {emp.role || "Sin rol"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${!emp.banned ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${!emp.banned ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {!emp.banned ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        ⋮
                      </button>
                      
                      {activeMenu === emp.id && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-36 bg-white rounded-xl shadow-lg border border-slate-100 z-10 py-1 overflow-hidden">
                          <button onClick={() => openEditModal(emp)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            Editar
                          </button>
                          <button onClick={() => handleSoftDelete(emp.id, emp.name, emp.banned || false)} className={`w-full text-left px-4 py-2 text-sm transition-colors ${emp.banned ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}>
                            {emp.banned ? 'Reactivar' : 'Desactivar'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CREAR USUARIO */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Crear nuevo usuario</h3>
              <button type="button" onClick={closeCreateModal} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            {/* Bloqueamos el autocompletado en todo el formulario */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                <input 
                  required 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white" 
                  autoComplete="off" 
                  data-lpignore="true" /* Ignora LastPass */
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                <input 
                  required 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white" 
                  autoComplete="new-email" /* Truco para evitar el correo guardado */
                  data-lpignore="true"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña temporal</label>
                <div className="relative">
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    minLength={8} 
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})} 
                    className="w-full px-4 py-2 pr-16 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white" 
                    autoComplete="new-password" /* Obligatorio para que Chrome no ponga la contraseña actual */
                    data-lpignore="true"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-orange-600 focus:outline-none">
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol operativo</label>
                <select 
                  value={form.role} 
                  onChange={e => setForm({...form, role: e.target.value})} 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white"
                >
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeCreateModal} disabled={isSaving} className="flex-1 px-4 py-2 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors">{isSaving ? 'Guardando...' : 'Guardar Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR USUARIO */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Editar usuario</h3>
              <button type="button" onClick={closeEditModal} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nueva contraseña <span className="text-slate-400 font-normal">(opcional)</span></label>
                <div className="relative">
                  <input type={showEditPassword ? "text" : "password"} minLength={8} placeholder="Dejar en blanco para no cambiar" value={editingUser.newPassword} onChange={e => setEditingUser({...editingUser, newPassword: e.target.value})} className="w-full px-4 py-2 pr-16 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white" />
                  <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-orange-600 focus:outline-none">
                    {showEditPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white">
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select value={editingUser.banned ? "true" : "false"} onChange={e => setEditingUser({...editingUser, banned: e.target.value === "true"})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white">
                    <option value="false">Activo</option>
                    <option value="true">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeEditModal} disabled={isSaving} className="flex-1 px-4 py-2 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors">{isSaving ? 'Actualizando...' : 'Actualizar Todo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}