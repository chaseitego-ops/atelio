/**
 * Atelio AI ajan envanteri.
 * Kıyaslanan üründeki her ajanı daha temiz bir taksonomiyle yansıtır; ayrıca
 * referansın açık bıraktığı boşlukları kapatan Atelio'ya özel ajanları içerir.
 */

export type AgentCategory =
  | 'Temel'
  | 'Ürün Fotoğrafı'
  | 'E-Ticaret'
  | 'Moda'
  | 'İç Mekan'
  | 'Ev Tekstili'
  | 'Mobilya'
  | 'Halı'
  | 'Kişisel Marka'
  | 'Pazarlama & Sosyal'
  | 'Ürün Setleri'
  | 'Video & 360°'

export interface Agent {
  name: string
  blurb: string
  category: AgentCategory
  /** çalışma başına kredi maliyeti — Atelio bunu her yerde gösterir (referans gizler) */
  credits: number
  isNew?: boolean
  /** referansın üstüne Atelio'nun eklediği yeni yetenek */
  exclusive?: boolean
}

export const CATEGORIES: AgentCategory[] = [
  'Temel',
  'Ürün Fotoğrafı',
  'E-Ticaret',
  'Moda',
  'İç Mekan',
  'Ev Tekstili',
  'Mobilya',
  'Halı',
  'Kişisel Marka',
  'Pazarlama & Sosyal',
  'Ürün Setleri',
  'Video & 360°',
]

