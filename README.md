# DUIT — Portal do Cliente

Portal web do estúdio **DUIT** para gerir tudo o que a equipa entrega aos clientes: subscrições (alojamento, domínios, redes sociais), projetos criativos, mockups para aprovação, ficheiros, calendário de publicações, orçamentos, faturas e suporte. Duas áreas completas:

- **Admin (DUIT)** — painel de controlo com estatísticas, clientes, subscrições, planos-template, projetos, calendário social (editor completo com edição/apagar por post e bulk-delete mensal), orçamentos, faturas, fila de cancelamentos, suporte e registo de notificações.
- **Cliente** — início personalizado, subscrições, projetos com barra de fases, aprovação de mockups, ficheiros, calendário social, analítica, orçamentos, faturas, suporte com FAQ, perfil editável.

## Stack

- **Backend**: Node.js + Express + SQLite (`better-sqlite3`)
- **Auth**: JWT em cookie httpOnly + bcrypt para passwords
- **Frontend**: HTML + CSS + JavaScript vanilla (sem build step)
- **Emails**: stub em dev (consola + tabela `notifications`), pronto para SMTP em `backend/email.js`
- **Design system DUIT**: amarelo `#ffd60a`, preto `#0a0a0a`, tipografia Clash Display + Space Grotesk, tema claro/escuro

## Instalação e arranque

```bash
cd portal-cliente
npm install
npm start
```

Abre http://localhost:3000

A base de dados SQLite é criada automaticamente em `backend/portal.db` no primeiro arranque, já populada com dados demo (4 utilizadores, 9 planos, 8 subscrições, 4 projetos, 5 mockups, 7 ficheiros, 3 orçamentos, 6 faturas, 14 posts de Abril, 3 tickets, 1 pedido de cancelamento pendente, 3 notas internas sobre a Ana).

## Credenciais demo

| Perfil  | Email                | Password    | Nome         | Empresa              |
|---------|----------------------|-------------|--------------|----------------------|
| Admin   | `admin@duit.pt`      | `admin123`  | Nuno Alho    | DUIT                 |
| Cliente | `ana@exemplo.pt`     | `cliente123`| Ana Ribeiro  | Padaria do Bairro    |
| Cliente | `joao@exemplo.pt`    | `cliente123`| João Silva   | Silva Advogados      |
| Cliente | `rita@exemplo.pt`    | `cliente123`| Rita Costa   | Café Tertúlia        |

## Estrutura

```
portal-cliente/
├─ backend/
│  ├─ server.js      # rotas Express (todas as APIs)
│  ├─ db.js          # schema SQLite + seed demo
│  ├─ auth.js        # JWT + middlewares requireAuth/requireAdmin
│  └─ email.js       # stub de email + templates (welcome, projectStatus, cancelRequest, cancelDecision, mockupReady, postsCleared)
├─ public/
│  ├─ index.html     # login (hero DUIT à esquerda, formulário à direita)
│  ├─ cliente.html   # shell da SPA do cliente + modais
│  ├─ admin.html     # shell da SPA do admin + modais
│  ├─ css/styles.css # design system DUIT completo, light + dark
│  └─ js/
│     ├─ common.js   # api(), toast(), svg(), modais, format helpers, theme toggle
│     ├─ cliente.js  # SPA cliente: 11 views
│     └─ admin.js    # SPA admin: 11 views
└─ package.json
```

## Funcionalidades principais

### Admin (DUIT)

- **Visão geral** com KPIs (receita recorrente, clientes, projetos) e queue "a precisar de ti" (cancelamentos, posts a aprovar, tickets).
- **Clientes**: tabela + painel lateral de **notas internas** só visíveis à DUIT (adicionar/apagar).
- **Subscrições**: listar todas, criar, apagar.
- **Planos** (templates por categoria): criar/remover cartões de planos, com flag "Popular".
- **Projetos**: tabela com barra de fases (Novo → Em análise → Em produção → Revisão final → Concluído, + Cancelado). Mudar fase envia **email automático** ao cliente com mensagem opcional.
- **Calendário social**: editor completo com filtro por cliente, criar post clicando num dia, editar clicando num post, apagar individualmente, **bulk delete** de todos os posts de um cliente num mês (com opção de manter publicados/aprovados).
- **Orçamentos**: criar orçamentos com linhas dinâmicas + total automático; cliente aceita/rejeita.
- **Faturas**: emissão manual com estado (pendente, pago, em atraso).
- **Cancelamentos**: queue com 3 decisões — Aprovar, Oferecer pausa, Recusar. Cliente recebe email da decisão.
- **Suporte**: tickets ordenados por urgência, trocar estado, responder inline.
- **Notificações**: últimos 50 emails simulados.

