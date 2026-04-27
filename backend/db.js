const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// Em produção (Railway) aponta DATABASE_PATH para o volume persistente — ex.: /data/portal.db
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'portal.db');

// Garante que a pasta existe (útil para volumes montados como /data)
try {
  const dir = path.dirname(dbPath);
  if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
} catch (e) { console.warn('Não consegui criar a pasta da BD:', e.message); }

console.log(`[db] a usar ${dbPath}`);
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ==============================================================
   Schema — portal DUIT
   ============================================================== */
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','client')),
  company TEXT,
  phone TEXT,
  avatar_url TEXT,
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK(category IN ('social','hosting','domain')),
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'mês',
  features TEXT,                      -- JSON array
  is_featured INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_id INTEGER,
  type TEXT NOT NULL CHECK(type IN ('hosting','domain','social')),
  name TEXT NOT NULL,
  detail TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','pending','expired','cancelled')),
  price REAL DEFAULT 0,
  period TEXT DEFAULT 'mês',
  renewal_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS subscription_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL,
  plan_id INTEGER,
  label TEXT NOT NULL,
  detail TEXT,
  default_price REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  price REAL NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'mês',
  renewal_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_subscription_items_sub ON subscription_items(subscription_id);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  stage TEXT NOT NULL DEFAULT 'new' CHECK(stage IN ('new','analysis','production','final_review','done','cancelled')),
  deadline TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mockups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','changes_requested')),
  thumb_style TEXT DEFAULT 'yellow',
  note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  kind TEXT,                          -- pdf/fig/png/zip/...
  size_kb INTEGER DEFAULT 0,
  uploaded_by TEXT DEFAULT 'DUIT',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cancellation_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reason TEXT,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','paused')),
  created_at TEXT DEFAULT (datetime('now')),
  decided_at TEXT,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  sent_at TEXT DEFAULT (datetime('now')),
  valid_until TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('draft','sent','revised','accepted','rejected')),
  rejection_reason TEXT,
  responded_at TEXT,
  seen_by_admin_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  detail TEXT,
  amount REAL NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  issued_at TEXT DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('paid','pending','overdue')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  about_user_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (about_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS social_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  network TEXT NOT NULL CHECK(network IN ('instagram','facebook','linkedin')),
  date TEXT NOT NULL,                 -- YYYY-MM-DD
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('draft','scheduled','published','cancelled')),
  client_suggestion TEXT,             -- sugestão do cliente (não altera o post)
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  kind TEXT,
  to_email TEXT,
  subject TEXT,
  body TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low','normal','high')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  read_by_admin_at TEXT,
  read_by_client_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);

CREATE TABLE IF NOT EXISTS project_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  read_by_admin_at TEXT,
  read_by_client_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_project_messages_project ON project_messages(project_id);
