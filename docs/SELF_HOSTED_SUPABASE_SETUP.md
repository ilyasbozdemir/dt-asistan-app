# 🏛️ TEMİN 360 - Self-Hosted Supabase Kurulum ve Entegrasyon Kılavuzu

Bu kılavuz, **TEMİN 360 (Kamu Harcama, İhale, Doğrudan Temin ve Hakediş Yönetim Sistemi)** verilerini kurumunuzun kendi yerel sunucusunda (On-Premise / Intranet) barındırabilmeniz için adım adım **Self-Hosted Supabase** kurulumunu açıklar.

---

## 📌 Neden Self-Hosted Supabase?

* **%100 Veri Egemenliği & KVKK Uyumu:** Kamu ihaleleri, yaklaşık maliyet teklifleri ve hakediş verileri kurumunuzun kendi sunucusunda kalır, hiçbir üçüncü taraf buluta çıkmaz.
* **Sıfır Maliyet & Sınırsız Kullanım:** Bulut kota veya fatura sınırlarına takılmadan sınırsız dosya boyutu ve sınırsız kullanıcı desteği.
* **Row-Level Security (RLS) & Audit Trail:** Veri tabanı seviyesinde rol bazlı yetkilendirme ve Sayıştay denetim izi.

---

## 🚀 1. Adım: Sunucuda Supabase'i Başlatma (Docker)

Sunucunuzda **Docker** ve **Docker Compose** kurulu olduğundan emin olun.

```bash
# 1. Proje ana dizinindeki docker klasörüne gidin
cd docker/supabase

# 2. .env dosyasını oluşturun
cp .env.example .env

# 3. İsteğe bağlı olarak .env içerisindeki parolaları düzenleyin:
#    - POSTGRES_PASSWORD
#    - JWT_SECRET
#    - SUPABASE_PUBLIC_URL (Örn: http://192.168.1.100:8000)

# 4. Konteynerleri arka planda ayağa kaldırın
docker compose up -d
```

Konteynerler çalıştığında şu portlar aktif olacaktır:
* **Supabase Studio (Yönetim Paneli):** `http://SUNUCU_IP:3000`
* **Kong API Gateway (TEMİN 360 Bağlantı Kapısı):** `http://SUNUCU_IP:8000`

---

## 🗄️ 2. Adım: TEMİN 360 SQL Şemasını ve Tablolarını İçe Aktarma

1. Tarayıcınızdan **Supabase Studio** arayüzüne girin: `http://SUNUCU_IP:3000`
2. Sol menüden **SQL Editor** bölümüne tıklayın.
3. Projede yer alan [`packages/database/src/supabase/schema.sql`](../packages/database/src/supabase/schema.sql) dosyasının tüm içeriğini kopyalayın ve SQL editörüne yapıştırın.
4. **"Run"** butonuna basarak çalıştırın.

Bu işlem şunları otomatik olarak kuracaktır:
* ✅ 37+ kamu ihale tablosu (`DATA_TeminDosyasi`, `DATA_TeminKalem`, `TANIM_Kurum`, vb.)
* ✅ Sayıştay uyumlu otomatik `LOG_AuditTrail` tetikleyicileri (INSERT/UPDATE/DELETE logları)
* ✅ Row Level Security (RLS) veri güvenliği kuralları
* ✅ Evrak ve Veritabanı Yedekleri için `temin-360-documents` ve `temin-360-backups` Storage bucket'ları

---

## ⚙️ 3. Adım: Temin 360 Masaüstü Uygulamasını Bağlama

1. **TEMİN 360** uygulamasını açın.
2. Sol menüden **Ayarlar** (`/ayarlar`) ekranına gidin.
3. **"Supabase & Bulut"** sekmesini seçin.
4. Bilgilerinizi girin:
   * **Supabase API URL:** `http://SUNUCU_IP:8000` (veya bulut kullanıyorsanız `https://xyz.supabase.co`)
   * **Supabase Anon Key:** `.env` dosyanızdaki `ANON_KEY` değeri
5. **"Bağlantıyı Test Et"** butonuna basın. Yeşil `✓ Supabase bağlantısı başarılı!` bildirimini gördüğünüzde işlem tamamdır!
6. **"Supabase Ayarlarını Kaydet"** butonuna basarak ayarlarınızı kaydedin.

---

## 💾 4. Adım: Tek Tıkla Buluta / Sunucuya Yedekleme

* Ayarlar ekranındaki **"Aktif SQLite Veritabanını Buluta Yedekle"** butonu ile istediğiniz an güncel veritabanınızı sunucudaki güvenli storage bucket'ına tek tıkla yükleyebilirsiniz.
* **Otomatik Bulut Yedekleme** seçeneğini açtığınızda dosya kapandığında güncel yedek otomatik olarak sunucuya iletilir.
