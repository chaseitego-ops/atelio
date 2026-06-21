import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AGENTS, CATEGORIES, type AgentCategory } from '../data/agents'
import { slug } from '../lib/slug'
import Reveal from './Reveal'

type Filter = 'Tümü' | 'Yeni & Özel' | AgentCategory

const FILTERS: Filter[] = ['Tümü', 'Yeni & Özel', ...CATEGORIES]

const GLYPH: Record<AgentCategory, string> = {
  Temel: '◍',
  'Ürün Fotoğrafı': '◎',
  'E-Ticaret': '⬡',
  Moda: '✦',
  'İç Mekan': '⌂',
  'Ev Tekstili': '❉',
  Mobilya: '▦',
  Halı: '▤',
  'Kişisel Marka': '☉',
  'Pazarlama & Sosyal': '➶',
  'Ürün Setleri': '❖',
  'Video & 360°': '⟳',
}

export default function AgentShowcase() {
  const [filter, setFilter] = useState<Filter>('Tümü')
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    return AGENTS.filter((a) => {
      const byFilter =
        filter === 'Tümü'
          ? true
          : filter === 'Yeni & Özel'
            ? a.isNew || a.exclusive
            : a.category === filter
      const byQuery =
        !q || a.name.toLocaleLowerCase('tr').includes(q) || a.blurb.toLocaleLowerCase('tr').includes(q)
      return byFilter && byQuery
    })
  }, [filter, query])

  return (
    <section id="agents" className="relative scroll-mt-24 py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Modeller · AI Stüdyo</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
            77 ajan. Tek stüdyo. <span className="text-gradient-cobalt">Sıfır yeniden çekim.</span>
          </h2>
          <p className="mt-5 text-lg text-ash">
            Her ajan gerçek bir üretici kategorisi için kuruldu — ve her çalışma kredi maliyetini
            önceden gösterir. Arayın, filtreleyin ve iş için doğru olanı bulun.
          </p>
        </Reveal>

        {/* kontroller */}
        <div className="mt-12 flex flex-col gap-5">
          <div className="relative mx-auto w-full max-w-md">
            <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash-dim" width="17" height="17" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ajan ara — “halı”, “video”, “metin”…"
              className="w-full rounded-full border border-line bg-ink-700/60 py-3 pl-11 pr-4 text-sm text-bone placeholder:text-ash-dim focus:border-cobalt-400/60 focus:outline-none focus:ring-2 focus:ring-cobalt-400/20"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {FILTERS.map((f) => {
              const active = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    active ? 'text-white' : 'text-ash hover:text-bone'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-full bg-cobalt-grad"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {f === 'Yeni & Özel' && <span className={active ? '' : 'text-live-300'}>✦</span>}
                    {f}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* sonuç sayısı */}
        <p className="mt-8 text-center text-sm text-ash-dim">
          <span className="text-bone">{list.length}</span> ajan gösteriliyor
        </p>

        {/* grid */}
        <motion.div layout className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((a) => (
              <motion.a
                key={a.name}
                href={`#studio/${slug(a.name)}`}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col gap-3 rounded-2xl border border-line bg-ink-700/50 p-5 transition-colors hover:border-cobalt-400/40 hover:bg-ink-600/60"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-ink-800 text-lg text-cobalt-300 transition-colors group-hover:border-cobalt-400/40">
                    {GLYPH[a.category]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {a.exclusive && <Tag tone="live">Atelio</Tag>}
                    {a.isNew && !a.exclusive && <Tag tone="cobalt">Yeni</Tag>}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-bone">{a.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ash">{a.blurb}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="text-2xs uppercase tracking-wider text-ash-dim">{a.category}</span>
                  <span className="rounded-full border border-line px-2 py-0.5 text-2xs font-semibold text-cobalt-200">
                    {a.credits === 0 ? 'Ücretsiz' : `${a.credits} kr`}
                  </span>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>

        {list.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-line py-16 text-center">
            <p className="text-3xl">🔍</p>
            <p className="mt-3 text-ash">“{query}” ile eşleşen ajan yok.</p>
            <button
              onClick={() => {
                setQuery('')
                setFilter('Tümü')
              }}
              className="mt-4 text-sm font-medium text-cobalt-300 hover:text-cobalt-200"
            >
              Aramayı temizle
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function Tag({ children, tone }: { children: string; tone: 'cobalt' | 'live' }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${
        tone === 'live'
          ? 'bg-live-500/15 text-live-300 ring-1 ring-live-400/30'
          : 'bg-cobalt-400/15 text-cobalt-200 ring-1 ring-cobalt-400/30'
      }`}
    >
      {children}
    </span>
  )
}
