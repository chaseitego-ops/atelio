import Reveal from './Reveal'

export default function CTA() {
  return (
    <section className="py-24">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl border border-cobalt-400/30 bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 px-7 py-16 text-center sm:px-14">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-radial-fade blur-2xl" />
            <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-bone sm:text-5xl">
                Yeni koleksiyonunuz bir <span className="text-gradient-cobalt">stüdyo</span> hak ediyor.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-ash">
                300 krediyle ücretsiz başlayın. Kart yok, yeniden çekim yok, ajans faturası yok — sadece
                ürünleriniz, en iyi hâlleriyle, satışa hazır.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#" className="btn-cobalt w-full sm:w-auto">Ücretsiz başla</a>
                <a href="#" className="btn-ghost w-full sm:w-auto">Demo planla</a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
