# DT Asistan Monorepo

Bu depo (repository), hem masaüstü uygulamasını hem de web sunucusu
bileşenlerini içeren bir **pnpm monorepo** çalışma alanıdır.

## 📥 Masaüstü Uygulaması İndir (Desktop App Download)

DT Asistan Lite uygulamasının en güncel sürümlerini doğrudan GitHub Releases
sayfası üzerinden indirebilirsiniz:

👉
**[DT Asistan Masaüstü Uygulaması Son Sürümü İndir (GitHub Releases)](https://github.com/ilyasbozdemir/dt-asistan-app/releases)**

_Not: Windows için `.exe` kurulum sihirbazını indirip doğrudan
çalıştırabilirsiniz._

---

## 📂 Dizin Yapısı

- **[`apps/app-desktop`](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-desktop):**
  Electron + React + TypeScript kullanılarak geliştirilen masaüstü asistan
  uygulamasıdır.
- **[`apps/app-web`](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-web):**
  Sunucu tarafındaki veri eşitleme, API yolları ve web arayüzü Next.js ile
  geliştirilmiştir.
- **[`apps/app-landing`](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/apps/app-landing):**
  Web tanıtım ve açılış sayfasıdır.

---

## 🚀 Hızlı Başlangıç

Bu depoda paket yönetimi ve iş akışları için **pnpm** kullanılmaktadır.
Başlamadan önce bilgisayarınızda Node.js ve pnpm yüklü olduğundan emin olun.

### 1. Bağımlılıkları Yükleme

Monorepo altındaki tüm projelerin bağımlılıklarını tek seferde yüklemek için kök
dizinde çalıştırın:

```bash
pnpm install
```

### 2. Geliştirme Ortamını Çalıştırma

Projeleri yerelde çalıştırmak için kök dizinden aşağıdaki komutları
kullanabilirsiniz:

- **Masaüstü Uygulaması (Electron):**

  ```bash
  pnpm dev:desktop
  ```

- **Web Uygulaması (Next.js):**
  ```bash
  pnpm dev:web
  ```

---

## 🐳 Docker ile Canlandırma (Web Sunucusu & Veritabanı)

Sunucu tarafını PostgreSQL veritabanı ile birlikte Docker üzerinde izole bir
şekilde ayağa kaldırmak için kök dizinde çalıştırın:

```bash
docker-compose up --build
```

Bu komut:

1. `dt-asistan-postgres` isminde bir PostgreSQL veritabanı konteyneri başlatır
   (Port: `5432`).
2. `dt-asistan-web` isminde Next.js web sunucusu konteyneri başlatır (Port:
   `3000`).

---

## 🛠️ Monorepo Komutları

Kök dizinden tüm alt projeleri yönetebilmeniz için tanımlanmış kısayol
scriptleri:

| Komut                | Açıklama                                                           |
| :------------------- | :----------------------------------------------------------------- |
| `pnpm dev:desktop`   | Masaüstü uygulamasını geliştirme modunda açar                      |
| `pnpm dev:web`       | Web sunucusunu geliştirme modunda açar                             |
| `pnpm build:desktop` | Masaüstü uygulamasının production derlemesini alır                 |
| `pnpm build:web`     | Web sunucusunun production derlemesini alır                        |
| `pnpm typecheck`     | Hem masaüstü hem de web projelerinde TypeScript tip kontrolü yapar |
| `pnpm format`        | Kod biçimlendirmeyi (Prettier) çalıştırır                          |
| `pnpm lint`          | ESLint denetimini çalıştırır                                       |