### Cliente

- **Início** com saudação personalizada, KPIs, projetos em curso, próxima renovação, últimas faturas.
- **Subscrições** com pedido de cancelamento (razão + comentário, fica em fila para a DUIT analisar).
- **Projetos** em curso com barra de fases clara.
- **Aprovações (mockups)** com thumb grande, aprovar ou pedir alterações com comentário.
- **Ficheiros** com upload e remoção dos próprios.
- **Calendário** social em modo leitura, colorido por rede (IG roxo, FB verde, LI teal).
- **Analítica** de alcance/engagement (dados demo).
- **Orçamentos**: cartão-lista e detalhe com aceitar/rejeitar.
- **Faturas** descarregáveis.
- **Suporte** com FAQ colapsável + abertura de tickets + conversa em bolhas.
- **Perfil** editável (nome, empresa, telefone, URL de foto) + toggle tema claro/escuro.

### Identidade visual

- Paleta DUIT: amarelo vivo (`#ffd60a`), preto (`#0a0a0a`), branco + neutros quentes.
- Tipografia: **Clash Display** (títulos, display) + **Space Grotesk** (corpo, UI).
- Tema claro e escuro com variáveis CSS; persistente no browser (localStorage).
- Toasts discretos em baixo-à-direita para feedback imediato.

## API resumida

### Auth
| Método | Rota                 | Acesso | Descrição            |
|--------|----------------------|--------|----------------------|
| POST   | /api/auth/login      | público| Login                |
| POST   | /api/auth/logout     | auth   | Logout               |
| GET    | /api/auth/me         | auth   | Utilizador atual     |
| PATCH  | /api/auth/me         | auth   | Atualizar perfil     |

### Stats
| Método | Rota                 | Acesso | Descrição                |
|--------|----------------------|--------|--------------------------|
| GET    | /api/stats           | admin  | KPIs do estúdio          |
| GET    | /api/client-summary  | cliente| Resumo pessoal           |

### Clientes, subs, planos
| Método | Rota                       | Acesso | Descrição                  |
|--------|----------------------------|--------|----------------------------|
| GET    | /api/clients               | admin  | Lista com KPIs por cliente |
| POST   | /api/clients               | admin  | Criar + email boas-vindas  |
| DELETE | /api/clients/:id           | admin  | Apagar                     |
| GET    | /api/subscriptions         | auth   | Admin tudo / cliente os seus|
| POST   | /api/subscriptions         | admin  | Criar                      |
| PATCH  | /api/subscriptions/:id     | admin  | Atualizar estado           |
| DELETE | /api/subscriptions/:id     | admin  | Apagar                     |
| GET    | /api/plans                 | auth   | Listar planos              |
| POST   | /api/plans                 | admin  | Criar                      |
| DELETE | /api/plans/:id             | admin  | Apagar                     |

### Projetos, mockups, ficheiros
| Método | Rota                 | Acesso | Descrição                           |
|--------|----------------------|--------|-------------------------------------|
| GET    | /api/projects        | auth   | Tudo (admin) / próprios (cliente)   |
| POST   | /api/projects        | admin  | Criar                               |
| PATCH  | /api/projects/:id    | admin  | Mudar fase (dispara email)          |
| DELETE | /api/projects/:id    | admin  | Apagar                              |
| GET    | /api/mockups         | auth   | Admin tudo / cliente os seus        |
| POST   | /api/mockups         | admin  | Criar (dispara email)               |
| PATCH  | /api/mockups/:id     | auth   | Aprovar / pedir alterações          |
| GET    | /api/files           | auth   | Admin tudo / cliente os seus        |
| POST   | /api/files           | auth   | Registar upload                     |
| DELETE | /api/files/:id       | auth   | Apagar (dono ou admin)              |

### Cancelamentos, orçamentos, faturas
| Método | Rota                     | Acesso | Descrição                      |
|--------|--------------------------|--------|--------------------------------|
| GET    | /api/cancellations       | auth   | Admin queue / cliente histórico|
| POST   | /api/cancellations       | auth   | Cliente pede cancelamento      |
| PATCH  | /api/cancellations/:id   | admin  | Aprovar / pausar / recusar     |
| GET    | /api/quotes              | auth   | Listar                         |
| GET    | /api/quotes/:id          | auth   | Detalhe com itens              |
| POST   | /api/quotes              | admin  | Criar com itens                |
| PATCH  | /api/quotes/:id          | auth   | Aceitar / rejeitar             |
| GET    | /api/invoices            | auth   | Listar                         |
| POST   | /api/invoices            | admin  | Emitir                         |

