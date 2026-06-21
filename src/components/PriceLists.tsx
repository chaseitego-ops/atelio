import { useEffect, useState } from 'react'
import { api, type PriceList, type Product } from '../lib/api'
import { Loading, BackendDown } from './States'

export default function PriceLists() {
  const [lists, setLists] = useState<PriceList[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<PriceList | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [down, setDown] = useState(false)

  const [pid, setPid] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('adet')

  async function load() {
    try {
      const [l, p] = await Promise.all([api.priceLists(), api.products()])
      setLists(l)
      setProducts(p)
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

  async function createList() {
    if (!name.trim()) return
    const l = await api.createPriceList(name.trim())
    setName('')
    await load()
    setSelected(l)
  }
  async function open(id: string) {
    setSelected(await api.priceList(id))
  }
  async function addItem() {
    if (!selected || price === '') return
    const prod = products.find((p) => p.id === pid)
    const updated = await api.addPriceItem(selected.id, { productId: pid || undefined, label: prod?.name, price: Number(price), unit })
    setSelected(updated)
    setPrice('')
    await load()
  }
  async function removeItem(id: string) {
    const updated = await api.deletePriceItem(id)
    setSelected(updated)
    await load()
  }

  if (down) return <BackendDown onRetry={() => { setLoading(true); load() }} />

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-12">
      <header className="mb-8">
        <p className="eyebrow">My Folio</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">Fiyat Listeleri</h1>
        <p className="mt-2 text-ash">B2B fiyat listeleri oluştur — tekliflerde ve kataloglarda kullan.</p>
      </header>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* lists */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-ink-800/50 p-4">
              <div className="flex gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Liste adı (örn. 2026 Toptan)"
                  className="min-w-0 flex-1 rounded-xl border border-line bg-ink-700/60 px-3 py-2 text-sm text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none" />
                <button onClick={createList} disabled={!name.trim()} className="btn-cobalt !px-4 !py-2 !text-xs disabled:opacity-40">Ekle</button>
              </div>
            </div>
            {lists.length === 0 ? (
              <p className="px-1 text-sm text-ash-dim">Henüz liste yok.</p>
            ) : (
              <div className="space-y-2">
                {lists.map((l) => (
                  <button key={l.id} onClick={() => open(l.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                      selected?.id === l.id ? 'border-cobalt-400/50 bg-cobalt-500/10' : 'border-line hover:bg-white/5'
                    }`}>
                    <span className="text-sm font-medium text-bone">{l.name}</span>
                    <span className="text-2xs text-ash-dim">{l.count} kalem</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* selected list */}
          <div className="rounded-3xl border border-line bg-ink-800/50 p-6">
            {!selected ? (
              <p className="py-16 text-center text-ash-dim">Soldan bir liste seç ya da yeni oluştur.</p>
            ) : (
              <>
                <h2 className="font-display text-xl font-semibold text-bone">{selected.name}</h2>

                {/* add item */}
                <div className="mt-5 flex flex-wrap items-end gap-2">
                  <label className="block">
                    <span className="mb-1 block text-2xs text-ash">Ürün</span>
                    <select value={pid} onChange={(e) => setPid(e.target.value)}
                      className="rounded-xl border border-line bg-ink-700/60 px-3 py-2 text-sm text-bone focus:border-cobalt-400/60 focus:outline-none">
                      <option value="">— ürün seç —</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-2xs text-ash">Fiyat (₺)</span>
                    <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0"
                      className="w-28 rounded-xl border border-line bg-ink-700/60 px-3 py-2 text-sm text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-2xs text-ash">Birim</span>
                    <input value={unit} onChange={(e) => setUnit(e.target.value)}
                      className="w-24 rounded-xl border border-line bg-ink-700/60 px-3 py-2 text-sm text-bone focus:border-cobalt-400/60 focus:outline-none" />
                  </label>
                  <button onClick={addItem} disabled={price === ''} className="btn-cobalt !py-2 !text-xs disabled:opacity-40">Kalem ekle</button>
                </div>

                {/* items */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-line">
                  {!selected.items || selected.items.length === 0 ? (
                    <p className="py-10 text-center text-sm text-ash-dim">Bu listede henüz kalem yok.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-ink-700/40 text-2xs uppercase tracking-wider text-ash-dim">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-medium">Ürün</th>
                          <th className="px-4 py-2.5 text-right font-medium">Fiyat</th>
                          <th className="px-4 py-2.5 text-left font-medium">Birim</th>
                          <th className="px-4 py-2.5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.items.map((it) => (
                          <tr key={it.id} className="border-t border-line">
                            <td className="px-4 py-2.5 text-bone">{it.product_name || it.label || '—'}</td>
                            <td className="px-4 py-2.5 text-right text-cobalt-200">{it.price?.toLocaleString('tr')} ₺</td>
                            <td className="px-4 py-2.5 text-ash">{it.unit}</td>
                            <td className="px-4 py-2.5 text-right">
                              <button onClick={() => removeItem(it.id)} className="text-ash-dim hover:text-red-400" aria-label="Sil">✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
