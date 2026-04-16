import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save } from 'lucide-react';

const SETTING_SLUG = 'store-setting-bank-transfer';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState('');
  const [recordId, setRecordId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('news').select('*').eq('slug', SETTING_SLUG).single();
      if (data) {
        setBankDetails(data.content || '');
        setRecordId(data.id);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title: 'Configuración: Datos Bancarios',
      slug: SETTING_SLUG,
      content: bankDetails,
      is_published: false // Hidden from news
    };

    if (recordId) {
      await supabase.from('news').update(payload).eq('id', recordId);
    } else {
      const { data } = await supabase.from('news').insert(payload).select().single();
      if (data) setRecordId(data.id);
    }
    
    setSaving(false);
    alert('Datos guardados correctamente.');
  };

  return (
    <div>
      <h1 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>Configuración</h1>
      
      {loading ? (
        <p style={{ color: 'hsl(var(--soft-brown))' }}>Cargando...</p>
      ) : (
        <div className="clare-card max-w-2xl bg-white border border-slate-200">
          <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--earth))' }}>Datos de Transferencia Bancaria</h3>
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--soft-brown))' }}>
            Estos datos aparecerán en la pantalla de pago al finalizar el checkout cuando el cliente elija la opción "Transferencia".
          </p>
          <textarea
            value={bankDetails}
            onChange={e => setBankDetails(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm resize-none mb-4"
            rows={6}
            style={{ borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--cream))', color: 'hsl(var(--earth))' }}
            placeholder={`Ejemplo:\nBanco: Santander\nCBU: 07200000000000\nAlias: CLARE.ESPACIO\nTitular: Maria Perez`}
          />
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="clare-btn clare-btn-primary text-sm flex items-center gap-2">
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
