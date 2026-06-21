# Atelio — Ürünleştirme Yol Haritası & Backend Mimarisi

AI görsel-ticaret stüdyosu (77 ajan · katalog · CRM · entegrasyonlar) için uçtan uca teknik plan.

---

## 0) Üst Düzey Mimari

```
[Web (Next.js)]   [iOS/Android (Expo)]
        \               /
         \             /
        [API Gateway / BFF]  ── Auth (Clerk) ── Rate limit
              |
     ┌────────┼─────────────────────────────┐
     |        |              |               |
 [Postgres] [Redis]   [Object Storage+CDN]  [Job Queue / Workers]
  (veri)    (cache,    (R2/S3 — görsel/video)  (BullMQ/Inngest)
            kuyruk)                                |
                                          [AI Orchestration Layer]
                                          “Agent Registry” → model router
                                                   |
                        ┌──────────────┬───────────┼───────────────┐
                     [Claude]     [fal.ai]    [Replicate]   [Direct: Runway/Kling/Veo]
                     (metin)    (görsel/video)  (görsel)      (premium video/360°)
```

**Temel prensip:** Her ajan için ayrı bir entegrasyon yazma. Bunun yerine **2 aggregator (fal.ai + Replicate)** üzerinden onlarca görsel/video modeline tek API ile eriş; metin/orkestrasyon için **Claude**; sadece premium video için 1-2 direkt sağlayıcı. Bu, entegrasyon sayısını ~25'ten MVP'de ~6'ya indirir.

---

## 1) AI / Model API'leri (çekirdek)

| Yetenek | Önerilen sağlayıcı | Neden |
|---|---|---|
| **Metin / orkestrasyon** (Copy Writer, çok dilli SEO, akıllı akış önericisi, CRM asistanı, ajan router) | **Anthropic Claude** (Opus 4.8 + Sonnet 4.x) | En güçlü metin + araç kullanımı; ajanları yönlendiren "beyin" |
| **Görsel üretim/düzenleme** (Image Editor/Generator, ürün foto, stüdyo, varyant) | **fal.ai** (Flux/Nano-Banana/Imagen) + **Replicate** | Tek API'den çok model; düşük gecikme |
| **Arka plan temizleme** | fal.ai `birefnet` / remove.bg | Hızlı cutout |
| **Upscale 4K** | fal.ai `clarity`/Real-ESRGAN / Topaz | Katalog/billboard kalitesi |
| **Video (text→/image→/ürün→video)** | **Kling**, **Runway Gen-4**, **Google Veo 3** (fal üzerinden veya direkt) | Sektör lideri kalite |
| **360° / orbital** | Luma / özel diffusion pipeline (fal) | Tek görselden tur |
| **Sanal deneme / fashion model** | Replicate (IDM-VTON vb.) | Hazır VTON modelleri |
| **Floorplan → 3D / iç mekan** | Replicate / özel model | Niş ama güçlü hook |

**AI API sayısı:** MVP'de **3** (Claude + fal.ai + Replicate). Tam ürün: **+3-4 direkt** (Kling, Runway, Veo, remove.bg) → toplam **~6-7**.

> Not: "77 ajan" = 77 ayrı API değil. Her ajan, DB'deki **Agent Registry** tablosunda bir kayıt: `{model, prompt şablonu, girdi şeması, kredi maliyeti, plan kısıtı}`. Aynı 5-6 model, 77 farklı ayarlı "ajan"a hizmet eder.

---

## 2) Platform / Altyapı API'leri ve Servisler

