import type { Config } from 'tailwindcss'

/**
 * Atelio tasarım token'ları — "Solid Cobalt Luxe"
 * Obsidyen yüzeyler · platin-beyaz metin · solid kobalt safir imza · buz-mavisi "canlı" aksanı
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // yüzeyler (obsidyen)
        ink: {
          900: '#08090C', // sayfa zemini
          800: '#0C0D12',
          700: '#111319',
          600: '#161922',
          500: '#1C2030',
        },
        line: 'rgba(255,255,255,0.08)',
        'line-strong': 'rgba(255,255,255,0.14)',
        // metin — soğuk platin beyaz
        bone: '#F2F4F8',
        ash: '#A3A7B3',
        'ash-dim': '#6C7080',
        // solid kobalt safir imza
        cobalt: {
          100: '#DCE5FF',
          200: '#B6C8FF',
          300: '#8FA9FF',
          400: '#5C82FF',
          500: '#2D5BFF',
          600: '#1E3FB8',
        },
        // canlı / AI durumları için soğuk buz mavisi
        live: {
          300: '#9CE2FF',
          400: '#4FB8FF',
          500: '#1E9BE6',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.6875rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45,91,255,0.30), 0 20px 60px -20px rgba(45,91,255,0.45)',
        'glow-live': '0 0 0 1px rgba(79,184,255,0.25), 0 20px 60px -20px rgba(79,184,255,0.35)',
        lift: '0 30px 80px -40px rgba(0,0,0,0.85)',
      },
      backgroundImage: {
        'cobalt-grad': 'linear-gradient(135deg, #5C82FF 0%, #2D5BFF 52%, #1E3FB8 100%)',
        'cobalt-white': 'linear-gradient(120deg, #9DB4FF 0%, #FFFFFF 62%)',
        'radial-fade': 'radial-gradient(circle at 50% 0%, rgba(45,91,255,0.18) 0%, transparent 60%)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 22s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
