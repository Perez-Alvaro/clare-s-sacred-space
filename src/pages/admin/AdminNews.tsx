import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface NewsItem {
  id: string; title: string; slug: string; content: string | null;
  excerpt: string | null; image_url: string | null; is_published: boolean | null; published_at: string | null;
}

const AdminNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    setNews(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);

  const slugify = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    if (!editing?.title) return;
    const slug = editing.slug || slugify(editing.title);
    const payload = {
      title: editing.title, slug, content: editing.content || null,
      excerpt: editing.excerpt || null, image_url: editing.image_url || null,
      is_published: editing.is_published ?? false,
      published_at: editing.is_published ? (editing.published_at || new Date().toISOString()) : null,
    };
    if (editing.id) {
      await supabase.from('news').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('news').insert(payload);
    }
    setEditing(null);
    fetchNews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar?')) return;
    await supabase.from('news').delete().eq('id', id);
    fetchNews();
  };

  const inputStyle: React.CSSProperties = { borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>Novedades</h1>
        <button onClick={() => setEditing({ is_published: false })} className="clare-btn clare-btn-primary text-sm"><Plus size={16} /> Nueva</button>
      </div>

      {editing && (
        <div className="clare-card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg" style={{ color: 'hsl(var(--earth))' }}>{editing.id ? 'Editar' : 'Nueva'} novedad</h3>
            <button onClick={() => setEditing(null)} style={{ color: 'hsl(var(--soft-brown))' }}><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div><label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Título *</label>
              <input value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Extracto</label>
              <input value={editing.excerpt || ''} onChange={e => setEditing(p => ({ ...p, excerpt: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Contenido</label>
              <textarea rows={6} value={editing.content || ''} onChange={e => setEditing(p => ({ ...p, content: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={inputStyle} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>URL de imagen</label>
              <input value={editing.image_url || ''} onChange={e => setEditing(p => ({ ...p, image_url: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} /></div>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'hsl(var(--earth))' }}>
              <input type="checkbox" checked={editing.is_published ?? false} onChange={e => setEditing(p => ({ ...p, is_published: e.target.checked }))} style={{ accentColor: 'hsl(var(--terracotta))' }} /> Publicada
            </label>
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
              <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Título</th>
              <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Estado</th>
              <th className="text-right py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Acciones</th>
            </tr></thead>
            <tbody>
              {news.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid hsl(var(--sand))' }}>
                  <td className="py-3" style={{ color: 'hsl(var(--earth))' }}>{item.title}</td>
                  <td className="py-3"><span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: item.is_published ? 'hsl(var(--olive) / 0.15)' : 'hsl(var(--sand))', color: item.is_published ? 'hsl(var(--olive))' : 'hsl(var(--soft-brown))' }}>{item.is_published ? 'Publicada' : 'Borrador'}</span></td>
                  <td className="py-3 text-right">
                    <button onClick={() => setEditing(item)} className="p-1.5" style={{ color: 'hsl(var(--soft-brown))' }}><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 ml-1" style={{ color: 'hsl(var(--terracotta))' }}><Trash2 size={16} /></button>
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

export default AdminNews;