export const AGENTS: Agent[] = [
  // ── Temel ────────────────────────────────────────────────────
  { name: 'Görsel Editörü', blurb: 'Herhangi bir kareyi düz metin komutlarıyla düzenleyin. 10 en-boy oranı, opsiyonel 4K.', category: 'Temel', credits: 2 },
  { name: 'Görsel Üretici', blurb: 'Metin komutunu bitmiş, markaya uygun bir ürün görseline dönüştürün.', category: 'Temel', credits: 2 },
  { name: 'Arka Plan Temizleyici', blurb: 'Tek tıkla temiz kenarlı kesim ve şeffaf PNG çıktısı.', category: 'Temel', credits: 1, exclusive: true },
  { name: '4K Yükseltici', blurb: 'Her render’ı katalog ve billboard için net 4K çözünürlüğe taşıyın.', category: 'Temel', credits: 2, exclusive: true },

  // ── Ürün Fotoğrafı ───────────────────────────────────────────
  { name: 'Yaşam Tarzı Görseli', blurb: 'Ürününüzü inandırıcı, stillenmiş gerçek bir sahneye yerleştirin.', category: 'Ürün Fotoğrafı', credits: 3 },
  { name: 'Kumaş Görselleştirici', blurb: 'Bir tekstili farklı döküm, dokuma ve ışık koşullarında önizleyin.', category: 'Ürün Fotoğrafı', credits: 3 },
  { name: 'Mobilya Yerleştirme', blurb: 'Bir parçayı doğru ölçek, gölge ve perspektifle odaya yerleştirin.', category: 'Ürün Fotoğrafı', credits: 3 },
  { name: 'Stüdyo Ürün Kompozisyonu', blurb: 'Özenli prop ve negatif alanla temiz stüdyo düzenleri.', category: 'Ürün Fotoğrafı', credits: 3 },
  { name: 'Yakın Çekim Fotoğraf', blurb: 'Dikiş, doku ve malzeme kalitesini satan makro detay kareleri.', category: 'Ürün Fotoğrafı', credits: 3 },
  { name: 'Renk & Malzeme Varyantları', blurb: 'Tek bir fotoğraftan tüm renk ve malzeme yelpazesini üretin.', category: 'Ürün Fotoğrafı', credits: 4 },
  { name: 'Stüdyo Arka Planları', blurb: 'Her tonda kusursuz stüdyo fonlarını anında değiştirin.', category: 'Ürün Fotoğrafı', credits: 2 },
  { name: 'Çoklu Görsel Üretici', blurb: 'Tek seferde tutarlı bir açı ve kırpma seti üretin.', category: 'Ürün Fotoğrafı', credits: 5 },
  { name: 'Ürün Karşılaştırma', blurb: 'Spesifikasyon odaklı alıcılar için yan yana karşılaştırma düzenleri.', category: 'Ürün Fotoğrafı', credits: 3 },

  // ── E-Ticaret ────────────────────────────────────────────────
  { name: 'Stüdyo Hero Kareleri', blurb: 'Ürün sayfası dönüşümü için optimize edilmiş, pazaryerine hazır hero görselleri.', category: 'E-Ticaret', credits: 3 },
  { name: 'Yaşam Tarzı Fotoğrafçılığı', blurb: 'E-ticaret galerileri için ayarlanmış bağlamsal yaşam tarzı görselleri.', category: 'E-Ticaret', credits: 3 },
  { name: 'Editöryel Fotoğrafçılık', blurb: 'Premium listelemeler için dergi kalitesinde editöryel kareler.', category: 'E-Ticaret', credits: 3 },
  { name: 'E-Ticaret Foto Seti', blurb: 'Eksiksiz listeleme seti — hero, detay, ölçek ve yaşam tarzı.', category: 'E-Ticaret', credits: 6 },
  { name: 'Metin Yazarı', blurb: 'Görselden üretilen slogan + kısa açıklama + uzun editöryel metin.', category: 'E-Ticaret', credits: 1, isNew: true },
  { name: 'Çok Dilli Katalog Yazarı', blurb: 'Tek ürün → 12 dilde SEO metni ve meta etiketleri, hepsi bir arada.', category: 'E-Ticaret', credits: 2, exclusive: true },
  { name: 'Akıllı Listeleme Aktarımı', blurb: 'Görsel + metin + fiyatı doğrudan Shopify, Woo, Amazon ya da Trendyol’a gönderin.', category: 'E-Ticaret', credits: 1, exclusive: true },

  // ── Moda ─────────────────────────────────────────────────────
  { name: 'Moda Modeli Oluştur', blurb: 'Koleksiyonunuzu giydirecek çeşitli, markaya uygun modeller üretin.', category: 'Moda', credits: 4 },
  { name: 'Sanal Deneme', blurb: 'Herhangi bir modele giysinizi gerçekçi kalıp ve dökümle giydirin.', category: 'Moda', credits: 4 },
  { name: 'Stil Adaptasyonu', blurb: 'Bir görünümü sezonlar, ruh halleri ve hedef pazarlar arasında yeniden stilleyin.', category: 'Moda', credits: 3 },
  { name: 'Desen Tasarımcısı', blurb: 'Kesintisiz, üretime hazır baskı ve raporlar oluşturun.', category: 'Moda', credits: 3 },
  { name: 'Koleksiyon Tasarımcısı', blurb: 'Tek bir tasarım yönünden tutarlı bir kapsül koleksiyon kurun.', category: 'Moda', credits: 5 },

  // ── İç Mekan ─────────────────────────────────────────────────
  { name: 'Oda Stilisti', blurb: 'Boş veya dağınık bir odayı satılabilir bir iç mekana dönüştürün.', category: 'İç Mekan', credits: 3 },
  { name: 'İç Mekan Stil Yenileme', blurb: 'Bir mekanı İskandinav’dan maksimalist’e farklı tasarım dillerinde yeniden giydirin.', category: 'İç Mekan', credits: 3 },
  { name: 'Zemin & Duvar Tasarımcısı', blurb: 'Kaplama, zemin ve duvar dokularını saniyeler içinde değiştirin.', category: 'İç Mekan', credits: 3 },
  { name: 'Oda Boşaltıcı', blurb: 'Bir odayı temizce boşaltıp sıfırdan başlayın.', category: 'İç Mekan', credits: 2 },
  { name: 'Oda Düzenleyici', blurb: 'Yeniden çekim olmadan bir sahneyi toparlayın ve yeniden sahneleyin.', category: 'İç Mekan', credits: 2 },
  { name: 'Kat Planından 3D’ye', blurb: 'Düz bir kat planını döşenmiş 3D görselleştirmeye dönüştürün.', category: 'İç Mekan', credits: 6, isNew: true },

  // ── Mobilya ──────────────────────────────────────────────────
  { name: 'Yatak Odası Mobilya Seti', blurb: 'Eksiksiz bir yatak odası setinin koordineli fotoğrafçılığı.', category: 'Mobilya', credits: 4 },
  { name: 'Panel Mobilya Rengi', blurb: 'Panel mobilyaları kaplama kataloğunuz boyunca yeniden renklendirin.', category: 'Mobilya', credits: 3 },
  { name: 'Koltuk & Berjer Seti', blurb: 'Hero’dan detaya eksiksiz oturma grubu.', category: 'Mobilya', credits: 6 },
  { name: 'Ofis Mobilyası Seti', blurb: 'Masa, sandalye ve depolama için işe hazır görseller.', category: 'Mobilya', credits: 4 },

  // ── Ev Tekstili ──────────────────────────────────────────────
  { name: 'Banyo Havlusu Sunumu', blurb: 'Spa kalitesinde ışıkla katlanmış ve stillenmiş havlu sunumları.', category: 'Ev Tekstili', credits: 3 },
  { name: 'Plaj & Havuz Havlusu', blurb: 'Plaj ve havuz başı tekstilleri için güneşli yaşam tarzı sahneleri.', category: 'Ev Tekstili', credits: 3 },
  { name: 'Modelde Bornoz', blurb: 'Doğal döküm ve konforla modeller üzerinde gösterilen bornozlar.', category: 'Ev Tekstili', credits: 4 },
  { name: 'Tam Nevresim Seti Sunumu', blurb: 'Komple nevresim takımını gösteren stillenmiş yataklar.', category: 'Ev Tekstili', credits: 4 },
  { name: 'Sadece Çarşaf Sunumu', blurb: 'Katalog gridleri için izole, temiz ve net çarşaf takımları.', category: 'Ev Tekstili', credits: 3 },
  { name: 'Modelde Panço Havlu', blurb: 'Eğlenceli sahnelerde giyilen çocuk ve yetişkin panço havlular.', category: 'Ev Tekstili', credits: 3 },
  { name: 'Tül Perde Görselleştirici', blurb: 'Gerçek pencerelerde render edilen ışık geçiren tül perdeler.', category: 'Ev Tekstili', credits: 3, isNew: true },
  { name: 'Oda Perde Tasarımı', blurb: 'Döşenmiş odalara stillenmiş komple perde uygulamaları.', category: 'Ev Tekstili', credits: 3, isNew: true },

  // ── Halı ─────────────────────────────────────────────────────
  { name: 'Halı Oda Yerleştirme', blurb: 'Bir halıyı gerçek ölçekle döşenmiş bir odaya yerleştirin.', category: 'Halı', credits: 3, isNew: true },
  { name: 'Halı Yaşam Tarzı Fotoğrafı', blurb: 'Halı etrafında kurulan sıcak, yaşanmış yaşam tarzı sahneleri.', category: 'Halı', credits: 3, isNew: true },
  { name: 'Halı Düz Çekim', blurb: 'Tüm deseni net gösteren tepeden düz çekimler.', category: 'Halı', credits: 2, isNew: true },
  { name: 'Halı Stüdyo Fotoğrafı', blurb: 'Doğru renk ve hav ile kontrollü stüdyo çekimleri.', category: 'Halı', credits: 3, isNew: true },

  // ── Kişisel Marka ────────────────────────────────────────────
  { name: 'Profesyonel Vesikalık', blurb: 'Tek bir selfie’den cilalı kurumsal vesikalıklar.', category: 'Kişisel Marka', credits: 3 },
  { name: 'Lüks Moda Portresi', blurb: 'Editöryel ışıkla yüksek moda portreciliği.', category: 'Kişisel Marka', credits: 3 },
  { name: 'Dramatik Siyah-Beyaz Portre', blurb: 'Ruh hali ve kontrastla çarpıcı siyah-beyaz portreler.', category: 'Kişisel Marka', credits: 3 },
  { name: 'Yaşam Tarzı Portreleri', blurb: 'Otantik kişisel marka yaşam tarzı görselleri.', category: 'Kişisel Marka', credits: 3 },
  { name: 'Editöryel Portre', blurb: 'Kurucular ve üreticiler için tek özneli editöryel kareler.', category: 'Kişisel Marka', credits: 3 },

  // ── Pazarlama & Sosyal ───────────────────────────────────────
  { name: 'Instagram İçeriği', blurb: 'Eşleşen açıklamalarla Post / Reel / Story görselleri.', category: 'Pazarlama & Sosyal', credits: 2, isNew: true },
  { name: 'Banner Tasarımcısı', blurb: 'Web, reklam ve e-posta başlıkları için markaya uygun banner’lar.', category: 'Pazarlama & Sosyal', credits: 2 },
  { name: 'Editöryel Kompozisyon', blurb: 'Kampanya ana görselleri için düzen bilinçli kompozisyonlar.', category: 'Pazarlama & Sosyal', credits: 3 },
  { name: 'Sosyal Planlayıcı', blurb: 'Instagram, TikTok ve Pinterest’e üretin, kuyruğa alın ve otomatik yayınlayın.', category: 'Pazarlama & Sosyal', credits: 1, exclusive: true },
  { name: 'Akıllı Akış Önericisi', blurb: 'Bir ürün seçin — Atelio tam olarak hangi ajanları ve kredi bütçesini önersin.', category: 'Pazarlama & Sosyal', credits: 0, exclusive: true },

  // ── Ürün Setleri ─────────────────────────────────────────────
  { name: 'Ürün Foto Seti', blurb: 'Her ürün kategorisi için hepsi bir arada genel set.', category: 'Ürün Setleri', credits: 7 },
  { name: 'Koltuk Takımı Foto Seti', blurb: 'Komple koltuk takımları için uçtan uca görseller.', category: 'Ürün Setleri', credits: 7 },
  { name: 'Yemek Masası Takımı Seti', blurb: 'Stillenmiş ve ışıklandırılmış komple yemek takımı fotoğrafçılığı.', category: 'Ürün Setleri', credits: 7 },
  { name: 'Sandalye Foto Seti', blurb: 'Bir sandalye listelemesinin ihtiyaç duyduğu her açı ve detay.', category: 'Ürün Setleri', credits: 6 },
  { name: 'Karyola Foto Seti', blurb: 'Karyola ve başlıklar için hero’dan detaya kapsama.', category: 'Ürün Setleri', credits: 6 },
  { name: 'Minder Foto Seti', blurb: 'Set halinde stillenmiş minder görselleri.', category: 'Ürün Setleri', credits: 5 },
  { name: 'Kırlent Foto Seti', blurb: 'Bağlamda ve düz çekimde yumuşak döşeme setleri.', category: 'Ürün Setleri', credits: 5 },
  { name: 'Perde Foto Seti', blurb: 'Stüdyodan odaya komple perde seti.', category: 'Ürün Setleri', credits: 6 },
  { name: 'Masa Örtüsü Foto Seti', blurb: 'Farklı sofralar ve sezonlarda stillenmiş masa tekstilleri.', category: 'Ürün Setleri', credits: 5 },
  { name: 'Battaniye & Şal Seti', blurb: 'Katlanmış, dökülmüş ve sahnede sıcacık şal görselleri.', category: 'Ürün Setleri', credits: 5 },
  { name: 'Yatak Örtüsü Seti', blurb: 'Stillenmiş yataklarda komple yatak örtüsü setleri.', category: 'Ürün Setleri', credits: 6 },
  { name: 'Bebek Giyim Foto Seti', blurb: 'Modelde ve modelsiz nazik, güvenli bebek giyim görselleri.', category: 'Ürün Setleri', credits: 5 },
  { name: 'Takı Foto Seti', blurb: 'Kontrollü yansımalarla yüksek parlaklıkta takı çekimleri.', category: 'Ürün Setleri', credits: 6 },
  { name: 'Çanta Foto Seti', blurb: 'Komple çanta kapsama — hero, detay, ölçek ve giyilmiş.', category: 'Ürün Setleri', credits: 6 },
  { name: 'Banyo Havlusu Seti', blurb: 'Banyo serileri için koordineli havlu programı görselleri.', category: 'Ürün Setleri', credits: 5 },
  { name: 'Giyim Foto Seti', blurb: 'Moda serileri için modelde ve düz çekim kapsama.', category: 'Ürün Setleri', credits: 6 },

  // ── Video & 360° ─────────────────────────────────────────────
  { name: 'Metinden Video', blurb: 'Metin komutu → süre, oran ve opsiyonel sesle video.', category: 'Video & 360°', credits: 8, isNew: true },
  { name: 'Görselden Video', blurb: 'Bir kareyi sinematik bir hareket klibine dönüştürün.', category: 'Video & 360°', credits: 8, isNew: true },
  { name: 'Üründen Video', blurb: 'Ürün görseli → Reels ve TikTok için 5 sn dikey klip.', category: 'Video & 360°', credits: 6, isNew: true },
  { name: '360° Görünüm', blurb: 'Tek fotoğraf → yörünge dönüşü; 2–9 açı → tam tur videosu.', category: 'Video & 360°', credits: 7, isNew: true },
]

export const AGENT_COUNT = AGENTS.length
export const NEW_COUNT = AGENTS.filter((a) => a.isNew || a.exclusive).length
