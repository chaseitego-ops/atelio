// Atelio backend — zero-dependency HTTP API (node:http + node:sqlite + fetch).
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'

// --- tiny .env loader (no dotenv dep) ---
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const dbm = await import('./db.mjs')
const { listAgents, getOrg, db, createProduct, listProducts, deleteProduct,
  createCatalog, listCatalogs, getCatalogBySlug, recordCatalogView, catalogAnalytics,
  createDeal, listDeals, updateDeal,
  createPriceList, listPriceLists, getPriceList, addPriceItem, deletePriceItem, deletePriceList } = dbm
const { runAgent, getGeneration, listGenerations } = await import('./runner.mjs')
const { writeFileSync, mkdirSync } = await import('node:fs')

function saveDataUrl(dataUrl, id, baseUrl) {
  const m = /^data:(image\/(png|jpeg|jpg|webp|gif));base64,(.+)$/s.exec(dataUrl || '')
  if (!m) return null
  const ext = m[2] === 'jpeg' ? 'jpg' : m[2]
  mkdirSync(join(OUT, 'products'), { recursive: true })
  writeFileSync(join(OUT, 'products', `${id}.${ext}`), Buffer.from(m[3], 'base64'))
  return `${baseUrl}/outputs/products/${id}.${ext}`
}

const PORT = process.env.PORT || 8787
const OUT = join(__dirname, 'outputs')
const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' }

