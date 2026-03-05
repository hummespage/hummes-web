// Auth + plano (cliente) via Supabase
// Requer: js/config.js (copie de config.example.js) + supabase-js CDN
(function(){
  const cfg = window.HUMMES_CONFIG || {};
  function missing(){
    return !cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes("SEU-PROJETO") || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.includes("SUA_SUPABASE");
  }
  async function init(){
    if (missing()) {
      console.warn("[Hummes] Configure o Supabase em js/config.js");
      return null;
    }
    const supabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    window.HUMMES = window.HUMMES || {};
    window.HUMMES.supabase = supabase;
    return supabase;
  }

  async function getSession(){
    const supabase = await init();
    if(!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session || null;
  }

  async function requireAuth(redirectTo){
    const s = await getSession();
    if(!s){
      const next = encodeURIComponent(redirectTo || location.pathname);
      location.href = `/login.html?next=${next}`;
      return null;
    }
    return s;
  }

  async function signOut(){
    const supabase = await init();
    if(!supabase) return;
    await supabase.auth.signOut();
    location.href = "/";
  }

  async function getSubscription(){
    const supabase = await init();
    if(!supabase) return { status: "unknown" };
    const session = await getSession();
    if(!session) return { status: "none" };
    const userId = session.user.id;

    // tabela subscriptions: user_id (uuid), status (text), plan (text), current_period_end (timestamptz)
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status, plan, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    if(error){
      console.warn("[Hummes] erro subscriptions", error);
      return { status: "unknown" };
    }
    return data || { status: "none" };
  }

  window.HUMMES = window.HUMMES || {};
  window.HUMMES.auth = { init, getSession, requireAuth, signOut, getSubscription };
})();
