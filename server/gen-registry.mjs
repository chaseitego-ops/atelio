// Generate the full Agent Registry (77 rows) from the frontend data (single source of truth).
// Output: server/agents.seed.json  → loaded by db.mjs.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(__dirname, '..', 'src', 'data', 'agents.ts'), 'utf8')

const re = /\{\s*name:\s*'([^']+)',\s*blurb:\s*'[^']*',\s*category:\s*'([^']+)',\s*credits:\s*(\d+)([^}]*)\}/g

const TEXT = new Set(['Metin Yazarı', 'Çok Dilli Katalog Yazarı', 'Akıllı Akış Önericisi'])

function slug(s) {
  const map = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a' }
  return s.toLowerCase().replace(/[çğıİöşüâ]/g, c => map[c] || c)
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const rows = []
let m
while ((m = re.exec(src))) {
  const [, name, category, credits, tail] = m
  const kind = category === 'Video & 360°' ? 'video' : TEXT.has(name) ? 'text' : 'image'
  const provider = kind === 'text' ? 'anthropic' : 'fal'
  const model = kind === 'text' ? 'claude-sonnet-4-6'
    : kind === 'video' ? 'fal-ai/kling-video/v1/standard/text-to-video'
    : 'fal-ai/flux/dev'
  const prompt_template = kind === 'text'
    ? `Ürün: "{product}". Görev: ${name}. Dil: {lang}. Sadece sonucu ver.`
    : kind === 'video'
    ? `Kısa ürün videosu: {prompt}. Stil: ${name}.`
    : `Profesyonel ürün görseli: {prompt}. Ajan: ${name}. Stüdyo kalitesi, e-ticarete hazır.`
  rows.push({
    id: slug(name),
    name, category, kind, provider, model, prompt_template,
    credit_cost: Number(credits),
    is_new: /isNew|exclusive/.test(tail) ? 1 : 0,
  })
}

// de-dupe ids (a couple of names may collide)
const seen = new Set()
const out = rows.filter(r => (seen.has(r.id) ? false : seen.add(r.id)))

writeFileSync(join(__dirname, 'agents.seed.json'), JSON.stringify(out, null, 2))
const by = out.reduce((a, r) => ((a[r.kind] = (a[r.kind] || 0) + 1), a), {})
console.log(`Generated ${out.length} agents →`, by)
