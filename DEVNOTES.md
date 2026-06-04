# 📍 Geliştirme Notu — Checkpoint

---

## 🔖 Neredeyiz?

### ✅ Tamamlananlar

- `DATA_TeminDosyasi` şemasına `tekrar_no` kolonu eklendi
- Aynı isimde dosya kaydedilince otomatik `#2`, `#3` eki — `yeni.screen.tsx`
- İşin Adı alanında Türkçe destekli autocomplete + duplicate uyarısı
- `db:run` IPC handler'da `workspaceManager.save()` tetikleniyor (dosya .dtm'ye
  yazılıyor)
- Schema Self-Healing: `ALTER TABLE ADD COLUMN` ile UNIQUE/NOT NULL ekleme
  hatası düzeltildi
- `index.screen.tsx` (dosyalar listesi) tamamen yenilendi:
  - Özet istatistik barı (Toplam / Aktif / Taslak / YM)
  - Tür filtresi (Mal / Hizmet / Yapım / Danışmanlık)
  - Zengin kart görünümü (birim, talep no, ekonomik kod, durum badge, tekrar_no)
  - Sağ detay paneli (bütçe & muhasebe, ihale & sözleşme, notlar)
- "Kurum İçi Temin Numarası" → "Doğrudan Temin Numarası" düzeltildi

---

## 🚧 Devam Edecek: Aktif Dosya İşlemleri Mimarisi

**Problem:** Sidebar'daki "Aktif Dosya İşlemleri" altındaki tüm alt ekranlar şu
an placeholder (Yakında).

**Plan:** Her SubScreen ekranı aktif `DATA_TeminDosyasi` kaydına bağlı verilerle
çalışacak.

### Önerilen Yeni Tablolar

```
DATA_TeminKalem     → Dosyaya bağlı malzeme kalemleri (YM cetveli)
DATA_TeminFirma     → Dosyaya bağlı istekli firmalar + teklifler  
DATA_TeminKomisyon  → Komisyon üyeleri
DATA_TeminBelge     → Üretilen belge kayıtları (log)
```

### Açık Sorular (kullanıcıyla konuşulacak)

1. Malzeme: `TANIM_Kalem` havuzundan seçim mi, serbest giriş mi?
2. Şablonlar: Hardcoded HTML mi, DB'den çekilen kullanıcı şablonu mu?
3. Çıktı: DOCX mı, PDF mi, ikisi de mi?

---

## 📁 Kritik Dosyalar

| Dosya                                                  | Açıklama                          |
| ------------------------------------------------------ | --------------------------------- |
| `src/main/database/tables/DATA_TeminDosyasi.ts`        | Ana DT dosyası şeması             |
| `src/main/database/workspace.ts`                       | Workspace yönetimi + Self-healing |
| `src/renderer/src/screens/dosyalar/index.screen.tsx`   | DT dosyaları listesi              |
| `src/renderer/src/screens/dosyalar/yeni.screen.tsx`    | Yeni/Düzenle formu                |
| `src/renderer/src/screens/dosya/SubScreens.screen.tsx` | Alt ekranlar (tümü placeholder)   |
| `src/renderer/src/components/layout/Sidebar.tsx`       | Dinamik sidebar menüsü            |
| `src/renderer/src/components/layout/TeminSelector.tsx` | Aktif dosya seçici                |
