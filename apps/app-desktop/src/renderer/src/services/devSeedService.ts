/**
 * Geliştirici ve Test Modu Veri Tohumlama (Database Seeder) Servisi
 * TEMİN 360 - Kurum, Birim, Personel, Firma, Kalem ve Dosya Süreçlerini Gerçekçi Verilerle Doldurur.
 */

export interface SeedResult {
  success: boolean
  message: string
  details?: {
    kurumUpdated?: boolean
    birimlerCount?: number
    personelCount?: number
    firmalarCount?: number
    kalemlerCount?: number
    komisyonlarCount?: number
    ambarCount?: number
    dosyalarEnrichedCount?: number
    totalRecordsInserted?: number
  }
}

export const devSeedService = {
  /**
   * Tek tıkla tüm sistemi kapsamlı test verisiyle doldurur.
   */
  async seedAll(): Promise<SeedResult> {
    try {
      const details: SeedResult['details'] = {
        kurumUpdated: false,
        birimlerCount: 0,
        personelCount: 0,
        firmalarCount: 0,
        kalemlerCount: 0,
        komisyonlarCount: 0,
        ambarCount: 0,
        dosyalarEnrichedCount: 0,
        totalRecordsInserted: 0
      }

      // 1. Kurum Bilgilerini Doldur / Güncelle
      await this.seedKurum()
      details.kurumUpdated = true

      // 2. Birimleri Doldur
      const birimIds = await this.seedBirimler()
      details.birimlerCount = birimIds.length

      // 3. Personelleri Doldur
      const personelIds = await this.seedPersonel()
      details.personelCount = personelIds.length

      // 4. Firmaları Doldur
      const firmaIds = await this.seedFirmalar()
      details.firmalarCount = firmaIds.length

      // 5. Kalem Havuzunu (Malzeme/Hizmet/Yapım) Doldur
      const kalemIds = await this.seedKalemler()
      details.kalemlerCount = kalemIds.length

      // 6. Komisyon ve Ambar Tanımlarını Doldur
      await this.seedKomisyonlarVeAmbarlar()
      details.komisyonlarCount = 3
      details.ambarCount = 2

      // 7. Mevcut Açık Doğrudan Temin Dosyalarına Kalem, Teklif ve Komisyon Ekle
      const enrichedCount = await this.enrichExistingDosyalar(firmaIds, personelIds, birimIds)
      details.dosyalarEnrichedCount = enrichedCount

      return {
        success: true,
        message: 'Tüm sistem ve açık temin dosyaları başarıyla test verileriyle dolduruldu!',
        details
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Bilinmeyen hata'
      console.error('[devSeedService] Hata:', error)
      return {
        success: false,
        message: `Tohumlama başarısız oldu: ${errMsg}`
      }
    }
  },

  /**
   * Kurum bilgilerini günceller
   */
  async seedKurum(): Promise<void> {
    const kurumCheck = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id FROM TANIM_Kurum LIMIT 1'
    )
    if (kurumCheck.success && kurumCheck.data && kurumCheck.data.length > 0) {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Kurum SET 
          kurum_adi = ?, 
          makam_adi = ?, 
          ust_kurum_adi = ?, 
          il = ?, 
          ilce = ?, 
          adres = ?, 
          telefon = ?, 
          eposta = ?, 
          web_sitesi = ?, 
          say2000i_kodu = ?, 
          ebutce_kodu = ?, 
          harcama_birim_adi = ?,
          harcama_birim_kodu = ?,
          muhasebe_birim_adi = ?,
          muhasebe_birim_kodu = ?
        WHERE id = ?`,
        [
          'T.C. ANKARA VALİLİĞİ İL DESTEK VE İDARİ HİZMETLER MÜDÜRLÜĞÜ',
          'VALİLİK MAKAMINA',
          'T.C. İÇİŞLERİ BAKANLIĞI',
          'Ankara',
          'Çankaya',
          'İsmet İnönü Bulvarı No:42 Bakanlıklar / Çankaya / ANKARA',
          '0312 419 00 00',
          'destek.ankara@icisleri.gov.tr',
          'https://ankara.gov.tr',
          '06.01.00.04',
          '06.24.01.00',
          'İdari ve Mali İşler Şube Müdürlüğü',
          '1001',
          'Ankara Defterdarlığı Muhasebe Müdürlüğü',
          '06001',
          kurumCheck.data[0].id
        ]
      )
    } else {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Kurum (
          kurum_adi, makam_adi, ust_kurum_adi, il, ilce, adres, telefon, eposta, web_sitesi, 
          say2000i_kodu, ebutce_kodu, harcama_birim_adi, harcama_birim_kodu, muhasebe_birim_adi, muhasebe_birim_kodu, limit_tipi, finansman_kodu
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'T.C. ANKARA VALİLİĞİ İL DESTEK VE İDARİ HİZMETLER MÜDÜRLÜĞÜ',
          'VALİLİK MAKAMINA',
          'T.C. İÇİŞLERİ BAKANLIĞI',
          'Ankara',
          'Çankaya',
          'İsmet İnönü Bulvarı No:42 Bakanlıklar / Çankaya / ANKARA',
          '0312 419 00 00',
          'destek.ankara@icisleri.gov.tr',
          'https://ankara.gov.tr',
          '06.01.00.04',
          '06.24.01.00',
          'İdari ve Mali İşler Şube Müdürlüğü',
          '1001',
          'Ankara Defterdarlığı Muhasebe Müdürlüğü',
          '06001',
          'diger',
          '5'
        ]
      )
    }
  },

  /**
   * Birimleri ekler
   */
  async seedBirimler(): Promise<number[]> {
    const birimList = [
      {
        ad: 'İdari ve Mali İşler Şube Müdürlüğü',
        kisa_ad: 'İMİD',
        birim_adi: 'İdari ve Mali İşler Şube Müdürlüğü'
      },
      {
        ad: 'Destek Hizmetleri Şube Müdürlüğü',
        kisa_ad: 'DHŞM',
        birim_adi: 'Destek Hizmetleri Şube Müdürlüğü'
      },
      {
        ad: 'Bilgi İşlem Şube Müdürlüğü',
        kisa_ad: 'BİŞM',
        birim_adi: 'Bilgi İşlem Şube Müdürlüğü'
      },
      {
        ad: 'Strateji Geliştirme Şube Müdürlüğü',
        kisa_ad: 'SGŞM',
        birim_adi: 'Strateji Geliştirme Şube Müdürlüğü'
      },
      {
        ad: 'Teknik ve Bakım Onarım Birimi',
        kisa_ad: 'TBOB',
        birim_adi: 'Teknik ve Bakım Onarım Birimi'
      }
    ]

    const ids: number[] = []
    for (const b of birimList) {
      const existing = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Birim WHERE birim_adi = ? OR ad = ? LIMIT 1',
        [b.birim_adi, b.ad]
      )
      if (existing.success && existing.data && existing.data.length > 0) {
        ids.push(existing.data[0].id)
      } else {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Birim (ad, kisa_ad, birim_adi, aktif_mi) VALUES (?, ?, ?, 1)`,
          [b.ad, b.kisa_ad, b.birim_adi]
        )
        if (res.success && res.lastInsertRowid) {
          ids.push(Number(res.lastInsertRowid))
        }
      }
    }
    return ids
  },

  /**
   * Personel havuzunu ekler
   */
  async seedPersonel(): Promise<number[]> {
    const personelList = [
      {
        ad_soyad: 'Dr. Ahmet Yılmaz',
        unvan: 'İl Müdürü (Harcama Yetkilisi)',
        birim: 'İl Müdürlüğü',
        sicil: '10482',
        tel: '0532 100 0001',
        ep: 'ahmet.yilmaz@icisleri.gov.tr'
      },
      {
        ad_soyad: 'Mehmet Ali Özkan',
        unvan: 'Şube Müdürü (Gerçekleştirme Görevlisi)',
        birim: 'İdari ve Mali İşler',
        sicil: '12490',
        tel: '0533 200 0002',
        ep: 'mehmet.ozkan@icisleri.gov.tr'
      },
      {
        ad_soyad: 'Ayşe Kaya Demir',
        unvan: 'Şube Müdürü (Piyasa Araştırma Başkanı)',
        birim: 'Destek Hizmetleri',
        sicil: '14820',
        tel: '0535 300 0003',
        ep: 'ayse.kaya@icisleri.gov.tr'
      },
      {
        ad_soyad: 'Mustafa Çelik',
        unvan: 'Bilgisayar Mühendisi (Üye)',
        birim: 'Bilgi İşlem',
        sicil: '18902',
        tel: '0542 400 0004',
        ep: 'mustafa.celik@icisleri.gov.tr'
      },
      {
        ad_soyad: 'Fatma Şahin Korkmaz',
        unvan: 'Mali Hizmetler Uzmanı (Üye)',
        birim: 'Strateji Geliştirme',
        sicil: '16734',
        tel: '0544 500 0005',
        ep: 'fatma.sahin@icisleri.gov.tr'
      },
      {
        ad_soyad: 'Emre Karaca',
        unvan: 'Elektrik Teknikeri (Muayene Kabul Başkanı)',
        birim: 'Teknik ve Bakım Onarım',
        sicil: '20194',
        tel: '0555 600 0006',
        ep: 'emre.karaca@icisleri.gov.tr'
      },
      {
        ad_soyad: 'Zeynep Aktaş',
        unvan: 'V.H.K.İ. (Taşınır Kayıt Yetkilisi)',
        birim: 'İdari ve Mali İşler',
        sicil: '21045',
        tel: '0505 700 0007',
        ep: 'zeynep.aktas@icisleri.gov.tr'
      }
    ]

    const ids: number[] = []
    for (const p of personelList) {
      const existing = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Personel WHERE ad_soyad = ? LIMIT 1',
        [p.ad_soyad]
      )
      if (existing.success && existing.data && existing.data.length > 0) {
        ids.push(existing.data[0].id)
      } else {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Personel (ad_soyad, unvan, birim, sicil_no, telefon, eposta, aktif_mi) VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [p.ad_soyad, p.unvan, p.birim, p.sicil, p.tel, p.ep]
        )
        if (res.success && res.lastInsertRowid) {
          ids.push(Number(res.lastInsertRowid))
        }
      }
    }
    return ids
  },

  /**
   * Tedarikçi / İstekli Firmaları ekler
   */
  async seedFirmalar(): Promise<number[]> {
    const firmaList = [
      {
        unvan: 'Anadolu Bilişim ve Teknoloji Sistemleri San. ve Tic. Ltd. Şti.',
        kod: 'FRM-001',
        ilgili: 'Kaan Yıldırım',
        vno: '0680459201',
        vd: 'Çankaya V.D.',
        tel: '0312 444 10 20',
        ep: 'satis@anadolubilisim.com.tr',
        adr: 'Kızılay Mah. Gazi Mustafa Kemal Bulv. No:84/A Çankaya / Ankara'
      },
      {
        unvan: 'Boğaziçi Kırtasiye Ofis ve Büro Malzemeleri Pazarlama A.Ş.',
        kod: 'FRM-002',
        ilgili: 'Burak Demirtaş',
        vno: '1840294819',
        vd: 'Ulus V.D.',
        tel: '0312 310 40 50',
        ep: 'kurumsal@bogazicikirtasiye.com.tr',
        adr: 'Rüzgarlı Cad. İpek Sok. No:12 Altındağ / Ankara'
      },
      {
        unvan: 'Marmara Medikal Sağlık ve Laboratuvar Ürünleri Ltd. Şti.',
        kod: 'FRM-003',
        ilgili: 'Dr. Selin Aydın',
        vno: '5920194820',
        vd: 'Yenimahalle V.D.',
        tel: '0312 395 70 80',
        ep: 'ihale@marmaramedikal.com.tr',
        adr: 'Ostim OSB 1200. Cadde No:45 Yenimahalle / Ankara'
      },
      {
        unvan: 'Başkent İnşaat, Tadilat ve Mühendislik Hizmetleri Tic. Ltd. Şti.',
        kod: 'FRM-004',
        ilgili: 'Engin Vural',
        vno: '1402948102',
        vd: 'Hitit V.D.',
        tel: '0312 284 30 00',
        ep: 'proje@baskentinsaat.com.tr',
        adr: 'Mustafa Kemal Mah. 2118. Cad. No:14 Çankaya / Ankara'
      },
      {
        unvan: 'Ege Teknik Endüstriyel Hırdavat ve Temizlik Malzemeleri A.Ş.',
        kod: 'FRM-005',
        ilgili: 'Murat Çetin',
        vno: '3290481029',
        vd: 'Sincan V.D.',
        tel: '0312 270 90 90',
        ep: 'info@egeteknik.com.tr',
        adr: 'İvedik OSB Ağaç İşleri Sanayi Sitesi 1354. Cadde No:8 Yenimahalle / Ankara'
      }
    ]

    const ids: number[] = []
    for (const f of firmaList) {
      const existing = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Firma WHERE unvan = ? OR vergi_no = ? LIMIT 1',
        [f.unvan, f.vno]
      )
      if (existing.success && existing.data && existing.data.length > 0) {
        ids.push(existing.data[0].id)
      } else {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Firma (
            unvan, firma_kodu, ilgili_adi, vergi_no, vergi_dairesi, telefon, email, adres, il, ilce, aktif_mi, kalite_skoru, deneyim_skoru
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 5, 5)`,
          [f.unvan, f.kod, f.ilgili, f.vno, f.vd, f.tel, f.ep, f.adr, 'Ankara', 'Çankaya']
        )
        if (res.success && res.lastInsertRowid) {
          ids.push(Number(res.lastInsertRowid))
        }
      }
    }
    return ids
  },

  /**
   * Malzeme, Hizmet ve Yapım Kalemleri Havuzunu Doldurur
   */
  async seedKalemler(): Promise<number[]> {
    const kalemList = [
      {
        barkod: '8690001001',
        ad: 'A4 80 gr/m² Beyaz Fotokopi Kağıdı (500 Yaprak / Paket)',
        tip: 'Mal',
        birim: 'Paket',
        kdv: 20,
        tkod: '150.01.01.01',
        okas: '30197630-1'
      },
      {
        barkod: '8690001002',
        ad: 'Siyah Lazer Toner Kartuşu (Yüksek Kapasiteli)',
        tip: 'Mal',
        birim: 'Adet',
        kdv: 20,
        tkod: '150.01.02.04',
        okas: '30125100-2'
      },
      {
        barkod: '8690001003',
        ad: 'Masaüstü İş İstasyonu Bilgisayar Seti (Intel i7, 32GB RAM, 1TB NVMe SSD)',
        tip: 'Mal',
        birim: 'Set',
        kdv: 20,
        tkod: '255.02.01.01',
        okas: '30213000-5'
      },
      {
        barkod: '8690001004',
        ad: '27 inç IPS QHD Profesyonel Monitör',
        tip: 'Mal',
        birim: 'Adet',
        kdv: 20,
        tkod: '255.02.01.02',
        okas: '30231300-0'
      },
      {
        barkod: '8690001005',
        ad: 'Ergonomik Fileli Personel Çalışma Koltuğu',
        tip: 'Mal',
        birim: 'Adet',
        kdv: 20,
        tkod: '255.03.01.01',
        okas: '39112000-0'
      },
      {
        barkod: '8690001006',
        ad: 'İklimlendirme & Split Klima Periyodik Bakım ve Gaz Dolum Hizmeti',
        tip: 'Hizmet',
        birim: 'Adet',
        kdv: 20,
        tkod: '150.08.01.01',
        okas: '50730000-1'
      },
      {
        barkod: '8690001007',
        ad: 'Kurumsal Sunucu ve Ağ Güvenlik Duvarı Yıllık Yazılım Lisansı',
        tip: 'Hizmet',
        birim: 'Yıl',
        kdv: 20,
        tkod: '260.01.01.01',
        okas: '48218000-9'
      },
      {
        barkod: '8690001008',
        ad: 'İdari Hizmet Binası Katları İç Cephe Boya ve Alçı Tadilat Yapım İşi',
        tip: 'Yapım',
        birim: 'm²',
        kdv: 20,
        tkod: '252.01.01.01',
        okas: '45442110-1'
      },
      {
        barkod: '8690001009',
        ad: 'Sıvı El Sabunu ve Endüstriyel Hijyen Temizlik Seti',
        tip: 'Mal',
        birim: 'Koli',
        kdv: 20,
        tkod: '150.05.01.01',
        okas: '39831200-8'
      },
      {
        barkod: '8690001010',
        ad: 'Jeneratör Yıllık Filtre, Yağ Değişimi ve Ağır Bakım Hizmeti',
        tip: 'Hizmet',
        birim: 'Adet',
        kdv: 20,
        tkod: '150.08.02.01',
        okas: '50532300-6'
      }
    ]

    const ids: number[] = []
    for (const k of kalemList) {
      const existing = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Kalem WHERE barkod_id = ? OR kalem_adi = ? LIMIT 1',
        [k.barkod, k.ad]
      )
      if (existing.success && existing.data && existing.data.length > 0) {
        ids.push(existing.data[0].id)
      } else {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Kalem (
            barkod_id, kalem_adi, tipi, birim, kdv_orani, tasinir_kodu, okas_kodu, aktif_mi
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [k.barkod, k.ad, k.tip, k.birim, k.kdv, k.tkod, k.okas]
        )
        if (res.success && res.lastInsertRowid) {
          ids.push(Number(res.lastInsertRowid))
        }
      }
    }
    return ids
  },

  /**
   * Komisyon ve Ambar tanımlarını ekler
   */
  async seedKomisyonlarVeAmbarlar(): Promise<void> {
    const ambarlar = [
      {
        ad: 'Merkez Ana Malzeme ve Tüketim Ambarı',
        aciklama: 'Hizmet Binası B1 Katı',
        tasinir_kodu: 'AMB-01'
      },
      {
        ad: 'Bilgi İşlem ve Teknik Donanım Ambarı',
        aciklama: 'Hizmet Binası 3. Kat',
        tasinir_kodu: 'AMB-02'
      }
    ]
    for (const amb of ambarlar) {
      const ex = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Ambar WHERE ambar_adi = ? LIMIT 1',
        [amb.ad]
      )
      if (!ex.success || !ex.data || ex.data.length === 0) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Ambar (ambar_adi, aciklama, tasinir_kodu, aktif_mi) VALUES (?, ?, ?, 1)`,
          [amb.ad, amb.aciklama, amb.tasinir_kodu]
        )
      }
    }
  },

  /**
   * Mevcut açık Doğrudan Temin Dosyalarını 3 farklı birimde (Mal Alımı, Hizmet Alımı, Yapım İşi) zenginleştirir.
   */
  async enrichExistingDosyalar(
    firmaIds: number[],
    personelIds: number[],
    birimIds: number[] = []
  ): Promise<number> {
    const dosyalarRes = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT * FROM DATA_TeminDosyasi WHERE is_deleted = 0 ORDER BY id ASC'
    )
    let dosyalar = dosyalarRes.success && Array.isArray(dosyalarRes.data) ? dosyalarRes.data : []

    // 3 Temel Doğrudan Temin Dosyası Şablonu (Farklı Birimler + Farklı Alım Türleri)
    const predefinedDosyalar = [
      {
        temin_no: 'DT-2026/1',
        konu: '2026 Yılı 1. Çeyrek Kırtasiye ve Büro Tüketim Malzemeleri Alımı',
        isin_aciklamasi:
          'Birimlerimizin acil kırtasiye, kağıt ve sarf malzeme ihtiyacı için 4734 sayılı KİK 22/d doğrudan temin usulü mal alımı.',
        tur: 'mal',
        birim_id: birimIds[0] || null, // İdari ve Mali İşler Şube Müdürlüğü
        ihtiyac_yeri: 'İdari ve Mali İşler Şube Müdürlüğü / Merkez Bina Ambarı',
        butce_kodu: '03.2.1.01 Kırtasiye ve Büro Malzemesi Alımları',
        butce_yili: 2026,
        butce_tipi: 'Genel Bütçe',
        ihale_sekli: '4734 Sayılı KİK Md. 22/d (Doğrudan Temin)',
        ihale_tipi: 'Doğrudan Temin'
      },
      {
        temin_no: 'DT-2026/2',
        konu: 'Hizmet Binası İklimlendirme ve Klimalar Periyodik Bakım, Onarım ve Gaz Dolumu Hizmet Alımı',
        isin_aciklamasi:
          'Hizmet binasındaki iklimlendirme sistemlerinin mevsimlik bakım, filtre değişimi, gaz dolumu ve onarımı hizmet alımı.',
        tur: 'hizmet',
        birim_id: birimIds[1] || birimIds[0] || null, // Destek Hizmetleri Şube Müdürlüğü
        ihtiyac_yeri: 'Destek Hizmetleri Şube Müdürlüğü / Hizmet Binası Katları',
        butce_kodu: '03.5.2.02 Makine Teçhizat Bakım ve Onarım Giderleri',
        butce_yili: 2026,
        butce_tipi: 'Genel Bütçe',
        ihale_sekli: '4734 Sayılı KİK Md. 22/d (Doğrudan Temin)',
        ihale_tipi: 'Doğrudan Temin'
      },
      {
        temin_no: 'DT-2026/3',
        konu: 'Hizmet Binası Zemin Kat Islak Hacim, Boya, Alçı ve Asma Tavan Tadilatı Yapım İşi',
        isin_aciklamasi:
          'Zemin kat ortak kullanım alanları ve ıslak hacimlerin komple seramik kaplama, iç cephe boya/alçı ve asma tavan yapım işi.',
        tur: 'yapim_isi',
        birim_id: birimIds[4] || birimIds[birimIds.length - 1] || null, // Teknik ve Bakım Onarım Birimi
        ihtiyac_yeri: 'Teknik ve Bakım Onarım Birimi / Hizmet Binası Zemin Kat',
        butce_kodu: '03.8.2.01 Hizmet Binası Küçük Onarım Giderleri',
        butce_yili: 2026,
        butce_tipi: 'Genel Bütçe',
        ihale_sekli: '4734 Sayılı KİK Md. 22/d (Doğrudan Temin)',
        ihale_tipi: 'Doğrudan Temin'
      }
    ]

    // Veritabanında hiç dosya yoksa, otomatik 3 adet örnek Doğrudan Temin dosyası aç
    if (dosyalar.length === 0) {
      for (const d of predefinedDosyalar) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminDosyasi (
            temin_no, konu, isin_aciklamasi, tur, birim_id, ihtiyac_yeri, butce_kodu, butce_yili, butce_tipi, 
            ihale_sekli, ihale_tipi, durum_asama_id, status, is_deleted, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 'devam_ediyor', 0, datetime('now'), datetime('now'))`,
          [
            d.temin_no,
            d.konu,
            d.isin_aciklamasi,
            d.tur,
            d.birim_id,
            d.ihtiyac_yeri,
            d.butce_kodu,
            d.butce_yili,
            d.butce_tipi,
            d.ihale_sekli,
            d.ihale_tipi
          ]
        )
      }

      const refreshedRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminDosyasi WHERE is_deleted = 0 ORDER BY id ASC'
      )
      dosyalar = refreshedRes.success && Array.isArray(refreshedRes.data) ? refreshedRes.data : []
    }

    if (dosyalar.length === 0) {
      return 0
    }
    let enrichedCount = 0

    // 3 Ayrı Alım Türüne Özel Kalem Paketleri
    const samplePackages = [
      // Paket 1: Mal Alımı (Kırtasiye & Büro Tüketim)
      [
        {
          ad: 'A4 80 gr/m² Beyaz Fotokopi Kağıdı (500 Yaprak / Paket)',
          tip: 'Mal',
          birim: 'Paket',
          miktar: 50,
          kdv: 20,
          tkod: '150.01.01.01',
          f1: 180,
          f2: 195,
          f3: 175
        },
        {
          ad: 'Siyah Lazer Toner Kartuşu (Yüksek Kapasiteli)',
          tip: 'Mal',
          birim: 'Adet',
          miktar: 8,
          kdv: 20,
          tkod: '150.01.02.04',
          f1: 1250,
          f2: 1300,
          f3: 1190
        },
        {
          ad: 'Masaüstü Zımba Makinesi ve Tel Seti',
          tip: 'Mal',
          birim: 'Kutu',
          miktar: 15,
          kdv: 20,
          tkod: '150.01.03.01',
          f1: 120,
          f2: 135,
          f3: 110
        }
      ],
      // Paket 2: Hizmet Alımı (İklimlendirme, Bakım ve Gaz Dolumu)
      [
        {
          ad: 'Split ve Salon Tipi Klima Periyodik Bakım ve Filtre Temizliği',
          tip: 'Hizmet',
          birim: 'Adet',
          miktar: 16,
          kdv: 20,
          tkod: '150.08.01.01',
          f1: 850,
          f2: 900,
          f3: 800
        },
        {
          ad: 'R410A / R32 Soğutucu Gaz Dolumu ve Kaçak Kontrolü',
          tip: 'Hizmet',
          birim: 'Adet',
          miktar: 12,
          kdv: 20,
          tkod: '150.08.01.02',
          f1: 1400,
          f2: 1550,
          f3: 1350
        },
        {
          ad: 'Sistem Odası Hassas Kontrollü Klima Yıllık Bakım Hizmeti',
          tip: 'Hizmet',
          birim: 'Adet',
          miktar: 2,
          kdv: 20,
          tkod: '150.08.01.03',
          f1: 4500,
          f2: 4800,
          f3: 4200
        }
      ],
      // Paket 3: Yapım İşi (Islak Hacim Seramik, Alçı-Boya ve Asma Tavan)
      [
        {
          ad: 'İç Cephe Alçı Sıva Tamiratı ve Silikonlu Mat Boya Yapım İşi',
          tip: 'Yapım',
          birim: 'm²',
          miktar: 350,
          kdv: 20,
          tkod: '252.01.01.01',
          f1: 160,
          f2: 180,
          f3: 150
        },
        {
          ad: 'Zemin ve Duvar Seramik Kaplama Söküm ve Yeniden Yapım İşi',
          tip: 'Yapım',
          birim: 'm²',
          miktar: 85,
          kdv: 20,
          tkod: '252.01.02.01',
          f1: 650,
          f2: 700,
          f3: 600
        },
        {
          ad: 'Akustik Taşyünü Asma Tavan ve T-24 Taşıyıcı Karkas İmalatı',
          tip: 'Yapım',
          birim: 'm²',
          miktar: 120,
          kdv: 20,
          tkod: '252.01.03.01',
          f1: 420,
          f2: 460,
          f3: 390
        }
      ]
    ]

    for (let i = 0; i < dosyalar.length; i++) {
      const dosya = dosyalar[i]
      const pkgIndex = i % samplePackages.length
      const pkg = samplePackages[pkgIndex]
      const predef = predefinedDosyalar[pkgIndex] || predefinedDosyalar[0]

      // Dosya üst bilgilerini tanımlı alım türü ve birim ile güncelle
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminDosyasi SET 
          tur = ?,
          birim_id = COALESCE(?, birim_id),
          konu = ?,
          isin_aciklamasi = ?,
          ihtiyac_yeri = ?,
          butce_kodu = ?,
          ihale_sekli = ?,
          ihale_tipi = ?,
          durum_asama_id = 2,
          status = 'devam_ediyor'
        WHERE id = ?`,
        [
          predef.tur,
          predef.birim_id,
          predef.konu,
          predef.isin_aciklamasi,
          predef.ihtiyac_yeri,
          predef.butce_kodu,
          predef.ihale_sekli,
          predef.ihale_tipi,
          dosya.id
        ]
      )

      // Dosya kalemlerini kontrol et
      const existingKalemler = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM DATA_TeminKalem WHERE temin_dosya_id = ?',
        [dosya.id]
      )

      let dosyaKalemIds: number[] = []

      if (!existingKalemler.success || !existingKalemler.data || existingKalemler.data.length === 0) {
        // Kalemleri ekle
        for (const item of pkg) {
          const kRes = await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO DATA_TeminKalem (
              temin_dosya_id, kalem_adi, tipi, birim, miktar, kdv_orani, tasinir_kodu
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [dosya.id, item.ad, item.tip, item.birim, item.miktar, item.kdv, item.tkod]
          )
          if (kRes.success && kRes.lastInsertRowid) {
            dosyaKalemIds.push(Number(kRes.lastInsertRowid))
          }
        }
      } else {
        dosyaKalemIds = existingKalemler.data.map((r: { id: number }) => r.id)
      }

      // Dosyaya İstekli Firmaları ve Teklifleri bağla
      const existingTeminFirmalar = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, firma_id FROM DATA_TeminFirma WHERE temin_dosya_id = ?',
        [dosya.id]
      )

      const teminFirmaIds: { id: number; firma_id: number; teklifTotal: number }[] = []

      if (!existingTeminFirmalar.success || !existingTeminFirmalar.data || existingTeminFirmalar.data.length === 0) {
        // İlk 3 firmayı ekle
        const selectedFirmalar = firmaIds.slice(0, 3)
        const firmalarData = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT id, unvan, vergi_no, telefon, email, ilgili_adi FROM TANIM_Firma WHERE id IN (${selectedFirmalar.join(',')})`
        )

        const fDataList = firmalarData.data || []

        for (let fi = 0; fi < fDataList.length; fi++) {
          const f = fDataList[fi]
          const isWinner = fi === 2 // 3. firma en uygun teklifi versin (f3)
          const fRes = await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO DATA_TeminFirma (
              temin_dosya_id, firma_id, unvan, vergi_no, ilgili_kisi, telefon, email, davet_edildi_mi, teklif_verdi_mi, kazandi_mi, teklif_durumu, para_birimi
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, 'Teklif Alındı', 'TRY')`,
            [dosya.id, f.id, f.unvan, f.vergi_no, f.ilgili_adi, f.telefon, f.email, isWinner ? 1 : 0]
          )

          if (fRes.success && fRes.lastInsertRowid) {
            teminFirmaIds.push({
              id: Number(fRes.lastInsertRowid),
              firma_id: f.id,
              teklifTotal: 0
            })
          }
        }
      } else {
        teminFirmaIds.push(
          ...existingTeminFirmalar.data.map((r: { id: number; firma_id: number }) => ({
            id: r.id,
            firma_id: r.firma_id,
            teklifTotal: 0
          }))
        )
      }

      // Kalem Tekliflerini Doldur
      let approxCostTotal = 0
      let winningTotal = 0

      for (let ki = 0; ki < dosyaKalemIds.length; ki++) {
        const dKalemId = dosyaKalemIds[ki]
        const sampleItem = pkg[ki % pkg.length]
        const miktar = sampleItem ? sampleItem.miktar : 1

        const prices = [
          sampleItem ? sampleItem.f1 : 100,
          sampleItem ? sampleItem.f2 : 110,
          sampleItem ? sampleItem.f3 : 95
        ]

        approxCostTotal += ((prices[0] + prices[1] + prices[2]) / 3) * miktar
        winningTotal += prices[2] * miktar

        for (let fi = 0; fi < teminFirmaIds.length; fi++) {
          const tf = teminFirmaIds[fi]
          const unitPrice = prices[fi % prices.length]
          tf.teklifTotal += unitPrice * miktar

          const exTeklif = await window.electron.ipcRenderer.invoke(
            'db:query',
            'SELECT id FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ? AND temin_kalem_id = ? AND temin_firma_id = ?',
            [dosya.id, dKalemId, tf.id]
          )

          if (!exTeklif.success || !exTeklif.data || exTeklif.data.length === 0) {
            await window.electron.ipcRenderer.invoke(
              'db:run',
              `INSERT INTO DATA_TeminKalemTeklif (
                temin_dosya_id, temin_kalem_id, temin_firma_id, birim_fiyat, kdv_tutari, teklif_verildi_mi
              ) VALUES (?, ?, ?, ?, ?, 1)`,
              [dosya.id, dKalemId, tf.id, unitPrice, unitPrice * 0.2]
            )
          }
        }
      }

      // Firmaların toplam tekliflerini güncelle
      for (const tf of teminFirmaIds) {
        if (tf.teklifTotal > 0) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'UPDATE DATA_TeminFirma SET teklif_toplami = ? WHERE id = ?',
            [tf.teklifTotal, tf.id]
          )
        }
      }

      // Komisyon Üyelerini Ata (Piyasa Araştırma & Muayene Kabul)
      const existingKomisyon = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?',
        [dosya.id]
      )

      if (!existingKomisyon.success || !existingKomisyon.data || existingKomisyon.data.length === 0) {
        const p1 = personelIds[2] || 1
        const p2 = personelIds[3] || 2
        const p3 = personelIds[4] || 3

        const komisyonMembers = [
          {
            kom_id: 1,
            p_id: p1,
            ad: 'Ayşe Kaya Demir',
            unvan: 'Şube Müdürü',
            gorev: 'Komisyon Başkanı',
            rol: 'Asil'
          },
          {
            kom_id: 1,
            p_id: p2,
            ad: 'Mustafa Çelik',
            unvan: 'Mühendis',
            gorev: 'Üye',
            rol: 'Asil'
          },
          {
            kom_id: 1,
            p_id: p3,
            ad: 'Fatma Şahin Korkmaz',
            unvan: 'Uzman',
            gorev: 'Üye',
            rol: 'Asil'
          },
          {
            kom_id: 2,
            p_id: personelIds[5] || 4,
            ad: 'Emre Karaca',
            unvan: 'Tekniker',
            gorev: 'Muayene Kabul Başkanı',
            rol: 'Asil'
          },
          {
            kom_id: 2,
            p_id: personelIds[6] || 5,
            ad: 'Zeynep Aktaş',
            unvan: 'Taşınır Kayıt Yetkilisi',
            gorev: 'Üye',
            rol: 'Asil'
          }
        ]

        for (const km of komisyonMembers) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO DATA_TeminKomisyon (
              temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [dosya.id, km.kom_id, km.p_id, km.ad, km.unvan, km.gorev, km.rol]
          )
        }
      }

      // Dosya Maliyet ve Personel Bilgilerini Güncelle
      const winningFirmaId =
        teminFirmaIds.length > 2 ? teminFirmaIds[2].firma_id : firmaIds[0] || 1
      const harcamaYetkilisiId = personelIds[0] || 1
      const gerceklestirmeId = personelIds[1] || 2
      const irtibatId = personelIds[2] || personelIds[0] || 1

      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminDosyasi SET 
          yaklasik_maliyet = ?,
          net_odenen = ?,
          firma_id = ?,
          onay_personel_id = ?,
          hazirlayan_personel_id = ?,
          talep_eden_personel_id = ?,
          sunan_personel_id = ?,
          irtibat_yetkilisi_id = ?,
          teslim_tarihi = date('now', '+15 days'),
          son_teklif_verme_tarihi = date('now', '+3 days')
        WHERE id = ?`,
        [
          approxCostTotal > 0 ? approxCostTotal : 45000,
          winningTotal > 0 ? winningTotal : 41500,
          winningFirmaId,
          harcamaYetkilisiId,
          gerceklestirmeId,
          gerceklestirmeId,
          harcamaYetkilisiId,
          irtibatId,
          dosya.id
        ]
      )

      enrichedCount++
    }

    return enrichedCount
  }
}

