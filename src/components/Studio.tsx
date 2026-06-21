import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, type ApiAgent, type Generation, type Health, type Product } from '../lib/api'
import { BackendDown } from './States'

const KIND_LABEL: Record<string, string> = { image: 'Görsel', text: 'Metin', video: 'Video' }

export default function Studio({ initialAgentId }: { initialAgentId?: string }) {
  const [agents, setAgents] = useState<ApiAgent[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState('')
  const [health, setHealth] = useState<Health | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [works, setWorks] = useState<Generation[]>([])
  const [backendError, setBackendError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>(initialAgentId || '')
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<Generation | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [savedAs, setSavedAs] = useState<string | null>(null)

  async function refresh() {
    const [c, w] = await Promise.all([api.credits(), api.generations()])
    setCredits(c.org.credits)
    setWorks(w)
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [h, a, p] = await Promise.all([api.health(), api.agents(), api.products()])
        if (!alive) return
        setHealth(h)
        setAgents(a)
        setProducts(p)
        if (!selectedId && a[0]) setSelectedId(a[0].id)
        await refresh()
      } catch (e) {
        if (alive) setBackendError((e as Error).message || 'backend_unreachable')
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = useMemo(() => agents.find((a) => a.id === selectedId) || null, [agents, selectedId])

  // reset inputs when agent changes
  useEffect(() => {
    if (!selected) return
    if (selected.kind === 'text') {
      setInputs(selected.id.includes('cok-dilli') ? { product: '', langs: 'TR, EN, DE' } : { product: '', lang: 'Türkçe' })
    } else {
      setInputs({ prompt: '' })
    }
    setProductId('')
    setResult(null)
    setRunError(null)
  }, [selectedId, selected])

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    return agents.filter((a) => !q || a.name.toLocaleLowerCase('tr').includes(q) || a.category.toLocaleLowerCase('tr').includes(q))
  }, [agents, query])

  const hasInput = Object.values(inputs).some((v) => v.trim()) || (!!productId && selected?.kind !== 'text')
  const canRun = selected && !running && credits != null && credits >= selected.credit_cost && hasInput

  async function saveAsProduct() {
    const url = result?.output?.url || result?.output?.poster
    if (!url) return
    const source = products.find((p) => p.id === productId)
    const name = (source ? source.name + ' · ' : '') + (selected?.name || 'AI çıktısı')
    const p = await api.createProductFromUrl(name, url)
    setProducts(await api.products())
    setSavedAs(p.name)
    setTimeout(() => setSavedAs(null), 4000)
  }

  async function run() {
    if (!selected) return
    setRunning(true)
    setRunError(null)
    setResult(null)
    setSavedAs(null)
    try {
      const product = products.find((p) => p.id === productId)
      const finalInputs =
        product && selected.kind !== 'text'
          ? { ...inputs, image: product.image_url || '', product: product.name }
          : inputs
      const gen = await api.generate(selected.id, finalInputs)
      if (gen.status === 'error') setRunError(gen._error || gen.error || 'üretim hatası')
      setResult(gen)
      await refresh()
    } catch (e) {
      const err = e as Error & { balance?: number }
      setRunError(err.message === 'insufficient_credits' ? `Yetersiz kredi (bakiye: ${err.balance})` : err.message)
    } finally {
      setRunning(false)
    }
  }

  if (backendError) return <BackendDown onRetry={() => window.location.reload()} />

  return (
    <section id="studio" className="container-x scroll-mt-24 py-12">
      {/* top bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">AI Stüdyo</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">Çalışma alanı</h1>
        </div>
        <div className="flex items-center gap-3">
          {health && (
            <span className="flex items-center gap-2 rounded-full border border-line bg-ink-700/60 px-3 py-1.5 text-xs text-ash">
              <Dot live={health.providers.fal === 'live'} /> görsel: {health.providers.fal}
              <Dot live={health.providers.anthropic === 'live'} /> metin: {health.providers.anthropic}
            </span>
          )}
          <span className="rounded-full border border-cobalt-400/40 bg-cobalt-500/10 px-4 py-1.5 text-sm font-semibold text-cobalt-200">
            {credits ?? '—'} kredi
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* agent picker */}
        <aside className="rounded-3xl border border-line bg-ink-800/50 p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ajan ara…"
            className="mb-3 w-full rounded-full border border-line bg-ink-700/60 px-4 py-2 text-sm text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none"
          />
          <div className="max-h-[58vh] space-y-1 overflow-y-auto pr-1">
            {filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  a.id === selectedId ? 'bg-cobalt-500/15 text-bone ring-1 ring-cobalt-400/40' : 'text-ash hover:bg-white/5 hover:text-bone'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{a.name}</span>
                  <span className="text-2xs text-ash-dim">{KIND_LABEL[a.kind]} · {a.category}</span>
                </span>
                <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-2xs text-cobalt-200">{a.credit_cost}kr</span>
              </button>
            ))}
          </div>
        </aside>

        {/* workspace */}
        <div className="space-y-6">
          {selected && (
            <div className="rounded-3xl border border-line bg-ink-800/50 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-xl font-semibold text-bone">{selected.name}</h2>
                <span className="rounded-full bg-cobalt-500/15 px-2 py-0.5 text-2xs font-semibold text-cobalt-200">{KIND_LABEL[selected.kind]}</span>
                <span className="text-2xs text-ash-dim">{selected.model}</span>
              </div>

              {/* dynamic inputs */}
              <div className="mt-5 space-y-3">
                {'prompt' in inputs && (
                  <Field label="Komut / açıklama">
                    <textarea
                      rows={3}
                      value={inputs.prompt}
                      onChange={(e) => setInputs({ ...inputs, prompt: e.target.value })}
                      placeholder={selected.kind === 'video' ? 'örn. dönen ahşap sandalye, stüdyo' : 'örn. kadife yeşil 3 kişilik koltuk, doğal ışık'}
                      className="input"
                    />
                  </Field>
                )}
                {'product' in inputs && (
                  <Field label="Ürün">
                    <input value={inputs.product} onChange={(e) => setInputs({ ...inputs, product: e.target.value })} placeholder="örn. el dokuma yün halı" className="input" />
                  </Field>
                )}
                {'lang' in inputs && (
                  <Field label="Dil">
                    <input value={inputs.lang} onChange={(e) => setInputs({ ...inputs, lang: e.target.value })} className="input" />
                  </Field>
                )}
                {'langs' in inputs && (
                  <Field label="Diller">
                    <input value={inputs.langs} onChange={(e) => setInputs({ ...inputs, langs: e.target.value })} className="input" />
                  </Field>
                )}
              </div>

              {/* source product picker (image/video agents) */}
              {selected.kind !== 'text' && (
                <div className="mt-4">
                  <span className="mb-1.5 block text-xs font-medium text-ash">Kaynak ürün (opsiyonel)</span>
                  {products.length === 0 ? (
                    <p className="text-xs text-ash-dim">
                      Ürün yok — <a href="#products" className="text-cobalt-300">Ürünler</a>'den ekle.
                    </p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      <button
                        onClick={() => setProductId('')}
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-2xs ${
                          !productId ? 'border-cobalt-400 bg-cobalt-500/10 text-cobalt-200' : 'border-line text-ash-dim'
                        }`}
                      >
                        Yok
                      </button>
                      {products.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setProductId(p.id)}
                          title={p.name}
                          className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border ${
                            productId === p.id ? 'border-cobalt-400 ring-2 ring-cobalt-400/40' : 'border-line'
                          }`}
                        >
                          {p.image_url ? (
                            <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-ash-dim">◳</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 flex items-center gap-3">
                <button onClick={run} disabled={!canRun} className="btn-cobalt disabled:cursor-not-allowed disabled:opacity-40">
                  {running ? (
                    <span className="flex items-center gap-2"><Spinner /> Çalışıyor…</span>
                  ) : (
                    <span>AI Modelini Çalıştır · {selected.credit_cost} kr</span>
                  )}
                </button>
                {runError && <span className="text-sm text-red-400">{runError}</span>}
                {selected && credits != null && credits < selected.credit_cost && !runError && (
                  <span className="text-sm text-orange-400">Yetersiz kredi · {selected.credit_cost} gerekli</span>
                )}
              </div>
            </div>
          )}

          {/* result */}
          <AnimatePresence>
            {result && result.output && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-line bg-ink-800/50 p-6"
              >
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-bone">Sonuç</h3>
                  {result.output.mock && <span className="rounded-full bg-white/10 px-2 py-0.5 text-2xs text-ash">MOCK</span>}
                  <span className="ml-auto text-2xs text-ash-dim">-{result.credits} kredi</span>
                </div>
                <ResultView gen={result} />
                {result.output.note && <p className="mt-3 text-xs text-ash-dim">{result.output.note}</p>}
                {(result.output.url || result.output.poster) && result.status === 'done' && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button onClick={saveAsProduct} className="btn-ghost !py-2 !text-xs">＋ Ürün olarak kaydet</button>
                    <a href={result.output.url || result.output.poster} target="_blank" rel="noreferrer" className="btn-ghost !py-2 !text-xs">İndir ↗</a>
                    {savedAs && (
                      <span className="text-xs text-live-300">
                        ✓ “{savedAs}” <a href="#products" className="underline">Ürünler</a>'e eklendi
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* my works */}
          <div className="rounded-3xl border border-line bg-ink-800/50 p-6">
            <h3 className="mb-4 font-display text-lg font-semibold text-bone">Çalışmalarım <span className="text-sm font-normal text-ash-dim">({works.length})</span></h3>
            {works.length === 0 ? (
              <p className="text-sm text-ash-dim">Henüz üretim yok — bir ajan çalıştır.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {works.slice(0, 12).map((g) => (
                  <WorkCard key={g.id} gen={g} agents={agents} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .input{width:100%;border-radius:12px;border:1px solid var(--tw-border,rgba(255,255,255,.08));background:rgba(17,19,25,.6);
          padding:10px 14px;font-size:14px;color:#F2F4F8;outline:none}
        .input::placeholder{color:#6C7080}
        .input:focus{border-color:rgba(92,130,255,.6);box-shadow:0 0 0 2px rgba(45,91,255,.2)}
      `}</style>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ash">{label}</span>
      {children}
    </label>
  )
}

function ResultView({ gen }: { gen: Generation }) {
  const o = gen.output!
  if (gen.status === 'error') return <p className="text-sm text-red-400">Hata: {gen._error || gen.error}</p>
  if (o.type === 'image' && o.url) return <img src={o.url} alt="" className="w-full max-w-md rounded-2xl border border-line" />
  if (o.type === 'video') return <img src={o.poster || ''} alt="" className="w-full max-w-md rounded-2xl border border-line opacity-90" />
  if (o.type === 'text') return <pre className="whitespace-pre-wrap rounded-2xl border border-line bg-ink-900/60 p-4 text-sm leading-relaxed text-bone/90">{o.text}</pre>
  return null
}

function WorkCard({ gen, agents }: { gen: Generation; agents: ApiAgent[] }) {
  const name = agents.find((a) => a.id === gen.agent_id)?.name || gen.agent_id
  const o = gen.output
  const thumb = o?.type === 'image' ? o.url : o?.type === 'video' ? o.poster : null
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink-700/40">
      <div className="aspect-square bg-ink-900/60">
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-2xs text-ash">
            {o?.type === 'text' ? (o.text || '').slice(0, 60) + '…' : gen.status}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 px-2.5 py-2">
        <span className="truncate text-2xs text-ash">{name}</span>
        <span className="shrink-0 text-2xs text-ash-dim">-{gen.credits}</span>
      </div>
    </div>
  )
}

function Dot({ live }: { live: boolean }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${live ? 'bg-live-400' : 'bg-ash-dim'}`} />
}
function Spinner() {
  return (
    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
