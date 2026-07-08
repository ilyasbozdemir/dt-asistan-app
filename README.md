# Doğrudan Temin & Satın Alma Yönetim Sistemi (Monorepo)

Bu depo (repository), hem masaüstü uygulamasını hem de web sunucusu bileşenlerini içeren bir **pnpm monorepo** çalışma alanıdır.

---

## 📂 Dizin Yapısı

- **[`/desktop`](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/desktop):** Electron + React + TypeScript kullanılarak geliştirilen masaüstü asistan uygulamasıdır.
- **[`/web`](file:///d:/Github/ilyas-bozdemir/dt-desktop-app/web):** Sunucu tarafındaki veri eşitleme, API yolları ve web arayüzü için Next.js (App Router, Tailwind CSS, TypeScript) ile geliştirilen web uygulamasıdır.

---

## 🚀 Hızlı Başlangıç

Bu depoda paket yönetimi ve iş akışları için **pnpm** kullanılmaktadır. Başlamadan önce bilgisayarınızda Node.js ve pnpm yüklü olduğundan emin olun.

### 1. Bağımlılıkları Yükleme
Monorepo altındaki tüm projelerin bağımlılıklarını tek seferde yüklemek için kök dizinde çalıştırın:
```bash
pnpm install
```

### 2. Geliştirme Ortamını Çalıştırma
Projeleri yerelde çalıştırmak için kök dizinden aşağıdaki komutları kullanabilirsiniz:

- **Masaüstü Uygulaması (Electron):**
  ```bash
  pnpm dev
  # veya
  pnpm dev:desktop
  ```

- **Web Uygulaması (Next.js):**
  ```bash
  pnpm dev:web
  ```

---

## 🐳 Docker ile Canlandırma (Web Sunucusu & Veritabanı)

Sunucu tarafını PostgreSQL veritabanı ile birlikte Docker üzerinde izole bir şekilde ayağa kaldırmak için kök dizinde çalıştırın:

```bash
docker-compose up --build
```

Bu komut:
1. `dt-asistan-postgres` isminde bir PostgreSQL veritabanı konteyneri başlatır (Port: `5432`).
2. `dt-asistan-web` isminde Next.js web sunucusu konteyneri başlatır (Port: `3000`).

---

## 🛠️ Monorepo Komutları

Kök dizinden tüm alt projeleri yönetebilmeniz için tanımlanmış kısayol scriptleri:

| Komut | Açıklama |
| :--- | :--- |
| `pnpm dev` | Masaüstü uygulamasını geliştirme modunda açar |
| `pnpm dev:web` | Web sunucusunu geliştirme modunda açar |
| `pnpm build:desktop` | Masaüstü uygulamasının production derlemesini alır |
| `pnpm build:web` | Web sunucusunun production derlemesini alır |
| `pnpm typecheck` | Hem masaüstü hem de web projelerinde TypeScript tip kontrolü yapar |
| `pnpm format` | Kod biçimlendirmeyi (Prettier) çalıştırır |
| `pnpm lint` | ESLint denetimini çalıştırır |
