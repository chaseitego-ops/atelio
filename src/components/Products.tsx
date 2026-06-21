import { useEffect, useRef, useState } from 'react'
import { api, type Product } from '../lib/api'
import { Loading, BackendDown } from './States'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [dataUrl, setDataUrl] = useState<string>('')
  const [preview, setPreview] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [down, setDown] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    try {
      setProducts(await api.products())
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

  function pickFile(f: File | undefined) {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setDataUrl(String(reader.result))
      setPreview(String(reader.result))
    }
    reader.readAsDataURL(f)
  }

  async function add() {
    if (!name.trim()) return
    setBusy(true)
    setErr(null)
    try {
      await api.createProduct(name.trim(), dataUrl || undefined)
      setName('')
      setDataUrl('')
      setPreview('')
      if (fileRef.current) fileRef.current.value = ''
      await load()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    await api.deleteProduct(id)
    await load()
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-12">
      <header className="mb-8">
        <p className="eyebrow">My Folio</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">Ürünler</h1>
        <p className="mt-2 text-ash">Ürünlerini ekle — AI ajanları ve kataloglar bunları kullanır.</p>
      </header>

      {/* add form */}
      <div className="mb-8 rounded-3xl border border-line bg-ink-800/50 p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ash">Ürün adı</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="örn. Kadife 3’lü Koltuk"
                className="w-full rounded-xl border border-line bg-ink-700/60 px-4 py-2.5 text-sm text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ash">Görsel (opsiyonel)</span>
              <input ref={fileRef} type="file" accept="image/*" onChange={(e) => pickFile(e.target.files?.[0])}
                className="block w-full text-sm text-ash file:mr-3 file:rounded-lg file:border-0 file:bg-cobalt-500/20 file:px-3 file:py-2 file:text-sm file:font-medium file:text-cobalt-200 hover:file:bg-cobalt-500/30" />
            </label>
          </div>
          <button onClick={add} disabled={busy || !name.trim()} className="btn-cobalt h-[42px] disabled:opacity-40">
            {busy ? 'Ekleniyor…' : 'Ürün ekle'}
          </button>
        </div>
        {preview && <img src={preview} alt="" className="mt-4 h-24 w-24 rounded-xl border border-line object-cover" />}
        {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      </div>

      {/* grid */}
      {loading ? (
        <Loading />
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line py-16 text-center text-ash-dim">
          Henüz ürün yok. Yukarıdan ilk ürününü ekle.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded-2xl border border-line bg-ink-700/40">
              <div className="aspect-square bg-ink-900/60">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl text-ash-dim">◳</div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="truncate text-sm text-bone">{p.name}</span>
                <button onClick={() => remove(p.id)} className="shrink-0 text-ash-dim opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100" aria-label="Sil">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
