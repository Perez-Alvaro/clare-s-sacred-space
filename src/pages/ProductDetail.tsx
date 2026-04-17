import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, ChevronRight, ExternalLink, ArrowLeft } from 'lucide-react';
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
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('id', id)
        .single();
      
      if (!data) {
        setLoading(false);
        return;
      }
      
      setProduct(data as Product);
      setImages([...(data.product_images || [])].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)));

      // Fetch variants
      const { data: vData } = await supabase.from('product_variants').select('*').eq('product_id', id).order('sort_order');
      if (vData && vData.length > 0) {
        const filledVariants = [];
        const initSelections: Record<string, string[]> = {};
        for (const v of vData) {
          const { data: opts } = await supabase.from('product_variant_options').select('*').eq('variant_id', v.id).order('sort_order');
          if (opts && opts.length > 0) {
            filledVariants.push({ ...v, options: opts });
            if (v.type === 'single_choice') {
              initSelections[v.id] = [opts[0].id];
            } else {
              initSelections[v.id] = [];
            }
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
      v.options.forEach(opt => {
        if (selected.includes(opt.id)) sum += opt.price_modifier || 0;
      });
    });
    return sum;
  };

  const finalPrice = product.price + getModifiersSum();
  const finalComparePrice = product.compare_at_price ? product.compare_at_price + getModifiersSum() : null;

  const handleAddToCart = () => {
    const selectedVariantLabels = variants.map(v => {
      const selectedIds = selectedOptions[v.id] || [];
      const opts = v.options.filter(o => selectedIds.includes(o.id)).map(o => o.label);
      return opts.length > 0 ? `${v.name}: ${opts.join(', ')}` : null;
    }).filter(Boolean).join(' | ');

    const cartItemName = selectedVariantLabels ? `${product.name} (${selectedVariantLabels})` : product.name;
    const cartItemId = selectedVariantLabels ? `${product.id}-${btoa(selectedVariantLabels).replace(/=/g, '')}` : product.id;

    addItem({ id: cartItemId, product_id: product.id, name: cartItemName, price: finalPrice, image_url: images[0]?.url, stock: product.stock });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="clare-container">
          <Link to="/tienda" className="inline-flex items-center gap-2 mb-6 text-sm hover:underline transition-all" style={{ color: 'hsl(var(--soft-brown))' }}>
            <ArrowLeft size={16} /> Volver a la tienda
          </Link>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
            {/* Gallery Section */}
            <div className="w-full md:w-1/2 relative bg-slate-50 min-h-[400px] md:min-h-[600px] flex items-center justify-center p-4">
              {images.length > 0 ? (
                <>
                  <div className="w-full h-full relative rounded-xl overflow-hidden shadow-inner">
                    <img src={images[currentImage]?.url} alt={images[currentImage]?.alt_text || product.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" />
                  </div>
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImage(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-transform hover:scale-110" 
                        style={{ backgroundColor: 'hsla(var(--warm-white), 0.95)' }}>
                        <ChevronLeft size={24} style={{ color: 'hsl(var(--earth))' }} />
                      </button>
                      <button onClick={() => setCurrentImage(i => (i + 1) % images.length)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-transform hover:scale-110" 
                        style={{ backgroundColor: 'hsla(var(--warm-white), 0.95)' }}>
                        <ChevronRight size={24} style={{ color: 'hsl(var(--earth))' }} />
                      </button>
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-3 rounded-full backdrop-blur-sm bg-black/10">
                        {images.map((_, idx) => (
                          <button key={idx} onClick={() => setCurrentImage(idx)}
                            className="w-3 h-3 rounded-full transition-all duration-300" 
                            style={{ 
                              backgroundColor: idx === currentImage ? 'hsl(var(--terracotta))' : 'hsla(var(--warm-white), 0.8)',
                              transform: idx === currentImage ? 'scale(1.2)' : 'scale(1)'
                            }} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <ShoppingBag size={80} className="mb-4" />
                  <p>Sin imagen</p>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
              <h1 className="text-3xl md:text-4xl mb-2 font-medium" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>
                {product.name}
              </h1>
              
              {product.short_description && (
                <p className="text-lg italic mb-6 break-words" style={{ color: 'hsl(var(--soft-brown))', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                  {product.short_description}
                </p>
              )}

              <div className="flex items-end gap-4 mb-6 pb-6 border-b" style={{ borderColor: 'hsl(var(--sand))' }}>
                <span className="text-4xl font-semibold" style={{ color: 'hsl(var(--terracotta))' }}>
                  ${finalPrice.toLocaleString('es-AR')}
                </span>
                {finalComparePrice && finalComparePrice > finalPrice && (
                  <span className="text-xl line-through mb-1" style={{ color: 'hsl(var(--soft-brown))' }}>
                    ${finalComparePrice.toLocaleString('es-AR')}
                  </span>
                )}
              </div>

              {/* Variants Section */}
              {variants.length > 0 && (
                <div className="space-y-6 mb-8">
                  {variants.map(v => (
                    <div key={v.id}>
                      <h4 className="text-base font-semibold mb-3 uppercase tracking-wide" style={{ color: 'hsl(var(--earth))' }}>
                        {v.name} {v.type === 'multiple_choice' && <span className="text-xs font-normal lowercase" style={{ color: 'hsl(var(--soft-brown))' }}>(Podés elegir varios)</span>}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {v.options.map(opt => {
                          const isSelected = (selectedOptions[v.id] || []).includes(opt.id);
                          return (
                            <button key={opt.id}
                              onClick={() => toggleOption(v.id, opt.id, v.type === 'single_choice')}
                              className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 border-2"
                              style={{ 
                                backgroundColor: isSelected ? 'hsl(var(--terracotta))' : 'transparent',
                                borderColor: isSelected ? 'hsl(var(--terracotta))' : 'hsl(var(--sand))',
                                color: isSelected ? 'hsl(var(--warm-white))' : 'hsl(var(--earth))',
                                transform: isSelected ? 'scale(1.02)' : 'none'
                              }}>
                              {opt.label} {opt.price_modifier > 0 && <span className="opacity-80 ml-1">(+${opt.price_modifier})</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="mb-8 p-6 rounded-2xl border-2" style={{ backgroundColor: 'hsl(var(--cream))', borderColor: 'hsl(var(--sand))' }}>
                  <h4 className="text-base font-semibold mb-4 uppercase tracking-wide" style={{ color: 'hsl(var(--earth))' }}>Detalles del producto</h4>
                  <div className="text-base leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'hsl(var(--soft-brown))', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                    {product.description}
                  </div>
                </div>
              )}

              {/* Add to Cart Area */}
              <div className="mt-auto flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: product.stock > 0 ? 'hsl(var(--olive))' : 'hsl(var(--terracotta))' }}>
                    {product.stock > 0 ? `Stock Disponible (${product.stock})` : 'Agotado'}
                  </p>
                  {product.external_link && (
                    <a href={product.external_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm underline transition-colors hover:opacity-80" style={{ color: 'hsl(var(--terracotta))' }}>
                      <ExternalLink size={14} /> Link externo
                    </a>
                  )}
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="clare-btn clare-btn-primary w-full py-5 text-lg flex justify-center uppercase tracking-widest font-bold shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:transform-none disabled:shadow-none">
                  <ShoppingBag size={22} className="mr-2" />
                  {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
