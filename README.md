# Dashboard do gestor — V5.1 FR

Dashboard completo com atualização automática, alertas, vendedores, lojas, produtos, GPS, histórico, relatório e administração.

Nesta versão os 5 produtos exibem foto real do catálogo, nome oficial, peso, código interno, valor unitário de tabela e quantidade por caixa.

## Base financeira
O sistema separa:
- `Custo Unitário`: custo real, se a empresa informar;
- `Valor Unitário Tabela`: valor da tabela FR de 26/06/2026.

Se o custo real estiver zerado, o dashboard usa o valor de tabela somente como **estimativa gerencial** e deixa isso explícito na tela.

## Publicação
Substitua todos os arquivos do repositório do dashboard por esta pasta, inclusive `assets/products`.

O webhook permanece `/webhook/reposicao-gestor`.
