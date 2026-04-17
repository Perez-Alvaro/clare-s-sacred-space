const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

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
const SELLER_EMAIL = 'florseia2015@gmail.com';
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY no configurada');
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

    const resp = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'CLARE <onboarding@resend.dev>',
        to: [customer_email],
        subject: `Confirmación de tu pedido #${order_number} — CLARE`,
        html,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Resend error', resp.status, data);
      throw new Error(`Resend [${resp.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
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
