import { TRUST_SECTORS } from '../data/content'

export default function TrustStrip() {
  const row = [...TRUST_SECTORS, ...TRUST_SECTORS]
  return (
    <section aria-label="Hizmet verdiğimiz sektörler" className="border-y border-line py-7">
      <p className="container-x mb-5 text-center text-xs uppercase tracking-[0.2em] text-ash-dim">
        Her kategoriden üreticinin güvendiği platform
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-3 pr-3">
          {row.map((sector, i) => (
            <span
              key={i}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-ink-700/50 px-5 py-2 text-sm text-ash"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cobalt-400/70" />
              {sector}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
