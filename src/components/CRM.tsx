import { useEffect, useState } from 'react'
import { api, type Deal, type DealStage, type Message } from '../lib/api'
import { Loading, BackendDown } from './States'

const COLS: { id: DealStage; label: string; accent: string }[] = [
  { id: 'lead', label: 'Görüldü', accent: 'text-ash' },
  { id: 'quoted', label: 'Teklif', accent: 'text-cobalt-200' },
  { id: 'negotiating', label: 'Pazarlık', accent: 'text-cobalt-200' },
  { id: 'won', label: 'Kazanıldı', accent: 'text-live-300' },
  { id: 'lost', label: 'Kaybedildi', accent: 'text-red-400' },
]
const MAIN: DealStage[] = ['lead', 'quoted', 'negotiating', 'won']

// Stage-aware follow-up message templates (Türkçe).
function buildMsg(d: Deal): string {
  const name = d.customer_name || 'Merhaba'
  const cat = d.catalog_title ? `“${d.catalog_title}” kataloğumuz` : 'kataloğumuz'
  const amt = d.amount ? `${d.amount.toLocaleString('tr')}₺` : '—'
  switch (d.stage) {
    case 'quoted':
      return `Merhaba ${name},\n\n${cat} için fiyat teklifimiz: ${amt}. Detayları konuşmak isterseniz buradayım. Sorularınızı yanıtlamaktan memnuniyet duyarım.\n\nAtelio`
    case 'negotiating':
      return `Merhaba ${name},\n\nTeklifimizle ilgili görüşmek istediğiniz bir nokta var mı? Adet, teslim süresi veya fiyatta size en uygun çözümü birlikte bulalım.\n\nAtelio`
    case 'won':
      return `Merhaba ${name},\n\nSiparişiniz için çok teşekkürler! 🎉 Süreçle ilgili sizi adım adım bilgilendireceğiz. İyi günler dileriz.\n\nAtelio`
    case 'lost':
      return `Merhaba ${name},\n\nİlginiz için teşekkür ederiz. İleride yardımcı olabileceğimiz bir konu olursa memnuniyetle iletişime geçebilirsiniz.\n\nAtelio`
    default:
      return `Merhaba ${name},\n\n${cat} gösterdiğiniz ilgi için teşekkürler. İhtiyacınızı netleştirip size özel bir fiyat teklifi hazırlayalım — hangi ürünler ve yaklaşık kaç adet ilginizi çekti?\n\nAtelio`
  }
}

