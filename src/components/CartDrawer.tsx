import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import SmartImage from './SmartImage';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setIsOpen(false)} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-[60] w-full max-w-md animate-fade-in flex flex-col"
        style={{ backgroundColor: 'hsl(var(--cream))' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'hsl(var(--sand))' }}>
          <h2 className="text-xl" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>
            Tu Carrito ({totalItems})
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full flex items-center gap-1 hover:bg-black/5 transition-colors" style={{ color: 'hsl(var(--soft-brown))' }}>
            <span className="text-sm font-medium mr-1">Seguir comprando</span>
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="clare-script text-xl mb-4" style={{ color: 'hsl(var(--terracotta))' }}>Tu carrito está vacío</p>
              <p className="text-sm" style={{ color: 'hsl(var(--soft-brown))' }}>Explora nuestras colecciones y encontrá algo especial.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  {item.image_url && (
                    <SmartImage src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium" style={{ color: 'hsl(var(--earth))' }}>{item.name}</h4>
                    <p className="text-sm mt-1" style={{ color: 'hsl(var(--terracotta))' }}>${item.price.toLocaleString('es-AR')}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center border" style={{ borderColor: 'hsl(var(--sand))', color: 'hsl(var(--soft-brown))' }}>
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center" style={{ color: 'hsl(var(--earth))' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center border" style={{ borderColor: 'hsl(var(--sand))', color: 'hsl(var(--soft-brown))' }}>
                        <Plus size={14} />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto p-1" style={{ color: 'hsl(var(--soft-brown))' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t" style={{ borderColor: 'hsl(var(--sand))' }}>
            <div className="flex justify-between mb-4">
              <span className="font-medium" style={{ color: 'hsl(var(--earth))' }}>Subtotal</span>
              <span className="font-semibold" style={{ color: 'hsl(var(--terracotta))' }}>${subtotal.toLocaleString('es-AR')}</span>
            </div>
            <Link to="/checkout" onClick={() => setIsOpen(false)}
              className="clare-btn clare-btn-primary w-full">
              Finalizar Compra
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
