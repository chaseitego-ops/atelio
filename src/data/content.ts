/** Atelio için pazarlama metni + yapılandırılmış içerik. Gerçekçi, ikna edici — placeholder yok. */

export interface Feature {
  id: string
  eyebrow: string
  title: string
  body: string
  bullets: string[]
  /** kıyaslanan üründe olmayan, Atelio'nun eklediği yetenekleri işaretler */
  isNew?: boolean
  /** canlı uygulamada bu özelliğin sayfası */
  href?: string
  /** henüz yol haritasında (canlı değil) */
  soon?: boolean
}

export const FEATURES: Feature[] = [
  {
    id: 'studio',
    eyebrow: 'AI Stüdyo',
    title: 'Hiç uyumayan bir stüdyo — 77 uzman ajan',
    body: 'Fotoğraf çekimini atlayın. Bir ürün seçin, bir ajan seçin; dakikalar içinde stüdyo kalitesinde fotoğraf, video ve metin alın. Her ajan, koltuk takımlarından tül perdelere gerçek bir üretici kategorisi için ayarlandı.',
    bullets: [
      'Tek çalışma alanı, kategoriye göre düzenli — sekme yığını yok',
      'Çalışma başına kredi maliyeti, onaylamadan önce görünür',
      'Çıktılar Çalışmalarım’a düşer; tek tıkla ürüne dönüşür',
    ],
    href: '#studio',
  },
  {
    id: 'catalog',
    eyebrow: 'Akıllı Kataloglar',
    title: 'Alıcının ne yaptığını size söyleyen paylaşılabilir kataloglar',
    body: 'Bir kataloğu kendi alan adınıza yayınlayın ve linki gönderin. Atelio size kimin açtığını, hangi ürünlerde durakladığını ve nereden çıktığını gösterir — yani takibiniz asla tahmin olmaz.',
    bullets: [
      'Link analitiği: katalog açılışı + ürün başına tıklama',
      'Vitrinden gelen "Teklif iste" doğrudan CRM’e düşer',
      'Fiyat listeleri ürünlere bağlanır',
    ],
    isNew: true,
    href: '#catalogs',
  },
  {
    id: 'crm',
    eyebrow: 'Satış Hattı',
    title: 'Sadece fiyat teklifi değil, gerçek bir B2B satış hattı',
    body: 'Her anlaşmayı ilk görüntülemeden imzalı siparişe taşıyın. Müşteri kartları, teklif durumu, otomatik hatırlatıcılar ve WhatsApp + e-posta takipleri tüm satış akışını Atelio içinde tutar.',
    bullets: [
      'Aşamalar: Görüldü · Teklif · Pazarlık · Kazanıldı · Kaybedildi',
      'Aşamaya göre hazır şablonla WhatsApp / e-posta takibi',
      'Düzenlenebilir tutar ve kazanılan değer takibi',
    ],
    isNew: true,
    href: '#crm',
  },
  {
    id: 'integrations',
    eyebrow: 'Entegrasyonlar & API',
    title: 'Zaten sattığınız yere gönderin',
    body: 'Bir kez üretin, her yere yayınlayın. Görselleri, metni ve fiyatları doğrudan Shopify, WooCommerce, Trendyol ve Amazon’a aktarın — ya da açık Atelio API’si üzerinde kendi akışınızı kurun.',
    bullets: [
      'Shopify, Woo, Trendyol ve Amazon’a tek tık aktarım',
      'Instagram, TikTok ve Pinterest’e zamanlanmış yayın',
      'PIM / ERP / CRM için açık REST API + webhook’lar',
    ],
    isNew: true,
    soon: true,
  },
]

export interface Step {
  n: string
  title: string
  body: string
}

export const STEPS: Step[] = [
  { n: '01', title: 'Ürün ekleyin', body: 'iOS ya da Android’de fotoğraf çekin veya masaüstünden yükleyin. Atelio ürünü okur ve stüdyoya hazırlar.' },
  { n: '02', title: 'Atelio önersin', body: 'Akıllı Akış ajanı, çalıştırılacak tam ajanları ve toplam kredi bütçesini önerir — tahmin yok.' },
  { n: '03', title: 'Üretin & inceltin', body: 'Dakikalar içinde fotoğraf, video, 360° dönüş ve çok dilli metin. Düz dille ince ayar yapın.' },
  { n: '04', title: 'Yayınlayın & satın', body: 'Mağazanıza ve sosyale gönderin, izlenebilir bir katalog paylaşın, ardından anlaşmayı dahili satış hattında kapatın.' },
]

export interface DiffPoint {
  title: string
  body: string
}

/** "Neden Atelio" — tipik AI-katalog aracına karşı jenerik çerçeveyle */
export const DIFFERENTIATORS: DiffPoint[] = [
  { title: 'Şeffaf krediler', body: 'Her ajan kredi maliyetini önceden gösterir ve kullanılmayan krediler bir ay devreder. Sessiz 2× ücret yok, israf yok.' },
  { title: 'Katalog zekâsı', body: 'Çoğu araç paylaşılabilir bir linkte durur. Atelio size kimin, neye, ne kadar baktığını söyler.' },
  { title: 'Gerçek bir satış hattı', body: 'Sadece “fiyat teklifi” değil — anlaşmayı ilk görüntülemeden ödenmiş faturaya taşıyan tam bir CRM.' },
  { title: 'Sattığınız yerde satar', body: 'Shopify, Woo, Trendyol ve Amazon’a yerel aktarım, zamanlanmış sosyal yayın ve açık API.' },
  { title: 'iOS + Android', body: 'Ürünleri herhangi bir telefondan yakalayın ve listeleyin — yalnızca iOS değil. Türkiye, MENA ve ötesi için.' },
  { title: 'Tek ve dürüst kaynak', body: 'Plan adları ve kredi sayıları her yerde aynı — site, panel ve fatura. Aldığınız, gördüğünüzdür.' },
]

