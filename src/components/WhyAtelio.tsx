import { DIFFERENTIATORS } from '../data/content'
import Reveal from './Reveal'

export default function WhyAtelio() {
  return (
    <section className="scroll-mt-24 py-24">
      <div className="container-x">
        <div className="overflow-hidden rounded-4xl border border-line bg-gradient-to-b from-ink-700/70 to-ink-900 p-8 sm:p-14">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center">Neden Atelio</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
              Diğer katalog araçlarının<br className="hidden sm:block" /> bıraktığı eksikleri kapatmak için.
            </h2>
            <p className="mt-5 text-lg text-ash">
              Kategoriyi yakından inceledik. Atelio bu boşlukları tasarımı gereği kapatır.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATORS.map((d, i) => (
              <Reveal key={d.title} delay={(i % 3) * 0.06} className="bg-ink-800">
                <div className="h-full p-7">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cobalt-400/30 text-cobalt-300">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5l3 3 7-7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-bone">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ash">{d.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
