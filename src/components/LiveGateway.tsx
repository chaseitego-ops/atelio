import Reveal from './Reveal'

const APPS = [
  { href: '#studio', icon: '✦', title: 'AI Stüdyo', desc: '77 ajan — yüklediğin üründen görsel, video ve metin üret.' },
  { href: '#catalogs', icon: '❖', title: 'Kataloglar + Analitik', desc: 'Paylaşılabilir vitrin aç, kimin neye baktığını gör.' },
  { href: '#crm', icon: '◈', title: 'Satış Hattı (CRM)', desc: 'Vitrinden gelen talepleri pipeline’da kapanışa taşı.' },
  { href: '#prices', icon: '₺', title: 'Fiyat Listeleri', desc: 'B2B fiyat listeleri oluştur, ürünlere bağla.' },
]

export default function LiveGateway() {
  return (
    <section className="scroll-mt-24 py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Canlı ürün</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
            Vitrin değil — <span className="text-gradient-cobalt">çalışan uygulama.</span>
          </h2>
          <p className="mt-5 text-lg text-ash">
            Aşağıdaki her şey gerçek ve şimdi çalışıyor. Bir karta tıkla, panele gir, dene.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {APPS.map((a, i) => (
            <Reveal key={a.href} delay={i * 0.06}>
              <a
                href={a.href}
                className="group flex h-full flex-col rounded-3xl border border-line bg-ink-800/50 p-6 transition-colors hover:border-cobalt-400/40 hover:bg-ink-700/60"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-ink-900 text-lg text-cobalt-300 transition-colors group-hover:border-cobalt-400/40">
                  {a.icon}
                </span>
                <h3 className="mt-4 text-lg font-medium text-bone">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ash">{a.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-300">
                  Aç <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
