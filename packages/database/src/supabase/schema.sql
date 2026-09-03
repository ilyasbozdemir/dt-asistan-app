-- ============================================================================
-- HAKİM Pro - Kamu Harcama, İhale, Doğrudan Temin ve Hakediş Yönetim Sistemi
-- Supabase / PostgreSQL Veritabanı Şeması & Güvenlik (RLS) Yapılandırması
-- ============================================================================

-- 1. GEREKLİ EKLENTİLER (EXTENSIONS)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. OTOMATİK ZAMAN DAMGASI GÜNCELLEME FONKSİYONU
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. SAYIŞTAY VE DENETİM İZİ (AUDIT TRAIL) TABLOSU VE TETİKLEYİCİSİ
CREATE TABLE IF NOT EXISTS "LOG_AuditTrail" (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT DEFAULT (auth.jwt() ->> 'email'),
    user_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "LOG_AuditTrail" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit kayıtları sadece okunabilir" ON "LOG_AuditTrail" FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION log_audit_trail_func()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO "LOG_AuditTrail" (table_name, record_id, action, old_data, user_id, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id::TEXT, 'DELETE', to_jsonb(OLD), auth.uid(), auth.jwt() ->> 'email');
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO "LOG_AuditTrail" (table_name, record_id, action, old_data, new_data, user_id, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid(), auth.jwt() ->> 'email');
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO "LOG_AuditTrail" (table_name, record_id, action, new_data, user_id, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'INSERT', to_jsonb(NEW), auth.uid(), auth.jwt() ->> 'email');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. KURUM, BİRİM, PERSONEL VE ROL TANIM TABLOLARI
-- ============================================================================

CREATE TABLE IF NOT EXISTS "TANIM_Kurum" (
    id BIGSERIAL PRIMARY KEY,
    ad TEXT NOT NULL,
    antet_ust TEXT,
    antet_alt TEXT,
    il TEXT,
    ilce TEXT,
    vergi_dairesi TEXT,
    vergi_no TEXT,
    muhasebe_kodu TEXT,
    telefon TEXT,
    email TEXT,
    adres TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_Birim" (
    id BIGSERIAL PRIMARY KEY,
    kurum_id BIGINT REFERENCES "TANIM_Kurum"(id) ON DELETE SET NULL,
    ad TEXT NOT NULL,
    kod TEXT,
    harcama_birim_kodu TEXT,
    harcama_yetkilisi_id BIGINT,
    gerceklestirme_gorevlisi_id BIGINT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_Roller" (
    id BIGSERIAL PRIMARY KEY,
    kod TEXT UNIQUE NOT NULL,
    ad TEXT NOT NULL,
    aciklama TEXT,
    yetkiler JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_Personel" (
    id BIGSERIAL PRIMARY KEY,
    kurum_id BIGINT REFERENCES "TANIM_Kurum"(id) ON DELETE SET NULL,
    birim_id BIGINT REFERENCES "TANIM_Birim"(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tc_kimlik_no TEXT,
    ad_soyad TEXT NOT NULL,
    unvan TEXT,
    gorev TEXT,
    eposta TEXT,
    telefon TEXT,
    rol_kod TEXT DEFAULT 'GOREVLI',
    imza_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_Mevzuat" (
    id BIGSERIAL PRIMARY KEY,
    kod TEXT NOT NULL,
    madde TEXT NOT NULL,
    baslik TEXT NOT NULL,
    aciklama TEXT,
    kanun_no TEXT DEFAULT '4734',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_Asama" (
    id BIGSERIAL PRIMARY KEY,
    sira INTEGER NOT NULL,
    ad TEXT NOT NULL,
    kod TEXT NOT NULL,
    aciklama TEXT,
    renk TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_Firma" (
    id BIGSERIAL PRIMARY KEY,
    unvan TEXT NOT NULL,
    kisa_ad TEXT,
    vergi_dairesi TEXT,
    vergi_no TEXT,
    tc_kimlik_no TEXT,
    yetkili_ad_soyad TEXT,
    telefon TEXT,
    gsm TEXT,
    email TEXT,
    adres TEXT,
    il TEXT,
    ilce TEXT,
    banka_adi TEXT,
    iban TEXT,
    sektor TEXT,
    notlar TEXT,
    yasakli_mi BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_FirmaIletisimNotu" (
    id BIGSERIAL PRIMARY KEY,
    firma_id BIGINT REFERENCES "TANIM_Firma"(id) ON DELETE CASCADE,
    not_metni TEXT NOT NULL,
    yazan_personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_Ambar" (
    id BIGSERIAL PRIMARY KEY,
    birim_id BIGINT REFERENCES "TANIM_Birim"(id) ON DELETE SET NULL,
    kod TEXT,
    ad TEXT NOT NULL,
    sorumlu_personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE SET NULL,
    adres TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_OlcuBirimi" (
    id BIGSERIAL PRIMARY KEY,
    kod TEXT NOT NULL,
    ad TEXT NOT NULL,
    sembol TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_TasinirKod" (
    id BIGSERIAL PRIMARY KEY,
    kod TEXT NOT NULL,
    ad TEXT NOT NULL,
    olcu_birimi_id BIGINT,
    seviye INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_OkasKod" (
    id BIGSERIAL PRIMARY KEY,
    kod TEXT NOT NULL,
    ad TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_Kalem" (
    id BIGSERIAL PRIMARY KEY,
    ad TEXT NOT NULL,
    tasinir_kod_id BIGINT REFERENCES "TANIM_TasinirKod"(id) ON DELETE SET NULL,
    okas_kod_id BIGINT REFERENCES "TANIM_OkasKod"(id) ON DELETE SET NULL,
    olcu_birimi_id BIGINT REFERENCES "TANIM_OlcuBirimi"(id) ON DELETE SET NULL,
    varsayilan_kdv NUMERIC(5, 2) DEFAULT 20.00,
    aciklama TEXT,
    barkod TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_AlimTuru" (
    id BIGSERIAL PRIMARY KEY,
    kod TEXT NOT NULL UNIQUE,
    ad TEXT NOT NULL,
    aciklama TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_Sablon" (
    id BIGSERIAL PRIMARY KEY,
    kod TEXT NOT NULL,
    ad TEXT NOT NULL,
    kategori TEXT,
    icerik_html TEXT,
    icerik_mustache TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_Placeholder" (
    id BIGSERIAL PRIMARY KEY,
    kod TEXT NOT NULL UNIQUE,
    ad TEXT NOT NULL,
    aciklama TEXT,
    kategori TEXT,
    ornek_deger TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_AlimTuru_Sablon" (
    id BIGSERIAL PRIMARY KEY,
    alim_turu_id BIGINT REFERENCES "TANIM_AlimTuru"(id) ON DELETE CASCADE,
    sablon_id BIGINT REFERENCES "TANIM_Sablon"(id) ON DELETE CASCADE,
    sira INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "TANIM_SurecTaslak" (
    id BIGSERIAL PRIMARY KEY,
    ad TEXT NOT NULL,
    alim_turu_kod TEXT,
    asamalar JSONB DEFAULT '[]'::jsonb,
    belgeler JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SABLON_Placeholder" (
    id BIGSERIAL PRIMARY KEY,
    sablon_id BIGINT REFERENCES "TANIM_Sablon"(id) ON DELETE CASCADE,
    placeholder_id BIGINT REFERENCES "TANIM_Placeholder"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "TANIM_KodSozlugu" (
    id BIGSERIAL PRIMARY KEY,
    grup TEXT NOT NULL,
    kod TEXT NOT NULL,
    deger TEXT NOT NULL,
    sira INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "TANIM_KomisyonGorevi" (
    id BIGSERIAL PRIMARY KEY,
    kod TEXT NOT NULL UNIQUE,
    ad TEXT NOT NULL,
    aciklama TEXT
);

CREATE TABLE IF NOT EXISTS "TANIM_Komisyon" (
    id BIGSERIAL PRIMARY KEY,
    ad TEXT NOT NULL,
    alim_turu_kod TEXT,
    birim_id BIGINT REFERENCES "TANIM_Birim"(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TANIM_KomisyonUye" (
    id BIGSERIAL PRIMARY KEY,
    komisyon_id BIGINT REFERENCES "TANIM_Komisyon"(id) ON DELETE CASCADE,
    personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE CASCADE,
    gorev_kod TEXT,
    asl_yedek TEXT DEFAULT 'ASIL',
    sira INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "TANIM_Komisyon_Sablon" (
    id BIGSERIAL PRIMARY KEY,
    komisyon_id BIGINT REFERENCES "TANIM_Komisyon"(id) ON DELETE CASCADE,
    sablon_id BIGINT REFERENCES "TANIM_Sablon"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "TANIM_KikLimitDonemleri" (
    id BIGSERIAL PRIMARY KEY,
    yil INTEGER NOT NULL,
    madde_22_d_buyuksehir NUMERIC(15, 2) NOT NULL,
    madde_22_d_diger NUMERIC(15, 2) NOT NULL,
    madde_21_f NUMERIC(15, 2) NOT NULL,
    yururluk_tarihi DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. DOĞRUDAN TEMİN & HAKEDİŞ ANA İŞLEM TABLOLARI (DATA_*)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "DATA_TeminDosyasi" (
    id BIGSERIAL PRIMARY KEY,
    temin_no TEXT,
    dosya_acilis_tarihi DATE DEFAULT CURRENT_DATE,
    butce_yili INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    butce_tipi TEXT,
    konu TEXT NOT NULL,
    isin_aciklamasi TEXT,
    birim_id BIGINT REFERENCES "TANIM_Birim"(id) ON DELETE SET NULL,
    antet_ek_satir TEXT,
    sunulacak_makam TEXT,
    ihtiyac_yeri TEXT,
    e_butce TEXT,
    say2000i TEXT,
    fonksiyonel_kod TEXT,
    muhasebe_birimi TEXT,
    harcama_birimi TEXT,
    finansman_kodu TEXT,
    ekonomik_kod TEXT,
    ihale_tipi TEXT DEFAULT 'Doğrudan Temin',
    tur TEXT NOT NULL DEFAULT 'mal',
    ihale_sekli TEXT DEFAULT '22/d',
    teklif_sozlesme_turu TEXT DEFAULT 'Birim Fiyat',
    alt_yuklenici_olacak_mi INTEGER DEFAULT 0,
    kismi_teklif_verilecek_mi INTEGER DEFAULT 0,
    fiyat_farki_dayanagi TEXT,
    yatirim_proje_no TEXT,
    avans_verilecek_mi INTEGER DEFAULT 0,
    yillara_yaygin INTEGER DEFAULT 0,
    sozlesme_yapilacak_mi INTEGER DEFAULT 0,
    isin_aciklama_maddeleri JSONB DEFAULT '[]'::jsonb,
    yaklasik_maliyet_hesaplamasi TEXT,
    yaklasik_maliyet_kdv_dahil_mi INTEGER DEFAULT 0,
    kdv TEXT DEFAULT '20',
    hesaplama_esasi TEXT,
    komisyon_takdiri TEXT,
    tibbi_cihaz_alimi_mi INTEGER DEFAULT 0,
    irtibat_yetkilisi_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE SET NULL,
    son_teklif_verme_tarihi TIMESTAMPTZ,
    teslim_tarihi DATE,
    yaklasik_maliyet NUMERIC(15, 2) DEFAULT 0,
    kesinti_damga NUMERIC(15, 2) DEFAULT 0,
    kesinti_karar_pulu NUMERIC(15, 2) DEFAULT 0,
    kesinti_kdv_tevkifat NUMERIC(15, 2) DEFAULT 0,
    net_odenen NUMERIC(15, 2) DEFAULT 0,
    butce_kodu TEXT,
    temin_tarihi DATE,
    firma_id BIGINT REFERENCES "TANIM_Firma"(id) ON DELETE SET NULL,
    onay_personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE SET NULL,
    hazirlayan_personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE SET NULL,
    talep_eden_personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE SET NULL,
    sunan_personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE SET NULL,
    durum_asama_id BIGINT REFERENCES "TANIM_Asama"(id) ON DELETE SET NULL,
    mevzuat_id BIGINT REFERENCES "TANIM_Mevzuat"(id) ON DELETE SET NULL,
    surec_taslak_id BIGINT REFERENCES "TANIM_SurecTaslak"(id) ON DELETE SET NULL,
    ordered_docs JSONB DEFAULT '[]'::jsonb,
    starred_docs JSONB DEFAULT '[]'::jsonb,
    skipped_docs JSONB DEFAULT '[]'::jsonb,
    notlar TEXT,
    tekrar_no INTEGER DEFAULT 1,
    status TEXT DEFAULT 'devam_ediyor',
    is_deleted INTEGER DEFAULT 0,
    ekap_no TEXT,
    is_ekap_sent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DATA_TeminKalem" (
    id BIGSERIAL PRIMARY KEY,
    temin_id BIGINT REFERENCES "DATA_TeminDosyasi"(id) ON DELETE CASCADE,
    kalem_id BIGINT REFERENCES "TANIM_Kalem"(id) ON DELETE SET NULL,
    sira_no INTEGER DEFAULT 1,
    kalem_adi TEXT NOT NULL,
    miktar NUMERIC(15, 4) NOT NULL DEFAULT 1,
    olcu_birimi TEXT NOT NULL,
    tasinir_kod TEXT,
    okas_kod TEXT,
    kdv_orani NUMERIC(5, 2) DEFAULT 20.00,
    yaklasik_maliyet_birim NUMERIC(15, 4) DEFAULT 0,
    yaklasik_maliyet_toplam NUMERIC(15, 2) DEFAULT 0,
    teknik_ozellikler TEXT,
    marka_model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DATA_TeminFirma" (
    id BIGSERIAL PRIMARY KEY,
    temin_id BIGINT REFERENCES "DATA_TeminDosyasi"(id) ON DELETE CASCADE,
    firma_id BIGINT REFERENCES "TANIM_Firma"(id) ON DELETE CASCADE,
    teklif_istendi_mi BOOLEAN DEFAULT true,
    teklif_verdi_mi BOOLEAN DEFAULT false,
    teklif_tarihi DATE,
    toplam_teklif_tutari NUMERIC(15, 2) DEFAULT 0,
    kazandi_mi BOOLEAN DEFAULT false,
    notlar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DATA_TeminKalemTeklif" (
    id BIGSERIAL PRIMARY KEY,
    temin_id BIGINT REFERENCES "DATA_TeminDosyasi"(id) ON DELETE CASCADE,
    kalem_id BIGINT REFERENCES "DATA_TeminKalem"(id) ON DELETE CASCADE,
    temin_firma_id BIGINT REFERENCES "DATA_TeminFirma"(id) ON DELETE CASCADE,
    birim_fiyat NUMERIC(15, 4) NOT NULL DEFAULT 0,
    toplam_fiyat NUMERIC(15, 2) NOT NULL DEFAULT 0,
    kdv_dahil_mi BOOLEAN DEFAULT false,
    uygun_mu BOOLEAN DEFAULT true,
    aciklama TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DATA_TeminKomisyon" (
    id BIGSERIAL PRIMARY KEY,
    temin_id BIGINT REFERENCES "DATA_TeminDosyasi"(id) ON DELETE CASCADE,
    personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE CASCADE,
    gorev_kod TEXT,
    asl_yedek TEXT DEFAULT 'ASIL',
    sira INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "DATA_TeminBelge" (
    id BIGSERIAL PRIMARY KEY,
    temin_id BIGINT REFERENCES "DATA_TeminDosyasi"(id) ON DELETE CASCADE,
    belge_kod TEXT NOT NULL,
    belge_adi TEXT NOT NULL,
    dosya_yolu TEXT,
    dosya_boyutu BIGINT,
    mime_type TEXT,
    storage_bucket TEXT DEFAULT 'hakim-pro-documents',
    storage_path TEXT,
    olusturulma_tarihi TIMESTAMPTZ DEFAULT NOW(),
    olusturan_personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "DATA_TIF" (
    id BIGSERIAL PRIMARY KEY,
    temin_id BIGINT REFERENCES "DATA_TeminDosyasi"(id) ON DELETE SET NULL,
    ambar_id BIGINT REFERENCES "TANIM_Ambar"(id) ON DELETE SET NULL,
    tif_no TEXT NOT NULL,
    tif_tarihi DATE DEFAULT CURRENT_DATE,
    hareket_turu TEXT DEFAULT 'Giris',
    fatura_no TEXT,
    fatura_tarihi DATE,
    teslim_eden_personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE SET NULL,
    teslim_alan_personel_id BIGINT REFERENCES "TANIM_Personel"(id) ON DELETE SET NULL,
    toplam_tutar NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DATA_TIF_Kalem" (
    id BIGSERIAL PRIMARY KEY,
    tif_id BIGINT REFERENCES "DATA_TIF"(id) ON DELETE CASCADE,
    kalem_id BIGINT REFERENCES "TANIM_Kalem"(id) ON DELETE SET NULL,
    miktar NUMERIC(15, 4) NOT NULL,
    birim_fiyat NUMERIC(15, 4) NOT NULL,
    kdv_orani NUMERIC(5, 2) DEFAULT 20.00,
    toplam_tutar NUMERIC(15, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS "DATA_AmbarStok" (
    id BIGSERIAL PRIMARY KEY,
    ambar_id BIGINT REFERENCES "TANIM_Ambar"(id) ON DELETE CASCADE,
    kalem_id BIGINT REFERENCES "TANIM_Kalem"(id) ON DELETE CASCADE,
    mevcut_miktar NUMERIC(15, 4) NOT NULL DEFAULT 0,
    kritik_stok_seviyesi NUMERIC(15, 4) DEFAULT 0,
    son_giris_tarihi TIMESTAMPTZ,
    son_cikis_tarihi TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DATA_DosyaSablonVeri" (
    id BIGSERIAL PRIMARY KEY,
    temin_id BIGINT REFERENCES "DATA_TeminDosyasi"(id) ON DELETE CASCADE,
    sablon_kod TEXT NOT NULL,
    veri_json JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "LOG_SystemLog" (
    id BIGSERIAL PRIMARY KEY,
    seviye TEXT NOT NULL,
    kategori TEXT,
    mesaj TEXT NOT NULL,
    detay JSONB,
    kullanici_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "app_backups" (
    id BIGSERIAL PRIMARY KEY,
    backup_name TEXT NOT NULL,
    file_size BIGINT,
    storage_path TEXT NOT NULL,
    backup_type TEXT DEFAULT 'full_sqlite',
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. GÜNCELLEME VE AUDIT TETİKLEYİCİLERİ (TRIGGERS)
-- ============================================================================

DROP TRIGGER IF EXISTS update_temin_dosyasi_modtime ON "DATA_TeminDosyasi";
CREATE TRIGGER update_temin_dosyasi_modtime BEFORE UPDATE ON "DATA_TeminDosyasi" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kurum_modtime ON "TANIM_Kurum";
CREATE TRIGGER update_kurum_modtime BEFORE UPDATE ON "TANIM_Kurum" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_birim_modtime ON "TANIM_Birim";
CREATE TRIGGER update_birim_modtime BEFORE UPDATE ON "TANIM_Birim" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personel_modtime ON "TANIM_Personel";
CREATE TRIGGER update_personel_modtime BEFORE UPDATE ON "TANIM_Personel" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_firma_modtime ON "TANIM_Firma";
CREATE TRIGGER update_firma_modtime BEFORE UPDATE ON "TANIM_Firma" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit log triggerları
DROP TRIGGER IF EXISTS audit_temin_dosyasi ON "DATA_TeminDosyasi";
CREATE TRIGGER audit_temin_dosyasi AFTER INSERT OR UPDATE OR DELETE ON "DATA_TeminDosyasi" FOR EACH ROW EXECUTE FUNCTION log_audit_trail_func();

DROP TRIGGER IF EXISTS audit_temin_kalem ON "DATA_TeminKalem";
CREATE TRIGGER audit_temin_kalem AFTER INSERT OR UPDATE OR DELETE ON "DATA_TeminKalem" FOR EACH ROW EXECUTE FUNCTION log_audit_trail_func();

DROP TRIGGER IF EXISTS audit_temin_teklif ON "DATA_TeminKalemTeklif";
CREATE TRIGGER audit_temin_teklif AFTER INSERT OR UPDATE OR DELETE ON "DATA_TeminKalemTeklif" FOR EACH ROW EXECUTE FUNCTION log_audit_trail_func();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ============================================================================

ALTER TABLE "DATA_TeminDosyasi" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DATA_TeminKalem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DATA_TeminFirma" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DATA_TeminKalemTeklif" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DATA_TeminKomisyon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DATA_TeminBelge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DATA_TIF" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DATA_TIF_Kalem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DATA_AmbarStok" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DATA_DosyaSablonVeri" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TANIM_Kurum" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TANIM_Birim" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TANIM_Personel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TANIM_Firma" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_backups" ENABLE ROW LEVEL SECURITY;

-- Anon / Authenticated Temel Erişim Politikaları (Kurulum kolaylığı için hem anon hem authenticated izinli)
DROP POLICY IF EXISTS "Genel temin dosyaları politikası" ON "DATA_TeminDosyasi";
CREATE POLICY "Genel temin dosyaları politikası" ON "DATA_TeminDosyasi" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Genel temin kalemleri politikası" ON "DATA_TeminKalem";
CREATE POLICY "Genel temin kalemleri politikası" ON "DATA_TeminKalem" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Genel temin firmaları politikası" ON "DATA_TeminFirma";
CREATE POLICY "Genel temin firmaları politikası" ON "DATA_TeminFirma" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Genel teklifler politikası" ON "DATA_TeminKalemTeklif";
CREATE POLICY "Genel teklifler politikası" ON "DATA_TeminKalemTeklif" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Genel belgeler politikası" ON "DATA_TeminBelge";
CREATE POLICY "Genel belgeler politikası" ON "DATA_TeminBelge" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Genel kurum politikası" ON "TANIM_Kurum";
CREATE POLICY "Genel kurum politikası" ON "TANIM_Kurum" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Genel birim politikası" ON "TANIM_Birim";
CREATE POLICY "Genel birim politikası" ON "TANIM_Birim" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Genel personel politikası" ON "TANIM_Personel";
CREATE POLICY "Genel personel politikası" ON "TANIM_Personel" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Genel firma politikası" ON "TANIM_Firma";
CREATE POLICY "Genel firma politikası" ON "TANIM_Firma" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Genel yedekler politikası" ON "app_backups";
CREATE POLICY "Genel yedekler politikası" ON "app_backups" FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 8. SUPABASE STORAGE BUCKET YAPILANDIRMASI
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('hakim-pro-documents', 'hakim-pro-documents', false, 104857600, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'application/zip']),
  ('hakim-pro-backups', 'hakim-pro-backups', false, 524288000, ARRAY['application/octet-stream', 'application/zip', 'application/x-sqlite3'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Belge okuma politikası" ON storage.objects;
CREATE POLICY "Belge okuma politikası" ON storage.objects FOR SELECT USING (bucket_id IN ('hakim-pro-documents', 'hakim-pro-backups'));

DROP POLICY IF EXISTS "Belge yükleme politikası" ON storage.objects;
CREATE POLICY "Belge yükleme politikası" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('hakim-pro-documents', 'hakim-pro-backups'));

DROP POLICY IF EXISTS "Belge güncelleme ve silme politikası" ON storage.objects;
CREATE POLICY "Belge güncelleme ve silme politikası" ON storage.objects FOR ALL USING (bucket_id IN ('hakim-pro-documents', 'hakim-pro-backups'));
