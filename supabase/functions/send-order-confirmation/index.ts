const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_URL = 'https://api.resend.com';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface RequestBody {
  order_number: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_notes?: string;
  payment_method: 'bank_transfer' | 'cash_on_delivery';
  shipping_address: string;
  items: OrderItem[];
  total: number;
  bank_details?: string;
}

const SELLER_NAME = 'Flor';
const SELLER_EMAIL = 'florenciaseia67@gmail.com';
const SELLER_WHATSAPP = '3534259493';
const SELLER_WHATSAPP_DISPLAY = '+54 9 3534 25-9493';
const BRAND_NAME = 'CLARE';

const escapeHtml = (s: string) => s.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!));

const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY no configurada');

    const body: RequestBody = await req.json();
    const {
      order_number, customer_name, customer_email, customer_phone, customer_notes,
      payment_method, shipping_address, items, total, bank_details,
    } = body;

    if (!customer_email || !order_number || !items?.length) {
      return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const itemsHtml = items.map(i => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #E8DCC3;color:#8B6A4E;">${i.product_name} <span style="color:#9C7A56;">x${i.quantity}</span></td>
        <td style="padding:10px;border-bottom:1px solid #E8DCC3;text-align:right;color:#8B6A4E;">${fmt(i.total)}</td>
      </tr>
    `).join('');

    const paymentBlock = payment_method === 'bank_transfer'
      ? `
        <div style="background:#FFFDF8;border:1px solid #E8DCC3;border-radius:12px;padding:20px;margin:24px 0;">
          <h3 style="margin:0 0 12px;color:#8B6A4E;font-family:Georgia,serif;font-size:18px;">Datos para transferencia</h3>
          ${bank_details
            ? `<pre style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;color:#8B6A4E;margin:0 0 12px;">${escapeHtml(bank_details)}</pre>`
            : `<p style="margin:0 0 12px;color:#9C7A56;font-size:14px;">Consultanos los datos por WhatsApp.</p>`}
          <p style="margin:0;color:#9C7A56;font-size:14px;">Una vez realizada la transferencia, enviá el comprobante por WhatsApp para confirmar tu pedido.</p>
        </div>`
      : `
        <div style="background:#FFFDF8;border:1px solid #E8DCC3;border-radius:12px;padding:20px;margin:24px 0;">
          <h3 style="margin:0 0 8px;color:#8B6A4E;font-family:Georgia,serif;font-size:18px;">Pago contra entrega</h3>
          <p style="margin:0;color:#9C7A56;font-size:14px;">Vas a abonar el total al recibir tu pedido. Coordinaremos la entrega por WhatsApp.</p>
        </div>`;

    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Pedido confirmado</title></head>
<body style="margin:0;padding:0;background:#F8F1E9;font-family:Arial,sans-serif;color:#8B6A4E;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-family:Georgia,serif;color:#C17F5A;font-size:32px;margin:0 0 8px;letter-spacing:2px;">${BRAND_NAME}</h1>
      <p style="margin:0;color:#9C7A56;font-style:italic;font-size:14px;">Artesanías hechas con fe y dedicación</p>
    </div>

    <div style="background:#FFFDF8;border-radius:16px;padding:32px 24px;border:1px solid #E8DCC3;">
      <h2 style="font-family:Georgia,serif;color:#8B6A4E;font-size:24px;margin:0 0 8px;">¡Hola ${customer_name}!</h2>
      <p style="margin:0 0 16px;color:#9C7A56;font-size:15px;line-height:1.6;">
        Recibimos tu pedido <strong style="color:#C17F5A;">#${order_number}</strong> con muchísima alegría. Gracias por elegir piezas hechas a mano con oración y cariño.
      </p>

      <h3 style="font-family:Georgia,serif;color:#8B6A4E;font-size:18px;margin:24px 0 12px;">Resumen del pedido</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${itemsHtml}
        <tr>
          <td style="padding:14px 10px;font-weight:bold;color:#8B6A4E;">Total</td>
          <td style="padding:14px 10px;text-align:right;font-weight:bold;font-size:18px;color:#C17F5A;">${fmt(total)}</td>
        </tr>
      </table>

      <h3 style="font-family:Georgia,serif;color:#8B6A4E;font-size:18px;margin:24px 0 8px;">Envío a</h3>
      <p style="margin:0;color:#9C7A56;font-size:14px;line-height:1.5;">${shipping_address}</p>

      ${paymentBlock}

      <div style="background:#F8F1E9;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
        <p style="margin:0 0 8px;color:#8B6A4E;font-size:15px;">Cualquier consulta, escribile directamente a <strong>${SELLER_NAME}</strong>:</p>
        <p style="margin:0 0 16px;color:#9C7A56;font-size:14px;">WhatsApp: <strong>${SELLER_WHATSAPP_DISPLAY}</strong></p>
        <a href="https://wa.me/${SELLER_WHATSAPP}" style="display:inline-block;background:#7A8A63;color:#FFFDF8;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;font-size:14px;">
          Escribir a ${SELLER_NAME} por WhatsApp
        </a>
      </div>

      <p style="margin:24px 0 0;color:#9C7A56;font-size:14px;line-height:1.6;text-align:center;font-style:italic;">
        "Que el Señor te bendiga y te guarde" — Nm 6:24
      </p>
    </div>

    <p style="text-align:center;color:#9C7A56;font-size:12px;margin:24px 0 0;">
      Este es un email automático de confirmación. Para cualquier consulta sobre tu pedido, respondé este correo o escribinos a ${SELLER_NAME} por WhatsApp.
    </p>
  </div>
</body></html>`;

    // Email interno para Flor (vendedora)
    const paymentLabel = payment_method === 'bank_transfer' ? 'Transferencia bancaria' : 'Pago contra entrega';
    const internalItemsHtml = items.map(i => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #E8DCC3;color:#8B6A4E;">${escapeHtml(i.product_name)}</td>
        <td style="padding:8px;border-bottom:1px solid #E8DCC3;text-align:center;color:#8B6A4E;">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #E8DCC3;text-align:right;color:#8B6A4E;">${fmt(i.unit_price)}</td>
        <td style="padding:8px;border-bottom:1px solid #E8DCC3;text-align:right;color:#8B6A4E;">${fmt(i.total)}</td>
      </tr>`).join('');

    const internalHtml = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Nuevo pedido #${order_number}</title></head>
<body style="margin:0;padding:0;background:#F8F1E9;font-family:Arial,sans-serif;color:#8B6A4E;">
  <div style="max-width:640px;margin:0 auto;padding:32px 24px;">
    <div style="background:#FFFDF8;border-radius:16px;padding:28px 24px;border:1px solid #E8DCC3;">
      <h1 style="font-family:Georgia,serif;color:#C17F5A;font-size:26px;margin:0 0 4px;">Nuevo pedido #${order_number}</h1>
      <p style="margin:0 0 20px;color:#9C7A56;font-size:14px;">Se registró un nuevo pedido en la tienda CLARE.</p>

      <h2 style="font-family:Georgia,serif;color:#8B6A4E;font-size:18px;margin:20px 0 8px;">Datos del cliente</h2>
      <table style="width:100%;font-size:14px;color:#8B6A4E;">
        <tr><td style="padding:4px 0;width:120px;color:#9C7A56;">Nombre:</td><td><strong>${escapeHtml(customer_name)}</strong></td></tr>
        <tr><td style="padding:4px 0;color:#9C7A56;">Email:</td><td><a href="mailto:${escapeHtml(customer_email)}" style="color:#C17F5A;">${escapeHtml(customer_email)}</a></td></tr>
        ${customer_phone ? `<tr><td style="padding:4px 0;color:#9C7A56;">Teléfono:</td><td><a href="https://wa.me/${customer_phone.replace(/\D/g,'')}" style="color:#C17F5A;">${escapeHtml(customer_phone)}</a></td></tr>` : ''}
        <tr><td style="padding:4px 0;color:#9C7A56;vertical-align:top;">Envío a:</td><td>${escapeHtml(shipping_address)}</td></tr>
        <tr><td style="padding:4px 0;color:#9C7A56;">Pago:</td><td>${paymentLabel}</td></tr>
        ${customer_notes ? `<tr><td style="padding:4px 0;color:#9C7A56;vertical-align:top;">Notas:</td><td>${escapeHtml(customer_notes)}</td></tr>` : ''}
      </table>

      <h2 style="font-family:Georgia,serif;color:#8B6A4E;font-size:18px;margin:24px 0 8px;">Productos</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead><tr style="background:#F8F1E9;">
          <th style="padding:8px;text-align:left;color:#8B6A4E;">Producto</th>
          <th style="padding:8px;text-align:center;color:#8B6A4E;">Cant.</th>
          <th style="padding:8px;text-align:right;color:#8B6A4E;">Unit.</th>
          <th style="padding:8px;text-align:right;color:#8B6A4E;">Total</th>
        </tr></thead>
        <tbody>${internalItemsHtml}</tbody>
        <tfoot><tr>
          <td colspan="3" style="padding:12px 8px;text-align:right;font-weight:bold;color:#8B6A4E;">Total</td>
          <td style="padding:12px 8px;text-align:right;font-weight:bold;font-size:18px;color:#C17F5A;">${fmt(total)}</td>
        </tr></tfoot>
      </table>
    </div>
  </div>
</body></html>`;

    const sendEmail = (payload: Record<string, unknown>) => fetch(`${RESEND_API_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const [customerResp, internalResp] = await Promise.all([
      sendEmail({
        from: 'CLARE <onboarding@resend.dev>',
        to: [customer_email],
        subject: `Confirmación de tu pedido #${order_number} — CLARE`,
        html,
      }),
      sendEmail({
        from: 'CLARE <onboarding@resend.dev>',
        to: [SELLER_EMAIL],
        reply_to: customer_email,
        subject: `🛍️ Nuevo pedido #${order_number} — ${customer_name}`,
        html: internalHtml,
      }),
    ]);

    const customerData = await customerResp.json();
    const internalData = await internalResp.json();
    if (!customerResp.ok) console.error('Resend customer error', customerResp.status, customerData);
    if (!internalResp.ok) console.error('Resend internal error', internalResp.status, internalData);
    if (!customerResp.ok && !internalResp.ok) {
      throw new Error(`Resend falló en ambos envíos`);
    }

    return new Response(JSON.stringify({
      success: true,
      customer_email_id: customerData?.id ?? null,
      internal_email_id: internalData?.id ?? null,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('send-order-confirmation error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
