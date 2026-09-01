# Dashboard Gestor V6 — Supabase GPS

- Estoque/pedidos continuam vindo do webhook `reposicao-gestor`.
- A tela **Rotas e visitas** consulta `reposicao-v6-tracking-manager` a cada 10 segundos.
- Com "Todos os vendedores", mostra posições ao vivo, pedidos e resumo.
- Selecione um vendedor para carregar a rota detalhada daquele dia e usar Reproduzir.
- A service_role do Supabase não fica no navegador. Tudo passa pelo n8n.