-- Nota: o índice em read_by_admin_at é criado depois das migrations correrem
-- (caso contrário, em BDs antigas ainda sem essa coluna, o CREATE INDEX falha
-- e bloqueia o arranque do servidor).
`);

/* ==============================================================
   Migrations ligeiras (para BDs já existentes)
   ============================================================== */
try {
  const cols = db.prepare(`PRAGMA table_info(social_posts)`).all();
  if (!cols.find(c => c.name === 'client_suggestion')) {
    db.exec(`ALTER TABLE social_posts ADD COLUMN client_suggestion TEXT`);
  }
} catch (e) { console.warn('Migration social_posts.client_suggestion:', e.message); }

// Migration: coluna notifications_enabled em users
try {
  const cols = db.prepare(`PRAGMA table_info(users)`).all();
  if (!cols.find(c => c.name === 'notifications_enabled')) {
    db.exec(`ALTER TABLE users ADD COLUMN notifications_enabled INTEGER NOT NULL DEFAULT 1`);
    console.log('✓ Migration: users.notifications_enabled adicionada.');
  }
} catch (e) { console.warn('Migration users.notifications_enabled:', e.message); }

// Migration: colunas extra em quotes (resposta do cliente, IVA, etc.)
try {
  const cols = db.prepare(`PRAGMA table_info(quotes)`).all();
  if (cols.length) {
    if (!cols.find(c => c.name === 'rejection_reason')) {
      db.exec(`ALTER TABLE quotes ADD COLUMN rejection_reason TEXT`);
      console.log('✓ Migration: quotes.rejection_reason adicionada.');
    }
    if (!cols.find(c => c.name === 'responded_at')) {
      db.exec(`ALTER TABLE quotes ADD COLUMN responded_at TEXT`);
      console.log('✓ Migration: quotes.responded_at adicionada.');
    }
    if (!cols.find(c => c.name === 'seen_by_admin_at')) {
      db.exec(`ALTER TABLE quotes ADD COLUMN seen_by_admin_at TEXT`);
      console.log('✓ Migration: quotes.seen_by_admin_at adicionada.');
    }
  }
} catch (e) { console.warn('Migration quotes extra columns:', e.message); }

// Migration: alargar CHECK do status em quotes para incluir 'revised'
try {
  const qSql = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='quotes'`).get();
  if (qSql && qSql.sql && !qSql.sql.includes("'revised'")) {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      BEGIN;
      CREATE TABLE quotes_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        sent_at TEXT DEFAULT (datetime('now')),
        valid_until TEXT,
        status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('draft','sent','revised','accepted','rejected')),
        rejection_reason TEXT,
        responded_at TEXT,
        seen_by_admin_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      INSERT INTO quotes_new (id, number, user_id, title, sent_at, valid_until, status,
                              rejection_reason, responded_at, seen_by_admin_at)
        SELECT id, number, user_id, title, sent_at, valid_until, status,
               rejection_reason, responded_at, seen_by_admin_at
          FROM quotes;
      DROP TABLE quotes;
      ALTER TABLE quotes_new RENAME TO quotes;
      COMMIT;
    `);
    db.pragma('foreign_keys = ON');
    console.log('✓ Migration: quotes.status alargado para incluir revised.');
  }
} catch (e) { console.warn('Migration quotes status revised:', e.message); }

// Migration: colunas period e renewal_date em subscription_items
try {
  const cols = db.prepare(`PRAGMA table_info(subscription_items)`).all();
  if (cols.length) {
    if (!cols.find(c => c.name === 'period')) {
      db.exec(`ALTER TABLE subscription_items ADD COLUMN period TEXT NOT NULL DEFAULT 'mês'`);
      console.log('✓ Migration: subscription_items.period adicionada.');
    }
    if (!cols.find(c => c.name === 'renewal_date')) {
      db.exec(`ALTER TABLE subscription_items ADD COLUMN renewal_date TEXT`);
      console.log('✓ Migration: subscription_items.renewal_date adicionada.');
      // Para items que vêm da migração inicial (cópia 1:1 das subscriptions),
      // copia o período e data de renovação da subscrição-pai para o item.
      try {
        db.exec(`
          UPDATE subscription_items
             SET period = COALESCE(
                   (SELECT s.period FROM subscriptions s WHERE s.id = subscription_items.subscription_id),
                   period
                 ),
                 renewal_date = COALESCE(
                   (SELECT s.renewal_date FROM subscriptions s WHERE s.id = subscription_items.subscription_id),
                   renewal_date
                 )
           WHERE renewal_date IS NULL
        `);
        console.log('✓ Migration: period e renewal_date sincronizados nas linhas existentes.');
      } catch (e) { console.warn('Sub-items sync period/renewal:', e.message); }
    }
  }
} catch (e) { console.warn('Migration subscription_items period/renewal:', e.message); }

// Migration: colunas read_by_admin_at e read_by_client_at em messages (tickets)
try {
  const cols = db.prepare(`PRAGMA table_info(messages)`).all();
  if (cols.length) {
    if (!cols.find(c => c.name === 'read_by_admin_at')) {
      db.exec(`ALTER TABLE messages ADD COLUMN read_by_admin_at TEXT`);
      console.log('✓ Migration: messages.read_by_admin_at adicionada.');
    }
    if (!cols.find(c => c.name === 'read_by_client_at')) {
      db.exec(`ALTER TABLE messages ADD COLUMN read_by_client_at TEXT`);
      console.log('✓ Migration: messages.read_by_client_at adicionada.');
    }
    db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_unread_admin ON messages(read_by_admin_at)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_unread_client ON messages(read_by_client_at)`);
  }
} catch (e) { console.warn('Migration messages read columns:', e.message); }

