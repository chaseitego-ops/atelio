import { STEPS } from '../data/content'
import Reveal from './Reveal'

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Nasıl çalışır</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
            Fotoğraftan ödemeye <span className="text-gradient-cobalt">dört adım.</span>
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* connector line */}
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-cobalt-400/30 to-transparent lg:block" />
          <div className="grid gap-6 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="relative h-full rounded-3xl border border-line bg-ink-800/60 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cobalt-grad font-display text-lg font-semibold text-white">
                    {s.n}
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-bone">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ash">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
