import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { user, isStaff, signOut } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const navLinks = [
    { label: 'Inicio', to: '/' },
    { label: 'Tienda', to: '/tienda' },
    { label: 'Novedades', to: '/novedades' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ backgroundColor: 'hsla(var(--cream), 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid hsla(var(--sand), 0.5)' }}>
      <div className="clare-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>
          CLARE
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: location.pathname === link.to ? 'hsl(var(--terracotta))' : 'hsl(var(--soft-brown))' }}>
              {link.label}
            </Link>
          ))}
          {isStaff && (
            <Link to="/admin" className="text-sm font-medium transition-colors duration-200"
              style={{ color: location.pathname.startsWith('/admin') ? 'hsl(var(--terracotta))' : 'hsl(var(--soft-brown))' }}>
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => signOut()} className="p-2 rounded-full transition-colors" style={{ color: 'hsl(var(--soft-brown))' }} title="Cerrar sesión">
              <LogOut size={20} />
            </button>
          ) : (
            <Link to="/login" className="p-2 rounded-full transition-colors" style={{ color: 'hsl(var(--soft-brown))' }}>
              <User size={20} />
            </Link>
          )}

          <button onClick={() => setIsOpen(true)} className="relative p-2 rounded-full transition-colors" style={{ color: 'hsl(var(--soft-brown))' }}>
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ backgroundColor: 'hsl(var(--terracotta))', color: 'hsl(var(--warm-white))' }}>
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2" style={{ color: 'hsl(var(--earth))' }}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t animate-fade-in" style={{ backgroundColor: 'hsl(var(--cream))', borderColor: 'hsl(var(--sand))' }}>
          <nav className="clare-container py-4 flex flex-col gap-4">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className="text-base font-medium py-2"
                style={{ color: location.pathname === link.to ? 'hsl(var(--terracotta))' : 'hsl(var(--soft-brown))' }}>
                {link.label}
              </Link>
            ))}
            {isStaff && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-base font-medium py-2"
                style={{ color: 'hsl(var(--soft-brown))' }}>
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