// Migration: colunas read_by_admin_at e read_by_client_at em project_messages
try {
  const cols = db.prepare(`PRAGMA table_info(project_messages)`).all();
  if (cols.length) {
    if (!cols.find(c => c.name === 'read_by_admin_at')) {
      db.exec(`ALTER TABLE project_messages ADD COLUMN read_by_admin_at TEXT`);
      console.log('✓ Migration: project_messages.read_by_admin_at adicionada.');
    }
    if (!cols.find(c => c.name === 'read_by_client_at')) {
      db.exec(`ALTER TABLE project_messages ADD COLUMN read_by_client_at TEXT`);
      console.log('✓ Migration: project_messages.read_by_client_at adicionada.');
    }
    // Índices idempotentes
    db.exec(`CREATE INDEX IF NOT EXISTS idx_project_messages_unread ON project_messages(read_by_admin_at)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_project_messages_unread_client ON project_messages(read_by_client_at)`);
  }
} catch (e) { console.warn('Migration project_messages read columns:', e.message); }

// Migration: simplificar status dos posts (tirar awaiting_approval / approved, meter cancelled)
try {
  const sp = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='social_posts'`).get();
  if (sp && sp.sql && sp.sql.includes('awaiting_approval')) {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      BEGIN;
      CREATE TABLE social_posts_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        network TEXT NOT NULL CHECK(network IN ('instagram','facebook','linkedin')),
        date TEXT NOT NULL,
        text TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('draft','scheduled','published','cancelled')),
        client_suggestion TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      INSERT INTO social_posts_new (id, user_id, network, date, text, status, client_suggestion, created_at)
        SELECT id, user_id, network, date, text,
          CASE WHEN status IN ('awaiting_approval','approved') THEN 'scheduled' ELSE status END,
          client_suggestion, created_at FROM social_posts;
      DROP TABLE social_posts;
      ALTER TABLE social_posts_new RENAME TO social_posts;
      COMMIT;
    `);
    db.pragma('foreign_keys = ON');
    console.log('✓ Migration: status dos posts simplificado.');
  }
} catch (e) { console.warn('Migration social_posts statuses:', e.message); }

// Migration: renomear stages dos projetos
try {
  const pr = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='projects'`).get();
  if (pr && pr.sql && pr.sql.includes("'briefing'")) {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      BEGIN;
      CREATE TABLE projects_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        stage TEXT NOT NULL DEFAULT 'new' CHECK(stage IN ('new','analysis','production','final_review','done','cancelled')),
        deadline TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      INSERT INTO projects_new (id, user_id, name, description, stage, deadline, created_at, updated_at)
        SELECT id, user_id, name, description,
          CASE stage
            WHEN 'briefing' THEN 'new'
            WHEN 'design'   THEN 'production'
            WHEN 'review'   THEN 'analysis'
            WHEN 'approval' THEN 'final_review'
            WHEN 'delivery' THEN 'final_review'
            WHEN 'done'     THEN 'done'
            ELSE 'new'
          END,
          deadline, created_at, updated_at FROM projects;
      DROP TABLE projects;
      ALTER TABLE projects_new RENAME TO projects;
      COMMIT;
    `);
    db.pragma('foreign_keys = ON');
    console.log('✓ Migration: stages dos projetos renomeados.');
  }
} catch (e) { console.warn('Migration projects stages:', e.message); }

/* ==============================================================
   Seed
   ============================================================== */
