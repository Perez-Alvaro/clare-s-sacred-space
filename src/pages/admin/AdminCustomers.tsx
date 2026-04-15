import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download } from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('customers').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setCustomers(data || []); setLoading(false); });
  }, []);

  const exportCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Ciudad', 'Provincia', 'Fecha'];
    const rows = customers.map(c => [c.full_name, c.email, c.phone || '', c.city || '', c.province || '', new Date(c.created_at).toLocaleDateString('es-AR')]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `clientes-${Date.now()}.csv`; a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>Clientes</h1>
        <button onClick={exportCSV} className="clare-btn clare-btn-secondary text-sm"><Download size={16} /> Exportar CSV</button>
      </div>

      {loading ? <p style={{ color: 'hsl(var(--soft-brown))' }}>Cargando...</p> : (
        <div className="clare-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: '2px solid hsl(var(--sand))' }}>
              {['Nombre', 'Email', 'Teléfono', 'Ciudad', 'Fecha'].map(h => (
                <th key={h} className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid hsl(var(--sand))' }}>
                  <td className="py-3" style={{ color: 'hsl(var(--earth))' }}>{c.full_name}</td>
                  <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>{c.email}</td>
                  <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>{c.phone || '—'}</td>
                  <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>{c.city || '—'}</td>
                  <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>{new Date(c.created_at).toLocaleDateString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
