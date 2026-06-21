import { useEffect, useMemo, useState } from 'react'
import { api, type Generation, type ApiAgent } from '../lib/api'
import { Loading, BackendDown } from './States'

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'image', label: 'Görsel' },
  { id: 'text', label: 'Metin' },
  { id: 'video', label: 'Video' },
]

export default function MyWorks() {
  const [gens, setGens] = useState<Generation[]>([])
  const [agents, setAgents] = useState<ApiAgent[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [down, setDown] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  async function load() {
    try {
      const [g, a] = await Promise.all([api.generations(), api.agents()])
      setGens(g)
      setAgents(a)
      setDown(false)
    } catch {
      setDown(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const kindOf = (id: string) => agents.find((a) => a.id === id)?.kind || 'image'
  const nameOf = (id: string) => agents.find((a) => a.id === id)?.name || id

  const filtered = useMemo(
    () => (filter === 'all' ? gens : gens.filter((g) => kindOf(g.agent_id) === filter)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gens, agents, filter],
  )

  async function save(g: Generation) {
    const url = g.output?.url || g.output?.poster
    if (!url) return
    const p = await api.createProductFromUrl(nameOf(g.agent_id), url)
    setSaved(p.name)
    setTimeout(() => setSaved(null), 3000)
  }

  if (down) return <BackendDown onRetry={() => { setLoading(true); load() }} />

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Galeri</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">Çalışmalarım</h1>
          <p className="mt-2 text-ash">Stüdyo'da ürettiğin her şey burada toplanır.</p>
        </div>
        {saved && <span className="text-sm text-live-300">✓ “{saved}” Ürünler'e eklendi</span>}
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-cobalt-grad text-white' : 'text-ash hover:text-bone'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line py-16 text-center text-ash-dim">
          Henüz üretim yok. <a href="#studio" className="text-cobalt-300">AI Stüdyo</a>'da bir ajan çalıştır.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((g) => {
            const o = g.output
            const thumb = o?.type === 'image' ? o.url : o?.type === 'video' ? o.poster : null
            const canSave = !!(o?.url || o?.poster) && g.status === 'done'
            return (
              <div key={g.id} className="group overflow-hidden rounded-2xl border border-line bg-ink-700/40">
                <div className="relative aspect-square bg-ink-900/60">
                  {thumb ? (
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-3 text-center text-2xs text-ash">
                      {o?.type === 'text' ? (o.text || '').slice(0, 90) + '…' : g.status === 'error' ? 'hata' : g.status}
                    </div>
                  )}
                  {o?.mock && <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-2xs text-ash">MOCK</span>}
                  {canSave && (
                    <button
                      onClick={() => save(g)}
                      className="absolute inset-x-2 bottom-2 rounded-lg bg-cobalt-grad py-1.5 text-2xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      ＋ Ürün yap
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 px-2.5 py-2">
                  <span className="truncate text-2xs text-ash">{nameOf(g.agent_id)}</span>
                  <span className="shrink-0 text-2xs text-ash-dim">-{g.credits}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
