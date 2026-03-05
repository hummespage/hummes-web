// Webhook Mercado Pago -> marca assinatura ativa no Supabase
export default async function handler(req, res) {
  try {
    // MP manda GET e POST dependendo da configuração. A gente responde rápido.
    if (req.method === "GET") return res.status(200).send("ok");
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    const accessToken = process.env.MP_ACCESS_TOKEN;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!accessToken || !supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: "missing_env" });
    }

    const body = req.body || {};
    // MP: { type: "payment", data: { id: "..." } } (padrão)
    const type = body.type || body.topic;
    const paymentId = body?.data?.id || body?.id;

    if (!paymentId) return res.status(200).json({ ok: true }); // nada a fazer

    // busca detalhes do pagamento
    const pr = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });
    const payment = await pr.json();
    if (!pr.ok) return res.status(200).json({ ok: true });

    // approved -> ativa assinatura
    if (payment.status !== "approved") return res.status(200).json({ ok: true });

    const plan = payment?.metadata?.plan || "starter";

    // ⚠️ IMPORTANTÍSSIMO:
    // Para vincular pagamento -> usuário, você precisa adicionar no checkout um identificador do usuário (ex: email/user_id).
    // Nesta versão 1, ativamos por e-mail do pagador (payer.email) se existir.
    const payerEmail = payment?.payer?.email;

    if (!payerEmail) return res.status(200).json({ ok: true });

    // busca user_id pelo e-mail via Supabase Admin API
    const ur = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(payerEmail)}`, {
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "apikey": supabaseServiceKey
      }
    });
    const users = await ur.json();
    const userId = Array.isArray(users) && users.length ? users[0].id : null;
    if (!userId) return res.status(200).json({ ok: true });

    // upsert subscription
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30*24*60*60*1000);

    const subPayload = {
      user_id: userId,
      status: "active",
      plan,
      current_period_end: periodEnd.toISOString()
    };

    const sr = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "apikey": supabaseServiceKey,
        "Prefer": "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify(subPayload)
    });

    // mesmo se falhar, responde ok pro MP (evitar retry infinito)
    return res.status(200).json({ ok: true, updated: sr.ok });
  } catch (e) {
    return res.status(200).json({ ok: true });
  }
}
