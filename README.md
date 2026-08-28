# Painel de Reposição e Perdas — V2

Dashboard web estático para visualizar a sugestão de reposição calculada na planilha e comparar com o pedido efetivamente realizado.

## O que há no projeto

- `index.html` — interface principal.
- `styles.css` — layout responsivo e visual do painel.
- `app.js` — filtros, KPIs, alertas, rankings, exportação CSV e conexão com n8n.
- `demo-data.js` — dados da planilha atual para abrir o painel sem backend.
- `N8N_DASHBOARD_REPOSICAO_GOOGLE_SHEETS.json` — workflow para importar no n8n.
- `SUGESTAO_REPOSICAO_FONTE_DASHBOARD.xlsx` — planilha preparada com a aba `API Dashboard`.

## Testar o site

Extraia o ZIP e abra `index.html` no navegador. Ele inicia em modo DEMO.

## Colocar dados ao vivo

1. Converta `SUGESTAO_REPOSICAO_FONTE_DASHBOARD.xlsx` para Google Sheets.
2. Importe o workflow JSON no n8n.
3. No node `Ler API Dashboard`, conecte sua credencial Google e selecione a planilha + aba `API Dashboard`.
4. Ative o workflow.
5. Copie a Production URL do Webhook.
6. No site, clique no cartão `Modo demonstração` no menu lateral.
7. Cole a URL e clique em `Salvar e testar`.

O painel passa a consultar o webhook automaticamente no intervalo configurado.

## Publicar

Como o site é estático, pode ser publicado em Netlify, Vercel, GitHub Pages, Cloudflare Pages ou qualquer hospedagem que aceite HTML/CSS/JS.
