import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download, MessageCircle } from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('customers').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setCustomers(data || []); setLoading(false); });
  }, []);

  const [waMessage, setWaMessage] = useState('¡Hola! Tenemos novedades exclusivas para vos en Clare\'s Sacred Space.');

  const exportCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Ciudad', 'Provincia', 'Fecha'];
    
    const escapeCsv = (str: any) => {
      if (str == null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = customers.map(c => [
      c.full_name, c.email, c.phone || '', c.city || '', c.province || '', new Date(c.created_at).toLocaleDateString('es-AR')
    ]);
    
    const csvContent = [headers.map(escapeCsv), ...rows.map(r => r.map(escapeCsv))].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `clientes-${Date.now()}.csv`; a.click();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>Clientes</h1>
        <button onClick={exportCSV} className="clare-btn clare-btn-secondary text-sm"><Download size={16} /> Exportar CSV</button>
      </div>

      <div className="clare-card mb-6 mb-8 bg-white" style={{ border: '1px solid hsl(var(--sand))' }}>
        <h3 className="text-lg font-medium mb-2" style={{ color: 'hsl(var(--earth))' }}>Promo por WhatsApp</h3>
        <p className="text-sm mb-4" style={{ color: 'hsl(var(--soft-brown))' }}>
          Escribe un mensaje genérico. Luego presiona el ícono de WhatsApp al lado de cada cliente para enviárselo directamente.
        </p>
        <textarea 
          value={waMessage} 
          onChange={e => setWaMessage(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
          rows={3}
          style={{ borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))' }}
          placeholder="Ej: ¡Hola! Tenemos un descuento especial..."
        />
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
                <tr key={c.id} style={{ borderBottom: '1px solid hsl(var(--sand))', backgroundColor: 'transparent' }} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3" style={{ color: 'hsl(var(--earth))' }}>{c.full_name}</td>
                  <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>{c.email}</td>
                  <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>
                    {c.phone ? (
                      <div className="flex items-center gap-2">
                        {c.phone}
                        <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`}
                           target="_blank" rel="noopener noreferrer"
                           title="Enviar WhatsApp"
                           className="text-green-600 hover:text-green-700 transition-colors">
                          <MessageCircle size={16} />
                        </a>
                      </div>
                    ) : '—'}
                  </td>
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
