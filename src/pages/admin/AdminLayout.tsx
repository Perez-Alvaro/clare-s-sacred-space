import { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Users, Newspaper, LogOut, Menu, X, ChevronRight, Settings as SettingsIcon } from 'lucide-react';

const AdminLayout = () => {
  const { user, isStaff, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isStaff)) navigate('/login');
  }, [user, isStaff, loading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--cream))' }}>
    <p style={{ color: 'hsl(var(--soft-brown))' }}>Cargando...</p>
  </div>;

  if (!user || !isStaff) return null;

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/products', icon: Package, label: 'Productos' },
    { to: '/admin/categories', icon: FolderOpen, label: 'Categorías' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
    { to: '/admin/customers', icon: Users, label: 'Clientes' },
    { to: '/admin/news', icon: Newspaper, label: 'Novedades' },
    { to: '/admin/settings', icon: SettingsIcon, label: 'Configuración' },
  ];

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: 'hsl(var(--earth))' }}>
        <div className="p-6">
          <Link to="/" className="text-2xl font-semibold block mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--warm-white))' }}>
            CLARE
          </Link>
          <p className="text-xs" style={{ color: 'hsl(var(--sand))' }}>Panel de administración</p>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: isActive(item) ? 'hsla(var(--warm-white), 0.15)' : 'transparent',
                color: isActive(item) ? 'hsl(var(--warm-white))' : 'hsl(var(--sand))'
              }}>
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button onClick={() => signOut()} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full"
            style={{ color: 'hsl(var(--sand))' }}>
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-4 px-6 h-16 border-b"
          style={{ backgroundColor: 'hsla(var(--cream), 0.95)', backdropFilter: 'blur(10px)', borderColor: 'hsl(var(--sand))' }}>
          <button onClick={() => setSidebarOpen(true)} className="md:hidden" style={{ color: 'hsl(var(--earth))' }}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-1 text-sm" style={{ color: 'hsl(var(--soft-brown))' }}>
            <span>Admin</span>
            <ChevronRight size={14} />
            <span style={{ color: 'hsl(var(--earth))' }}>
              {navItems.find(i => isActive(i))?.label || 'Dashboard'}
            </span>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
