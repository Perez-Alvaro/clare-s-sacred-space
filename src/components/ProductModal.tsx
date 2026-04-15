import { X, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  product_images: ProductImage[];
}

interface Props {
  product: Product;
  onClose: () => void;
}

const ProductModal = ({ product, onClose }: Props) => {
  const images = [...(product.product_images || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const [currentImage, setCurrentImage] = useState(0);
  const { addItem } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl animate-scale-in"
        style={{ backgroundColor: 'hsl(var(--cream))' }}
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full"
          style={{ backgroundColor: 'hsl(var(--sand))', color: 'hsl(var(--earth))' }}>
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Images */}
          <div className="relative aspect-square">
            {images.length > 0 ? (
              <>
                <img src={images[currentImage]?.url} alt={images[currentImage]?.alt_text || product.name}
                  className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full"
                      style={{ backgroundColor: 'hsla(var(--warm-white), 0.9)' }}>
                      <ChevronLeft size={20} style={{ color: 'hsl(var(--earth))' }} />
                    </button>
                    <button onClick={() => setCurrentImage(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full"
                      style={{ backgroundColor: 'hsla(var(--warm-white), 0.9)' }}>
                      <ChevronRight size={20} style={{ color: 'hsl(var(--earth))' }} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentImage(idx)}
                          className="w-2 h-2 rounded-full transition-all"
                          style={{ backgroundColor: idx === currentImage ? 'hsl(var(--terracotta))' : 'hsla(var(--warm-white), 0.7)' }} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--sand))' }}>
                <ShoppingBag size={64} style={{ color: 'hsl(var(--soft-brown))' }} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col">
            <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>{product.name}</h2>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-semibold" style={{ color: 'hsl(var(--terracotta))' }}>
                ${product.price.toLocaleString('es-AR')}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-lg line-through" style={{ color: 'hsl(var(--soft-brown))' }}>
                  ${product.compare_at_price.toLocaleString('es-AR')}
                </span>
              )}
            </div>

            <p className="text-sm mb-2" style={{ color: product.stock > 0 ? 'hsl(var(--olive))' : 'hsl(var(--terracotta))' }}>
              {product.stock > 0 ? `${product.stock} disponible${product.stock > 1 ? 's' : ''}` : 'Agotado'}
            </p>

            {product.description && (
              <div className="flex-1 mt-4 text-sm leading-relaxed" style={{ color: 'hsl(var(--soft-brown))' }}>
                {product.description.split('\n').map((p, i) => <p key={i} className="mb-2">{p}</p>)}
              </div>
            )}

            <button
              onClick={() => { addItem({ id: product.id, name: product.name, price: product.price, image_url: images[0]?.url, stock: product.stock }); onClose(); }}
              disabled={product.stock <= 0}
              className="clare-btn clare-btn-primary w-full mt-6 disabled:opacity-40">
              <ShoppingBag size={18} />
              {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
