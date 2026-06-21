// Atelio backend — data layer (zero-dependency, Node built-in SQLite).
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const db = new DatabaseSync(join(__dirname, 'atelio.db'))

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS orgs (
    id TEXT PRIMARY KEY,
    name TEXT,
    plan TEXT,
    credits REAL NOT NULL DEFAULT 0
  );

  -- Agent Registry: each of the 77 agents is a row, not a separate integration.
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    kind TEXT NOT NULL,                 -- 'image' | 'text'
    provider TEXT NOT NULL,             -- 'fal' | 'anthropic'
    model TEXT NOT NULL,
    prompt_template TEXT NOT NULL,
    credit_cost REAL NOT NULL,
    is_new INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS generations (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    status TEXT NOT NULL,               -- 'queued'|'processing'|'done'|'error'
    inputs TEXT,
    output TEXT,
    credits REAL,
    error TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  -- Append-only ledger → full transparency + reserve/settle/refund.
  CREATE TABLE IF NOT EXISTS credit_ledger (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    generation_id TEXT,
    delta REAL NOT NULL,               -- negative = spend, positive = refund/topup
    reason TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS catalogs (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'published',
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS catalog_items (
    catalog_id TEXT NOT NULL,
    product_id TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS catalog_views (
    id TEXT PRIMARY KEY,
    catalog_id TEXT NOT NULL,
    product_id TEXT,
    at TEXT
  );

  -- Pazaryeri aktarımları (Trendyol/Amazon/Shopify/Woo) — şimdilik mock
  CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    marketplace TEXT NOT NULL,
    status TEXT DEFAULT 'published',
    external_ref TEXT,
    created_at TEXT
  );

  -- Uygulama içi al-sat mesajlaşması (teklif/deal bazlı)
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    deal_id TEXT NOT NULL,
    sender TEXT NOT NULL,             -- 'seller' | 'buyer'
    body TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS price_lists (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'TRY',
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS price_items (
    id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL,
    product_id TEXT,
    label TEXT,
    price REAL,
    unit TEXT
  );

  -- CRM: real B2B pipeline (referansın 'price offers'ından farkı: tam pipeline)
  CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    catalog_id TEXT,
    catalog_title TEXT,
    customer_name TEXT,
    contact TEXT,
    message TEXT,
    stage TEXT NOT NULL DEFAULT 'lead',   -- lead|quoted|negotiating|won|lost
    amount REAL,
    created_at TEXT,
    updated_at TEXT
  );
`)

// ---- seed demo org ----
const demoOrg = db.prepare('SELECT id FROM orgs WHERE id = ?').get('demo')
if (!demoOrg) {
  db.prepare('INSERT INTO orgs (id, name, plan, credits) VALUES (?,?,?,?)').run(
    'demo',
    'Demo Atölye',
    'growth',
    300,
  )
  db.prepare(
    'INSERT INTO credit_ledger (id, org_id, generation_id, delta, reason, created_at) VALUES (?,?,?,?,?,?)',
  ).run(crypto.randomUUID(), 'demo', null, 300, 'signup_grant', new Date().toISOString())
}

// ---- seed agent registry ----
// Full 77-agent registry is generated from the frontend data into agents.seed.json
// (run `node gen-registry.mjs`). Fall back to this inline slice if it's missing.
import { readFileSync, existsSync } from 'node:fs'
const seedPath = join(__dirname, 'agents.seed.json')
const FALLBACK = [
  { id: 'image-generator', name: 'Görsel Üretici', category: 'Temel', kind: 'image',
    provider: 'fal', model: 'fal-ai/flux/schnell', credit_cost: 2, is_new: 0,
    prompt_template: 'Professional product photo, {prompt}, studio lighting, high detail, e-commerce ready' },
  { id: 'product-lifestyle', name: 'Yaşam Tarzı Görseli', category: 'Ürün Fotoğrafı', kind: 'image',
    provider: 'fal', model: 'fal-ai/flux/dev', credit_cost: 3, is_new: 0,
    prompt_template: 'Lifestyle scene featuring {product}, {style}, natural light, interior setting, photorealistic' },
  { id: 'background-remover', name: 'Arka Plan Temizleyici', category: 'Temel', kind: 'image',
    provider: 'fal', model: 'fal-ai/birefnet', credit_cost: 1, is_new: 1,
    prompt_template: '{image}' },
  { id: 'copy-writer', name: 'Metin Yazarı', category: 'E-Ticaret', kind: 'text',
    provider: 'anthropic', model: 'claude-sonnet-4-6', credit_cost: 1, is_new: 1,
    prompt_template: 'Sen bir e-ticaret metin yazarısın. Ürün: "{product}". Dil: {lang}. Şunları üret:\n1) Slogan (max 8 kelime)\n2) Kısa açıklama (2 cümle)\n3) Uzun editöryel açıklama (1 paragraf). Sadece metni ver.' },
  { id: 'multilingual-copy', name: 'Çok Dilli Katalog Yazarı', category: 'E-Ticaret', kind: 'text',
    provider: 'anthropic', model: 'claude-sonnet-4-6', credit_cost: 2, is_new: 1,
    prompt_template: 'Ürün: "{product}". Şu dillerde SEO uyumlu kısa ürün açıklaması + 5 meta etiketi üret: {langs}. JSON döndür: {"lang":{"description":"...","tags":[...]}}.' },
]
const AGENTS = existsSync(seedPath) ? JSON.parse(readFileSync(seedPath, 'utf8')) : FALLBACK
const upsert = db.prepare(`INSERT INTO agents (id,name,category,kind,provider,model,prompt_template,credit_cost,is_new)
  VALUES (@id,@name,@category,@kind,@provider,@model,@prompt_template,@credit_cost,@is_new)
  ON CONFLICT(id) DO UPDATE SET name=@name, model=@model, prompt_template=@prompt_template, credit_cost=@credit_cost`)
for (const a of AGENTS) upsert.run(a)

export function listAgents() {
  return db.prepare('SELECT * FROM agents ORDER BY kind, name').all()
}
export function getAgent(id) {
  return db.prepare('SELECT * FROM agents WHERE id = ?').get(id)
}
export function getOrg(id) {
  return db.prepare('SELECT * FROM orgs WHERE id = ?').get(id)
}

// ---- products ----
export function createProduct(orgId, name, imageUrl) {
  const id = crypto.randomUUID()
  db.prepare('INSERT INTO products (id,org_id,name,image_url,created_at) VALUES (?,?,?,?,?)')
    .run(id, orgId, name, imageUrl, new Date().toISOString())
  return getProduct(id)
}
export function getProduct(id) { return db.prepare('SELECT * FROM products WHERE id=?').get(id) }
export function listProducts(orgId = 'demo') {
  return db.prepare('SELECT * FROM products WHERE org_id=? ORDER BY created_at DESC').all(orgId)
}
export function deleteProduct(id) { db.prepare('DELETE FROM products WHERE id=?').run(id) }

// ---- catalogs ----
export function createCatalog(orgId, title, productIds = []) {
  const id = crypto.randomUUID()
  const slug = slugify(title) + '-' + id.slice(0, 6)
  db.prepare('INSERT INTO catalogs (id,org_id,title,slug,status,created_at) VALUES (?,?,?,?,?,?)')
    .run(id, orgId, title, slug, 'published', new Date().toISOString())
  const ins = db.prepare('INSERT INTO catalog_items (catalog_id,product_id) VALUES (?,?)')
  for (const pid of productIds) ins.run(id, pid)
  return getCatalog(id)
}
export function getCatalog(id) {
  const c = db.prepare('SELECT * FROM catalogs WHERE id=?').get(id)
  if (c) c.products = catalogProducts(id)
  return c
}
export function getCatalogBySlug(slug) {
  const c = db.prepare('SELECT * FROM catalogs WHERE slug=?').get(slug)
  if (c) c.products = catalogProducts(c.id)
  return c
}
function catalogProducts(catalogId) {
  return db.prepare(`SELECT p.* FROM catalog_items ci JOIN products p ON p.id=ci.product_id WHERE ci.catalog_id=?`).all(catalogId)
}
export function listCatalogs(orgId = 'demo') {
  return db.prepare('SELECT * FROM catalogs WHERE org_id=? ORDER BY created_at DESC').all(orgId)
    .map(c => ({ ...c, count: db.prepare('SELECT COUNT(*) n FROM catalog_items WHERE catalog_id=?').get(c.id).n,
      views: db.prepare('SELECT COUNT(*) n FROM catalog_views WHERE catalog_id=?').get(c.id).n }))
}
export function recordCatalogView(catalogId, productId = null) {
  db.prepare('INSERT INTO catalog_views (id,catalog_id,product_id,at) VALUES (?,?,?,?)')
    .run(crypto.randomUUID(), catalogId, productId, new Date().toISOString())
}
export function catalogAnalytics(id) {
  const total = db.prepare('SELECT COUNT(*) n FROM catalog_views WHERE catalog_id=?').get(id).n
  const opens = db.prepare('SELECT COUNT(*) n FROM catalog_views WHERE catalog_id=? AND product_id IS NULL').get(id).n
  const clicks = total - opens
  const perProduct = db.prepare(`SELECT p.name, COUNT(v.id) views FROM catalog_views v
    JOIN products p ON p.id=v.product_id WHERE v.catalog_id=? GROUP BY v.product_id ORDER BY views DESC`).all(id)
  return { total, opens, clicks, perProduct }
}
function slugify(s) {
  const map = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a' }
  return s.toLowerCase().replace(/[çğıİöşüâ]/g, c => map[c] || c).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'katalog'
}

// ---- marketplace listings (mock export) ----
export function createListing(orgId, productId, marketplace) {
  const id = crypto.randomUUID()
  const ref = marketplace.toLowerCase().replace(/[^a-z]/g, '') + '-' + id.slice(0, 8)
  // de-dupe: one listing per (product, marketplace)
  const ex = db.prepare('SELECT id FROM listings WHERE product_id=? AND marketplace=?').get(productId, marketplace)
  if (ex) return listListings(orgId)
  db.prepare('INSERT INTO listings (id,org_id,product_id,marketplace,status,external_ref,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, orgId, productId, marketplace, 'published', ref, new Date().toISOString())
  return listListings(orgId)
}
export function listListings(orgId = 'demo') {
  return db.prepare('SELECT * FROM listings WHERE org_id=? ORDER BY created_at DESC').all(orgId)
}
export function deleteListing(id) { db.prepare('DELETE FROM listings WHERE id=?').run(id) }

// ---- deal messages ----
export function addMessage(dealId, sender, body) {
  const id = crypto.randomUUID()
  db.prepare('INSERT INTO messages (id,deal_id,sender,body,created_at) VALUES (?,?,?,?,?)')
    .run(id, dealId, sender === 'buyer' ? 'buyer' : 'seller', body || '', new Date().toISOString())
  return listMessages(dealId)
}
export function listMessages(dealId) {
  return db.prepare('SELECT * FROM messages WHERE deal_id=? ORDER BY created_at ASC').all(dealId)
}

// ---- price lists ----
export function createPriceList(orgId, name) {
  const id = crypto.randomUUID()
  db.prepare('INSERT INTO price_lists (id,org_id,name,currency,created_at) VALUES (?,?,?,?,?)')
    .run(id, orgId, name, 'TRY', new Date().toISOString())
  return getPriceList(id)
}
export function listPriceLists(orgId = 'demo') {
  return db.prepare('SELECT * FROM price_lists WHERE org_id=? ORDER BY created_at DESC').all(orgId)
    .map(l => ({ ...l, count: db.prepare('SELECT COUNT(*) n FROM price_items WHERE list_id=?').get(l.id).n }))
}
export function getPriceList(id) {
  const l = db.prepare('SELECT * FROM price_lists WHERE id=?').get(id)
  if (l) l.items = db.prepare(`SELECT pi.*, p.name product_name, p.image_url FROM price_items pi
    LEFT JOIN products p ON p.id=pi.product_id WHERE pi.list_id=?`).all(id)
  return l
}
export function addPriceItem(listId, { productId, label, price, unit }) {
  const id = crypto.randomUUID()
  db.prepare('INSERT INTO price_items (id,list_id,product_id,label,price,unit) VALUES (?,?,?,?,?,?)')
    .run(id, listId, productId || null, label || null, price ?? null, unit || 'adet')
  return getPriceList(listId)
}
export function deletePriceItem(id) {
  const it = db.prepare('SELECT list_id FROM price_items WHERE id=?').get(id)
  db.prepare('DELETE FROM price_items WHERE id=?').run(id)
  return it ? getPriceList(it.list_id) : null
}
export function deletePriceList(id) {
  db.prepare('DELETE FROM price_items WHERE list_id=?').run(id)
  db.prepare('DELETE FROM price_lists WHERE id=?').run(id)
}

// ---- CRM deals ----
const STAGES = ['lead', 'quoted', 'negotiating', 'won', 'lost']
export function createDeal(orgId, { catalogSlug, name, contact, message }) {
  const cat = catalogSlug ? db.prepare('SELECT id,title,org_id FROM catalogs WHERE slug=?').get(catalogSlug) : null
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  db.prepare(`INSERT INTO deals (id,org_id,catalog_id,catalog_title,customer_name,contact,message,stage,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    id, cat?.org_id || orgId, cat?.id || null, cat?.title || null, name || 'İsimsiz', contact || '', message || '', 'lead', now, now,
  )
  return db.prepare('SELECT * FROM deals WHERE id=?').get(id)
}
export function listDeals(orgId = 'demo') {
  return db.prepare('SELECT * FROM deals WHERE org_id=? ORDER BY updated_at DESC').all(orgId)
}
export function updateDeal(id, { stage, amount }) {
  const d = db.prepare('SELECT * FROM deals WHERE id=?').get(id)
  if (!d) return null
  const newStage = stage && STAGES.includes(stage) ? stage : d.stage
  const newAmount = amount === undefined ? d.amount : amount
  db.prepare('UPDATE deals SET stage=?, amount=?, updated_at=? WHERE id=?')
    .run(newStage, newAmount, new Date().toISOString(), id)
  return db.prepare('SELECT * FROM deals WHERE id=?').get(id)
}
