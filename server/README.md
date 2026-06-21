# Atelio Backend — Agent Pipeline (PoC)

Gerçek üretim mimarisinin çalışan çekirdeği: **Agent Registry → kredi rezerve → model çağrısı → asset depolama → kesinleştir/iade → My Works.**
Sıfır bağımlılık (Node built-in `http` + `sqlite` + `fetch`). API anahtarı olmadan **mock** çalışır; anahtar eklenince **gerçek AI**.

## Çalıştır
```bash
cd server
node --no-warnings index.mjs      # http://localhost:8787
# başka bir terminalde:
node --no-warnings demo.mjs        # uçtan uca test
```

## Gerçek AI'a geçiş (tek adım)
`.env.example`'ı `.env` olarak kopyala ve 2 anahtarı doldur:
- `ANTHROPIC_API_KEY` — metin ajanları (Claude). https://console.anthropic.com
- `FAL_KEY` — görsel ajanları. https://fal.ai/dashboard/keys

Sunucuyu yeniden başlat → `/health` artık `"live"` gösterir, aynı uç noktalar gerçek görsel/metin üretir.

## API
| Metot | Yol | Açıklama |
|---|---|---|
| GET | `/health` | Sağlık + sağlayıcı modu (mock/live) |
| GET | `/agents` | Agent Registry |
| POST | `/generate` | `{agentId, inputs, orgId?}` → ajanı çalıştır |
| GET | `/generations` | My Works |
| GET | `/generations/:id` | Tek üretim |
| GET | `/credits` | Bakiye + kredi defteri |
| GET | `/outputs/:file` | Üretilen asset |

Örnek:
```bash
curl -X POST localhost:8787/generate -H 'Content-Type: application/json' \
  -d '{"agentId":"copy-writer","inputs":{"product":"Meşe yemek masası","lang":"Türkçe"}}'
```

## Mimari notlar
- **Agent Registry** (`db.mjs`): 77 ajan = 77 satır. Yeni ajan = yeni kayıt, kod değişmez.
- **Kredi defteri** (`credits.mjs`): append-only; rezerve-on-enqueue, hata olursa **otomatik iade**.
- **Sağlayıcı router** (`providers.mjs`): fal.ai / Anthropic / mock — anahtar yoksa mock'a düşer.
- **Worker akışı** (`runner.mjs`): doğrula → rezerve → model → depola → kesinleştir/iade.

## Sonraki adımlar (üretime doğru)
1. SQLite → **Postgres** (Neon) + Prisma/Drizzle.
2. Senkron çağrı → **iş kuyruğu** (Inngest/BullMQ) — uzun video işleri için.
3. **Auth** (Clerk) + org/üyeler · **Stripe** kredi/abonelik.
4. Asset depolama → **Cloudflare R2** + CDN.
5. Backend'i **Fly.io/Railway**'e deploy, frontend'i bağla.
