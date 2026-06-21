import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import TrustStrip from './components/TrustStrip'
import Stats from './components/Stats'
import AgentShowcase from './components/AgentShowcase'
import Studio from './components/Studio'
import Products from './components/Products'
import Catalogs from './components/Catalogs'
import CRM from './components/CRM'
import MyWorks from './components/MyWorks'
import PriceLists from './components/PriceLists'
import CatalogView from './components/CatalogView'
import Dashboard from './components/Dashboard'
import Features from './components/Features'
import LiveGateway from './components/LiveGateway'
import HowItWorks from './components/HowItWorks'
import WhyAtelio from './components/WhyAtelio'
import Pricing from './components/Pricing'
import Faq from './components/Faq'
import CTA from './components/CTA'
import Footer from './components/Footer'

type RouteName = 'home' | 'models' | 'studio' | 'products' | 'catalogs' | 'crm' | 'works' | 'prices' | 'catalogView'
interface Route {
  name: RouteName
  agentId?: string
  slug?: string
}

function parseHash(): Route {
  const h = window.location.hash
  if (h.startsWith('#c/')) return { name: 'catalogView', slug: h.slice(3) }
  if (h.startsWith('#studio')) return { name: 'studio', agentId: h.split('/')[1] || undefined }
  if (h === '#products') return { name: 'products' }
  if (h === '#catalogs') return { name: 'catalogs' }
  if (h === '#crm') return { name: 'crm' }
  if (h === '#works') return { name: 'works' }
  if (h === '#prices') return { name: 'prices' }
  if (h === '#models') return { name: 'models' }
  return { name: 'home' }
}

const APP_PAGES: RouteName[] = ['studio', 'products', 'catalogs', 'crm', 'works', 'prices']

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash())

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (route.name !== 'home') {
      window.scrollTo(0, 0)
      return
    }
    const hash = window.location.hash
    if (hash && hash !== '#top' && hash !== '#models' && !hash.startsWith('#studio')) {
      requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView())
    } else {
      window.scrollTo(0, 0)
    }
  }, [route])

  // public storefront — standalone, no app/marketing chrome
  if (route.name === 'catalogView') return <CatalogView slug={route.slug || ''} />

  // app dashboard
  if (APP_PAGES.includes(route.name)) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-ink-900">
        <Dashboard active={route.name as 'studio' | 'products' | 'catalogs' | 'crm' | 'works' | 'prices'}>
          {route.name === 'studio' && <Studio initialAgentId={route.agentId} />}
          {route.name === 'products' && <Products />}
          {route.name === 'catalogs' && <Catalogs />}
          {route.name === 'crm' && <CRM />}
          {route.name === 'works' && <MyWorks />}
          {route.name === 'prices' && <PriceLists />}
        </Dashboard>
      </div>
    )
  }

  // marketing site
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-900">
      <Nav route={route.name === 'models' ? 'models' : 'home'} />
      {route.name === 'models' ? (
        <main className="pt-16 md:pt-[72px]">
          <AgentShowcase />
        </main>
      ) : (
        <main>
          <Hero />
          <TrustStrip />
          <Stats />
          <Features />
          <LiveGateway />
          <HowItWorks />
          <WhyAtelio />
          <Pricing />
          <Faq />
          <CTA />
        </main>
      )}
      <Footer />
    </div>
  )
}