export default function CRM() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [down, setDown] = useState(false)

  async function load() {
    try {
      setDeals(await api.deals())
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

  async function move(d: Deal, stage: DealStage) {
    await api.updateDeal(d.id, { stage })
    await load()
  }
  async function setAmount(d: Deal, amount: number) {
    await api.updateDeal(d.id, { amount })
    await load()
  }

  const wonValue = deals.filter((d) => d.stage === 'won').reduce((s, d) => s + (d.amount || 0), 0)

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">CRM</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">Satış Hattı</h1>
          <p className="mt-2 text-ash">Vitrinden gelen talepleri ilk görüşmeden kapanışa taşı.</p>
        </div>
        <div className="flex gap-3">
          <Kpi label="Açık fırsat" value={deals.filter((d) => !['won', 'lost'].includes(d.stage)).length} />
          <Kpi label="Kazanılan" value={deals.filter((d) => d.stage === 'won').length} />
          <Kpi label="Kazanılan değer" value={wonValue ? `${wonValue.toLocaleString('tr')}₺` : '—'} />
        </div>
      </header>

      {loading ? (
        <Loading />
      ) : deals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line py-16 text-center text-ash-dim">
          Henüz teklif talebi yok. Bir <a href="#catalogs" className="text-cobalt-300">katalog</a> paylaş; müşteri vitrinden "Teklif iste" deyince burada belirir.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLS.map((col) => {
            const items = deals.filter((d) => d.stage === col.id)
            return (
              <div key={col.id} className="w-[280px] shrink-0">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className={`text-sm font-semibold ${col.accent}`}>{col.label}</span>
                  <span className="text-2xs text-ash-dim">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map((d) => (
                    <DealCard key={d.id} d={d} onMove={move} onAmount={setAmount} />
                  ))}
                  {items.length === 0 && <div className="rounded-2xl border border-dashed border-line py-8 text-center text-2xs text-ash-dim">—</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function DealCard({ d, onMove, onAmount }: { d: Deal; onMove: (d: Deal, s: DealStage) => void; onAmount: (d: Deal, a: number) => void }) {
  const idx = MAIN.indexOf(d.stage)
  const [amt, setAmt] = useState(d.amount ?? '')
  const [follow, setFollow] = useState(false)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [chat, setChat] = useState(false)
  const [msgs, setMsgs] = useState<Message[]>([])
  const [text, setText] = useState('')

  function toggleFollow() {
    if (!follow) setMsg(buildMsg(d))
    setFollow((v) => !v)
  }
  async function toggleChat() {
    if (!chat) setMsgs(await api.dealMessages(d.id))
    setChat((v) => !v)
  }
  async function sendChat() {
    if (!text.trim()) return
    setMsgs(await api.sendMessage(d.id, 'seller', text.trim()))
    setText('')
  }
  const isEmail = (d.contact || '').includes('@')
  const phone = (d.contact || '').replace(/\D/g, '')
  const wa = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  const mail = `mailto:${d.contact}?subject=${encodeURIComponent('Atelio · ' + (d.catalog_title || 'Teklif'))}&body=${encodeURIComponent(msg)}`
  async function copy() {
    await navigator.clipboard.writeText(msg)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="rounded-2xl border border-line bg-ink-800/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate font-medium text-bone">{d.customer_name}</h4>
          {d.contact && <p className="truncate text-2xs text-ash-dim">{d.contact}</p>}
        </div>
      </div>
      {d.catalog_title && <p className="mt-2 text-2xs text-cobalt-300">❖ {d.catalog_title}</p>}
      {d.message && <p className="mt-2 line-clamp-2 text-xs text-ash">{d.message}</p>}

      <div className="mt-3 flex items-center gap-2">
        <input
          value={amt}
          onChange={(e) => setAmt(e.target.value.replace(/[^\d]/g, ''))}
          onBlur={() => amt !== '' && onAmount(d, Number(amt))}
          placeholder="Tutar ₺"
          className="w-24 rounded-lg border border-line bg-ink-700/60 px-2 py-1 text-xs text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {d.stage === 'lost' ? (
          <button onClick={() => onMove(d, 'lead')} className="rounded-lg border border-line px-2 py-1 text-2xs text-ash hover:text-bone">↩ Geri al</button>
        ) : (
          <>
            {idx > 0 && <button onClick={() => onMove(d, MAIN[idx - 1])} className="rounded-lg border border-line px-2 py-1 text-2xs text-ash hover:text-bone">←</button>}
            {idx < MAIN.length - 1 && (
              <button onClick={() => onMove(d, MAIN[idx + 1])} className="rounded-lg bg-cobalt-grad px-2.5 py-1 text-2xs font-semibold text-white">İlerlet →</button>
            )}
            {d.stage !== 'won' && (
              <button onClick={() => onMove(d, 'lost')} className="rounded-lg border border-line px-2 py-1 text-2xs text-ash-dim hover:text-red-400">Kaybet</button>
            )}
          </>
        )}
      </div>

      <div className="mt-2 flex gap-1.5">
        <button onClick={toggleChat} className="flex-1 rounded-lg border border-line py-1.5 text-2xs text-cobalt-200 transition-colors hover:bg-white/5">
          {chat ? 'Kapat' : '💬 Sohbet'}
        </button>
        {d.contact && (
          <button onClick={toggleFollow} className="flex-1 rounded-lg border border-line py-1.5 text-2xs text-cobalt-200 transition-colors hover:bg-white/5">
            {follow ? 'Kapat' : '✉ Yaz'}
          </button>
        )}
      </div>

      {chat && (
        <div className="mt-2 rounded-xl border border-line bg-ink-900/60 p-2.5">
          <div className="max-h-40 space-y-1.5 overflow-y-auto">
            {msgs.length === 0 && <p className="text-2xs text-ash-dim">Henüz mesaj yok. Müşteriyle sohbeti başlat.</p>}
            {msgs.map((m) => (
              <div key={m.id} className={`max-w-[85%] rounded-lg px-2 py-1 text-2xs ${m.sender === 'seller' ? 'ml-auto bg-cobalt-500/20 text-bone' : 'bg-ink-700 text-ash'}`}>
                {m.body}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()} placeholder="Mesaj yaz…"
              className="min-w-0 flex-1 rounded-lg border border-line bg-ink-700/60 px-2 py-1 text-2xs text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none" />
            <button onClick={sendChat} className="rounded-lg bg-cobalt-grad px-2.5 py-1 text-2xs font-semibold text-white">Gönder</button>
          </div>
        </div>
      )}
      {follow && (
        <div className="mt-2 rounded-xl border border-line bg-ink-900/60 p-2.5">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-line bg-ink-700/60 p-2 text-2xs leading-relaxed text-bone focus:border-cobalt-400/60 focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {phone && !isEmail && (
              <a href={wa} target="_blank" rel="noreferrer" className="rounded-lg bg-[#25D366] px-2.5 py-1 text-2xs font-semibold text-black">WhatsApp ↗</a>
            )}
            {isEmail && (
              <a href={mail} className="rounded-lg bg-cobalt-grad px-2.5 py-1 text-2xs font-semibold text-white">E-posta ↗</a>
            )}
            <button onClick={copy} className="rounded-lg border border-line px-2.5 py-1 text-2xs text-ash hover:text-bone">
              {copied ? 'Kopyalandı ✓' : 'Kopyala'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-ink-800/50 px-4 py-2 text-center">
      <div className="font-display text-xl font-semibold text-cobalt-200">{value}</div>
      <div className="text-2xs text-ash-dim">{label}</div>
    </div>
  )
}
