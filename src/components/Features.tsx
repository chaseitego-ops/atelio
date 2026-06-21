import { FEATURES } from '../data/content'
import Reveal from './Reveal'

export default function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Platform</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
            Sadece güzel görseller değil — <span className="text-gradient-cobalt">bir satış motoru.</span>
          </h2>
          <p className="mt-5 text-lg text-ash">
            Üretim sadece başlangıç. Atelio işi ta kapanan siparişe kadar taşır.
          </p>
        </Reveal>

        <div className="mt-16 flex flex-col gap-6">
          {FEATURES.map((f, i) => (
            <Reveal key={f.id} delay={i * 0.05}>
              <article
                className={`grid items-center gap-8 rounded-4xl border border-line bg-ink-800/60 p-7 sm:p-10 lg:grid-cols-2 ${
                  i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <p className="eyebrow">{f.eyebrow}</p>
                    {f.isNew && (
                      <span className="rounded-full bg-live-500/15 px-2 py-0.5 text-2xs font-semibold text-live-300 ring-1 ring-live-400/30">
                        Atelio bunu ekliyor
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-bone sm:text-[1.8rem]">
                    {f.title}
                  </h3>
                  <p className="mt-4 text-ash">{f.body}</p>
                  <ul className="mt-6 space-y-3">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm text-bone/90">
                        <svg className="mt-0.5 shrink-0 text-cobalt-300" width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <circle cx="9" cy="9" r="8.2" stroke="currentColor" strokeOpacity="0.4" />
                          <path d="M5.5 9.2l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  {f.href && (
                    <a href={f.href} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-300 transition-colors hover:text-cobalt-200">
                      Canlı dene <span aria-hidden>→</span>
                    </a>
                  )}
                  {f.soon && (
                    <span className="mt-6 inline-block rounded-full border border-line px-3 py-1 text-xs text-ash-dim">Yol haritasında</span>
                  )}
                </div>

                <FeatureVisual id={f.id} />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Lightweight, distinct mock for each feature — no image assets. */
function FeatureVisual({ id }: { id: string }) {
  const shell = 'relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-ink-700 to-ink-900 p-5'

  if (id === 'catalog') {
    return (
      <div className={shell}>
        <p className="text-2xs uppercase tracking-wider text-ash-dim">Katalog · Bahar Koleksiyonu</p>
        <div className="mt-4 space-y-2.5">
          {[
            ['Kadife Koltuk · 3’lü', '142 görüntüleme', '78%'],
            ['Meşe Yemek Masası', '96 görüntüleme', '54%'],
            ['Yün Halı', '61 görüntüleme', '33%'],
          ].map(([name, views, pct]) => (
            <div key={name} className="rounded-xl border border-line bg-ink-700/60 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-bone">{name}</span>
                <span className="text-ash-dim">{views}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-600">
                <div className="h-full rounded-full bg-cobalt-grad" style={{ width: pct as string }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (id === 'crm') {
    const cols: [string, string, string][] = [
      ['Görüldü', 'Atlas Hotels', 'cobalt'],
      ['Teklif', 'Norka Living', 'cobalt'],
      ['Kazanıldı', 'Belle Maison', 'live'],
    ]
    return (
      <div className={shell}>
        <div className="grid h-full grid-cols-3 gap-2">
          {cols.map(([stage, deal, tone]) => (
            <div key={stage} className="flex flex-col rounded-xl border border-line bg-ink-700/50 p-2.5">
              <p className="text-2xs uppercase tracking-wide text-ash-dim">{stage}</p>
              <div className={`mt-2 rounded-lg border p-2 text-xs ${tone === 'live' ? 'border-live-400/40 bg-live-500/10 text-live-200' : 'border-line bg-ink-600 text-bone'}`}>
                {deal}
                <div className="mt-2 h-1 w-2/3 rounded-full bg-white/15" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (id === 'integrations') {
    const chips = ['Shopify', 'WooCommerce', 'Trendyol', 'Amazon', 'Instagram', 'TikTok', 'Pinterest', 'REST API']
    return (
      <div className={`${shell} flex items-center justify-center`}>
        <div className="flex flex-wrap justify-center gap-2.5">
          {chips.map((c) => (
            <span key={c} className="glass rounded-full px-3.5 py-2 text-sm text-bone">{c}</span>
          ))}
        </div>
      </div>
    )
  }

  // studio default
  return (
    <div className={`${shell} grid grid-cols-3 grid-rows-3 gap-2`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-line"
          style={{
            background:
              i % 4 === 0
                ? 'linear-gradient(135deg,#5C82FF,#1E3FB8)'
                : i % 3 === 0
                  ? 'linear-gradient(135deg,#4FB8FF,#1E9BE6)'
                  : 'linear-gradient(135deg,#23232f,#15151d)',
            opacity: i % 4 === 0 || i % 3 === 0 ? 0.9 : 1,
          }}
        />
      ))}
    </div>
  )
}
