import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Save, X, Upload, Image, Tag, Percent } from 'lucide-react';

interface ProductImage { id: string; url: string; alt_text: string | null; sort_order: number | null }
interface VariantOption { id?: string; label: string; price_modifier: number; sort_order: number }
interface Variant { id?: string; name: string; type: 'single_choice' | 'multiple_choice'; sort_order: number; options: VariantOption[] }
interface Product {
  id: string; name: string; slug: string; description: string | null;
  short_description: string | null; price: number; stock: number;
  is_active: boolean | null; is_featured: boolean | null;
  category_id: string | null; external_link: string | null;
  product_images: ProductImage[];
}
interface Category { id: string; name: string }
interface Discount {
  id?: string; name: string; type: 'category' | 'product';
  target_id: string; percentage: number;
  starts_at: string | null; ends_at: string | null; is_active: boolean;
}

const MAX_IMAGES = 2;

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<'products' | 'discounts'>('products');
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [editingDiscount, setEditingDiscount] = useState<Partial<Discount> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*, product_images(*)').order('name');
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name').order('name');
    setCategories(data || []);
  };

  const fetchDiscounts = async () => {
    const { data } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
    setDiscounts((data as Discount[]) || []);
  };

  const fetchVariants = async (productId: string) => {
    const { data: vData } = await supabase
      .from('product_variants').select('*').eq('product_id', productId).order('sort_order');
    if (!vData) { setVariants([]); return; }
    const variantsWithOpts: Variant[] = [];
    for (const v of vData) {
      const { data: opts } = await supabase
        .from('product_variant_options').select('*').eq('variant_id', v.id).order('sort_order');
      variantsWithOpts.push({ ...v, type: v.type as Variant['type'], options: (opts || []) as VariantOption[] });
    }
    setVariants(variantsWithOpts);
  };

  useEffect(() => { fetchProducts(); fetchCategories(); fetchDiscounts(); }, []);

  const slugify = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existingImageCount = editing?.product_images?.length || 0;
  const canAddMore = existingImageCount + pendingImages.length < MAX_IMAGES;

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const remaining = MAX_IMAGES - existingImageCount - pendingImages.length;
    const toAdd = arr.slice(0, remaining);
    const newPending = [...pendingImages, ...toAdd];
    setPendingImages(newPending);
    setPreviewUrls(newPending.map(f => URL.createObjectURL(f)));
  };

  const removePendingImage = (idx: number) => {
    const next = pendingImages.filter((_, i) => i !== idx);
    setPendingImages(next);
    setPreviewUrls(next.map(f => URL.createObjectURL(f)));
  };

  const uploadImages = async (productId: string) => {
    for (const file of pendingImages) {
      const ext = file.name.split('.').pop();
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        await supabase.from('product_images').insert({
          product_id: productId, url: urlData.publicUrl, alt_text: file.name, sort_order: 0,
        });
      }
    }
    setPendingImages([]);
    setPreviewUrls([]);
  };

  const saveVariants = async (productId: string) => {
    // Delete removed variants
    const { data: existing } = await supabase.from('product_variants').select('id').eq('product_id', productId);
    const existingIds = (existing || []).map(v => v.id);
    const keepIds = variants.filter(v => v.id).map(v => v.id!);
    const toDelete = existingIds.filter(id => !keepIds.includes(id));
    for (const id of toDelete) {
      await supabase.from('product_variants').delete().eq('id', id);
    }

    for (const v of variants) {
      let variantId = v.id;
      if (v.id) {
        await supabase.from('product_variants').update({ name: v.name, type: v.type, sort_order: v.sort_order }).eq('id', v.id);
      } else {
        const { data } = await supabase.from('product_variants').insert({ product_id: productId, name: v.name, type: v.type, sort_order: v.sort_order }).select('id').single();
        variantId = data?.id;
      }
      if (!variantId) continue;

      // Sync options
      const { data: existingOpts } = await supabase.from('product_variant_options').select('id').eq('variant_id', variantId);
      const existingOptIds = (existingOpts || []).map(o => o.id);
      const keepOptIds = v.options.filter(o => o.id).map(o => o.id!);
      const deleteOptIds = existingOptIds.filter(id => !keepOptIds.includes(id));
      for (const id of deleteOptIds) {
        await supabase.from('product_variant_options').delete().eq('id', id);
      }

      for (const opt of v.options) {
        if (opt.id) {
          await supabase.from('product_variant_options').update({ label: opt.label, price_modifier: opt.price_modifier, sort_order: opt.sort_order }).eq('id', opt.id);
        } else {
          await supabase.from('product_variant_options').insert({ variant_id: variantId, label: opt.label, price_modifier: opt.price_modifier, sort_order: opt.sort_order });
        }
      }
    }
  };

  const handleSave = async () => {
    if (!editing?.name) return;
    setUploading(true);
    const slug = editing.slug || slugify(editing.name);
    const payload = {
      name: editing.name, slug,
      description: editing.description || null,
      short_description: editing.short_description || null,
      price: Number(editing.price) || 0,
      stock: Number(editing.stock) || 0,
      is_active: editing.is_active ?? true,
      is_featured: editing.is_featured ?? false,
      category_id: editing.category_id || null,
      external_link: editing.external_link || null,
    };

    let productId = editing.id;
    if (editing.id) {
      await supabase.from('products').update(payload).eq('id', editing.id);
    } else {
      const { data } = await supabase.from('products').insert(payload).select('id').single();
      productId = data?.id;
    }

    if (productId) {
      await uploadImages(productId);
      await saveVariants(productId);
    }

    setUploading(false);
    setEditing(null);
    setVariants([]);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const handleDeleteImage = async (imageId: string) => {
    await supabase.from('product_images').delete().eq('id', imageId);
    if (editing?.id) {
      const updated = (editing.product_images || []).filter(i => i.id !== imageId);
      setEditing(prev => prev ? { ...prev, product_images: updated } : null);
    }
    fetchProducts();
  };

  const startEdit = async (product?: Partial<Product>) => {
    setPendingImages([]);
    setPreviewUrls([]);
    if (product?.id) {
      setEditing(product);
      await fetchVariants(product.id);
    } else {
      setEditing({ is_active: true, is_featured: false, stock: 0, price: 0 });
      setVariants([]);
    }
  };

  // Variant helpers
  const addVariant = () => setVariants(v => [...v, { name: '', type: 'single_choice', sort_order: v.length, options: [] }]);
  const removeVariant = (idx: number) => setVariants(v => v.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, field: Partial<Variant>) => setVariants(v => v.map((vr, i) => i === idx ? { ...vr, ...field } : vr));
  const addOption = (vIdx: number) => setVariants(v => v.map((vr, i) => i === vIdx ? { ...vr, options: [...vr.options, { label: '', price_modifier: 0, sort_order: vr.options.length }] } : vr));
  const removeOption = (vIdx: number, oIdx: number) => setVariants(v => v.map((vr, i) => i === vIdx ? { ...vr, options: vr.options.filter((_, j) => j !== oIdx) } : vr));
  const updateOption = (vIdx: number, oIdx: number, field: Partial<VariantOption>) => setVariants(v => v.map((vr, i) => i === vIdx ? { ...vr, options: vr.options.map((o, j) => j === oIdx ? { ...o, ...field } : o) } : vr));

  // Discount handlers
  const handleSaveDiscount = async () => {
    if (!editingDiscount?.name || !editingDiscount.target_id) return;
    const payload = {
      name: editingDiscount.name,
      type: editingDiscount.type || 'category' as const,
      target_id: editingDiscount.target_id,
      percentage: Number(editingDiscount.percentage) || 0,
      starts_at: editingDiscount.starts_at || null,
      ends_at: editingDiscount.ends_at || null,
      is_active: editingDiscount.is_active ?? true,
    };
    if (editingDiscount.id) {
      await supabase.from('discounts').update(payload).eq('id', editingDiscount.id);
    } else {
      await supabase.from('discounts').insert(payload);
    }
    setEditingDiscount(null);
    fetchDiscounts();
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('¿Eliminar este descuento?')) return;
    await supabase.from('discounts').delete().eq('id', id);
    fetchDiscounts();
  };

  const inputStyle: React.CSSProperties = {
    borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))',
  };

  const sectionTitle: React.CSSProperties = { color: 'hsl(var(--earth))', fontFamily: 'var(--font-heading)' };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('products')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: tab === 'products' ? 'hsl(var(--earth))' : 'transparent',
            color: tab === 'products' ? 'hsl(var(--warm-white))' : 'hsl(var(--soft-brown))',
            border: tab === 'products' ? 'none' : '1px solid hsl(var(--sand))',
          }}>
          <Tag size={14} className="inline mr-1.5" style={{ verticalAlign: '-2px' }} /> Productos
        </button>
        <button onClick={() => setTab('discounts')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: tab === 'discounts' ? 'hsl(var(--earth))' : 'transparent',
            color: tab === 'discounts' ? 'hsl(var(--warm-white))' : 'hsl(var(--soft-brown))',
            border: tab === 'discounts' ? 'none' : '1px solid hsl(var(--sand))',
          }}>
          <Percent size={14} className="inline mr-1.5" style={{ verticalAlign: '-2px' }} /> Descuentos
        </button>
      </div>

      {/* ==================== PRODUCTS TAB ==================== */}
      {tab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl" style={sectionTitle}>Productos</h1>
            <button onClick={() => startEdit()} className="clare-btn clare-btn-primary text-sm">
              <Plus size={16} /> Nuevo producto
            </button>
          </div>

          {editing && (
            <div className="clare-card mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg" style={{ color: 'hsl(var(--earth))' }}>{editing.id ? 'Editar' : 'Nuevo'} producto</h3>
                <button onClick={() => { setEditing(null); setVariants([]); setPendingImages([]); setPreviewUrls([]); }} style={{ color: 'hsl(var(--soft-brown))' }}><X size={20} /></button>
              </div>

              {/* Basic info */}
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
                  <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Stock</label>
                  <input type="number" value={editing.stock || 0} onChange={e => setEditing(p => ({ ...p, stock: Number(e.target.value) }))}
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
                  <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Link externo</label>
                  <input value={editing.external_link || ''} onChange={e => setEditing(p => ({ ...p, external_link: e.target.value }))}
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

              {/* Images section — max 2 */}
              <div className="mt-6">
                <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(var(--earth))' }}>
                  <Image size={14} className="inline mr-1" style={{ verticalAlign: '-2px' }} />
                  Imágenes (máx. {MAX_IMAGES})
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {/* Existing images */}
                  {editing.product_images?.map(img => (
                    <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden" style={{ border: '2px solid hsl(var(--sand))' }}>
                      <img src={img.url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                      <button onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: 'hsl(var(--terracotta))', color: 'hsl(var(--warm-white))' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {/* Pending previews */}
                  {previewUrls.map((url, idx) => (
                    <div key={`pending-${idx}`} className="relative w-24 h-24 rounded-lg overflow-hidden" style={{ border: '2px dashed hsl(var(--terracotta))' }}>
                      <img src={url} alt="preview" className="w-full h-full object-cover opacity-80" />
                      <button onClick={() => removePendingImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: 'hsl(var(--terracotta))', color: 'hsl(var(--warm-white))' }}>
                        <X size={12} />
                      </button>
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] py-0.5"
                        style={{ backgroundColor: 'hsl(var(--terracotta) / 0.85)', color: 'hsl(var(--warm-white))' }}>
                        Pendiente
                      </span>
                    </div>
                  ))}
                  {/* Add button */}
                  {canAddMore && (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-lg flex flex-col items-center justify-center gap-1 text-xs transition-colors"
                      style={{ border: '2px dashed hsl(var(--sand))', color: 'hsl(var(--soft-brown))' }}>
                      <Upload size={20} />
                      <span>Subir foto</span>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => { handleFileSelect(e.target.files); e.target.value = ''; }} />
                <p className="text-xs" style={{ color: 'hsl(var(--soft-brown))' }}>
                  Podés subir desde tu PC o galería del celular. Máximo {MAX_IMAGES} fotos.
                </p>
              </div>

              {/* Variants section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium" style={{ color: 'hsl(var(--earth))' }}>
                    <Tag size={14} className="inline mr-1" style={{ verticalAlign: '-2px' }} /> Variantes
                  </label>
                  <button onClick={addVariant} className="text-xs px-2 py-1 rounded-lg"
                    style={{ color: 'hsl(var(--terracotta))', border: '1px solid hsl(var(--terracotta))' }}>
                    + Agregar variante
                  </button>
                </div>

                {variants.map((v, vIdx) => (
                  <div key={vIdx} className="p-3 rounded-lg mb-3" style={{ border: '1px solid hsl(var(--sand))', backgroundColor: 'hsl(var(--cream))' }}>
                    <div className="flex gap-2 items-start mb-2">
                      <div className="flex-1">
                        <input value={v.name} onChange={e => updateVariant(vIdx, { name: e.target.value })}
                          placeholder="Nombre (ej: Color, Tamaño)"
                          className="w-full px-3 py-1.5 rounded-lg border text-sm" style={inputStyle} />
                      </div>
                      <select value={v.type} onChange={e => updateVariant(vIdx, { type: e.target.value as Variant['type'] })}
                        className="px-2 py-1.5 rounded-lg border text-sm" style={inputStyle}>
                        <option value="single_choice">Opción única</option>
                        <option value="multiple_choice">Opción múltiple</option>
                      </select>
                      <button onClick={() => removeVariant(vIdx)} style={{ color: 'hsl(var(--terracotta))' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Options */}
                    <div className="space-y-1.5 ml-2">
                      {v.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-2 items-center">
                          <input value={opt.label} onChange={e => updateOption(vIdx, oIdx, { label: e.target.value })}
                            placeholder="Etiqueta (ej: Rojo)"
                            className="flex-1 px-2 py-1 rounded border text-sm" style={inputStyle} />
                          <input type="number" step="0.01" value={opt.price_modifier || ''} onChange={e => updateOption(vIdx, oIdx, { price_modifier: Number(e.target.value) })}
                            placeholder="+$0"
                            className="w-20 px-2 py-1 rounded border text-sm" style={inputStyle} />
                          <button onClick={() => removeOption(vIdx, oIdx)} style={{ color: 'hsl(var(--terracotta))' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addOption(vIdx)} className="text-xs mt-1" style={{ color: 'hsl(var(--terracotta))' }}>
                        + Agregar opción
                      </button>
                    </div>
                  </div>
                ))}

                {variants.length === 0 && (
                  <p className="text-xs" style={{ color: 'hsl(var(--soft-brown))' }}>
                    Sin variantes. Agregá variantes para personalizar colores, tamaños, etc.
                  </p>
                )}
              </div>

              {/* Save */}
              <div className="mt-6 flex gap-3">
                <button onClick={handleSave} disabled={uploading} className="clare-btn clare-btn-primary text-sm">
                  <Save size={16} /> {uploading ? 'Guardando...' : 'Guardar'}
                </button>
                <button onClick={() => { setEditing(null); setVariants([]); setPendingImages([]); setPreviewUrls([]); }}
                  className="clare-btn clare-btn-secondary text-sm">Cancelar</button>
              </div>
            </div>
          )}

          {/* Products table */}
          {loading ? (
            <p style={{ color: 'hsl(var(--soft-brown))' }}>Cargando...</p>
          ) : products.length === 0 ? (
            <div className="clare-card text-center py-12">
              <p style={{ color: 'hsl(var(--soft-brown))' }}>No hay productos aún. Creá el primero.</p>
            </div>
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
                        {prod.product_images?.[0] ? (
                          <img src={prod.product_images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded flex items-center justify-center"
                            style={{ backgroundColor: 'hsl(var(--sand) / 0.3)' }}>
                            <Image size={16} style={{ color: 'hsl(var(--soft-brown))' }} />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium" style={{ color: 'hsl(var(--earth))' }}>{prod.name}</span>
                          {prod.is_featured && (
                            <span className="w-fit text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider" 
                                style={{ backgroundColor: 'hsl(var(--earth))', color: 'hsl(var(--warm-white))' }}>
                              Destacado
                            </span>
                          )}
                        </div>
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
                        <button onClick={() => startEdit(prod)} className="p-1.5 rounded" style={{ color: 'hsl(var(--soft-brown))' }}><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(prod.id)} className="p-1.5 rounded ml-1" style={{ color: 'hsl(var(--terracotta))' }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== DISCOUNTS TAB ==================== */}
      {tab === 'discounts' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl" style={sectionTitle}>Descuentos</h1>
            <button onClick={() => setEditingDiscount({ is_active: true, percentage: 0, type: 'category' })}
              className="clare-btn clare-btn-primary text-sm">
              <Plus size={16} /> Nuevo descuento
            </button>
          </div>

          {editingDiscount && (
            <div className="clare-card mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg" style={{ color: 'hsl(var(--earth))' }}>{editingDiscount.id ? 'Editar' : 'Nuevo'} descuento</h3>
                <button onClick={() => setEditingDiscount(null)} style={{ color: 'hsl(var(--soft-brown))' }}><X size={20} /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Nombre *</label>
                  <input value={editingDiscount.name || ''} onChange={e => setEditingDiscount(p => p ? { ...p, name: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} placeholder="Ej: Promo Pascua" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Porcentaje *</label>
                  <input type="number" step="1" min="0" max="100" value={editingDiscount.percentage || ''}
                    onChange={e => setEditingDiscount(p => p ? { ...p, percentage: Number(e.target.value) } : p)}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} placeholder="10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Aplicar a</label>
                  <select value={editingDiscount.type || 'category'}
                    onChange={e => setEditingDiscount(p => p ? { ...p, type: e.target.value as 'category' | 'product', target_id: '' } : p)}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle}>
                    <option value="category">Categoría</option>
                    <option value="product">Producto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>
                    {editingDiscount.type === 'product' ? 'Producto' : 'Categoría'} *
                  </label>
                  <select value={editingDiscount.target_id || ''}
                    onChange={e => setEditingDiscount(p => p ? { ...p, target_id: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle}>
                    <option value="">Seleccionar...</option>
                    {editingDiscount.type === 'product'
                      ? products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                      : categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Desde</label>
                  <input type="datetime-local" value={editingDiscount.starts_at?.slice(0, 16) || ''}
                    onChange={e => setEditingDiscount(p => p ? { ...p, starts_at: e.target.value || null } : p)}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Hasta</label>
                  <input type="datetime-local" value={editingDiscount.ends_at?.slice(0, 16) || ''}
                    onChange={e => setEditingDiscount(p => p ? { ...p, ends_at: e.target.value || null } : p)}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm" style={{ color: 'hsl(var(--earth))' }}>
                    <input type="checkbox" checked={editingDiscount.is_active ?? true}
                      onChange={e => setEditingDiscount(p => p ? { ...p, is_active: e.target.checked } : p)}
                      style={{ accentColor: 'hsl(var(--terracotta))' }} /> Activo
                  </label>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={handleSaveDiscount} className="clare-btn clare-btn-primary text-sm"><Save size={16} /> Guardar</button>
                <button onClick={() => setEditingDiscount(null)} className="clare-btn clare-btn-secondary text-sm">Cancelar</button>
              </div>
            </div>
          )}

          {discounts.length === 0 ? (
            <div className="clare-card text-center py-12">
              <p style={{ color: 'hsl(var(--soft-brown))' }}>No hay descuentos aún. Creá el primero.</p>
            </div>
          ) : (
            <div className="clare-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid hsl(var(--sand))' }}>
                    <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Nombre</th>
                    <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>%</th>
                    <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Aplica a</th>
                    <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Estado</th>
                    <th className="text-right py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map(d => {
                    const targetName = d.type === 'product'
                      ? products.find(p => p.id === d.target_id)?.name
                      : categories.find(c => c.id === d.target_id)?.name;
                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid hsl(var(--sand))' }}>
                        <td className="py-3" style={{ color: 'hsl(var(--earth))' }}>{d.name}</td>
                        <td className="py-3" style={{ color: 'hsl(var(--terracotta))' }}>{d.percentage}%</td>
                        <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--sand) / 0.4)' }}>
                            {d.type === 'product' ? 'Producto' : 'Categoría'}
                          </span>{' '}
                          {targetName || '—'}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 rounded-full text-xs"
                            style={{ backgroundColor: d.is_active ? 'hsl(var(--olive) / 0.15)' : 'hsl(var(--sand))', color: d.is_active ? 'hsl(var(--olive))' : 'hsl(var(--soft-brown))' }}>
                            {d.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button onClick={() => setEditingDiscount(d)} className="p-1.5 rounded" style={{ color: 'hsl(var(--soft-brown))' }}><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteDiscount(d.id!)} className="p-1.5 rounded ml-1" style={{ color: 'hsl(var(--terracotta))' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
