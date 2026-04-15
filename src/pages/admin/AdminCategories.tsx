import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface Category {
  id: string; name: string; slug: string; description: string | null;
  image_url: string | null; sort_order: number | null; is_active: boolean | null;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const slugify = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    if (!editing?.name) return;
    const slug = editing.slug || slugify(editing.name);
    const payload = { name: editing.name, slug, description: editing.description || null, image_url: editing.image_url || null, sort_order: Number(editing.sort_order) || 0, is_active: editing.is_active ?? true };
    if (editing.id) {
      await supabase.from('categories').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('categories').insert(payload);
    }
    setEditing(null);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetch();
  };

  const inputStyle: React.CSSProperties = { borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>Categorías</h1>
        <button onClick={() => setEditing({ is_active: true, sort_order: 0 })} className="clare-btn clare-btn-primary text-sm"><Plus size={16} /> Nueva</button>
      </div>

      {editing && (
        <div className="clare-card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg" style={{ color: 'hsl(var(--earth))' }}>{editing.id ? 'Editar' : 'Nueva'} categoría</h3>
            <button onClick={() => setEditing(null)} style={{ color: 'hsl(var(--soft-brown))' }}><X size={20} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Nombre *</label>
              <input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Slug</label>
              <input value={editing.slug || ''} onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} placeholder="auto" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Descripción</label>
              <textarea rows={2} value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={inputStyle} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Orden</label>
              <input type="number" value={editing.sort_order || 0} onChange={e => setEditing(p => ({ ...p, sort_order: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={editing.is_active ?? true} onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: 'hsl(var(--terracotta))' }} />
              <label className="text-sm" style={{ color: 'hsl(var(--earth))' }}>Activa</label>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleSave} className="clare-btn clare-btn-primary text-sm"><Save size={16} /> Guardar</button>
            <button onClick={() => setEditing(null)} className="clare-btn clare-btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: 'hsl(var(--soft-brown))' }}>Cargando...</p> : (
        <div className="clare-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: '2px solid hsl(var(--sand))' }}>
              <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Nombre</th>
              <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Slug</th>
              <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Estado</th>
              <th className="text-right py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Acciones</th>
            </tr></thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid hsl(var(--sand))' }}>
                  <td className="py-3" style={{ color: 'hsl(var(--earth))' }}>{cat.name}</td>
                  <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>{cat.slug}</td>
                  <td className="py-3"><span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: cat.is_active ? 'hsl(var(--olive) / 0.15)' : 'hsl(var(--sand))', color: cat.is_active ? 'hsl(var(--olive))' : 'hsl(var(--soft-brown))' }}>{cat.is_active ? 'Activa' : 'Inactiva'}</span></td>
                  <td className="py-3 text-right">
                    <button onClick={() => setEditing(cat)} className="p-1.5" style={{ color: 'hsl(var(--soft-brown))' }}><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 ml-1" style={{ color: 'hsl(var(--terracotta))' }}><Trash2 size={16} /></button>
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

export default AdminCategories;
