import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [prods, ords, custs] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
      ]);
      const revenue = (ords.data || []).reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
      setStats({
        products: prods.count || 0,
        orders: ords.count || 0,
        customers: custs.count || 0,
        revenue,
      });
    };

    const fetchRecent = async () => {
      const { data } = await supabase.from('orders').select('*, customers(full_name, email)')
        .order('created_at', { ascending: false }).limit(5);
      setRecentOrders(data || []);
    };

    fetchStats();
    fetchRecent();
  }, []);

  const statCards = [
    { label: 'Productos', value: stats.products, icon: Package, color: 'var(--terracotta)' },
    { label: 'Pedidos', value: stats.orders, icon: ShoppingCart, color: 'var(--olive)' },
    { label: 'Clientes', value: stats.customers, icon: Users, color: 'var(--soft-brown)' },
    { label: 'Ingresos', value: `$${stats.revenue.toLocaleString('es-AR')}`, icon: TrendingUp, color: 'var(--earth)' },
  ];

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'Preparando',
    shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
  };

  return (
    <div>
      <h1 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="clare-card flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: `hsl(${card.color} / 0.1)` }}>
              <card.icon size={24} style={{ color: `hsl(${card.color})` }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'hsl(var(--soft-brown))' }}>{card.label}</p>
              <p className="text-xl font-semibold" style={{ color: 'hsl(var(--earth))' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="clare-card">
        <h3 className="text-lg mb-4" style={{ color: 'hsl(var(--earth))' }}>Últimos pedidos</h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm" style={{ color: 'hsl(var(--soft-brown))' }}>Sin pedidos aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--sand))' }}>
                  <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>#</th>
                  <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Cliente</th>
                  <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Total</th>
                  <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Estado</th>
                  <th className="text-left py-2 font-medium" style={{ color: 'hsl(var(--earth))' }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid hsl(var(--sand))' }}>
                    <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>{order.order_number}</td>
                    <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>{order.customers?.full_name}</td>
                    <td className="py-3 font-medium" style={{ color: 'hsl(var(--terracotta))' }}>${Number(order.total).toLocaleString('es-AR')}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: 'hsl(var(--sand))', color: 'hsl(var(--earth))' }}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3" style={{ color: 'hsl(var(--soft-brown))' }}>
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
