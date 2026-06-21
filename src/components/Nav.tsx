import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './Logo'

const LINKS = [
  { href: '#models', label: 'Modeller' },
  { href: '#studio', label: 'Stüdyo' },
  { href: '#features', label: 'Platform' },
  { href: '#how', label: 'Nasıl çalışır' },
  { href: '#pricing', label: 'Fiyatlandırma' },
  { href: '#faq', label: 'SSS' },
]

export default function Nav({ route = 'home' }: { route?: 'home' | 'models' | 'studio' }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`transition-all duration-500 ${
          scrolled ? 'border-b border-line bg-ink-900/80 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <nav className="container-x flex h-16 items-center justify-between md:h-[72px]">
          <a href="#top" className="transition-opacity hover:opacity-80">
            <Logo />
          </a>

          <div className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const active = l.href === `#${route}`
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-4 py-2 text-sm transition-colors hover:text-bone ${
                    active ? 'text-bone' : 'text-ash'
                  }`}
                >
                  {l.label}
                </a>
              )
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a href="#" className="text-sm font-medium text-ash transition-colors hover:text-bone">
              Giriş yap
            </a>
            <a href="#studio" className="btn-cobalt !px-5 !py-2.5">
              Uygulamayı aç
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-bone md:hidden"
            aria-label="Menüyü aç/kapat"
            aria-expanded={open}
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-current transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-current transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
            </div>
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-b border-line bg-ink-800/95 backdrop-blur-xl md:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base text-ash transition-colors hover:bg-white/5 hover:text-bone"
                >
                  {l.label}
                </a>
              ))}
              <a href="#studio" onClick={() => setOpen(false)} className="btn-cobalt mt-2 w-full">
                Uygulamayı aç
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
