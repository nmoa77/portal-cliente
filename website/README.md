# Website DUIT

Esta pasta fica reservada para o site público **duit.pt** dentro do mesmo repositório do Portal DUIT.

## Estrutura prevista

- `index.html` — homepage pública
- `imagens/` — trabalhos e imagens reais da DUIT
- `assets/` — logótipo e outros recursos do site

## Integração com o Portal

O formulário público deve enviar os contactos para:

`POST /api/public/site-lead`

Campos aceites:
- `nome` / `name`
- `empresa` / `company`
- `email`
- `telefone` / `phone`
- `mensagem` / `message`

Os contactos são gravados em **Leads** no portal, com origem **Site DUIT**, e entram também na contagem de leads.

O site será servido por `duit.pt`/ `www.duit.pt` quando a migração visual estiver concluída. O portal continua em `cliente.duit.pt`.
