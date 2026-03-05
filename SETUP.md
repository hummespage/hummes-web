# Hummes — Setup (Auth + Pagamento)

## 1) Supabase (obrigatório)
Crie um projeto no Supabase e pegue:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (**somente no backend/Vercel — NUNCA no front**)

### 1.1 Criar tabela `subscriptions`
No Supabase: **SQL Editor** → cole e rode:

```sql
-- 1) tabela
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'none',
  plan text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- evita status inválido
  constraint subscriptions_status_check
    check (status in ('none','active','trialing','past_due','canceled'))
);

-- 2) RLS
alter table public.subscriptions enable row level security;

-- 3) trigger p/ updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;

create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

-- 4) policy: leitura do próprio usuário (só SELECT)
drop policy if exists "read own subscription" on public.subscriptions;

create policy "read own subscription"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);