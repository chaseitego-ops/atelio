// Thin client for the Atelio backend (server/). Base URL configurable for deploy.
const BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8787'

export interface ApiAgent {
  id: string
  name: string
  category: string
  kind: 'image' | 'text' | 'video'
  provider: string
  model: string
  credit_cost: number
  is_new: number
}

export interface Generation {
  id: string
  agent_id: string
  status: 'queued' | 'processing' | 'done' | 'error'
  inputs: Record<string, unknown>
  output: { type: string; url?: string; text?: string; poster?: string; mock?: boolean; note?: string } | null
  credits: number
  error?: string
  created_at: string
  _error?: string
}

export interface Health {
  ok: boolean
  providers: { fal: 'live' | 'mock'; anthropic: 'live' | 'mock' }
}

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || `http_${res.status}`)
    Object.assign(err, data, { status: res.status })
    throw err
  }
  return data as T
}

export interface Product {
  id: string
  name: string
  image_url: string | null
  created_at: string
}
export interface Catalog {
  id: string
  title: string
  slug: string
  status: string
  count?: number
  views?: number
  products?: Product[]
  created_at?: string
}

export const api = {
  base: BASE,
  health: () => req<Health>('/health'),
  agents: () => req<ApiAgent[]>('/agents'),
  credits: (orgId = 'demo') => req<{ org: { credits: number; plan: string; name: string }; ledger: { delta: number; reason: string; created_at: string }[] }>(`/credits?orgId=${orgId}`),
  generations: (orgId = 'demo') => req<Generation[]>(`/generations?orgId=${orgId}`),
  generate: (agentId: string, inputs: Record<string, unknown>) =>
    req<Generation>('/generate', { method: 'POST', body: JSON.stringify({ agentId, inputs }) }),

  products: () => req<Product[]>('/products'),
  createProduct: (name: string, imageDataUrl?: string) =>
    req<Product>('/products', { method: 'POST', body: JSON.stringify({ name, imageDataUrl }) }),
  createProductFromUrl: (name: string, imageUrl: string) =>
    req<Product>('/products', { method: 'POST', body: JSON.stringify({ name, imageUrl }) }),
  deleteProduct: (id: string) => req<{ ok: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  catalogs: () => req<Catalog[]>('/catalogs'),
  createCatalog: (title: string, productIds: string[]) =>
    req<Catalog>('/catalogs', { method: 'POST', body: JSON.stringify({ title, productIds }) }),
  catalog: (slug: string) => req<Catalog>(`/catalog/${slug}`),
  catalogAnalytics: (id: string) =>
    req<{ total: number; opens: number; clicks: number; perProduct: { name: string; views: number }[] }>(`/catalogs/${id}/analytics`),
  recordProductView: (slug: string, productId: string) =>
    req<{ ok: boolean }>(`/catalog/${slug}/product-view`, { method: 'POST', body: JSON.stringify({ productId }) }),

  priceLists: () => req<PriceList[]>('/price-lists'),
  createPriceList: (name: string) => req<PriceList>('/price-lists', { method: 'POST', body: JSON.stringify({ name }) }),
  priceList: (id: string) => req<PriceList>(`/price-lists/${id}`),
  addPriceItem: (listId: string, item: { productId?: string; label?: string; price: number; unit?: string }) =>
    req<PriceList>(`/price-lists/${listId}/items`, { method: 'POST', body: JSON.stringify(item) }),
  deletePriceItem: (id: string) => req<PriceList>(`/price-items/${id}`, { method: 'DELETE' }),
  deletePriceList: (id: string) => req<{ ok: boolean }>(`/price-lists/${id}`, { method: 'DELETE' }),

  deals: () => req<Deal[]>('/deals'),
  createDeal: (data: { catalogSlug?: string; name: string; contact: string; message: string }) =>
    req<Deal>('/deals', { method: 'POST', body: JSON.stringify(data) }),
  updateDeal: (id: string, data: { stage?: string; amount?: number }) =>
    req<Deal>(`/deals/${id}`, { method: 'POST', body: JSON.stringify(data) }),
}

export interface PriceItem {
  id: string
  product_id: string | null
  product_name: string | null
  image_url: string | null
  label: string | null
  price: number | null
  unit: string | null
}
export interface PriceList {
  id: string
  name: string
  currency: string
  count?: number
  items?: PriceItem[]
  created_at?: string
}

export type DealStage = 'lead' | 'quoted' | 'negotiating' | 'won' | 'lost'
export interface Deal {
  id: string
  catalog_title: string | null
  customer_name: string
  contact: string
  message: string
  stage: DealStage
  amount: number | null
  created_at: string
  updated_at: string
}
