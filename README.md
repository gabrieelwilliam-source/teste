# Dashboard Gestor V7 — Operação Inteligente

Esta versão acrescenta a tela **Hoje**, visitas automáticas por geofence, cobertura de lojas atribuídas, alertas operacionais e replay de rota com marcadores de chegada/saída/pedido.

## Instalação
1. Execute primeiro `SQL_SUPABASE_V7_OPERACAO_INTELIGENTE.sql` no Supabase.
2. Substitua o dashboard atual por este `index.html`.
3. Mantenha o workflow n8n V6.2 ativo: as assinaturas das RPCs foram preservadas.
4. Mantenha o APK V3/6.0.2: ele já envia o GPS necessário para a V7.

## Geofence automático
A entrada exige 2 pontos GPS válidos consecutivos dentro do raio da loja. A saída exige 2 pontos consecutivos além do raio de saída (raio + 80 m ou +25%). Isso reduz visitas falsas causadas por oscilação do GPS.