function seed() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count > 0) return;

  // Users
  const adminHash = bcrypt.hashSync('admin123', 10);
  const clientHash = bcrypt.hashSync('cliente123', 10);
  const insertUser = db.prepare(
    `INSERT INTO users (name, email, password_hash, role, company, phone)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const nuno = insertUser.run('Nuno Alho', 'admin@duit.pt', adminHash, 'admin', 'DUIT', '+351 918 390 570').lastInsertRowid;
  const ana = insertUser.run('Ana Ribeiro', 'ana@exemplo.pt', clientHash, 'client', 'Padaria do Bairro', '+351 912 345 678').lastInsertRowid;
  const joao = insertUser.run('João Silva', 'joao@exemplo.pt', clientHash, 'client', 'Silva Advogados', '+351 913 111 222').lastInsertRowid;
  const rita = insertUser.run('Rita Costa', 'rita@exemplo.pt', clientHash, 'client', 'Café Tertúlia', '+351 914 222 333').lastInsertRowid;

  // Plans (templates)
  const insertPlan = db.prepare(
    `INSERT INTO plans (category, name, description, price, period, features, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const plansList = [
    ['social', 'Social Básico',  'Para quem está a começar', 180, 'mês',
      JSON.stringify(['1 rede social', '8 posts/mês', 'Relatório mensal', 'Resposta em 48h']), 0],
    ['social', 'Social Pro',     'O mais popular',           240, 'mês',
      JSON.stringify(['2 redes sociais', '12 posts + stories', 'Relatório quinzenal', 'Resposta em 24h', 'Reels mensais']), 1],
    ['social', 'Social Premium', 'Presença completa',        420, 'mês',
      JSON.stringify(['3+ redes sociais', '20 posts + reels', 'Relatório semanal', 'Community management', 'Ads management']), 0],
    ['hosting', 'Web Básico',    'Sites simples',            6.9, 'mês',
      JSON.stringify(['10GB SSD', '1 email @domínio', 'Backups semanais', 'SSL incluído']), 0],
    ['hosting', 'Web Pro',       'Recomendado',              12.9, 'mês',
      JSON.stringify(['20GB SSD', '10 emails', 'Backups diários', 'SSL + CDN', 'Suporte prioritário']), 1],
    ['hosting', 'Web Business',  'Para negócios',            24.9, 'mês',
      JSON.stringify(['50GB SSD', 'Emails ilimitados', 'Backups diários', 'Staging', 'Monitoring 24/7']), 0],
    ['domain', '.pt',            'Domínio português',        15,  'ano',
      JSON.stringify(['Registo anual', 'DNS gerido', 'Email forwarder', 'WHOIS privacy']), 0],
    ['domain', '.com / .net',    'Internacional',            12,  'ano',
      JSON.stringify(['Registo anual', 'DNS gerido', 'WHOIS privacy', 'Auto-renew']), 0],
    ['domain', 'Premium',        '.design, .studio, .agency', 45, 'ano',
      JSON.stringify(['Registo anual', 'DNS gerido', 'SSL grátis', 'Forwarding']), 0],
  ];
  for (const p of plansList) insertPlan.run(...p);

  // Subscriptions
  const insertSub = db.prepare(
    `INSERT INTO subscriptions (user_id, type, name, detail, status, price, period, renewal_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  insertSub.run(ana, 'social',  'Pacote Social Pro',        '12 posts + stories · 2 redes', 'active',  240.00, 'mês', '2026-05-01');
  insertSub.run(ana, 'hosting', 'Alojamento Web Pro',       'cPanel · 20GB SSD · Backups',  'active',  12.90,  'mês', '2026-09-12');
  insertSub.run(ana, 'domain',  'padariadobairro.pt',       'Renovação anual',              'active',  15.00,  'ano', '2026-11-03');

  insertSub.run(joao, 'hosting','Alojamento Web Básico',    '10GB SSD',                     'active',  6.90,   'mês', '2026-07-20');
  insertSub.run(joao, 'domain', 'silvaadvogados.pt',        'Renovação anual',              'pending', 15.00,  'ano', '2026-05-05');

  insertSub.run(rita, 'social', 'Pacote Social Básico',     '8 posts/mês · Instagram',      'active', 180.00, 'mês', '2026-05-18');
  insertSub.run(rita, 'hosting','Alojamento Web Pro',       '20GB SSD',                     'active',  12.90, 'mês', '2026-08-01');
  insertSub.run(rita, 'domain', 'cafetertulia.pt',          'Renovação anual',              'active',  15.00, 'ano', '2026-10-12');

  // Projects
  const insertProj = db.prepare(
    `INSERT INTO projects (user_id, name, description, stage, deadline, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const proj1 = insertProj.run(ana, 'Rebranding da padaria', 'Identidade visual completa + papelaria', 'final_review', '2026-05-15', datetime(-1)).lastInsertRowid;
  const proj2 = insertProj.run(ana, 'Website padariadobairro.pt', 'Site institucional com encomendas', 'new', '2026-06-30', datetime(-4)).lastInsertRowid;
  const proj3 = insertProj.run(joao, 'Novo website — Silva Advogados', 'Site institucional + área de clientes', 'final_review', '2026-05-30', datetime(-2)).lastInsertRowid;
  const proj4 = insertProj.run(rita, 'Campanha social — Dia da Mãe', 'Identidade de campanha + 12 posts', 'production', '2026-05-04', datetime(-3)).lastInsertRowid;

  // Mockups
  const insertMockup = db.prepare(
    `INSERT INTO mockups (project_id, title, version, status, thumb_style) VALUES (?, ?, ?, ?, ?)`
  );
  insertMockup.run(proj1, 'Logótipo',       2, 'pending',  'yellow');
  insertMockup.run(proj1, 'Paleta de cores', 1, 'pending', 'cream');
  insertMockup.run(proj1, 'Tipografia',     1, 'approved', 'ink');
  insertMockup.run(proj1, 'Moodboard',      1, 'changes_requested', 'olive');
  insertMockup.run(proj3, 'Homepage',       1, 'pending',  'dusty');

  // Files
  const insertFile = db.prepare(
    `INSERT INTO files (project_id, user_id, name, kind, size_kb, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)`
  );
  insertFile.run(proj1, ana, 'Brand Guidelines v2.pdf',       'pdf', 2400, 'DUIT');
  insertFile.run(proj1, ana, 'Logo_final.fig',                'fig', 1100, 'DUIT');
  insertFile.run(proj1, ana, 'Logo_exports.zip',              'zip', 12800, 'DUIT');
  insertFile.run(proj1, ana, 'Moodboard_v3.png',              'png', 4200, 'Cliente');
  insertFile.run(proj1, ana, 'Briefing inicial.pdf',          'pdf', 820,  'Cliente');
  insertFile.run(proj2, ana, 'Briefing website.pdf',          'pdf', 640,  'DUIT');
  insertFile.run(proj2, ana, 'Wireframes_v1.fig',             'fig', 7700, 'DUIT');

  // Quotes
  const insertQuote = db.prepare(
    `INSERT INTO quotes (number, user_id, title, sent_at, valid_until, status) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertQItem = db.prepare(
    `INSERT INTO quote_items (quote_id, label, detail, amount) VALUES (?, ?, ?, ?)`
  );
  const q1 = insertQuote.run('2026-041', ana,  'Rebranding da padaria', '2026-04-18', '2026-05-18', 'sent').lastInsertRowid;
  insertQItem.run(q1, 'Identidade visual completa', 'Logótipo, paleta, tipografia, guidelines', 850);
  insertQItem.run(q1, 'Design de embalagens',       '3 variações + etiquetas',                  320);
  insertQItem.run(q1, 'Papelaria',                  'Cartões, fatura, envelopes',               140);

  const q2 = insertQuote.run('2026-040', rita, 'Ilustrações menu', '2026-04-15', '2026-05-15', 'accepted').lastInsertRowid;
  insertQItem.run(q2, 'Ilustrações à mão', '12 ilustrações + variações', 480);

  const q3 = insertQuote.run('2026-039', joao, 'Campanha Google Ads', '2026-04-10', '2026-05-10', 'rejected').lastInsertRowid;
  insertQItem.run(q3, 'Setup campanha', 'Landing + 4 criativos', 650);

  // Invoices
  const insertInv = db.prepare(
    `INSERT INTO invoices (number, user_id, description, amount, issued_at, status) VALUES (?, ?, ?, ?, ?, ?)`
  );
  insertInv.run('2026/042', ana,  'Plano Social Pro · Abril',   240.00, '2026-04-01', 'paid');
  insertInv.run('2026/036', ana,  'Alojamento Web Pro',          12.90, '2026-03-12', 'paid');
  insertInv.run('2026/029', ana,  'Plano Social Pro · Março',   240.00, '2026-03-01', 'paid');
  insertInv.run('2026/018', ana,  'Plano Social Pro · Fevereiro',240.00,'2026-02-01', 'paid');
  insertInv.run('2026/041', rita, 'Plano Social Básico · Abril',180.00, '2026-04-01', 'pending');
  insertInv.run('2026/040', joao, 'Domínio silvaadvogados.pt',   15.00, '2026-03-28', 'overdue');

  // Cancellation request demo
  db.prepare(
    `INSERT INTO cancellation_requests (subscription_id, user_id, reason, comment, status)
     VALUES (?, ?, ?, ?, 'pending')`
  ).run(5, joao, 'Pausa temporária',
        'Vamos reestruturar a comunicação internamente nos próximos 3 meses. Queremos pausar, não cancelar definitivamente.');

  // Notes (admin-only, about Ana)
  const insertNote = db.prepare(
    `INSERT INTO notes (about_user_id, author_id, body, created_at) VALUES (?, ?, ?, ?)`
  );
  insertNote.run(ana, nuno, 'Paga sempre a dia 15, nunca antes. Não enviar lembretes agressivos.', datetime(-12, 'days'));
  insertNote.run(ana, nuno, 'Prefere comunicar por WhatsApp para urgências (+351 912 345 678).',    datetime(-30, 'days'));
  insertNote.run(ana, nuno, 'Atenção: evitar tons verdes no branding — reação negativa do sogro.',   datetime(-60, 'days'));

  // Social posts (Abril 2026)
  const insertPost = db.prepare(
    `INSERT INTO social_posts (user_id, network, date, text, status) VALUES (?, ?, ?, ?, ?)`
  );
  const posts = [
    [ana, 'instagram', '2026-04-03', 'Pão da manhã',            'published'],
    [ana, 'facebook',  '2026-04-07', 'Novos doces',             'published'],
    [joao,'linkedin',  '2026-04-10', 'Artigo sobre direito digital', 'published'],
    [ana, 'instagram', '2026-04-12', 'Stories receita folar',   'published'],
    [rita,'instagram', '2026-04-14', 'Reel baristas',           'published'],
    [ana, 'instagram', '2026-04-15', 'Reels bastidores',        'published'],
    [ana, 'facebook',  '2026-04-18', 'Cliente da semana',       'published'],
    [joao,'linkedin',  '2026-04-18', 'Caso de estudo',          'published'],
    [rita,'instagram', '2026-04-22', 'Ideia menu maio',         'draft'],
    [rita,'instagram', '2026-04-24', 'Stories aniversário',     'scheduled'],
    [joao,'facebook',  '2026-04-25', 'Newsletter mensal',       'scheduled'],
    [ana, 'instagram', '2026-04-28', 'Pão quente ☀️',           'scheduled'],
    [rita,'instagram', '2026-04-29', 'Campanha Dia da Mãe',     'scheduled'],
    [ana, 'facebook',  '2026-04-30', 'Promo Dia da Mãe',        'scheduled'],
  ];
  for (const p of posts) insertPost.run(...p);

  // Tickets
  const insertTicket = db.prepare(
    `INSERT INTO tickets (user_id, subject, status, priority) VALUES (?, ?, ?, ?)`
  );
  const insertMsg = db.prepare(
    `INSERT INTO messages (ticket_id, user_id, body) VALUES (?, ?, ?)`
  );

  const t1 = insertTicket.run(ana, 'Alteração do logo no site', 'open', 'normal').lastInsertRowid;
  insertMsg.run(t1, ana,  'Olá! Gostaria de atualizar o logo no cabeçalho do site. Envio o ficheiro em anexo.');
  insertMsg.run(t1, nuno, 'Olá Ana, recebido. Vamos tratar hoje e enviamos preview para aprovação.');

  const t2 = insertTicket.run(joao, 'Email profissional não envia', 'in_progress', 'high').lastInsertRowid;
  insertMsg.run(t2, joao, 'O email geral@silvaadvogados.pt não está a enviar desde ontem.');
  insertMsg.run(t2, nuno, 'Verificámos os registos SPF. A investigar o servidor SMTP — damos update em breve.');

  const t3 = insertTicket.run(rita, 'Rever texto post Dia da Mãe', 'open', 'low').lastInsertRowid;
  insertMsg.run(t3, rita, 'Podem alterar o copy do post de 29 Abr? Queria uma ligação mais emotiva.');

  console.log('✓ Base de dados DUIT preenchida com dados demo.');
}

// helper: SQLite-compatible datetime("now", offset)
function datetime(n, unit = 'days') {
  // returns a string like "2026-04-10 12:00:00"
  const d = new Date();
  if (unit === 'days') d.setDate(d.getDate() + n);
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

seed();

/* ==============================================================
   Pós-seed: garantir que subscription_items reflete subscriptions.
   Corre tanto em BDs antigas (vindas de releases sem items) como em
   instalações novas (após seed que insere directamente em subscriptions).
   ============================================================== */
try {
  const hasTable = db.prepare(
    `SELECT COUNT(*) c FROM sqlite_master WHERE type='table' AND name='subscription_items'`
  ).get().c > 0;
  if (hasTable) {
    const items = db.prepare(`SELECT COUNT(*) c FROM subscription_items`).get().c;
    if (items === 0) {
      const subs = db.prepare(`SELECT id, plan_id, name, detail, price, period, renewal_date FROM subscriptions`).all();
      if (subs.length) {
        const insertItem = db.prepare(
          `INSERT INTO subscription_items
             (subscription_id, plan_id, label, detail, default_price, discount, price, period, renewal_date)
           VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`
        );
        const tx = db.transaction(() => {
          for (const s of subs) {
            insertItem.run(
              s.id, s.plan_id || null, s.name, s.detail || '',
              s.price || 0, s.price || 0,
              s.period || 'mês', s.renewal_date || null
            );
          }
        });
        tx();
        console.log(`✓ subscription_items populada com ${subs.length} linhas (cópia 1:1 de subscriptions).`);
      }
    }
  }
} catch (e) { console.warn('Sync subscription_items:', e.message); }

module.exports = db;
