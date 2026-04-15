import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Save, X, Upload } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  category_id: string | null;
  external_link: string | null;
  sort_order: number | null;
  product_images: { id: string; url: string; alt_text: string | null; sort_order: number | null }[];
}

interface Category { id: string; name: string; }

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*, product_images(*)').order('sort_order');
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name').order('sort_order');
    setCategories(data || []);
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const slugify = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    if (!editing?.name) return;
    const slug = editing.slug || slugify(editing.name);
    const payload = {
      name: editing.name, slug, description: editing.description || null,
      short_description: editing.short_description || null,
      price: Number(editing.price) || 0,
      compare_at_price: editing.compare_at_price ? Number(editing.compare_at_price) : null,
      stock: Number(editing.stock) || 0, sku: editing.sku || null,
      is_active: editing.is_active ?? true, is_featured: editing.is_featured ?? false,
      category_id: editing.category_id || null, external_link: editing.external_link || null,
      sort_order: Number(editing.sort_order) || 0,
    };

    if (editing.id) {
      await supabase.from('products').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('products').insert(payload);
    }
    setEditing(null);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const handleImageUpload = async (productId: string, files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${productId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        await supabase.from('product_images').insert({
          product_id: productId, url: urlData.publicUrl, alt_text: file.name,
          sort_order: 0,
        });
      }
    }
    setUploading(false);
    fetchProducts();
  };

  const handleDeleteImage = async (imageId: string) => {
    await supabase.from('product_images').delete().eq('id', imageId);
    fetchProducts();
  };

  const inputStyle: React.CSSProperties = {
    borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>Productos</h1>
        <button onClick={() => setEditing({ is_active: true, is_featured: false, stock: 0, price: 0, sort_order: 0 })}
          className="clare-btn clare-btn-primary text-sm">
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="clare-card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg" style={{ color: 'hsl(var(--earth))' }}>{editing.id ? 'Editar' : 'Nuevo'} producto</h3>
            <button onClick={() => setEditing(null)} style={{ color: 'hsl(var(--soft-brown))' }}><X size={20} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Nombre *</label>
              <input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Slug</label>
              <input value={editing.slug || ''} onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} placeholder="auto-generado" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Precio *</label>
              <input type="number" step="0.01" value={editing.price || ''} onChange={e => setEditing(p => ({ ...p, price: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Precio comparativo</label>
              <input type="number" step="0.01" value={editing.compare_at_price || ''} onChange={e => setEditing(p => ({ ...p, compare_at_price: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Stock</label>
              <input type="number" value={editing.stock || 0} onChange={e => setEditing(p => ({ ...p, stock: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>SKU</label>
              <input value={editing.sku || ''} onChange={e => setEditing(p => ({ ...p, sku: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Categoría</label>
              <select value={editing.category_id || ''} onChange={e => setEditing(p => ({ ...p, category_id: e.target.value || null }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle}>
                <option value="">Sin categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Orden</label>
              <input type="number" value={editing.sort_order || 0} onChange={e => setEditing(p => ({ ...p, sort_order: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Descripción corta</label>
              <input value={editing.short_description || ''} onChange={e => setEditing(p => ({ ...p, short_description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Descripción completa</label>
              <textarea rows={4} value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={inputStyle} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Link externo</label>
              <input value={editing.external_link || ''} onChange={e => setEditing(p => ({ ...p, external_link: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
            </div>
            <div className="flex gap-4 items-center sm:col-span-2">
              <label className="flex items-center gap-2 text-sm" style={{ color: 'hsl(var(--earth))' }}>
                <input type="checkbox" checked={editing.is_active ?? true} onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))}
                  style={{ accentColor: 'hsl(var(--terracotta))' }} /> Activo
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'hsl(var(--earth))' }}>
                <input type="checkbox" checked={editing.is_featured ?? false} onChange={e => setEditing(p => ({ ...p, is_featured: e.target.checked }))}
                  style={{ accentColor: 'hsl(var(--terracotta))' }} /> Destacado
              </label>
            </div>
          </div>

          {/* Images for existing products */}
          {editing.id && (
            <div className="mt-6">
              <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(var(--earth))' }}>Imágenes</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {editing.product_images?.map(img => (
                  <div key={img.id} className="relative w-20 h-20">
                    <img src={img.url} alt={img.alt_text || ''} className="w-full h-full object-cover rounded-lg" />
                    <button onClick={() => handleDeleteImage(img.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'hsl(var(--terracotta))', color: 'hsl(var(--warm-white))' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="clare-btn clare-btn-secondary text-sm cursor-pointer inline-flex">
                <Upload size={16} /> {uploading ? 'Subiendo...' : 'Subir imágenes'}
                <input type="file" multiple accept="image/*" className="hidden"
                  onChange={e => e.target.files && handleImageUpload(editing.id!, e.target.files)} />
              </label>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button onClick={handleSave} className="clare-btn clare-btn-primary text-sm"><Save size={16} /> Guardar</button>
            <button onClick={() => setEditing(null)} className="clare-btn clare-btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Products table */}
      {loading ? (
        <p style={{ color: 'hsl(var(--soft-brown))' }}>Cargando...</p>
      ) : (
        <div className="clare-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid hsl(var(--sand))' }}>
                <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Producto</th>
                <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Precio</th>
                <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Stock</th>
                <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Estado</th>
                <th className="text-right py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id} style={{ borderBottom: '1px solid hsl(var(--sand))' }}>
                  <td className="py-3 flex items-center gap-3">
                    {prod.product_images?.[0] && (
                      <img src={prod.product_images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    <span style={{ color: 'hsl(var(--earth))' }}>{prod.name}</span>
                  </td>
                  <td className="py-3" style={{ color: 'hsl(var(--terracotta))' }}>${prod.price.toLocaleString('es-AR')}</td>
                  <td className="py-3" style={{ color: prod.stock <= 0 ? 'hsl(var(--terracotta))' : 'hsl(var(--soft-brown))' }}>{prod.stock}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs"
                      style={{ backgroundColor: prod.is_active ? 'hsl(var(--olive) / 0.15)' : 'hsl(var(--sand))', color: prod.is_active ? 'hsl(var(--olive))' : 'hsl(var(--soft-brown))' }}>
                      {prod.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => setEditing(prod)} className="p-1.5 rounded" style={{ color: 'hsl(var(--soft-brown))' }}><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(prod.id)} className="p-1.5 rounded ml-1" style={{ color: 'hsl(var(--terracotta))' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
