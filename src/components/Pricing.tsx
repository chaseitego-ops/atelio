import { useState } from 'react'
import { motion } from 'framer-motion'
import { PLANS } from '../data/content'
import Reveal from './Reveal'

export default function Pricing() {
  const [yearly, setYearly] = useState(true)

  return (
    <section id="pricing" className="scroll-mt-24 py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Fiyatlandırma</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
            Şeffaf planlar. <span className="text-gradient-cobalt">Devreden krediler.</span>
          </h2>
          <p className="mt-5 text-lg text-ash">
            Sitede, uygulamada ve faturanızda aynı isimler. Her ajan, çalıştırmadan önce kredi
            maliyetini gösterir.
          </p>
        </Reveal>

        {/* billing toggle */}
        <div className="mt-9 flex items-center justify-center gap-4">
          <span className={`text-sm ${!yearly ? 'text-bone' : 'text-ash-dim'}`}>Aylık</span>
          <button
            onClick={() => setYearly((v) => !v)}
            className="relative h-7 w-12 rounded-full border border-line bg-ink-700"
            role="switch"
            aria-checked={yearly}
            aria-label="Yıllık faturalandırmayı aç/kapat"
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-cobalt-grad ${yearly ? 'right-0.5' : 'left-0.5'}`}
            />
          </button>
          <span className={`text-sm ${yearly ? 'text-bone' : 'text-ash-dim'}`}>
            Yıllık <span className="text-live-300">· ~%20 tasarruf</span>
          </span>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06}>
              <div
                className={`relative flex h-full flex-col rounded-3xl border p-6 ${
                  p.popular
                    ? 'border-cobalt-400/50 bg-gradient-to-b from-cobalt-400/[0.07] to-transparent shadow-glow'
                    : 'border-line bg-ink-800/60'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cobalt-grad px-3 py-1 text-2xs font-bold uppercase tracking-wider text-white">
                    En popüler
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-ash">{p.name}</h3>
                  {p.isNew && (
                    <span className="rounded-full bg-live-500/15 px-2 py-0.5 text-2xs font-semibold text-live-300 ring-1 ring-live-400/30">
                      Yeni paket
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display text-4xl font-semibold text-bone">
                    {yearly && p.name !== 'Ücretsiz' ? p.yearly.split('/')[0] : p.price}
                  </span>
                  {p.name !== 'Ücretsiz' && <span className="mb-1 text-sm text-ash-dim">/ay</span>}
                </div>
                <p className="mt-1 h-5 text-xs text-ash-dim">
                  {p.name === 'Ücretsiz' ? p.yearly : yearly ? 'yıllık faturalanır' : 'aylık faturalanır'}
                </p>
                <p className="mt-3 text-sm text-ash">{p.blurb}</p>

                <a
                  href="#"
                  className={`mt-6 w-full text-center ${p.popular ? 'btn-cobalt' : 'btn-ghost'}`}
                >
                  {p.cta}
                </a>

                <ul className="mt-7 space-y-3 border-t border-line pt-6">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-bone/90">
                      <svg className="mt-0.5 shrink-0 text-cobalt-300" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8.5l3 3 7-7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ash-dim">
          Her değişimde orantılı faturalama · Kullanılmayan krediler bir ay devreder · İstediğiniz zaman iptal
        </p>
      </div>
    </section>
  )
}
