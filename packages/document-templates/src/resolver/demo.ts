import { DatabaseSync } from 'node:sqlite';
import { resolveTemplateData } from './mappingResolver';
import { ProcessMapping } from './types';

import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';

const dbPath = join(__dirname, 'demo.db');

// Delete existing DB file if it exists to start fresh
if (existsSync(dbPath)) {
  try {
    unlinkSync(dbPath);
  } catch (err) {
    // Ignore error if file is locked or cannot be deleted
  }
}

const db = new DatabaseSync(dbPath);

// 2. Create tables
db.exec(`
  CREATE TABLE TANIM_Kurum (
    id INTEGER PRIMARY KEY,
    kurum_anteti TEXT,
    detsis_kodu TEXT,
    makam_adi TEXT,
    adres TEXT,
    telefon TEXT,
    faks TEXT,
    web_sitesi TEXT,
    eposta TEXT,
    kep_adresi TEXT
  );
`);

db.exec(`
  CREATE TABLE DATA_TeminDosyasi (
    id INTEGER PRIMARY KEY,
    butce_yili TEXT,
    temin_no_clean TEXT,
    ihtiyac_yeri TEXT,
    isin_aciklamasi TEXT
  );
`);

db.exec(`
  CREATE TABLE DATA_TeminKalem (
    id INTEGER PRIMARY KEY,
    temin_dosya_id INTEGER,
    tasinir_kodu TEXT,
    kalem_adi TEXT,
    aciklama TEXT,
    birim TEXT,
    kdv_orani INTEGER,
    miktar INTEGER
  );
`);

// 3. Insert mock data
const insertKurum = db.prepare(`
  INSERT INTO TANIM_Kurum (id, kurum_anteti, detsis_kodu, makam_adi, adres, telefon, faks, web_sitesi, eposta, kep_adresi)
  VALUES (1, ?, '95240212', 'İl Sağlık Müdürlüğüne', 'Mustafa Kemal Mah. No:1 Ankara', '0312 555 44 33', '0312 555 44 34', 'www.saglik.gov.tr', 'eposta@saglik.gov.tr', 'kep@hs01.kep.tr')
`);
insertKurum.run(JSON.stringify([
  "T.C.",
  "SAĞLIK BAKANLIĞI",
  "Ankara İl Sağlık Müdürlüğü"
]));

const insertDosya = db.prepare(`
  INSERT INTO DATA_TeminDosyasi (id, butce_yili, temin_no_clean, ihtiyac_yeri, isin_aciklamasi)
  VALUES (100, '2026', '123', 'Poliklinik Hizmetleri', 'Laboratuvar Malzemeleri Alımı')
`);
insertDosya.run();

const insertKalem = db.prepare(`
  INSERT INTO DATA_TeminKalem (temin_dosya_id, tasinir_kodu, kalem_adi, aciklama, birim, kdv_orani, miktar)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
insertKalem.run(100, 'LAB-001', 'Eldiven', 'Nitril', 'Kutu', 20, 50);
insertKalem.run(100, 'LAB-002', 'Maske', 'N95', 'Adet', 10, 200);

// 4. Define mapping (as provided by the user)
const IhtiyacListesiMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Dosyanın antet satırları'
  },
  dosyaKonusu: { deger: 'İhtiyaç Listesi', aciklama: 'Belge Başlığı / Konusu' },
  evrakSayisi: {
    formul: '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no_clean}}',
    aciklama: 'DETSİS No - Yıl - Dosya No birleşimi'
  },
  sunulacakMakamAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'makam_adi',
    aciklama: 'Sunulacak makam adı'
  },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      kodu: 'tasinir_kodu',
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      kdvOrani: 'kdv_orani',
      miktar: 'miktar'
    },
    aciklama: 'İhtiyaç listesi kalemleri'
  },
  ihtiyacYeri: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihtiyac_yeri',
    aciklama: 'İhtiyaç listesi yerleri'
  },
  isinAciklamasi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'İşin Açıklaması'
  },
  olurYazisi: { deger: true, aciklama: 'Olur yazısı oluşturulacak' },
  kurumIci: { deger: true, aciklama: 'Kurum içi mi?' },
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum telefonu' },
  kurumWeb: { tablo: 'TANIM_Kurum', sutun: 'web_sitesi', aciklama: 'Kurum web sitesi' }
};

// 5. Query execution helper matching resolver signature
const queryExecutor = async (sql: string, params: any[]): Promise<any[]> => {
  const statement = db.prepare(sql);
  return statement.all(...params);
};

// 6. Run Resolver
async function runDemo() {
  console.log("🚀 Veritabanı Eşleştirme Çözümleyicisi Başlatılıyor...");
  console.log("Sorgulanan Dosya ID: 100\n");

  const payload = await resolveTemplateData(IhtiyacListesiMapping, 100, queryExecutor);
  
  console.log("✅ Çözümlenen Şablon Değişkenleri (JSON):");
  console.log(JSON.stringify(payload, null, 2));
}

runDemo().catch(console.error);
