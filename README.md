# Dashboard Gestor V4.4 — Realtime

- Atualização automática a cada 30 segundos.
- Atualiza imediatamente ao voltar para a aba se os dados estiverem defasados.
- Impede requisições simultâneas.
- Mantém os últimos dados válidos quando houver falha temporária.
- Trata resposta vazia/não-JSON do n8n sem expor erro técnico ao usuário.
- Compatível com o workflow REPOSICAO_INTELIGENTE_V4.4_ESTAVEL_REALTIME.json.

Use a Production URL `/webhook/reposicao-gestor` e a chave definida em `API Config`.


V4.5: corrige datas seriais do Google Sheets, filtros por período, reset de filtros ao conectar e mantém atualização automática a cada 30s.
