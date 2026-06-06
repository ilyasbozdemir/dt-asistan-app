# Doğrudan Temin Masaüstü Yönetim Uygulaması

<p align="center">
  <img src="resources/icon.png" alt="Doğrudan Temin Yönetimi İkonu" width="128" />
</p>

<p align="center">
  <a href="https://github.com/ilyasbozdemir/dt-desktop-app/actions"><img src="https://img.shields.io/github/actions/workflow/status/ilyasbozdemir/dt-desktop-app/release.yml?style=flat-square&logo=github&label=Build%20Status" alt="Build Status"></a>
  <a href="https://github.com/ilyasbozdemir/dt-desktop-app/releases/latest"><img src="https://img.shields.io/github/v/release/ilyasbozdemir/dt-desktop-app?style=flat-square&logo=github&label=Latest%20Release" alt="Latest Release"></a>
  <a href="https://github.com/ilyasbozdemir/dt-desktop-app/releases"><img src="https://img.shields.io/github/downloads/ilyasbozdemir/dt-desktop-app/total?style=flat-square&logo=github&color=blue" alt="Downloads"></a>
</p>

**4734 Sayılı Kamu İhale Kanunu Madde 22 kapsamında doğrudan temin yoluyla
yapılan alımları yönetmek için geliştirilmiş masaüstü uygulama.**

---

## Hakkında

Doğrudan Temin Programı, internet bağlantısı gerektirmeyen, tamamen **çevrimdışı
(offline)** çalışan bir masaüstü uygulamasıdır. Verileriniz yalnızca kendi
bilgisayarınızda saklanır; herhangi bir sunucuya veya bulut sistemine
gönderilmez.

Uygulama, tüm verilerini `.dtm` uzantılı dosyalarda saklar. Bu dosya formatı,
tıpkı `.docx`, `.xlsx` veya `.pptx` gibi uygulamaya özgü bir yapıya sahiptir;
içinde SQLite veritabanı ve ilgili meta veriler yer alır. Dosyalarınızı
yedekleyebilir, taşıyabilir ve paylaşabilirsiniz.

---

## Özellikler

- **Mevzuata tam uygunluk** — 4734 Sayılı Kamu İhale Kanunu Madde 22 ve Kamu
  İhale Kurumu standartları eksiksiz karşılanmaktadır.
- **Tek girdi, sonsuz kullanım** — Temin sürecinde kullanılan belgeleri
  kurumunuza özgü bir kez düzenleyin, her zaman kullanın. Sık kullanılan benzer
  alımlarınız için Tip Onay Belgesi oluşturun.
- **Sınırsız Esneklik** — En düşük fiyatlı firmadan mı, tüm kalemleri aynı
  firmadan mı, yoksa her kalem için istediğiniz firmadan mı alım
  gerçekleştireceksiniz? Kaç firmadan teklif alacaksanız sayısını siz
  belirleyin. Seçim tamamen size ait!
- **Yaklaşık Maliyet Kolaylığı** — Yaklaşık maliyeti ister programla detaylı
  hesaplayın, isterseniz doğrudan elinizdeki veriyi girin.
- **EKAP’a Girişe Hazır** — Doğrudan Temin Kayıt Formu için zaman harcamaya
  gerek kalmadı, sistem her şeyi EKAP formatına uygun hazırlar.
- **Dinamik şablon yönetimi** — Belgelerinizi uygulama içinden düzenleyebilir,
  anlık önizleyebilir ve `.xlsx` ya da `.docx` formatında dışa aktarabilirsiniz.
- **DYS uyumlu çıktı** — Tüm belgeler `.UDF` formatında da dışa aktarılabilir;
  Doküman Yönetim Sistemi entegrasyonu ek adım gerektirmez.
- **Adım adım rehberli iş akışı** — Her süreç aşaması yönlendirmeli ekranlarla
  ilerler; eksik ya da hatalı bilgi girilmesi sistem tarafından engellenir.
