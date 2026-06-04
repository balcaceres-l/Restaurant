//ruta del archivo: tech-flavor/components/ui/Sidebar.tsx
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ROLES, ROLE_HOME_PATHS } from '@/lib/constants/roles';
import { authClient } from '@/lib/auth-client';

type RoleValue = (typeof ROLES)[keyof typeof ROLES];

type SidebarSession = Awaited<ReturnType<typeof authClient.useSession>>['data'];

const ROLE_LABEL = {
  [ROLES.ADMIN]: 'Administración',
  [ROLES.CAJERO]: 'Caja y Pedidos',
  [ROLES.COCINA]: 'Cocina',
};

const MENU_CONFIG = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', path: '/admin', icon: 'ri-dashboard-3-line' },
    { label: 'Usuarios', path: '/admin/usuarios', icon: 'ri-group-line' },
    { label: 'Categorías', path: '/admin/categorias', icon: 'ri-layout-grid-line' },
    { label: 'Productos', path: '/admin/productos', icon: 'ri-restaurant-line' },
    { label: 'Mesas', path: '/admin/mesas', icon: 'ri-table-line' },
    { label: 'Ventas', path: '/admin/ventas', icon: 'ri-line-chart-line' },
  ],
  [ROLES.CAJERO]: [
    { label: 'Caja', path: '/caja', icon: 'ri-computer-line' },
    { label: 'Cobros', path: '/caja/cobros', icon: 'ri-bank-card-line' },
  ],
  [ROLES.COCINA]: [
    { label: 'Tablero Pedidos', path: '/cocina', icon: 'ri-restaurant-2-line' },
    { label: 'Historial', path: '/cocina/historial', icon: 'ri-history-line' },
  ],
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'TF';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Sidebar = ({ session }: { session: SidebarSession }) => {
  const pathname = usePathname();
  const router = useRouter();

  const user = session?.user as
    | { name?: string; role?: RoleValue }
    | undefined;

  const role = user?.role ?? '';
  const userName = user?.name ?? 'Usuario';
  
  const currentLinks = MENU_CONFIG[role as keyof typeof MENU_CONFIG] ?? [];

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/caja' || path === '/cocina') {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/');
  };

  if (!session) return null; 

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Brand */}
      <div
        className="p-6 border-b border-gray-800 cursor-pointer"
        onClick={() => router.push(ROLE_HOME_PATHS[role as keyof typeof ROLE_HOME_PATHS] ?? "/")}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center font-bold text-xl">
            TF
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">TechFlavor</h1>
            <span className="text-xs text-gray-400">Restaurante</span>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6">
        <div className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {ROLE_LABEL[role as keyof typeof ROLE_LABEL] || 'Menú'}
        </div>
        <nav className="space-y-1 px-3">
          {currentLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive(link.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className={link.icon}></i>
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
            {getInitials(userName)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-gray-400 truncate">{ROLE_LABEL[role as keyof typeof ROLE_LABEL]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-red-400 bg-gray-800 rounded-md hover:bg-gray-700 hover:text-red-300 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};