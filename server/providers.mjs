// Model providers. Real APIs via fetch (no SDK deps). Falls back to MOCK when
// the relevant key is missing, so the whole pipeline runs end-to-end today.
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'outputs')
mkdirSync(OUT, { recursive: true })

function fillTemplate(tpl, inputs) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (inputs[k] ?? `{${k}}`))
}

// ---- MOCK (no key needed) ----
function mockImage(agent, inputs, genId, baseUrl) {
  const label = (inputs.prompt || inputs.product || agent.name).slice(0, 40)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5C82FF"/><stop offset="1" stop-color="#1E3FB8"/></linearGradient></defs>
    <rect width="1024" height="1024" fill="#0C0D12"/>
    <rect x="112" y="112" width="800" height="800" rx="32" fill="url(#g)" opacity="0.92"/>
    <text x="512" y="500" fill="#fff" font-family="sans-serif" font-size="40" font-weight="700" text-anchor="middle">ATELIO · MOCK</text>
    <text x="512" y="560" fill="#cdd9ff" font-family="sans-serif" font-size="26" text-anchor="middle">${escapeXml(agent.name)}</text>
    <text x="512" y="610" fill="#9db4ff" font-family="sans-serif" font-size="20" text-anchor="middle">${escapeXml(label)}</text>
  </svg>`
  writeFileSync(join(OUT, `${genId}.svg`), svg)
  return { type: 'image', url: `${baseUrl}/outputs/${genId}.svg`, mock: true }
}
function mockVideo(agent, inputs, genId, baseUrl) {
  // placeholder poster for video agents until fal video is wired
  mockImage({ ...agent, name: agent.name + ' (video)' }, inputs, genId, baseUrl)
  return { type: 'video', poster: `${baseUrl}/outputs/${genId}.svg`, url: null, mock: true, note: 'fal video anahtarı eklenince gerçek klip' }
}
function mockText(agent, inputs) {
  const p = inputs.product || inputs.prompt || 'ürün'
  return { type: 'text', text:
`[MOCK] ${agent.name}
Slogan: ${p} — zanaatın yeni hâli
Kısa: ${p}, modern üretim ve özenli detaylarla. Her mekâna değer katar.
Uzun: ${p} koleksiyonu, dayanıklı malzeme ve zamansız tasarımı bir araya getirir...`,
    mock: true }
}
function escapeXml(s) { return String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])) }

// ---- REAL: fal.ai (image) ----
async function falImage(agent, inputs) {
  const key = process.env.FAL_KEY
  const prompt = fillTemplate(agent.prompt_template, inputs)
  const res = await fetch(`https://fal.run/${agent.model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image_size: 'square_hd', ...(inputs.image ? { image_url: inputs.image } : {}) }),
  })
  if (!res.ok) throw new Error(`fal_error ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const url = data?.images?.[0]?.url || data?.image?.url
  if (!url) throw new Error('fal_no_image')
  return { type: 'image', url, mock: false }
}

// ---- REAL: Anthropic Claude (text) ----
async function anthropicText(agent, inputs) {
  const key = process.env.ANTHROPIC_API_KEY
  const prompt = fillTemplate(agent.prompt_template, inputs)
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: agent.model, max_tokens: 700, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`anthropic_error ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const text = data?.content?.map(c => c.text).join('\n') ?? ''
  return { type: 'text', text, mock: false }
}

// ---- router ----
export async function runProvider(agent, inputs, genId, baseUrl) {
  const hasFal = !!process.env.FAL_KEY
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  // Resilience: if a live provider fails (e.g. balance not topped up yet), fall
  // back to a clearly-marked mock so the app stays demoable. Real output the
  // moment the provider works.
  if (agent.kind === 'image') {
    if (agent.provider === 'fal' && hasFal) {
      try {
        return await falImage(agent, inputs)
      } catch (e) {
        return { ...mockImage(agent, inputs, genId, baseUrl), note: 'canlı sağlayıcı: ' + String(e.message).slice(0, 90) }
      }
    }
    return mockImage(agent, inputs, genId, baseUrl)
  }
  if (agent.kind === 'text') {
    if (agent.provider === 'anthropic' && hasAnthropic) {
      try {
        return await anthropicText(agent, inputs)
      } catch (e) {
        return { ...mockText(agent, inputs), note: 'canlı sağlayıcı: ' + String(e.message).slice(0, 90) }
      }
    }
    return mockText(agent, inputs)
  }
  if (agent.kind === 'video') {
    // real fal video to be wired (fal-ai/kling-video); mock poster for now
    return mockVideo(agent, inputs, genId, baseUrl)
  }
  throw new Error('unknown_agent_kind')
}
