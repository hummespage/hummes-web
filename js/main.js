
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";
const SUPABASE_TABLE = "leads";

function $(sel){return document.querySelector(sel);}

async function postLead(payload){
  if(!SUPABASE_URL || !SUPABASE_ANON_KEY) return { ok:false, skipped:true };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(payload)
  });
  if(!res.ok){
    const t = await res.text().catch(()=> "");
    return { ok:false, error: t || res.statusText };
  }
  return { ok:true };
}

function setToast(msg, type="ok"){
  const el = $("#toast");
  if(!el) return;
  el.textContent = msg;
  el.style.display = "block";
  el.style.background = type === "ok" ? "rgba(134,197,138,.18)" : "rgba(207,91,67,.15)";
  el.style.borderColor = type === "ok" ? "rgba(134,197,138,.35)" : "rgba(207,91,67,.35)";
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(()=>{ el.style.display="none"; }, 4200);
}

document.addEventListener("DOMContentLoaded", ()=>{
  const form = $("#leadForm");
  if(form){
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const name = $("#name").value.trim();
      const email = $("#email").value.trim();
      const whatsapp = $("#whatsapp").value.trim();
      const reason = $("#reason").value.trim();
      const source = window.location.pathname;

      if(!name || !email){
        setToast("Preenche pelo menos nome + e-mail 🙂", "err");
        return;
      }

      const r = await postLead({ name, email, whatsapp, reason, source });
      if(r.ok){
        setToast("Fechou! Recebi teu contato. Vou te chamar 🙌");
        form.reset();
        return;
      }

      const msg =
`Oi! Me chamo ${name}.
Email: ${email}
WhatsApp: ${whatsapp || "-"}
Quero falar sobre: ${reason || "-"}
Vim pelo site: ${window.location.href}`;
      const url = `https://wa.me/5548992155149?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
      setToast("Abrindo WhatsApp pra te enviar a mensagem…");
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener("click", (e)=>{
      const id = a.getAttribute("href");
      const el = document.querySelector(id);
      if(!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});
