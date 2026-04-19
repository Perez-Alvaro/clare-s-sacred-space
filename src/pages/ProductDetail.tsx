import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, ChevronRight, ExternalLink, ChevronRight as ChevronRightIcon, Truck, ShieldCheck, Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ProductImage { id: string; url: string; alt_text: string | null; sort_order: number | null; }
interface Product {
  id: string; name: string; description: string | null; short_description: string | null;
  price: number; compare_at_price: number | null; stock: number; external_link?: string | null;
  product_images: ProductImage[];
}
interface VariantOption { id: string; label: string; price_modifier: number; sort_order: number; }
interface Variant { id: string; name: string; type: 'single_choice' | 'multiple_choice'; sort_order: number; options: VariantOption[]; }

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(true);
  const [shipOpen, setShipOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data } = await supabase.from('products').select('*, product_images(*)').eq('id', id).single();
      if (!data) { setLoading(false); return; }
      setProduct(data as Product);
      setImages([...(data.product_images || [])].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)));

      const { data: vData } = await supabase.from('product_variants').select('*').eq('product_id', id).order('sort_order');
      if (vData && vData.length > 0) {
        const filledVariants = [];
        const initSelections: Record<string, string[]> = {};
        for (const v of vData) {
          const { data: opts } = await supabase.from('product_variant_options').select('*').eq('variant_id', v.id).order('sort_order');
          if (opts && opts.length > 0) {
            filledVariants.push({ ...v, options: opts });
            initSelections[v.id] = v.type === 'single_choice' ? [opts[0].id] : [];
          }
        }
        setVariants(filledVariants as Variant[]);
        setSelectedOptions(initSelections);
      }
      setLoading(false);
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--cream))' }}>
        <p className="animate-pulse" style={{ color: 'hsl(var(--earth))' }}>Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: 'hsl(var(--cream))' }}>
        <h2 className="text-2xl mb-4" style={{ color: 'hsl(var(--earth))' }}>Producto no encontrado</h2>
        <button onClick={() => navigate('/tienda')} className="clare-btn clare-btn-primary">Volver a la tienda</button>
      </div>
    );
  }

  const toggleOption = (variantId: string, optionId: string, isSingle: boolean) => {
    setSelectedOptions(prev => {
      if (isSingle) return { ...prev, [variantId]: [optionId] };
      const current = prev[variantId] || [];
      const updated = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId];
      return { ...prev, [variantId]: updated };
    });
  };

  const getModifiersSum = () => {
    let sum = 0;
    variants.forEach(v => {
      const selected = selectedOptions[v.id] || [];
      v.options.forEach(opt => { if (selected.includes(opt.id)) sum += opt.price_modifier || 0; });
    });
    return sum;
  };

  const finalPrice = product.price + getModifiersSum();
  const finalComparePrice = product.compare_at_price ? product.compare_at_price + getModifiersSum() : null;
  const discountPct = finalComparePrice && finalComparePrice > finalPrice
    ? Math.round(((finalComparePrice - finalPrice) / finalComparePrice) * 100) : 0;

  const handleAddToCart = () => {
    const selectedVariantLabels = variants.map(v => {
      const selectedIds = selectedOptions[v.id] || [];
      const opts = v.options.filter(o => selectedIds.includes(o.id)).map(o => o.label);
      return opts.length > 0 ? `${v.name}: ${opts.join(', ')}` : null;
    }).filter(Boolean).join(' | ');

    const cartItemName = selectedVariantLabels ? `${product.name} (${selectedVariantLabels})` : product.name;
    const cartItemId = selectedVariantLabels ? `${product.id}-${btoa(selectedVariantLabels).replace(/=/g, '')}` : product.id;
    for (let i = 0; i < quantity; i++) {
      addItem({ id: cartItemId, product_id: product.id, name: cartItemName, price: finalPrice, image_url: images[0]?.url, stock: product.stock });
    }
  };

  const outOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <Navbar />

      <main className="flex-1 pt-20 md:pt-24 pb-32 md:pb-16">
        <div className="clare-container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs md:text-sm mb-4 md:mb-6 overflow-x-auto whitespace-nowrap" style={{ color: 'hsl(var(--soft-brown))' }}>
            <Link to="/" className="hover:underline">Inicio</Link>
            <ChevronRightIcon size={12} className="opacity-50" />
            <Link to="/tienda" className="hover:underline">Tienda</Link>
            <ChevronRightIcon size={12} className="opacity-50" />
            <span className="truncate font-medium" style={{ color: 'hsl(var(--earth))' }}>{product.name}</span>
          </nav>

          <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden md:shadow-xl md:border border-slate-100 max-w-3xl mx-auto">
            {/* Gallery */}
            <div className="w-full">
              <div className="flex flex-col gap-3">
                {/* Main image */}
                <div className="relative bg-slate-50 aspect-square overflow-hidden">
                  {images.length > 0 ? (
                    <>
                      <img src={images[currentImage]?.url} alt={images[currentImage]?.alt_text || product.name}
                        className="absolute inset-0 w-full h-full object-cover" />
                      {discountPct > 0 && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                          style={{ backgroundColor: 'hsl(var(--terracotta))', color: 'hsl(var(--warm-white))' }}>
                          -{discountPct}%
                        </span>
                      )}
                      {images.length > 1 && (
                        <>
                          <button onClick={() => setCurrentImage(i => (i - 1 + images.length) % images.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-md md:p-2.5"
                            style={{ backgroundColor: 'hsla(var(--warm-white), 0.95)' }}>
                            <ChevronLeft size={18} style={{ color: 'hsl(var(--earth))' }} />
                          </button>
                          <button onClick={() => setCurrentImage(i => (i + 1) % images.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-md md:p-2.5"
                            style={{ backgroundColor: 'hsla(var(--warm-white), 0.95)' }}>
                            <ChevronRight size={18} style={{ color: 'hsl(var(--earth))' }} />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <ShoppingBag size={64} className="mb-2" /><p className="text-sm">Sin imagen</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile thumbnails (horizontal) */}
              {images.length > 1 && (
                <div className="flex md:hidden gap-2 px-4 py-3 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button key={img.id} onClick={() => setCurrentImage(idx)}
                      className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all"
                      style={{ borderColor: idx === currentImage ? 'hsl(var(--terracotta))' : 'hsl(var(--sand))', opacity: idx === currentImage ? 1 : 0.6 }}>
                      <img src={img.url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="w-full md:w-1/2 p-5 md:p-10 flex flex-col">
              {/* Title + price block */}
              <div className="pb-5 border-b" style={{ borderColor: 'hsl(var(--sand))' }}>
                <h1 className="text-2xl md:text-4xl font-medium leading-tight mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>
                  {product.name}
                </h1>
                {product.short_description && (
                  <p className="text-sm md:text-base italic mb-4 break-words" style={{ color: 'hsl(var(--soft-brown))' }}>
                    {product.short_description}
                  </p>
                )}
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl md:text-4xl font-semibold" style={{ color: 'hsl(var(--terracotta))' }}>
                    ${finalPrice.toLocaleString('es-AR')}
                  </span>
                  {finalComparePrice && finalComparePrice > finalPrice && (
                    <span className="text-base md:text-lg line-through" style={{ color: 'hsl(var(--soft-brown))' }}>
                      ${finalComparePrice.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-2" style={{ color: 'hsl(var(--soft-brown))' }}>
                  O hasta 3 cuotas sin interés a coordinar con la vendedora.
                </p>
              </div>

              {/* Variants */}
              {variants.length > 0 && (
                <div className="space-y-5 py-5 border-b" style={{ borderColor: 'hsl(var(--sand))' }}>
                  {variants.map(v => (
                    <div key={v.id}>
                      <div className="flex items-baseline justify-between mb-2.5">
                        <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--earth))' }}>
                          {v.name}
                        </h4>
                        {v.type === 'multiple_choice' && (
                          <span className="text-xs" style={{ color: 'hsl(var(--soft-brown))' }}>Elegí varios</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {v.options.map(opt => {
                          const isSelected = (selectedOptions[v.id] || []).includes(opt.id);
                          return (
                            <button key={opt.id}
                              onClick={() => toggleOption(v.id, opt.id, v.type === 'single_choice')}
                              className="px-4 py-2 rounded-lg text-sm font-medium transition-all border-2"
                              style={{
                                backgroundColor: isSelected ? 'hsl(var(--terracotta))' : 'transparent',
                                borderColor: isSelected ? 'hsl(var(--terracotta))' : 'hsl(var(--sand))',
                                color: isSelected ? 'hsl(var(--warm-white))' : 'hsl(var(--earth))',
                              }}>
                              {opt.label}{opt.price_modifier > 0 && <span className="opacity-80 ml-1">+${opt.price_modifier}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity selector */}
              <div className="py-5 border-b" style={{ borderColor: 'hsl(var(--sand))' }}>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'hsl(var(--earth))' }}>Cantidad</h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 rounded-full" style={{ borderColor: 'hsl(var(--sand))' }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || outOfStock}
                      className="p-3 disabled:opacity-30" style={{ color: 'hsl(var(--earth))' }}>
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-semibold min-w-[2.5rem] text-center" style={{ color: 'hsl(var(--earth))' }}>{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))} disabled={quantity >= product.stock || outOfStock}
                      className="p-3 disabled:opacity-30" style={{ color: 'hsl(var(--earth))' }}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: outOfStock ? 'hsl(var(--terracotta))' : 'hsl(var(--olive))' }}>
                    {outOfStock ? 'Agotado' : `${product.stock} disponibles`}
                  </p>
                </div>
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:flex flex-col gap-3 py-5">
                <button onClick={handleAddToCart} disabled={outOfStock}
                  className="clare-btn clare-btn-primary w-full py-4 text-base flex justify-center uppercase tracking-widest font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:transform-none">
                  <ShoppingBag size={20} className="mr-2" />
                  {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
                </button>
                {product.external_link && (
                  <a href={product.external_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm underline hover:opacity-80" style={{ color: 'hsl(var(--terracotta))' }}>
                    <ExternalLink size={14} /> Ver más información
                  </a>
                )}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 py-4 border-t" style={{ borderColor: 'hsl(var(--sand))' }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--soft-brown))' }}>
                  <Truck size={18} style={{ color: 'hsl(var(--olive))' }} />
                  <span>Envíos a todo el país</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--soft-brown))' }}>
                  <ShieldCheck size={18} style={{ color: 'hsl(var(--olive))' }} />
                  <span>Hecho a mano con fe</span>
                </div>
              </div>

              {/* Collapsible: Description */}
              {product.description && (
                <div className="border-t" style={{ borderColor: 'hsl(var(--sand))' }}>
                  <button onClick={() => setDescOpen(o => !o)}
                    className="w-full flex items-center justify-between py-4 text-left">
                    <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--earth))' }}>
                      Detalles del producto
                    </span>
                    <ChevronRightIcon size={18} className="transition-transform" style={{ color: 'hsl(var(--earth))', transform: descOpen ? 'rotate(90deg)' : 'none' }} />
                  </button>
                  {descOpen && (
                    <div className="pb-5 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'hsl(var(--soft-brown))' }}>
                      {product.description}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible: Shipping */}
              <div className="border-t" style={{ borderColor: 'hsl(var(--sand))' }}>
                <button onClick={() => setShipOpen(o => !o)}
                  className="w-full flex items-center justify-between py-4 text-left">
                  <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--earth))' }}>
                    Envíos y pagos
                  </span>
                  <ChevronRightIcon size={18} className="transition-transform" style={{ color: 'hsl(var(--earth))', transform: shipOpen ? 'rotate(90deg)' : 'none' }} />
                </button>
                {shipOpen && (
                  <div className="pb-5 text-sm leading-relaxed space-y-2" style={{ color: 'hsl(var(--soft-brown))' }}>
                    <p>📦 Realizamos envíos a todo el país coordinados por WhatsApp.</p>
                    <p>💳 Aceptamos transferencia bancaria o pago contra entrega.</p>
                    <p>🤝 Cualquier consulta, escribinos directamente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom bar (mobile only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t shadow-2xl" style={{ backgroundColor: 'hsl(var(--warm-white))', borderColor: 'hsl(var(--sand))' }}>
        <div className="flex items-center gap-3 p-3">
          <div className="flex-shrink-0">
            <p className="text-xs uppercase tracking-wide" style={{ color: 'hsl(var(--soft-brown))' }}>Total</p>
            <p className="text-lg font-bold leading-tight" style={{ color: 'hsl(var(--terracotta))' }}>
              ${(finalPrice * quantity).toLocaleString('es-AR')}
            </p>
          </div>
          <button onClick={handleAddToCart} disabled={outOfStock}
            className="flex-1 py-3.5 rounded-full font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'hsl(var(--terracotta))', color: 'hsl(var(--warm-white))' }}>
            <ShoppingBag size={18} />
            {outOfStock ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