| Alan | Önerilen | Notlar |
|---|---|---|
| **Auth & org/üyeler** | Clerk (veya Auth0 / Supabase Auth) | Google OAuth, çok kiracılı org, davet, rol |
| **Veritabanı** | Postgres (Neon / Supabase / RDS) | Ana veri; RLS ile kiracı izolasyonu |
| **Cache & kuyruk** | Redis (Upstash) | Oturum, rate limit, BullMQ |
| **Object storage + CDN** | Cloudflare R2 + Images (veya S3 + CloudFront) | Görsel/video çıktıları + thumbnail |
| **Async iş kuyruğu** | BullMQ veya **Inngest** | AI üretimleri uzun sürer → kuyruk şart |
| **Ödeme & krediler** | **Stripe** (Billing + metered usage) | Abonelik + kredi paketleri |
| **E-posta** | Resend / Postmark | İşlemsel + katalog bildirimleri |
| **WhatsApp** | Meta WhatsApp Business API (Twilio) | CRM takip/hatırlatma |
| **Analytics & ürün** | PostHog | Funnel, katalog link analitiği |
| **Hata/izleme** | Sentry + Grafana/Logflare | Üretim güvenilirliği |
| **İçerik moderasyonu** | Hive / AWS Rekognition / OpenAI moderation | Yüklenen+üretilen görsel NSFW filtresi |

**Platform API sayısı:** ~**8-9** (auth, db, redis, storage, kuyruk, stripe, e-posta, whatsapp, sentry/posthog).

---

## 3) Entegrasyon API'leri (farklılaşma)

| Entegrasyon | API |
|---|---|
| Shopify | Admin GraphQL API + OAuth app |
| WooCommerce | REST API (consumer key/secret) |
| Trendyol | Trendyol Marketplace API |
| Amazon | Selling Partner API (SP-API) |
| Instagram/Facebook yayını | Meta Graph API (Content Publishing) |
| TikTok | Content Posting API |
| Pinterest | Pinterest API |
| Kendi alan adı | Cloudflare for SaaS (custom hostnames + otomatik SSL) |