### Notas, posts sociais, tickets, notificações
| Método | Rota                              | Acesso | Descrição                         |
|--------|-----------------------------------|--------|-----------------------------------|
| GET    | /api/notes/:user_id               | admin  | Notas internas sobre um cliente   |
| POST   | /api/notes                        | admin  | Adicionar                         |
| DELETE | /api/notes/:id                    | admin  | Apagar                            |
| GET    | /api/social-posts?month=&user_id= | auth   | Posts filtrados                   |
| POST   | /api/social-posts                 | admin  | Criar                             |
| PATCH  | /api/social-posts/:id             | auth   | Editar                            |
| DELETE | /api/social-posts/:id             | admin  | Apagar um                         |
| POST   | /api/social-posts/bulk-delete     | admin  | Apagar mês de um cliente          |
| GET    | /api/tickets                      | auth   | Listar                            |
| POST   | /api/tickets                      | auth   | Abrir                             |
| GET    | /api/tickets/:id                  | auth   | Detalhe + mensagens               |
| POST   | /api/tickets/:id/messages         | auth   | Responder                         |
| PATCH  | /api/tickets/:id                  | admin  | Atualizar estado                  |
| GET    | /api/notifications                | admin  | Últimos 50 emails                 |

## Emails automáticos

Em desenvolvimento, todos os emails são registados na tabela `notifications` e impressos na consola. Em produção, se definires a variável `RESEND_API_KEY`, o mesmo `deliver()` envia também via API do [Resend](https://resend.com) (fire-and-forget, continua a funcionar o stub em paralelo). Os templates já incluídos:

- `welcome` — na criação de um cliente (credenciais + link para o portal)
- `projectStatus` — a cada mudança de fase, com mensagem opcional do admin
- `cancelRequest` — confirmação de receção ao cliente
- `cancelDecision` — decisão final (aprovado/recusado)
- `mockupReady` — novo mockup disponível para aprovação
- `postsCleared` — aviso quando admin apaga o mês de posts sociais

## Deploy no Railway

O projeto já vem preparado para o [Railway](https://railway.app):

- `Dockerfile` com toolchain para compilar o `better-sqlite3`.
- `auth.js` força `JWT_SECRET` em produção e mete `secure: true` no cookie.
- `server.js` tem `app.set('trust proxy', 1)` e `/healthz` para healthcheck.
- `db.js` lê `DATABASE_PATH` — aponta-o para o volume persistente.
- `email.js` usa [Resend](https://resend.com) se existir `RESEND_API_KEY`.

**Passos:**

1. `git init` dentro de `portal-cliente/`, commit e push para um repo no GitHub/GitLab.
2. No Railway: **New Project → Deploy from GitHub repo** e aponta para o repo.
3. **Volumes:** criar um volume e montá-lo em `/data`. Este é o passo crítico — sem volume, a SQLite é apagada a cada redeploy.
4. **Variables** do serviço:
   - `NODE_ENV=production`
   - `JWT_SECRET=...` (gera com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `DATABASE_PATH=/data/portal.db`
   - `RESEND_API_KEY=...` e `EMAIL_FROM="DUIT <no-reply@teudominio.pt>"` (opcional — sem isto, os emails ficam em consola/BD)
5. **Settings → Healthcheck Path:** `/healthz`.
6. O Railway deteta o `Dockerfile` e faz build automaticamente. A porta é injetada via `PORT`.
7. **Domínio:** em *Settings → Networking → Generate domain* (ou liga um custom domain).

**Primeiro arranque:**
- A seed cria os 4 utilizadores demo. Muda a password do admin no primeiro login, em *Perfil*, antes de dar o URL a ninguém.
- Se quiseres começar sem dados demo, faz login, apaga os 3 clientes demo e cria os reais.

## Ainda por fazer antes de produção séria

- Rate-limiting no `/api/auth/login` (ex: `express-rate-limit`).
- Recuperação de password por email.
- Uploads reais de ficheiros para S3/R2 (hoje só se regista metadata).
- Backup automático do volume (Railway tem snapshots).

## Reset da base de dados

Apagar `backend/portal.db` e `backend/portal.db-*` e reiniciar o servidor — a seed é recriada.

---

Feito com amarelo DUIT. Design com método.
