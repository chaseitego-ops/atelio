# Atelio — AI Visual Commerce Studio for Makers

A premium, animated marketing/showcase site for **Atelio**, an original brand built as a
markedly stronger reimagining of a benchmarked multi-model AI catalog product. It covers every
capability of the reference (77 AI agents across 12 categories) and closes the gaps the reference
left open — transparent credits, catalog analytics, a real B2B pipeline, store/social
integrations, an open API, and more.

Visual direction: **Solid Cobalt Luxe** — obsidian surfaces, cool platin-white ink, a solid
cobalt-sapphire signature (blended with white on highlighted headings), and an ice-blue accent
reserved for "live / AI" states. Display serif (Fraunces) over a clean grotesque (Inter).

UI language: **Turkish** (tüm arayüz Türkçe).

## Tech stack

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS 3** (design tokens in `tailwind.config.ts`)
- **Framer Motion** for scroll reveals, micro-interactions, and the hero animation
- Zero image assets — all visuals are SVG/CSS, so the page is light and fast
- `prefers-reduced-motion` honored globally

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production build to /dist
npm run preview  # preview the production build
```

> Note: this folder contains an unrelated `lumi` symlink and a `.claude/launch.json`. An `atelio`
> launch configuration is included so the in-app preview targets this Vite project on port 5173.

## Project structure

```
src/
  data/
    agents.ts        # 77-agent inventory: category, per-run credit cost, New/Exclusive flags
    content.ts       # features, steps, differentiators, pricing, FAQ, stats (real copy)
  components/
    Nav.tsx          # sticky, animated nav + mobile drawer
    Hero.tsx         # headline + CTAs
    StudioCanvas.tsx # animated "AI Studio" showpiece (reveal sweep, scan line, run bar)
    TrustStrip.tsx   # marquee of maker sectors
    Stats.tsx        # count-up stat band
    AgentShowcase.tsx# searchable + filterable grid of all 77 agents
    Features.tsx     # platform feature sections with bespoke mock visuals
    HowItWorks.tsx   # 4-step workflow
    WhyAtelio.tsx    # differentiators ("why us", generic framing)
    Pricing.tsx      # 4 tiers + monthly/yearly toggle
    Faq.tsx          # accordion
    CTA.tsx          # closing call to action
    Footer.tsx       # sitemap, apps, languages
    Logo.tsx, Reveal.tsx
  App.tsx, main.tsx, index.css
```

## What this improves over the reference (highlights)

The reference's analysis flagged 15 weaknesses and 13 opportunities. Atelio addresses them by design:

| Reference gap | Atelio's answer |
| --- | --- |
| Plan names differ site vs. app; "50 vs 100" credit mismatch | One source of truth — names & credits match everywhere |
| Support/FAQ 404 | Real FAQ section + "help center" CTA on every plan |
| Opaque per-run / 4K credit cost | **Every agent shows its credit cost up front** |
| Credits don't carry over | **Credits roll over one month** |
| Tab pile-up in the studio | One organized, searchable/filterable studio — no tabs |
| CRM = price offers only | **Full pipeline:** Viewed · Quoted · Negotiating · Won · Lost |
| No catalog analytics | **Link intelligence:** opens, views, dwell time, exit points |
| No e-commerce integrations | One-click export to **Shopify, Woo, Trendyol, Amazon** |
| No social publishing | **Social Scheduler** agent → IG / TikTok / Pinterest |
| Single-language copy | **Multilingual Catalog Writer** — 12 languages + SEO meta |
| iOS only | **iOS + Android** |
| $20→$100 pricing cliff | New **Growth** tier ($39–49) fills the gap |
| Weak freemium (no store) | **Free = 1 store + 15 products + 300 credits** |
| No public API | **Open REST API + webhooks** |
| Floorplan→3D hidden | Surfaced as a featured, "New" agent |
| Subdomain only | **Custom domain** on Growth+ |

Plus Atelio-exclusive agents not in the reference: Background Remover, 4K Upscaler,
Multilingual Catalog Writer, Smart Listing Export, Social Scheduler, and a **Smart Workflow
Suggester** that recommends the right agents and total credit budget per product.
