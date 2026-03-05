export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    const { plan } = req.body || {};
    const p = (plan || "starter").toLowerCase();

    const pricing = {
      starter: { title: "Hummes BotSuite — Starter (mensal)", price: 49.90 },
      pro: { title: "Hummes BotSuite — Pro (mensal)", price: 99.90 }
    };
    const item = pricing[p] || pricing.starter;

    const accessToken = process.env.MP_ACCESS_TOKEN;
    const publicUrl = process.env.PUBLIC_URL || "https://www.hummes.com.br";
    if (!accessToken) return res.status(500).json({ error: "missing_mp_access_token" });

    // Preferência (Checkout Pro)
    const payload = {
      items: [
        {
          title: item.title,
          quantity: 1,
          currency_id: "BRL",
          unit_price: item.price
        }
      ],
      back_urls: {
        success: `${publicUrl}/dashboard.html?paid=1`,
        failure: `${publicUrl}/pricing.html?fail=1`,
        pending: `${publicUrl}/dashboard.html?pending=1`
      },
      auto_return: "approved",
      notification_url: `${publicUrl}/api/webhook`,
      metadata: { plan: p }
    };

    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    if (!r.ok) return res.status(400).json({ error: "mp_error", details: data });

    return res.status(200).json({ id: data.id, init_point: data.init_point, sandbox_init_point: data.sandbox_init_point });
  } catch (e) {
    return res.status(500).json({ error: "server_error", message: String(e) });
  }
}
