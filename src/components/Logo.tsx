interface LogoProps {
  className?: string
  showWordmark?: boolean
}

/** Atelio mark — an aperture-blade 'A' that doubles as a folded catalog page. */
export default function Logo({ className = '', showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id="atelio-g" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9DB4FF" />
            <stop offset="0.5" stopColor="#2D5BFF" />
            <stop offset="1" stopColor="#1E3FB8" />
          </linearGradient>
        </defs>
        <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="8.4" stroke="url(#atelio-g)" strokeOpacity="0.45" strokeWidth="1.2" />
        <path d="M16 6.5l8.2 19.5h-4.1l-1.5-3.8h-5.2L11.9 26H7.8L16 6.5zm0 7.3l-1.75 4.5h3.5L16 13.8z" fill="url(#atelio-g)" />
        <circle cx="16" cy="16" r="2.1" fill="#08080B" stroke="url(#atelio-g)" strokeWidth="1" />
      </svg>
      {showWordmark && (
        <span className="font-display text-[1.3rem] font-semibold tracking-tight text-bone">
          Atelio
        </span>
      )}
    </span>
  )
}
