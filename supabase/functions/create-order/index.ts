import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Item {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Body {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code?: string;
  notes?: string;
  payment_method: 'bank_transfer' | 'cash_on_delivery';
  items: Item[];
}

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = (await req.json()) as Body;

    // Basic validation
    const required = ['full_name', 'email', 'phone', 'address', 'city', 'province', 'payment_method'] as const;
    for (const k of required) {
      if (!body[k] || String(body[k]).trim() === '') {
        return json(400, { error: `Campo requerido: ${k}` });
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return json(400, { error: 'Email inválido' });
    if (!['bank_transfer', 'cash_on_delivery'].includes(body.payment_method)) {
      return json(400, { error: 'Método de pago inválido' });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return json(400, { error: 'El carrito está vacío' });
    }
    for (const it of body.items) {
      if (!it.product_id || !it.name || !(it.quantity > 0) || !(it.price >= 0)) {
        return json(400, { error: 'Ítem inválido en el carrito' });
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Re-price from DB to prevent client tampering
    const ids = body.items.map((i) => i.product_id);
    const { data: products, error: prodErr } = await admin
      .from('products')
      .select('id, name, price, stock')
      .in('id', ids);
    if (prodErr) throw prodErr;
    const priceMap = new Map(products?.map((p) => [p.id, p]) ?? []);
    let subtotal = 0;
    const safeItems = body.items.map((it) => {
      const p = priceMap.get(it.product_id);
      if (!p) throw new Error(`Producto no disponible: ${it.name}`);
      const qty = Math.min(it.quantity, p.stock ?? it.quantity);
      if (qty <= 0) throw new Error(`Sin stock: ${p.name}`);
      const unit = Number(p.price);
      const total = unit * qty;
      subtotal += total;
      return { product_id: p.id, product_name: p.name, quantity: qty, unit_price: unit, total };
    });

    // Create customer (anonymous: user_id stays NULL)
    const { data: customer, error: custErr } = await admin
      .from('customers')
      .insert({
        email: body.email.trim().toLowerCase(),
        full_name: body.full_name.trim(),
        phone: body.phone.trim(),
        address: body.address.trim(),
        city: body.city.trim(),
        province: body.province.trim(),
        postal_code: body.postal_code?.trim() ?? null,
      })
      .select('id')
      .single();
    if (custErr) throw custErr;

    const shipping_address = `${body.address}, ${body.city}, ${body.province}${body.postal_code ? ' ' + body.postal_code : ''}`;

    const { data: order, error: ordErr } = await admin
      .from('orders')
      .insert({
        customer_id: customer.id,
        payment_method: body.payment_method,
        subtotal,
        tax: 0,
        total: subtotal,
        shipping_address,
        notes: body.notes?.trim() || null,
      })
      .select('id, order_number')
      .single();
    if (ordErr) throw ordErr;

    const { error: itemsErr } = await admin
      .from('order_items')
      .insert(safeItems.map((i) => ({ order_id: order.id, ...i })));
    if (itemsErr) throw itemsErr;

    // Confirmation email (awaited so the Edge runtime doesn't kill it early)
    try {
      let bank_details: string | undefined;
      if (body.payment_method === 'bank_transfer') {
        const { data: setting } = await admin
          .from('news')
          .select('content')
          .eq('slug', 'store-setting-bank-transfer')
          .single();
        bank_details = setting?.content ?? undefined;
      }
      const { data: emailRes, error: emailErr } = await admin.functions.invoke(
        'send-order-confirmation',
        {
          body: {
            order_number: order.order_number,
            customer_name: body.full_name,
            customer_email: body.email,
            customer_phone: body.phone,
            customer_notes: body.notes,
            payment_method: body.payment_method,
            shipping_address,
            items: safeItems,
            total: subtotal,
            bank_details,
          },
        },
      );
      if (emailErr) console.error('send-order-confirmation invoke error', emailErr);
      else console.log('send-order-confirmation result', emailRes);
    } catch (e) {
      console.error('email send error', e);
    }

    return json(200, { success: true, order_number: order.order_number });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('create-order error:', msg);
    return json(500, { success: false, error: msg });
  }
});
