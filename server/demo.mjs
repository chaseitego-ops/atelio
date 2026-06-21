// End-to-end demo: hits the running backend and prints the full pipeline result.
const API = process.env.API || 'http://localhost:8787'

async function j(method, path, body) {
  const r = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: r.status, data: await r.json() }
}

console.log('1) health   →', (await j('GET', '/health')).data)
console.log('2) agents   →', (await j('GET', '/agents')).data.map(a => `${a.id} (${a.kind}, ${a.credit_cost}cr)`))

console.log('\n3) Copy Writer çalıştır (text)…')
const copy = await j('POST', '/generate', { agentId: 'copy-writer', inputs: { product: 'El dokuma yün halı', lang: 'Türkçe' } })
console.log('   status:', copy.data.status, '| credits:', copy.data.credits)
console.log('   output:', JSON.stringify(copy.data.output).slice(0, 220), '…')

console.log('\n4) Görsel Üretici çalıştır (image)…')
const img = await j('POST', '/generate', { agentId: 'image-generator', inputs: { prompt: 'kadife 3-seat koltuk' } })
console.log('   status:', img.data.status, '| asset:', img.data.output?.url)

console.log('\n5) Krediler →', (await j('GET', '/credits')).data.org)
console.log('6) My Works (son üretimler) →', (await j('GET', '/generations')).data.length, 'kayıt')
