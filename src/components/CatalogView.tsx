import { useEffect, useState } from 'react'
import { api, type Catalog, type Message } from '../lib/api'
import Logo from './Logo'

// Public storefront — what a customer sees when they open a shared catalog link.
export default function CatalogView({ slug }: { slug: string }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', contact: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [dealId, setDealId] = useState<string>('')
  const [msgs, setMsgs] = useState<Message[]>([])
  const [text, setText] = useState('')

  async function requestQuote() {
    if (!form.name.trim() || !form.contact.trim()) return
    setSending(true)
    try {
      const deal = await api.createDeal({ catalogSlug: slug, ...form })
      setDealId(deal.id)
      if (form.message.trim()) setMsgs(await api.sendMessage(deal.id, 'buyer', form.message.trim()))
      setSent(true)
    } finally {
      setSending(false)
    }
  }
  async function refreshMsgs() {
    if (dealId) setMsgs(await api.dealMessages(dealId))
  }
  async function sendBuyer() {
    if (!text.trim() || !dealId) return
    setMsgs(await api.sendMessage(dealId, 'buyer', text.trim()))
    setText('')
  }

  useEffect(() => {
    let alive = true
    api
      .catalog(slug)
      .then((c) => alive && setCatalog(c))
      .catch((e) => alive && setError((e as Error).message))
    return () => {
      alive = false
    }
  }, [slug])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900 px-6 text-center">
        <div>
          <p className="text-3xl">🔍</p>
          <p className="mt-3 text-ash">Katalog bulunamadı.</p>
          <a href="#top" className="mt-4 inline-block text-sm text-cobalt-300">Atelio'ya dön</a>
        </div>
      </div>
    )
  }
  if (!catalog) return <div className="min-h-screen bg-ink-900" />

  return (
    <div className="min-h-screen bg-ink-900">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-5">
          <Logo />
          <span className="text-xs text-ash-dim">Atelio ile hazırlandı</span>
        </div>
      </header>

      <div className="container-x py-12">
        <p className="eyebrow">Katalog</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-bone sm:text-5xl">{catalog.title}</h1>
        <p className="mt-3 text-ash">{catalog.products?.length ?? 0} ürün</p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {catalog.products?.map((p) => (
            <button
              key={p.id}
              onClick={() => api.recordProductView(slug, p.id).catch(() => {})}
              className="group overflow-hidden rounded-3xl border border-line bg-ink-800/50 text-left transition-colors hover:border-cobalt-400/40"
            >
              <div className="aspect-square bg-ink-700/40">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-ash-dim">◳</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-bone">{p.name}</h3>
                <p className="mt-1 text-sm text-cobalt-300">Fiyat için iletişime geç →</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-line bg-ink-800/50 p-8">
          {sent ? (
            <div className="mx-auto max-w-md">
              <div className="text-center">
                <p className="text-3xl">✓</p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-bone">Talebin alındı</h2>
                <p className="mt-2 text-ash">Satıcıyla buradan mesajlaşabilirsin.</p>
              </div>
              <div className="mt-6 rounded-2xl border border-line bg-ink-900/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xs font-medium text-ash">Sohbet</span>
                  <button onClick={refreshMsgs} className="text-2xs text-cobalt-300 hover:text-cobalt-200">Yenile ↻</button>
                </div>
                <div className="max-h-48 space-y-1.5 overflow-y-auto">
                  {msgs.length === 0 && <p className="text-2xs text-ash-dim">Henüz mesaj yok.</p>}
                  {msgs.map((m) => (
                    <div key={m.id} className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs ${m.sender === 'buyer' ? 'ml-auto bg-cobalt-500/20 text-bone' : 'bg-ink-700 text-ash'}`}>
                      {m.body}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendBuyer()} placeholder="Mesaj yaz…"
                    className="min-w-0 flex-1 rounded-lg border border-line bg-ink-700/60 px-3 py-1.5 text-xs text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none" />
                  <button onClick={sendBuyer} className="rounded-lg bg-cobalt-grad px-3 py-1.5 text-xs font-semibold text-white">Gönder</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-md">
              <h2 className="text-center font-display text-2xl font-semibold text-bone">Beğendin mi?</h2>
              <p className="mt-2 text-center text-ash">Bu ürünler için fiyat teklifi iste.</p>
              <div className="mt-6 space-y-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ad / Firma"
                  className="w-full rounded-xl border border-line bg-ink-700/60 px-4 py-2.5 text-sm text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none" />
                <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="E-posta veya telefon"
                  className="w-full rounded-xl border border-line bg-ink-700/60 px-4 py-2.5 text-sm text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none" />
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={2} placeholder="Mesajın (opsiyonel)"
                  className="w-full rounded-xl border border-line bg-ink-700/60 px-4 py-2.5 text-sm text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none" />
                <button onClick={requestQuote} disabled={sending || !form.name.trim() || !form.contact.trim()} className="btn-cobalt w-full disabled:opacity-40">
                  {sending ? 'Gönderiliyor…' : 'Teklif iste'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-line py-8 text-center text-xs text-ash-dim">
        © 2026 · Atelio ile oluşturuldu
      </footer>
    </div>
  )
}