**Entegrasyon API sayısı:** ~**7-8** (kademeli açılır; MVP'de 0-1).

### 📊 Toplam API özeti
- **MVP'de gereken:** ~6 (Claude, fal.ai, Stripe, Clerk, R2, Postgres-as-service)
- **Tam ürün:** ~**22-25** dış API/servis (yukarıdaki 3 grup toplamı)

---

## 4) Bir Ajan Çalışmasının Uçtan Uca Akışı (kritik workflow)

```
1. Kullanıcı: ajan + ürün + parametre seçer (web/mobil)
2. API: doğrula → kredi maliyetini hesapla → bakiye yeter mi? → krediyi "rezerve" et
3. Job kuyruğa atılır (idempotency key ile) → kullanıcıya "işleniyor" (WebSocket)
4. Worker: Agent Registry'den config çek → prompt şablonu + ürün görselini hazırla
5. Model çağrısı: fal.ai/Replicate/Claude → (uzun video ise webhook/poll ile bekle)
6. Çıktı: indir → R2'ye yaz → thumbnail üret → "My Works"e kaydet
7. Krediyi "kesinleştir" (credit_ledger'a yaz) → kullanıcıya bitti bildirimi
8. Hata: retry (3x) → kalıcı hatada krediyi iade et → dead-letter + Sentry
```

**Tasarım kararları:**
- **Rezerve→kesinleştir/iade** deseni: başarısız üretimde kullanıcı kredi kaybetmez (referansın opak kredi sorununu çözer).
- **Idempotency:** aynı istek iki kez işlenmez.
- **WebSocket/SSE:** canlı ilerleme.
- **Agent Registry = DB tablosu:** yeni ajan eklemek = yeni satır, kod değişikliği yok.

---

## 5) Veri Modeli (ana tablolar)

`organizations`, `users`, `memberships`, `products`, `product_images`,
`agents` (registry: model/prompt/maliyet/plan), `generations` (job + durum + maliyet),
`assets` (R2 çıktıları), `catalogs`, `catalog_items`, `catalog_views` (analitik),
`price_lists`, `deals` (CRM pipeline: viewed→quoted→won), `subscriptions`,
`credit_ledger` (append-only, şeffaf), `integrations`, `social_posts`, `custom_domains`.

---

## 6) Kredi & Faturalandırma Mantığı

- **Stripe Billing:** 4 plan (Free/Solo/Growth/Studio) abonelik + tek seferlik kredi paketleri.
- **credit_ledger** (yalnızca-ekleme): her hareket izlenir → tam şeffaflık + "1 ay devir".
- **Ajan başına maliyet** registry'de; rezerve-on-enqueue, settle-on-success.
- Aylık yenileme + 1 ay devir; 4K = 2x gibi çarpanlar registry'de açık.

---

## 7) Güvenlik & Uyumluluk
- Çok kiracılı izolasyon (Postgres RLS), rate limiting, secrets yönetimi (Doppler/Vault).
- Yüklenen + üretilen görsellerde **içerik moderasyonu**.
- **KVKK/GDPR**: veri silme, sözleşmeler, AB/TR veri konumu.
- Telif: üretilen içeriklerin kullanım hakları net; opsiyonel watermark (free plan).

---

## 8) Faz Faz Yol Haritası

| Faz | Süre | Kapsam |
|---|---|---|
| **0 — Hazırlık** | 1-2 hafta | Mimari, hesaplar/anahtarlar, IaC (Terraform), CI/CD, monorepo |
| **1 — MVP** | 6-10 hafta | Auth+org, ürün kataloğu, **~10 çekirdek görsel ajanı** (fal.ai), Copy Writer (Claude), kredi+Stripe, web app, My Works |
| **2 — Katalog & CRM** | 4-6 hafta | Paylaşılabilir katalog + **link analitiği**, satış pipeline + hatırlatıcılar, storefront |
| **3 — Entegrasyonlar** | 4-6 hafta | Shopify/Woo/Trendyol export + **sosyal zamanlayıcı** (Meta/TikTok) |
| **4 — Video/3D + Mobil** | 6-8 hafta | Video ajanları (Kling/Runway), 360°, Floorplan→3D, iOS+Android (Expo) |
| **5 — Ölçek** | sürekli | Açık API + webhook ekosistemi, çok dilli SEO, kurumsal/özel ajanlar |

**MVP'ye kadar gerçekçi süre:** ~2.5-3 ay, çekirdek ekip ile.

---

## 9) Önerilen Teknoloji Yığını
- **Frontend:** Next.js (web) + Expo/React Native (mobil), Tailwind, Framer Motion.
- **Backend:** Node + NestJS (veya tRPC), TypeScript uçtan uca.
- **Orkestrasyon:** Inngest (durable functions — AI iş akışları için ideal).
- **AI:** Anthropic SDK (Claude) + fal.ai + Replicate SDK.
- **Altyapı:** Vercel (web) + Fly.io/Railway (workers) + Neon (PG) + Upstash (Redis) + Cloudflare R2.

---

## 10) Maliyet Notları (birim ekonomi)
- Görsel üretim ~$0.01-0.04/kare, video ~$0.05-0.50/klip → krediye **kâr marjıyla** map'le.
- Örn. 1 kredi ≈ $0.02 maliyet + marj; "Run AI Model" öncesi maliyet gösterilir.
- Sabit altyapı (MVP): ~$300-800/ay (PG+Redis+storage+monitoring).

---

## 11) Ekip
Backend (2) · Frontend (1) · Mobil (1) · AI/ML entegrasyon (1) · Tasarım (1) · PM/Ürün (1).
MVP için minimum: 1 full-stack + 1 AI entegrasyon + 1 tasarım ile de başlanabilir.

---

## Önce başlanacak 3 şey
1. **fal.ai + Anthropic** hesapları → 1 görsel ajanı + Copy Writer'ı uçtan uca çalıştır (PoC).
2. **Agent Registry + generations + credit_ledger** şemasını kur (omurga bu).
3. **Stripe** kredi/abonelik modelini kur — para akışı erken doğrulanmalı.
