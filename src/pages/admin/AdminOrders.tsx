import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders')
      .select('*, customers(full_name, email, phone), order_items(*, products(name))')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status: status as any }).eq('id', id);
    fetchOrders();
  };

  const updatePaymentStatus = async (id: string, payment_status: string) => {
    await supabase.from('orders').update({ payment_status: payment_status as any }).eq('id', id);
    fetchOrders();
  };

  const exportCSV = () => {
    const headers = ['Pedido', 'Cliente', 'Email', 'Telefono', 'Total', 'Estado', 'Pago', 'Fecha'];
    
    const escapeCsv = (str: any) => {
      if (str == null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = orders.map(o => [
      o.order_number, o.customers?.full_name, o.customers?.email, o.customers?.phone || '',
      o.total, statusLabels[o.status] || o.status, paymentLabels[o.payment_status] || o.payment_status,
      new Date(o.created_at).toLocaleDateString('es-AR'),
    ]);

    const csvContent = [headers.map(escapeCsv), ...rows.map(r => r.map(escapeCsv))].map(r => r.join(';')).join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
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
          {orders.map(order => {
            const isExpanded = expandedOrders.includes(order.id);
            return (
              <div key={order.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: 'hsl(var(--sand))' }}>
                
                {/* Header (Always Visible) */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-6 cursor-pointer flex justify-between items-center transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold" style={{ color: 'hsl(var(--earth))' }}>
                      #{order.order_number}
                    </h3>
                    {!isExpanded && (
                      <div className="hidden md:flex items-center gap-3">
                        <span className="text-sm font-medium" style={{ color: 'hsl(var(--soft-brown))' }}>
                          {order.customers?.full_name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" 
                          style={{ backgroundColor: 'hsl(var(--earth))', color: 'hsl(var(--warm-white))' }}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <p className="text-xl font-bold" style={{ color: 'hsl(var(--terracotta))' }}>
                      ${Number(order.total).toLocaleString('es-AR')}
                    </p>
                    {isExpanded ? <ChevronUp size={20} style={{ color: 'hsl(var(--soft-brown))' }} /> : <ChevronDown size={20} style={{ color: 'hsl(var(--soft-brown))' }} />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 animate-fade-in">
                    
                    {/* Primary Action */}
                    {order.customers?.phone && (
                      <div className="mb-6">
                        <a href={`https://wa.me/${order.customers.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${order.customers.full_name}, te contacto por tu pedido #${order.order_number} en Clare para coordinar el envío.`)}`}
                           target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                           style={{ backgroundColor: '#25D366' }}>
                          <MessageCircle size={18} /> Coordinar por WhatsApp
                        </a>
                      </div>
                    )}

                    {/* Client & Date Info */}
                    <div className="text-sm mb-6" style={{ color: 'hsl(var(--soft-brown))' }}>
                      <p className="font-medium" style={{ color: 'hsl(var(--earth))' }}>{order.customers?.full_name}</p>
                      <p className="opacity-80">{order.customers?.email}</p>
                      {order.customers?.phone && <p className="opacity-80">{order.customers.phone}</p>}
                      <p className="opacity-70 text-xs mt-1">{new Date(order.created_at).toLocaleString('es-AR')}</p>
                    </div>

                    {/* Items */}
                    <div className="mb-6 pt-5 border-t" style={{ borderColor: 'hsl(var(--sand))' }}>
                      <div className="space-y-2">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm" style={{ color: 'hsl(var(--soft-brown))' }}>
                            <span>{item.product_name} <span className="opacity-70">x{item.quantity}</span></span>
                            <span>${Number(item.total).toLocaleString('es-AR')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Pills */}
                    <div className="space-y-5 pt-5 border-t" style={{ borderColor: 'hsl(var(--sand))' }}>
                      <div>
                        <h4 className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: 'hsl(var(--soft-brown))' }}>Estado del Pedido</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(statusLabels).map(([k, v]) => {
                            const isActive = order.status === k;
                            return (
                              <button
                                key={k}
                                onClick={() => updateStatus(order.id, k)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                                style={{
                                  backgroundColor: isActive ? 'hsl(var(--earth))' : 'transparent',
                                  color: isActive ? 'hsl(var(--cream))' : 'hsl(var(--earth))',
                                  border: `1px solid ${isActive ? 'hsl(var(--earth))' : 'hsl(var(--sand))'}`,
                                  opacity: isActive ? 1 : 0.7,
                                }}
                              >
                                {v}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: 'hsl(var(--soft-brown))' }}>Estado del Pago</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(paymentLabels).map(([k, v]) => {
                            const isActive = order.payment_status === k;
                            const isConfirmed = k === 'confirmed' && isActive;
                            return (
                              <button
                                key={k}
                                onClick={() => updatePaymentStatus(order.id, k)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                                style={{
                                  backgroundColor: isActive ? (isConfirmed ? 'hsl(var(--olive))' : 'hsl(var(--earth))') : 'transparent',
                                  color: isActive ? 'hsl(var(--cream))' : 'hsl(var(--earth))',
                                  border: `1px solid ${isActive ? (isConfirmed ? 'hsl(var(--olive))' : 'hsl(var(--earth))') : 'hsl(var(--sand))'}`,
                                  opacity: isActive ? 1 : 0.7,
                                }}
                              >
                                {v}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-5 p-4 rounded-xl text-sm" style={{ backgroundColor: 'hsla(var(--sand), 0.3)', color: 'hsl(var(--earth))' }}>
                        <span className="font-semibold block mb-1">Nota del cliente:</span>
                        <span className="italic opacity-80">{order.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
