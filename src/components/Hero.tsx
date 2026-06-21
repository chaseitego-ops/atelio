import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import heroDark from '../assets/hero-texture.jpg'
import heroLight from '../assets/hero-texture-light.jpg'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay: 0.1 + 0.14 * i, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const revealRef = useRef<HTMLImageElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  // Cursor reveal — ported verbatim from the original hero bundle.
  // A canvas paints a soft hole that masks the blue top layer, exposing the
  // white bag underneath; a screen-blend glow brightens the revealed product.
  useEffect(() => {
    const hero = heroRef.current
    const revealEl = revealRef.current
    const glowEl = glowRef.current
    if (!hero || !revealEl || !glowEl) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const noHover = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const radiusFor = () => Math.max(260, Math.min(340, window.innerWidth * 0.2))

    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    // Start closed (full blue). Reduced-motion keeps it closed → plain blue hero,
    // never a static white blob stuck at the centre.
    const target = { x: cx, y: cy, r: 0 }
    const cur = { x: cx, y: cy, r: 0 }
    let touching = false
    let raf = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Snap the reveal to the cursor on first contact so the hole opens AT the
    // pointer instead of popping at the screen centre (which covered the bag).
    let primed = false
    const prime = (px: number, py: number) => {
      if (!primed) {
        cur.x = px
        cur.y = py
        primed = true
      }
    }
    const onMove = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      target.r = radiusFor()
      prime(e.clientX, e.clientY)
    }
    const onEnter = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      target.r = radiusFor()
      prime(e.clientX, e.clientY)
    }
    const onLeave = () => {
      target.r = 0
      primed = false
    }
    const onTouch = (e: TouchEvent) => {
      const t = e.touches && e.touches[0]
      if (!t) return
      touching = true
      target.x = t.clientX
      target.y = t.clientY
      target.r = radiusFor()
      prime(t.clientX, t.clientY)
    }

    if (!reduced && !noHover) {
      window.addEventListener('mousemove', onMove)
      hero.addEventListener('mouseenter', onEnter)
      hero.addEventListener('mouseleave', onLeave)
    }
    if (noHover && !reduced) {
      hero.addEventListener('touchmove', onTouch, { passive: true })
      hero.addEventListener('touchstart', onTouch, { passive: true })
    }

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      const { x, y } = cur
      // Keep the blue top layer intact under the fixed nav: fade the reveal to
      // zero in the top strip so the blue bag always shows at the very top.
      const topFade = Math.max(0, Math.min(1, (y - 64) / 96))
      const r = cur.r * topFade
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(0,0,0,1)'
      ctx.fillRect(0, 0, w, h)
      if (r > 0.5) {
        ctx.globalCompositeOperation = 'destination-out'
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, 'rgba(0,0,0,1)')
        g.addColorStop(0.45, 'rgba(0,0,0,1)')
        g.addColorStop(0.62, 'rgba(0,0,0,0.82)')
        g.addColorStop(0.78, 'rgba(0,0,0,0.45)')
        g.addColorStop(0.9, 'rgba(0,0,0,0.15)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalCompositeOperation = 'source-over'
      }
      const url = canvas.toDataURL()
      revealEl.style.maskImage = 'url(' + url + ')'
      revealEl.style.webkitMaskImage = 'url(' + url + ')'
      revealEl.style.maskSize = '100% 100%'
      revealEl.style.webkitMaskSize = '100% 100%'
      revealEl.style.maskRepeat = 'no-repeat'
      revealEl.style.webkitMaskRepeat = 'no-repeat'
      glowEl.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + r / 300 + ')'
      glowEl.style.opacity = String(Math.min(1, r / 240) * 0.95)
    }

    if (!reduced) {
      const t0 = performance.now()
      const loop = (now: number) => {
        if (noHover && !touching) {
          const period = 8500
          const phase = ((now - t0) % period) / period
          const tri = phase < 0.5 ? phase * 2 : (1 - phase) * 2
          const eased = 0.5 - 0.5 * Math.cos(tri * Math.PI)
          target.x = window.innerWidth * (0.12 + eased * 0.76)
          target.y = window.innerHeight * 0.5
          target.r = radiusFor()
        }
        const s = 0.13
        cur.x += (target.x - cur.x) * s
        cur.y += (target.y - cur.y) * s
        cur.r += (target.r - cur.r) * s
        draw()
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    } else {
      draw()
    }

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseenter', onEnter)
      hero.removeEventListener('mouseleave', onLeave)
      hero.removeEventListener('touchmove', onTouch)
      hero.removeEventListener('touchstart', onTouch)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative flex h-[100dvh] min-h-[640px] w-full items-center justify-center overflow-hidden bg-ink-900"
    >
      {/* bottom layer — white bag (always present beneath) */}
      <img
        src={heroLight}
        alt=""
        loading="eager"
        decoding="async"
        aria-hidden="true"
        className="absolute inset-0 z-10 block h-full w-full object-cover"
      />
      {/* top layer — blue bag, masked away under the cursor */}
      <img
        ref={revealRef}
        src={heroDark}
        alt=""
        loading="eager"
        decoding="async"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 block h-full w-full object-cover"
      />
      {/* legibility overlay: vignette + top/bottom scrim */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            'radial-gradient(70% 54% at 50% 50%, rgba(5,7,13,0.5) 0%, rgba(5,7,13,0.24) 54%, rgba(5,7,13,0) 100%), linear-gradient(to bottom, rgba(5,7,13,0.68) 0%, rgba(5,7,13,0.24) 28%, rgba(5,7,13,0.28) 60%, rgba(5,7,13,0.8) 100%)',
        }}
      />
      {/* spotlight glow following the cursor (brightens the revealed product) */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-[35] h-[680px] w-[680px] rounded-full opacity-0 will-change-transform"
        style={{
          marginLeft: -340,
          marginTop: -340,
          background:
            'radial-gradient(circle, rgba(204,221,255,0.5) 0%, rgba(204,221,255,0.2) 42%, rgba(204,221,255,0) 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* content */}
      <div className="pointer-events-none container-x relative z-40 flex flex-col items-center py-24 text-center">
        <motion.span
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="eyebrow glass mb-6 rounded-full px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-live-400" />
          Üreticiler için AI Görsel-Ticaret Stüdyosu
        </motion.span>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="m-0 max-w-[18ch] text-balance font-sans font-semibold leading-[1.0] tracking-[-0.045em] text-white [text-shadow:0_2px_28px_rgba(5,7,13,0.85),0_1px_4px_rgba(5,7,13,0.6)]"
          style={{ fontSize: 'clamp(34px,5.6vw,72px)' }}
        >
          <span className="block">Ürününüzü dakikalar içinde</span>
          <span
            className="mt-1 block font-display font-medium italic tracking-[0.01em] text-[#cdd9ff] [text-shadow:0_2px_30px_rgba(5,7,13,0.92),0_0_22px_rgba(90,123,255,0.45)]"
            style={{ fontSize: 'clamp(38px,6.2vw,80px)' }}
          >
            STÜDYO KALİTESİNE
          </span>
          <span className="mt-1 block">çıkarın.</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-7 max-w-2xl text-pretty text-ash [text-shadow:0_1px_18px_rgba(5,7,13,0.7)]"
          style={{ fontSize: 'clamp(15px,1.4vw,18px)', lineHeight: 1.7 }}
        >
          Tek bir fotoğraf yükleyin — AI saniyeler içinde stüdyo görseli, video, 360° dönüş ve çok
          dilli metin üretsin. Çekim yok, beklemek yok.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="pointer-events-auto mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a href="#studio" className="btn-cobalt w-full sm:w-auto">
            Stüdyoyu dene — 300 kredi
          </a>
          <a href="#models" className="btn-ghost w-full bg-white/[0.06] backdrop-blur-sm sm:w-auto">
            77 modeli keşfet
          </a>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ash [text-shadow:0_1px_14px_rgba(5,7,13,0.8)]"
        >
          <span className="flex items-center gap-2"><Check /> Kredi kartı gerekmez</span>
          <span className="flex items-center gap-2"><Check /> iOS &amp; Android</span>
          <span className="flex items-center gap-2"><Check /> Krediler devreder</span>
        </motion.div>
      </div>

      {/* hover hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-40 -translate-x-1/2 text-2xs uppercase tracking-[0.2em] text-ash-dim"
      >
        İmleci gezdir · dokuyu canlı gör
      </motion.div>
    </section>
  )
}

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="text-live-400">
      <path d="M3 8.5l3 3 7-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
