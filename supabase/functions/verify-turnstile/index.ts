// ============================================================
// Supabase Edge Function: verify-turnstile
// Cloudflare Turnstile token'ını sunucu tarafında doğrular.
// İstemci (form) gönderdiği token'ı buraya yollar; token gizli
// anahtarla Cloudflare'e doğrulatılır. Böylece bot koruması
// istemci tarafında taklit edilemez.
//
// Gerekli secret (supabase secrets set ...):
//   TURNSTILE_SECRET_KEY -> Cloudflare Turnstile "Secret Key"
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = (await req.json()) as { token?: string };

    const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (!secret) {
      return new Response(
        JSON.stringify({ success: false, error: 'TURNSTILE_SECRET_KEY tanımlı değil' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Doğrulama token\'ı eksik' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const form = new URLSearchParams();
    form.append('secret', secret);
    form.append('response', token);
    const remoteip = req.headers.get('CF-Connecting-IP');
    if (remoteip) form.append('remoteip', remoteip);

    const verifyRes = await fetch(SITEVERIFY_URL, { method: 'POST', body: form });
    const outcome = (await verifyRes.json()) as { success?: boolean; 'error-codes'?: string[] };

    return new Response(
      JSON.stringify({ success: outcome.success === true, errorCodes: outcome['error-codes'] ?? [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('verify-turnstile error:', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
