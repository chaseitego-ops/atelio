import { useEffect, useState } from 'react'
import { api, type Catalog, type Product } from '../lib/api'
import { Loading, BackendDown } from './States'

export default function Catalogs() {
  const [products, setProducts] = useState<Product[]>([])
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [loading, setLoading] = useState(true)
  const [down, setDown] = useState(false)
  const [title, setTitle] = useState('')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [analyticsId, setAnalyticsId] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof api.catalogAnalytics>> | null>(null)

  async function toggleAnalytics(id: string) {
    if (analyticsId === id) {
      setAnalyticsId(null)
      setAnalytics(null)
      return
    }
    setAnalyticsId(id)
    setAnalytics(null)
    setAnalytics(await api.catalogAnalytics(id))
  }

  async function load() {
    try {
      const [p, c] = await Promise.all([api.products(), api.catalogs()])
      setProducts(p)
      setCatalogs(c)
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

  if (down) return <BackendDown onRetry={() => { setLoading(true); load() }} />

  function toggle(id: string) {
    setPicked((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  async function publish() {
    if (!title.trim() || picked.size === 0) return
    setBusy(true)
    try {
      await api.createCatalog(title.trim(), [...picked])
      setTitle('')
      setPicked(new Set())
      await load()
    } finally {
      setBusy(false)
    }
  }

  function shareUrl(slug: string) {
    return `${window.location.origin}${window.location.pathname}#c/${slug}`
  }
  async function copy(slug: string) {
    await navigator.clipboard.writeText(shareUrl(slug))
    setCopied(slug)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-12">
      <header className="mb-8">
        <p className="eyebrow">My Folio</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">Kataloglar</h1>
        <p className="mt-2 text-ash">Paylaşılabilir katalog oluştur — link aç, kimin neye baktığını gör.</p>
      </header>

      {/* create */}
      <div className="mb-8 rounded-3xl border border-line bg-ink-800/50 p-6">
        <label className="block max-w-md">
          <span className="mb-1.5 block text-xs font-medium text-ash">Katalog başlığı</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="örn. Bahar Koleksiyonu"
            className="w-full rounded-xl border border-line bg-ink-700/60 px-4 py-2.5 text-sm text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none" />
        </label>

        <p className="mb-2 mt-5 text-xs font-medium text-ash">Ürün seç ({picked.size})</p>
        {products.length === 0 ? (
          <p className="text-sm text-ash-dim">Önce <a href="#products" className="text-cobalt-300">Ürünler</a> sayfasından ürün ekle.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
            {products.map((p) => {
              const on = picked.has(p.id)
              return (
                <button key={p.id} onClick={() => toggle(p.id)}
                  className={`overflow-hidden rounded-xl border text-left transition-colors ${on ? 'border-cobalt-400 ring-2 ring-cobalt-400/40' : 'border-line hover:border-line-strong'}`}>
                  <div className="aspect-square bg-ink-900/60">
                    {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl text-ash-dim">◳</div>}
                  </div>
                  <div className="truncate px-2 py-1.5 text-2xs text-ash">{p.name}</div>
                </button>
              )
            })}
          </div>
        )}

        <button onClick={publish} disabled={busy || !title.trim() || picked.size === 0} className="btn-cobalt mt-5 disabled:opacity-40">
          {busy ? 'Yayınlanıyor…' : 'Kataloğu yayınla'}
        </button>
      </div>

      {/* list */}
      {loading ? (
        <Loading />
      ) : catalogs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line py-16 text-center text-ash-dim">Henüz katalog yok.</div>
      ) : (
        <div className="space-y-3">
          {catalogs.map((c) => (
            <div key={c.id} className="rounded-2xl border border-line bg-ink-800/50">
              <div className="flex flex-wrap items-center gap-3 p-5">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-bone">{c.title}</h3>
                  <p className="text-2xs text-ash-dim">{c.count} ürün · {c.views} görüntüleme</p>
                </div>
                <button onClick={() => toggleAnalytics(c.id)} className="btn-ghost !py-2 !text-xs">
                  {analyticsId === c.id ? 'Kapat' : '📊 Analitik'}
                </button>
                <a href={`#c/${c.slug}`} className="btn-ghost !py-2 !text-xs">Vitrini aç ↗</a>
                <button onClick={() => copy(c.slug)} className="btn-cobalt !py-2 !text-xs">
                  {copied === c.slug ? 'Kopyalandı ✓' : 'Linki kopyala'}
                </button>
              </div>
              {analyticsId === c.id && (
                <div className="border-t border-line p-5">
                  {!analytics ? <p className="text-sm text-ash-dim">Yükleniyor…</p> : <AnalyticsView a={analytics} />}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function AnalyticsView({ a }: { a: { total: number; opens: number; clicks: number; perProduct: { name: string; views: number }[] } }) {
  const max = Math.max(1, ...a.perProduct.map((p) => p.views))
  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="Toplam etkileşim" value={a.total} />
        <Stat label="Katalog açılışı" value={a.opens} />
        <Stat label="Ürün tıklaması" value={a.clicks} />
      </div>
      {a.perProduct.length === 0 ? (
        <p className="text-sm text-ash-dim">
          Henüz ürün tıklaması yok. Vitrinde bir ürüne tıklanınca burada hangi ürünün ne kadar ilgi gördüğünü görürsün.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-medium text-ash">En çok ilgi gören ürünler</p>
          {a.perProduct.map((p) => (
            <div key={p.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="truncate text-bone">{p.name}</span>
                <span className="shrink-0 text-ash-dim">{p.views} tıklama</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-600">
                <div className="h-full rounded-full bg-cobalt-grad transition-all" style={{ width: `${(p.views / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-ink-700/40 p-3 text-center">
      <div className="font-display text-2xl font-semibold text-cobalt-200">{value}</div>
      <div className="mt-0.5 text-2xs text-ash-dim">{label}</div>
    </div>
  )
}