export interface Plan {
  name: string
  price: string
  yearly: string
  blurb: string
  features: string[]
  popular?: boolean
  isNew?: boolean
  cta: string
}

export const PLANS: Plan[] = [
  {
    name: 'Ücretsiz',
    price: '$0',
    yearly: 'Sonsuza dek ücretsiz',
    blurb: 'Tüm döngüyü gerçekten deneyin.',
    cta: 'Ücretsiz başla',
    features: ['1 kullanıcı', '15 ürün', '1 canlı mağaza', '300 kredi — tek seferlik', 'Temel ajanlar + analitik önizleme'],
  },
  {
    name: 'Solo',
    price: '$24',
    yearly: '$19/ay',
    blurb: 'Profesyonelleşen solo üreticiler için.',
    cta: 'Solo’yu seç',
    features: ['1 kullanıcı', '3 online mağaza', 'Aylık 1.000 kredi', 'Tüm görsel + video ajanları', 'Katalog link analitiği'],
  },
  {
    name: 'Growth',
    price: '$49',
    yearly: '$39/ay',
    blurb: 'Eksik olan orta segment.',
    cta: 'Growth’u seç',
    popular: true,
    isNew: true,
    features: ['2 kullanıcı', '10 online mağaza', 'Aylık 2.500 kredi', 'Tam satış hattı + hatırlatıcılar', 'Mağaza & sosyal entegrasyonları'],
  },
  {
    name: 'Studio',
    price: '$129',
    yearly: '$99/ay',
    blurb: 'Büyüyen markalar ve ekipler için.',
    cta: 'Studio’yu seç',
    features: ['5 kullanıcıya kadar', 'Sınırsız mağaza', 'Aylık 5.000 kredi', 'Açık API + webhook’lar', 'Kendi alan adı + öncelikli destek'],
  },
]

export interface Faq {
  q: string
  a: string
}

export const FAQS: Faq[] = [
  { q: 'Krediler nasıl çalışır — ve süresi doluyor mu?', a: 'Her ajan çalışması, onaylamadan önce tam kredi maliyetini gösterir; yani asla sessiz ücret olmaz. Aylık krediler her dönem yenilenir ve kullanılmayan krediler bir ay daha devreder — sakin bir hafta asla boşa gitmez.' },
  { q: 'AI görseller gerçekten ürünlerime benzeyecek mi?', a: 'Evet. Kendi gerçek ürün fotoğraflarınızı yüklersiniz ve Atelio bunlardan çalışır — kumaşı, kaplamayı, oranları ve rengi koruyarak. Ajanlar yeniden stiller, ışıklandırır ve sahneler; farklı bir ürün uydurmaz.' },
  { q: 'Shopify, Trendyol veya Amazon’da satabilir miyim?', a: 'Atelio görselleri, metni ve fiyatları tek tıkla doğrudan Shopify, WooCommerce, Trendyol ve Amazon’a aktarır. Özel bir akış için açık REST API ve webhook’lar Atelio’yu PIM, ERP veya CRM’inize bağlamanıza imkân verir.' },
  { q: 'Mobil uygulama var mı?', a: 'Hem iOS hem Android. Telefonunuzla bir ürün çekin, listeleyin ve ajanları hareket halindeyken çalıştırın. Her şey web stüdyosuyla gerçek zamanlı senkronize olur.' },
  { q: 'Kendi alan adımı kullanabilir miyim?', a: 'Growth ve üzerinde kataloglar ve mağazalar için kendi alan adınızı (markaniz.com) bağlayabilirsiniz. Her plan ayrıca kutudan çıkan ücretsiz bir Atelio alt alan adı alır.' },
  { q: 'Atelio hangi dilleri konuşur?', a: 'Arayüz 8 dilde sunulur ve Çok Dilli Katalog Yazarı, SEO’ya hazır ürün metni ile meta etiketlerini 12 dilde üretir — yani tek yükleme küresel bir listelemeye dönüşür.' },
  { q: 'Gerçek destek sunuyor musunuz?', a: 'Personelli bir yardım merkezi, aranabilir dokümanlar ve canlı sohbet her planda mevcuttur; Studio’da öncelikli yanıtla. Ölü link yok, 404 yok.' },
]

export const STATS = [
  { value: 77, suffix: '', label: 'AI ajanı' },
  { value: 12, suffix: '', label: 'Ürün kategorisi' },
  { value: 12, suffix: '', label: 'Metin dili' },
  { value: 8, suffix: 'dk', label: 'Ort. yayına geçiş süresi' },
]

export const TRUST_SECTORS = [
  'Mobilya Üreticileri',
  'Ev Tekstili',
  'Moda & Giyim',
  'Halı Dokumacıları',
  'Takı Atölyeleri',
  'Döşeme Stüdyoları',
  'Aydınlatma Markaları',
  'Seramik',
]
