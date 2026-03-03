# Hummes — Site Oficial (Static)

Este pacote é um site **estático** (HTML/CSS/JS) no padrão visual da Hummes.

## Links
- **LinkedIn:** https://www.linkedin.com/in/samuelhummes/
- **GitHub:** https://github.com/hummespage
- **WhatsApp:** https://wa.me/5548992155149
- **CNPJ:** 53.245.305/0001-20

## Estrutura
- `index.html` → Home (landing)
- `pages/` → subpáginas (portfólio, produto, contato, produtos)
- `assets/` → imagens (logo, mockups)
- `css/styles.css` → tema visual
- `js/main.js` → comportamento + captura de leads (WhatsApp / Supabase opcional)

## Captura de leads (banco de dados)
Por padrão, o formulário abre o **WhatsApp** com a mensagem pronta.

Se quiser salvar em banco:
1. Crie um projeto no **Supabase**
2. Crie a tabela `leads` com colunas: `name`, `email`, `whatsapp`, `reason`, `source`, `created_at`
3. No arquivo `js/main.js`, preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`.

## Deploy
### Opção A — Vercel / Netlify
Projeto estático:
- Build: nenhum
- Output: raiz

### Opção B — Hospedagem tradicional (cPanel)
Envie os arquivos para `public_html`, com `index.html` na raiz.
