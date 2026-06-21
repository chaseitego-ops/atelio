import { api } from '../lib/api'

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Loading({ label = 'Yükleniyor…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-ash-dim">
      <Spinner /> {label}
    </div>
  )
}

export function BackendDown({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-24 text-center">
      <div className="card max-w-lg p-8">
        <p className="text-3xl">🔌</p>
        <h2 className="mt-4 font-display text-2xl font-semibold text-bone">Backend çalışmıyor</h2>
        <p className="mt-3 text-ash">
          Yerel API'ye bağlanılamadı (<code className="text-cobalt-300">{api.base}</code>). Bir terminalde çalıştır:
        </p>
        <pre className="mt-4 rounded-xl border border-line bg-ink-900 p-4 text-left text-xs text-cobalt-300">cd server{'\n'}node --no-warnings index.mjs</pre>
        <button onClick={onRetry} className="btn-cobalt mt-5">Tekrar dene</button>
      </div>
    </div>
  )
}
