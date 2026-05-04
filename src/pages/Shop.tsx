import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Eye, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import RevealOnScroll from '@/components/RevealOnScroll';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SmartImage from '@/components/SmartImage';

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  is_active: boolean | null;
  is_featured: boolean | null;
  category_id: string | null;
  external_link: string | null;
  product_images: { id: string; url: string; alt_text: string | null; sort_order: number | null }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*, product_images(*)').eq('is_active', true).order('sort_order'),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      ]);
      setProducts((prodRes.data as Product[]) || []);
      setCategories(catRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = (selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory))
    .sort((a, b) => {
      // Sort by featured first
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });

  const getMainImage = (product: Product) => {
    const sorted = [...(product.product_images || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return sorted[0]?.url;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="clare-container">
          {/* Header */}
          <RevealOnScroll>
            <div className="text-center mb-12">
              <p className="clare-script mb-4">Nuestras creaciones</p>
              <h1 className="mb-4">Tienda</h1>

            </div>
          </RevealOnScroll>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: selectedCategory === 'all' ? 'hsl(var(--terracotta))' : 'hsl(var(--sand))',
                  color: selectedCategory === 'all' ? 'hsl(var(--warm-white))' : 'hsl(var(--soft-brown))'
                }}>
                Todas
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: selectedCategory === cat.id ? 'hsl(var(--terracotta))' : 'hsl(var(--sand))',
                    color: selectedCategory === cat.id ? 'hsl(var(--warm-white))' : 'hsl(var(--soft-brown))'
                  }}>
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="clare-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="clare-card animate-pulse">
                  <div className="aspect-square rounded-lg mb-4" style={{ backgroundColor: 'hsl(var(--sand))' }} />
                  <div className="h-4 rounded mb-2 w-3/4" style={{ backgroundColor: 'hsl(var(--sand))' }} />
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'hsl(var(--sand))' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="clare-script text-xl mb-2" style={{ color: 'hsl(var(--terracotta))' }}>Sin productos aún</p>
              <p className="text-sm" style={{ color: 'hsl(var(--soft-brown))' }}>Pronto habrá nuevas creaciones.</p>
            </div>
          ) : (
            <div className="clare-grid">
              {filtered.map((product, index) => (
                <RevealOnScroll key={product.id} delay={index * 80}>
                  <div className="clare-card group h-full flex flex-col">
                    {/* Image */}
                    <Link to={`/producto/${product.id}`} className="relative overflow-hidden rounded-lg mb-4 aspect-square block group-hover:shadow-md transition-all">
                      {getMainImage(product) ? (
                        <SmartImage src={getMainImage(product)} alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--sand))' }}>
                          <ShoppingBag size={48} style={{ color: 'hsl(var(--soft-brown))' }} />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ backgroundColor: 'hsla(var(--earth), 0.3)' }}>
                        <span className="px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider" style={{ backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))' }}>
                          COMPRAR
                        </span>
                      </div>
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.is_featured && (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
                            style={{ backgroundColor: 'hsl(var(--earth))', color: 'hsl(var(--warm-white))' }}>
                            Destacado
                          </span>
                        )}
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
                            style={{ backgroundColor: 'hsl(var(--terracotta))', color: 'hsl(var(--warm-white))' }}>
                            Oferta
                          </span>
                        )}
                      </div>
                      {product.stock <= 0 && (
                        <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
                          style={{ backgroundColor: 'hsl(var(--soft-brown))', color: 'hsl(var(--warm-white))' }}>
                          Agotado
                        </span>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                      <Link to={`/producto/${product.id}`} className="hover:underline">
                        <h3 className="text-lg font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>{product.name}</h3>
                      </Link>
                      {product.short_description && (
                        <p className="text-sm mb-3 flex-1 line-clamp-2" style={{ color: 'hsl(var(--soft-brown))' }}>{product.short_description}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold" style={{ color: 'hsl(var(--terracotta))' }}>
                            ${product.price.toLocaleString('es-AR')}
                          </span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="text-sm line-through" style={{ color: 'hsl(var(--soft-brown))' }}>
                              ${product.compare_at_price.toLocaleString('es-AR')}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/producto/${product.id}`)}
                          className="px-6 py-2 rounded-full transition-all duration-300 text-sm font-bold uppercase tracking-wide hover:-translate-y-1 shadow-sm hover:shadow-md"
                          style={{ backgroundColor: 'hsl(var(--terracotta))', color: 'hsl(var(--warm-white))' }}>
                          COMPRAR
                        </button>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          )}
        </div>
      </div>


      <Footer />
    </div>
  );
};

export default Shop;