function send(res, code, body, headers = {}) {
  const data = typeof body === 'string' ? body : JSON.stringify(body, null, 2)
  res.writeHead(code, {
    'Content-Type': typeof body === 'string' ? 'text/plain' : 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    ...headers,
  })
  res.end(data)
}
function readBody(req) {
  return new Promise(resolve => {
    let b = ''
    req.on('data', c => (b += c))
    req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}) } catch { resolve({}) } })
  })
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname
  if (req.method === 'OPTIONS') return send(res, 204, '')

  try {
    // static: generated assets
    if (path.startsWith('/outputs/')) {
      const f = join(OUT, path.replace('/outputs/', ''))
      if (!f.startsWith(OUT) || !existsSync(f)) return send(res, 404, 'not found')
      return send(res, 200, readFileSync(f, 'utf8'), { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' })
    }

    if (path === '/health') return send(res, 200, {
      ok: true,
      providers: {
        fal: process.env.FAL_KEY ? 'live' : 'mock',
        anthropic: process.env.ANTHROPIC_API_KEY ? 'live' : 'mock',
      },
    })

    if (path === '/agents' && req.method === 'GET') return send(res, 200, listAgents())

    if (path === '/credits' && req.method === 'GET') {
      const orgId = url.searchParams.get('orgId') || 'demo'
      const org = getOrg(orgId)
      const ledger = db.prepare('SELECT delta, reason, created_at FROM credit_ledger WHERE org_id=? ORDER BY created_at DESC LIMIT 20').all(orgId)
      return send(res, 200, { org, ledger })
    }

    if (path === '/generations' && req.method === 'GET') {
      const orgId = url.searchParams.get('orgId') || 'demo'
      return send(res, 200, listGenerations(orgId))
    }
    if (path.startsWith('/generations/') && req.method === 'GET') {
      const g = getGeneration(path.split('/')[2])
      return g ? send(res, 200, g) : send(res, 404, { error: 'not_found' })
    }

    if (path === '/generate' && req.method === 'POST') {
      const body = await readBody(req)
      if (!body.agentId) return send(res, 400, { error: 'agentId_required' })
      const baseUrl = `http://localhost:${PORT}`
      try {
        const gen = await runAgent({ orgId: body.orgId || 'demo', agentId: body.agentId, inputs: body.inputs || {}, baseUrl })
        return send(res, 200, gen)
      } catch (err) {
        if (err.code === 'insufficient_credits') return send(res, 402, { error: 'insufficient_credits', balance: err.balance })
        if (err.code === 'agent_not_found') return send(res, 404, { error: 'agent_not_found' })
        return send(res, 500, { error: String(err.message || err) })
      }
    }

    // ---- products ----
    if (path === '/products' && req.method === 'GET') return send(res, 200, listProducts())
    if (path === '/products' && req.method === 'POST') {
      const body = await readBody(req)
      if (!body.name) return send(res, 400, { error: 'name_required' })
      const imageUrl = body.imageDataUrl
        ? saveDataUrl(body.imageDataUrl, crypto.randomUUID(), `http://localhost:${PORT}`)
        : body.imageUrl || null
      return send(res, 200, createProduct(body.orgId || 'demo', body.name, imageUrl))
    }
    if (path.startsWith('/products/') && req.method === 'DELETE') {
      deleteProduct(path.split('/')[2]); return send(res, 200, { ok: true })
    }

    // ---- catalogs ----
    if (path === '/catalogs' && req.method === 'GET') return send(res, 200, listCatalogs())
    if (path === '/catalogs' && req.method === 'POST') {
      const body = await readBody(req)
      if (!body.title) return send(res, 400, { error: 'title_required' })
      return send(res, 200, createCatalog(body.orgId || 'demo', body.title, body.productIds || []))
    }
    const am = path.match(/^\/catalogs\/([^/]+)\/analytics$/)
    if (am && req.method === 'GET') return send(res, 200, catalogAnalytics(am[1]))

    // public storefront view (records a view)
    const cm = path.match(/^\/catalog\/([^/]+)$/)
    if (cm && req.method === 'GET') {
      const c = getCatalogBySlug(cm[1])
      if (!c) return send(res, 404, { error: 'not_found' })
      recordCatalogView(c.id, null)
      return send(res, 200, c)
    }
    const pv = path.match(/^\/catalog\/([^/]+)\/product-view$/)
    if (pv && req.method === 'POST') {
      const body = await readBody(req)
      const c = getCatalogBySlug(pv[1])
      if (c) recordCatalogView(c.id, body.productId || null)
      return send(res, 200, { ok: true })
    }

    // ---- price lists ----
    if (path === '/price-lists' && req.method === 'GET') return send(res, 200, listPriceLists())
    if (path === '/price-lists' && req.method === 'POST') {
      const body = await readBody(req)
      if (!body.name) return send(res, 400, { error: 'name_required' })
      return send(res, 200, createPriceList(body.orgId || 'demo', body.name))
    }
    const plItems = path.match(/^\/price-lists\/([^/]+)\/items$/)
    if (plItems && req.method === 'POST') {
      const body = await readBody(req)
      return send(res, 200, addPriceItem(plItems[1], body))
    }
    const plOne = path.match(/^\/price-lists\/([^/]+)$/)
    if (plOne && req.method === 'GET') {
      const l = getPriceList(plOne[1])
      return l ? send(res, 200, l) : send(res, 404, { error: 'not_found' })
    }
    if (plOne && req.method === 'DELETE') {
      deletePriceList(plOne[1])
      return send(res, 200, { ok: true })
    }
    const piOne = path.match(/^\/price-items\/([^/]+)$/)
    if (piOne && req.method === 'DELETE') return send(res, 200, deletePriceItem(piOne[1]) || { ok: true })

    // ---- CRM deals ----
    if (path === '/deals' && req.method === 'GET') return send(res, 200, listDeals(url.searchParams.get('orgId') || 'demo'))
    if (path === '/deals' && req.method === 'POST') {
      const body = await readBody(req)
      return send(res, 200, createDeal(body.orgId || 'demo', body))
    }
    const dm = path.match(/^\/deals\/([^/]+)$/)
    if (dm && req.method === 'POST') {
      const body = await readBody(req)
      const d = updateDeal(dm[1], body)
      return d ? send(res, 200, d) : send(res, 404, { error: 'not_found' })
    }

    return send(res, 404, { error: 'route_not_found', path })
  } catch (err) {
    send(res, 500, { error: String(err.message || err) })
  }
})

server.listen(PORT, () => {
  const fal = process.env.FAL_KEY ? 'LIVE' : 'mock'
  const ant = process.env.ANTHROPIC_API_KEY ? 'LIVE' : 'mock'
  console.log(`Atelio backend → http://localhost:${PORT}  (fal: ${fal}, anthropic: ${ant})`)
})
