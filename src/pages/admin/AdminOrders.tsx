import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders')
      .select('*, customers(full_name, email, phone), order_items(*, products(name))')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  const updatePaymentStatus = async (id: string, payment_status: string) => {
    await supabase.from('orders').update({ payment_status }).eq('id', id);
    fetchOrders();
  };

  const exportCSV = () => {
    const headers = ['#', 'Cliente', 'Email', 'Total', 'Estado', 'Pago', 'Fecha'];
    const rows = orders.map(o => [
      o.order_number, o.customers?.full_name, o.customers?.email,
      o.total, o.status, o.payment_status,
      new Date(o.created_at).toLocaleDateString('es-AR'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pedidos-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'Preparando',
    shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
  };
  const paymentLabels: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmado', refunded: 'Reembolsado' };

  const selectStyle: React.CSSProperties = { borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>Pedidos</h1>
        <button onClick={exportCSV} className="clare-btn clare-btn-secondary text-sm"><Download size={16} /> Exportar CSV</button>
      </div>

      {loading ? <p style={{ color: 'hsl(var(--soft-brown))' }}>Cargando...</p> : orders.length === 0 ? (
        <p style={{ color: 'hsl(var(--soft-brown))' }}>Sin pedidos</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="clare-card">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-medium" style={{ color: 'hsl(var(--earth))' }}>Pedido #{order.order_number}</h3>
                  <p className="text-sm" style={{ color: 'hsl(var(--soft-brown))' }}>
                    {order.customers?.full_name} — {order.customers?.email}
                    {order.customers?.phone && ` — ${order.customers.phone}`}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'hsl(var(--soft-brown))' }}>
                    {new Date(order.created_at).toLocaleString('es-AR')}
                  </p>
                </div>
                <p className="text-xl font-bold" style={{ color: 'hsl(var(--terracotta))' }}>${Number(order.total).toLocaleString('es-AR')}</p>
              </div>

              {/* Items */}
              <div className="mb-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between py-1 text-sm" style={{ color: 'hsl(var(--soft-brown))' }}>
                    <span>{item.product_name} x{item.quantity}</span>
                    <span>${Number(item.total).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>

              {/* Status controls */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'hsl(var(--earth))' }}>Estado</label>
                  <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg border text-sm" style={selectStyle}>
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'hsl(var(--earth))' }}>Pago</label>
                  <select value={order.payment_status} onChange={e => updatePaymentStatus(order.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg border text-sm" style={selectStyle}>
                    {Object.entries(paymentLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              {order.notes && (
                <p className="mt-3 text-xs italic p-2 rounded" style={{ backgroundColor: 'hsl(var(--sand))', color: 'hsl(var(--soft-brown))' }}>
                  Nota: {order.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
