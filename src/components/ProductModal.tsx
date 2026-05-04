import { X, ShoppingBag, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import SmartImage from './SmartImage';

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
  external_link?: string | null; // Added external_link
  product_images: ProductImage[];
}

interface VariantOption {
  id: string;
  label: string;
  price_modifier: number;
  sort_order: number;
}

interface Variant {
  id: string;
  name: string;
  type: 'single_choice' | 'multiple_choice';
  sort_order: number;
  options: VariantOption[];
}

interface Props {
  product: Product;
  onClose: () => void;
}

const ProductModal = ({ product, onClose }: Props) => {
  const images = [...(product.product_images || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const [currentImage, setCurrentImage] = useState(0);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const { addItem } = useCart();

  useEffect(() => {
    const loadVariants = async () => {
      const { data: vData } = await supabase.from('product_variants').select('*').eq('product_id', product.id).order('sort_order');
      if (!vData || vData.length === 0) return;
      
      const filledVariants = [];
      const initSelections: Record<string, string[]> = {};
      
      for (const v of vData) {
        const { data: opts } = await supabase.from('product_variant_options').select('*').eq('variant_id', v.id).order('sort_order');
        if (opts && opts.length > 0) {
          filledVariants.push({ ...v, options: opts });
          if (v.type === 'single_choice') {
            initSelections[v.id] = [opts[0].id]; // Default select the first option
          } else {
            initSelections[v.id] = [];
          }
        }
      }
      setVariants(filledVariants as Variant[]);
      setSelectedOptions(initSelections);
    };
    loadVariants();
  }, [product.id]);

  const toggleOption = (variantId: string, optionId: string, isSingle: boolean) => {
    setSelectedOptions(prev => {
      if (isSingle) return { ...prev, [variantId]: [optionId] };
      const current = prev[variantId] || [];
      const updated = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId];
      return { ...prev, [variantId]: updated };
    });
  };

  // Compute final price based on selected variants
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] overflow-y-auto md:rounded-xl animate-scale-in flex flex-col md:flex-row"
        style={{ backgroundColor: 'hsl(var(--cream))' }}
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full shadow-md"
          style={{ backgroundColor: 'hsl(var(--sand))', color: 'hsl(var(--earth))' }}>
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2 gap-0 w-full h-full">
          {/* Images */}
          <div className="relative w-full h-64 sm:h-80 md:h-full min-h-[250px] bg-slate-100">
            {images.length > 0 ? (
              <>
                <SmartImage src={images[currentImage]?.url} alt={images[currentImage]?.alt_text || product.name}
                  className="w-full h-full object-cover md:rounded-l-xl" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full shadow"
                      style={{ backgroundColor: 'hsla(var(--warm-white), 0.9)' }}>
                      <ChevronLeft size={20} style={{ color: 'hsl(var(--earth))' }} />
                    </button>
                    <button onClick={() => setCurrentImage(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full shadow"
                      style={{ backgroundColor: 'hsla(var(--warm-white), 0.9)' }}>
                      <ChevronRight size={20} style={{ color: 'hsl(var(--earth))' }} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
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
          <div className="p-6 md:p-8 flex flex-col pt-6 pb-24 md:pb-8">
            <h2 className="text-2xl mb-1 leading-tight" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>{product.name}</h2>
            {product.short_description && (
              <p className="text-sm italic mb-3" style={{ color: 'hsl(var(--soft-brown))' }}>{product.short_description}</p>
            )}

            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-semibold" style={{ color: 'hsl(var(--terracotta))' }}>
                ${finalPrice.toLocaleString('es-AR')}
              </span>
              {finalComparePrice && finalComparePrice > finalPrice && (
                <span className="text-lg line-through" style={{ color: 'hsl(var(--soft-brown))' }}>
                  ${finalComparePrice.toLocaleString('es-AR')}
                </span>
              )}
            </div>

            <p className="text-xs mb-4 uppercase tracking-wider" style={{ color: product.stock > 0 ? 'hsl(var(--olive))' : 'hsl(var(--terracotta))' }}>
              {product.stock > 0 ? `${product.stock} disponible${product.stock > 1 ? 's' : ''}` : 'Agotado'}
            </p>

            <div className="flex-1 overflow-y-auto pb-4 pr-1">
              {product.description && (
                <div className="text-sm leading-relaxed mb-6 space-y-2" style={{ color: 'hsl(var(--soft-brown))' }}>
                  {product.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}

              {/* Variants Section */}
              {variants.length > 0 && (
                <div className="space-y-5 mb-6">
                  {variants.map(v => (
                    <div key={v.id}>
                      <h4 className="text-sm font-semibold mb-2" style={{ color: 'hsl(var(--earth))' }}>
                        {v.name} {v.type === 'multiple_choice' && <span className="text-xs font-normal" style={{ color: 'hsl(var(--soft-brown))' }}>(Podés elegir varios)</span>}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {v.options.map(opt => {
                          const isSelected = (selectedOptions[v.id] || []).includes(opt.id);
                          return (
                            <button key={opt.id}
                              onClick={() => toggleOption(v.id, opt.id, v.type === 'single_choice')}
                              className="px-3 py-1.5 rounded-lg text-sm transition-all border"
                              style={{
                                backgroundColor: isSelected ? 'hsl(var(--terracotta))' : 'transparent',
                                borderColor: isSelected ? 'hsl(var(--terracotta))' : 'hsl(var(--sand))',
                                color: isSelected ? 'hsl(var(--warm-white))' : 'hsl(var(--earth))'
                              }}>
                              {opt.label} {opt.price_modifier > 0 && `(+$${opt.price_modifier})`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* External Link Option */}
              {product.external_link && (
                <a href={product.external_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm underline mb-4" style={{ color: 'hsl(var(--terracotta))' }}>
                  <ExternalLink size={16} /> Ver producto en sitio externo
                </a>
              )}
            </div>

            <div className="mt-auto pt-4 border-t" style={{ borderColor: 'hsl(var(--sand))' }}>
              <button
                onClick={() => {
                  const selectedVariantLabels = variants.map(v => {
                    const selectedIds = selectedOptions[v.id] || [];
                    const opts = v.options.filter(o => selectedIds.includes(o.id)).map(o => o.label);
                    return opts.length > 0 ? `${v.name}: ${opts.join(', ')}` : null;
                  }).filter(Boolean).join(' | ');

                  const cartItemName = selectedVariantLabels ? `${product.name} (${selectedVariantLabels})` : product.name;
                  const cartItemId = selectedVariantLabels ? `${product.id}-${btoa(selectedVariantLabels).replace(/=/g, '')}` : product.id;

                  addItem({ id: cartItemId, product_id: product.id, name: cartItemName, price: finalPrice, image_url: images[0]?.url, stock: product.stock });
                  onClose();
                }}
                disabled={product.stock <= 0}
                className="clare-btn clare-btn-primary w-full py-3 disabled:opacity-40 flex justify-center uppercase tracking-wide text-sm font-semibold">
                <ShoppingBag size={18} />
                {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