- **Tamamen çevrimdışı** — İnternet bağlantısı gerekmez, verileriniz yalnızca
  sizin bilgisayarınızda durur.

---

## Kimler Kullanabilir?

Kamu İhale Kanunu kapsamında **Doğrudan Temin** ile alım yapan tüm kurum ve
kuruluşlar için tasarlanmıştır:

- **Belediyeler** (Büyük, orta ve küçük ölçekli ihale düzenleyen tüm
  müdürlükler)
- **İl Özel İdareleri**
- **Hastaneler** ve **Üniversiteler**
- **İl Milli Eğitim Müdürlükleri**
- **İçişleri Bakanlığı** Merkez ve Taşra Müdürlükleri
- **Milli Savunma Bakanlığı** ve ilgili Başkanlıkları
- **Karayolları, DSİ, İller Bankası**, **Adalet Bakanlığı Ceza İnfaz Kurumları**
- **Sosyal Güvenlik Kurumları**

---

## Basıma Hazır Alabileceğiniz Belgeler

Sistemden saniyeler içinde otomatik olarak üretip çıktısını alabileceğiniz
belgeler:

- Doğrudan Temin Onay Belgesi
- Yaklaşık Maliyet Hesap Cetveli ve Görevlendirme Yazısı
- İhtiyaç Listesi ve Talep Yazısı (Lüzum Müzekkeresi)
- Firmalardan Teklif İsteme Yazısı
- Piyasa Araştırma Tutanağı
- Geçmiş Alımlar Tutanağı
- Doğrudan Temin Gerekçe Tutanağı
- Sipariş Formu ve Sözleşme
- Kabul Tutanağı ve Ödeme Emri Yazısı
- Doğrudan Temin Kayıt Formu
- Doğrudan Temin Arşiv Dosyaları...

---

## Gelişmiş Raporlama

Bütçe harcama raporlarınız tek tuşla elinizin altında:

- Hangi bütçe kaleminden?
- Hangi tarih aralığında?
- Hangi temin şeklinden veya iş türlerinde?
- Ne kadar alım gerçekleştirdiniz?

Tüm bu soruların yanıtlarını güçlü ve dinamik raporlama ekranlarıyla anında
alabilirsiniz.

---

## Dosya Formatı

`.dtm` dosyaları ZIP tabanlı bir yapıya sahiptir. İçeriği:

```
dosya.dtm
├── database.sqlite    ← Tüm veriler
├── meta.json          ← Sürüm ve şema bilgisi
└── attachments/       ← Varsa ek dosyalar
```

Bu yapı sayesinde dosyalarınız hem taşınabilir hem de versiyon uyumluluğu
açısından yönetilebilirdir.

---

## Kurulum

```bash
# Bağımlılıkları yükle
pnpm install

# Geliştirme modunda çalıştır
pnpm run dev

# Üretim için derle (Windows)
pnpm run build:win

# Linux veya Mac için derle (İsteğe bağlı)
pnpm run build:linux
pnpm run build:mac
```

---

## Teknolojiler

- [Electron.js](https://www.electronjs.org/) — Masaüstü uygulama çatısı
- [Radix UI](https://www.radix-ui.com/) — Erişilebilirlik odaklı, headless
  bileşen kütüphanesi
- [Tailwind CSS](https://tailwindcss.com/) — `rem` tabanlı, responsive
  utility-first stil sistemi
- [SQLite](https://www.sqlite.org/) /
  [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — Yerel
  veritabanı
- [Express.js](https://expressjs.com/) — Dahili API katmanı
- [node-windows](https://github.com/coreybutler/node-windows) — Windows servis
  entegrasyonu

---

## Lisans

Bu proje [GNU Affero General Public License v3.0](./LICENSE) lisansı ile
lisanslanmıştır.

```
dt-desktop-app - Doğrudan Temin Masaüstü Yönetim uygulaması
Copyright (C) 2026  İlyas Bozdemir
```
