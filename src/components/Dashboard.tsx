import type { ReactNode } from 'react'
import Logo from './Logo'

type AppPage = 'studio' | 'products' | 'catalogs' | 'crm' | 'works' | 'prices'

const LINKS: { id: AppPage; href: string; label: string; icon: string }[] = [
  { id: 'studio', href: '#studio', label: 'AI Stüdyo', icon: '✦' },
  { id: 'works', href: '#works', label: 'Çalışmalarım', icon: '▦' },
  { id: 'products', href: '#products', label: 'Ürünler', icon: '◳' },
  { id: 'catalogs', href: '#catalogs', label: 'Kataloglar', icon: '❖' },
  { id: 'prices', href: '#prices', label: 'Fiyatlar', icon: '₺' },
  { id: 'crm', href: '#crm', label: 'CRM', icon: '◈' },
]

export default function Dashboard({ active, children }: { active: AppPage; children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      {/* sidebar */}
      <aside className="sticky top-0 z-40 border-b border-line bg-ink-900/90 backdrop-blur-xl lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:flex-col lg:items-stretch lg:gap-0">
          <a href="#top" className="shrink-0 lg:mb-8 lg:mt-2"><Logo /></a>

          <nav className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible lg:px-0">
            {LINKS.map((l) => {
              const on = l.id === active
              return (
                <a
                  key={l.id}
                  href={l.href}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:gap-3 ${
                    on ? 'bg-cobalt-500/15 text-bone ring-1 ring-cobalt-400/30' : 'text-ash hover:bg-white/5 hover:text-bone'
                  }`}
                >
                  <span className={on ? 'text-cobalt-300' : 'text-ash-dim'}>{l.icon}</span>
                  <span className="whitespace-nowrap">{l.label}</span>
                </a>
              )
            })}
          </nav>

          <a href="#top" className="hidden text-xs text-ash-dim transition-colors hover:text-bone lg:mt-auto lg:block lg:py-3">
            ← Siteye dön
          </a>
        </div>
      </aside>

      {/* content */}
      <main className="min-w-0">{children}</main>
    </div>
  )
}
