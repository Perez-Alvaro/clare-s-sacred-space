import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle } from 'lucide-react';

type PaymentMethod = 'bank_transfer' | 'cash_on_delivery';

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [bankDetails, setBankDetails] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', address: '', city: '', province: '', postal_code: '', notes: '',
    payment_method: 'bank_transfer' as PaymentMethod,
  });

  useEffect(() => {
    supabase.from('news').select('content').eq('slug', 'store-setting-bank-transfer').single()
      .then(({ data }) => {
        if (data?.content) setBankDetails(data.content);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      // Create customer
      const { data: customer, error: custErr } = await supabase.from('customers').insert({
        email: form.email, full_name: form.full_name, phone: form.phone,
        address: form.address, city: form.city, province: form.province, postal_code: form.postal_code,
      }).select().single();
      if (custErr) throw custErr;

      // Create order
      const { data: order, error: ordErr } = await supabase.from('orders').insert({
        customer_id: customer.id,
        payment_method: form.payment_method,
        subtotal, tax: 0, total: subtotal,
        shipping_address: `${form.address}, ${form.city}, ${form.province} ${form.postal_code}`,
        notes: form.notes || null,
      }).select().single();
      if (ordErr) throw ordErr;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id, product_id: item.id, product_name: item.name,
        quantity: item.quantity, unit_price: item.price, total: item.price * item.quantity,
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      setOrderNumber(order.order_number);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Hubo un error al procesar tu pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--cream))' }}>
        <Navbar />
        <div className="pt-24 pb-16 clare-container">
          <div className="max-w-lg mx-auto text-center py-16">
            <CheckCircle size={64} className="mx-auto mb-6" style={{ color: 'hsl(var(--olive))' }} />
            <h1 className="text-3xl mb-4">¡Pedido confirmado!</h1>
            <p className="text-lg mb-2" style={{ color: 'hsl(var(--soft-brown))' }}>
              Tu pedido #{orderNumber} fue registrado.
            </p>
            {form.payment_method === 'bank_transfer' && (
              <div className="clare-card mt-6 text-left">
                <h3 className="text-lg mb-3" style={{ color: 'hsl(var(--earth))' }}>Datos para transferencia</h3>
                {bankDetails ? (
                  <div className="p-4 rounded-xl border mb-4 text-sm whitespace-pre-wrap break-words" style={{ backgroundColor: 'hsl(var(--warm-white))', borderColor: 'hsl(var(--sand))', color: 'hsl(var(--earth))' }}>
                    {bankDetails}
                  </div>
                ) : (
                  <p className="text-sm mb-4" style={{ color: 'hsl(var(--soft-brown))' }}>Por favor consúltenos los datos de transferencia por WhatsApp.</p>
                )}
                <p className="text-sm mb-1" style={{ color: 'hsl(var(--soft-brown))' }}>
                  Enviá el comprobante por WhatsApp para confirmar tu pedido.
                </p>
                <a href="https://wa.me/3534259493" target="_blank" rel="noopener noreferrer"
                  className="clare-btn clare-btn-primary mt-4 inline-flex">
                  Enviar comprobante por WhatsApp
                </a>
              </div>
            )}
            <button onClick={() => navigate('/tienda')} className="clare-btn clare-btn-secondary mt-8">
              Seguir comprando
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <Navbar />
      <div className="pt-24 pb-16 clare-container">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl mb-8 text-center">Finalizar Compra</h1>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="clare-script text-xl mb-4" style={{ color: 'hsl(var(--terracotta))' }}>Tu carrito está vacío</p>
              <button onClick={() => navigate('/tienda')} className="clare-btn clare-btn-primary">Ir a la tienda</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Order summary */}
              <div className="clare-card">
                <h3 className="text-lg mb-4" style={{ color: 'hsl(var(--earth))' }}>Resumen del pedido</h3>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between py-2 border-b" style={{ borderColor: 'hsl(var(--sand))' }}>
                    <span className="text-sm" style={{ color: 'hsl(var(--soft-brown))' }}>{item.name} x{item.quantity}</span>
                    <span className="text-sm font-medium" style={{ color: 'hsl(var(--earth))' }}>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-4">
                  <span className="font-medium" style={{ color: 'hsl(var(--earth))' }}>Total</span>
                  <span className="text-xl font-bold" style={{ color: 'hsl(var(--terracotta))' }}>${subtotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Customer info */}
              <div className="clare-card">
                <h3 className="text-lg mb-4" style={{ color: 'hsl(var(--earth))' }}>Tus datos</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: 'full_name', label: 'Nombre completo', required: true, type: 'text' },
                    { name: 'email', label: 'Email', required: true, type: 'email' },
                    { name: 'phone', label: 'Teléfono', required: true, type: 'tel' },
                    { name: 'address', label: 'Dirección', required: true, type: 'text' },
                    { name: 'city', label: 'Ciudad', required: true, type: 'text' },
                    { name: 'province', label: 'Provincia', required: true, type: 'text' },
                    { name: 'postal_code', label: 'Código postal', required: false, type: 'text' },
                  ].map(field => (
                    <div key={field.name} className={field.name === 'address' ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>{field.label}</label>
                      <input name={field.name} type={field.type} required={field.required}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all focus:ring-2"
                        style={{ borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))', '--tw-ring-color': 'hsl(var(--terracotta))' } as React.CSSProperties} />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Notas (opcional)</label>
                  <textarea name="notes" rows={3} value={form.notes} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none resize-none"
                    style={{ borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))' }} />
                </div>
              </div>

              {/* Payment */}
              <div className="clare-card">
                <h3 className="text-lg mb-4" style={{ color: 'hsl(var(--earth))' }}>Método de pago</h3>
                <div className="space-y-3">
                  {[
                    { value: 'bank_transfer', label: 'Transferencia bancaria', desc: 'Enviá el comprobante por WhatsApp' },
                    { value: 'cash_on_delivery', label: 'Pago contra entrega', desc: 'Pagás al recibir tu pedido' },
                  ].map(method => (
                    <label key={method.value} className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all"
                      style={{
                        borderColor: form.payment_method === method.value ? 'hsl(var(--terracotta))' : 'hsl(var(--sand))',
                        backgroundColor: form.payment_method === method.value ? 'hsla(var(--terracotta), 0.05)' : 'transparent'
                      }}>
                      <input type="radio" name="payment_method" value={method.value}
                        checked={form.payment_method === method.value} onChange={handleChange}
                        className="mt-1" style={{ accentColor: 'hsl(var(--terracotta))' }} />
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'hsl(var(--earth))' }}>{method.label}</span>
                        <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--soft-brown))' }}>{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="clare-btn clare-btn-primary w-full text-lg">
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
