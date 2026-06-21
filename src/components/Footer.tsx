import Logo from './Logo'

const COLUMNS: { title: string; links: string[] }[] = [
  { title: 'Ürün', links: ['AI Stüdyo', 'Akıllı Kataloglar', 'Satış Hattı', 'Entegrasyonlar', 'Mobil uygulamalar'] },
  { title: 'Çözümler', links: ['Mobilya', 'Ev Tekstili', 'Moda', 'Halı', 'Takı'] },
  { title: 'Kaynaklar', links: ['Yardım merkezi', 'API dokümanları', 'Fiyatlandırma', 'Sürüm notları', 'Durum'] },
  { title: 'Şirket', links: ['Hakkımızda', 'Kariyer', 'Gizlilik', 'Şartlar', 'İletişim'] },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink-900">
      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ash">
              Üreticiler ve imalatçılar için AI-doğumlu görsel ticaret stüdyosu. Atölyeden showroom’a,
              dakikalar içinde.
            </p>
            <div className="mt-6 flex gap-3">
              {['iOS', 'Android'].map((s) => (
                <span key={s} className="rounded-xl border border-line bg-ink-700/60 px-4 py-2 text-xs text-ash">
                  ↓ {s} uygulaması
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['EN', 'TR', 'DE', 'FR', 'ES', 'IT', 'AR', 'RU'].map((l) => (
                <span key={l} className="rounded-md border border-line px-2 py-1 text-2xs text-ash-dim">{l}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-2xs font-semibold uppercase tracking-wider text-ash-dim">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-ash transition-colors hover:text-bone">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-7 text-sm text-ash-dim sm:flex-row">
          <p>© 2026 Atelio Studio. Üreticiler için tasarlandı.</p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-live-400" />
            Tüm sistemler çalışıyor
          </div>
        </div>
      </div>
    </footer>
  )
}
