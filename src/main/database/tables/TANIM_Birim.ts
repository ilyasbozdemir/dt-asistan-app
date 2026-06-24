export const TANIM_Birim = {
  name: 'TANIM_Birim',
  description: 'Kurum içerisindeki müdürlükler, birimler ve departmanlar',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'eski_id', type: 'TEXT' },
    { name: 'birim_adi', type: 'TEXT', notNull: true, unique: true },
    { name: 'antet_ek_satir', type: 'TEXT' },
    { name: 'ihtiyac_yeri_eki', type: 'TEXT' },
    { name: 'sunum_makami', type: 'TEXT' },
    { name: 'e_butce', type: 'TEXT' },
    { name: 'say2000i', type: 'TEXT' },
    { name: 'dtvt_kodu', type: 'TEXT' },
    { name: 'detsis_kodu', type: 'TEXT' },
    { name: 'muhasebe_kodu', type: 'TEXT' },
    { name: 'muhasebe_adi', type: 'TEXT' },
    { name: 'harcama_kodu', type: 'TEXT' },
    { name: 'harcama_adi', type: 'TEXT' },
    { name: 'ayrintili_bilgi_personel', type: 'TEXT' },
    { name: 'ilgili_personel_id', type: 'INTEGER' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1 },
    { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }
  ],
  initialData: [
    {
      birim_adi: 'Fen İşleri Müdürlüğü',
      antet_ek_satir: 'FEN İŞLERİ MÜDÜRLÜĞÜ',
      sunum_makami: 'FEN İŞLERİ MÜDÜRLÜĞÜNE',
      aktif_mi: 1
    },
    {
      birim_adi: 'Mali Hizmetler Müdürlüğü',
      antet_ek_satir: 'MALİ HİZMETLER MÜDÜRLÜĞÜ',
      sunum_makami: 'MALİ HİZMETLER MÜDÜRLÜĞÜNE',
      aktif_mi: 1
    },
    {
      birim_adi: 'Yazı İşleri Müdürlüğü',
      antet_ek_satir: 'YAZI İŞLERİ MÜDÜRLÜĞÜ',
      sunum_makami: 'YAZI İŞLERİ MÜDÜRLÜĞÜNE',
      aktif_mi: 1
    },
    {
      birim_adi: 'Zabıta Amirliği',
      antet_ek_satir: 'ZABITA AMİRLİĞİ',
      sunum_makami: 'ZABITA AMİRLİĞİNE',
      aktif_mi: 1
    },
    {
      birim_adi: 'Destek Hizmetleri Müdürlüğü',
      antet_ek_satir: 'DESTEK HİZMETLERİ MÜDÜRLÜĞÜ',
      sunum_makami: 'DESTEK HİZMETLERİ MÜDÜRLÜĞÜNE',
      aktif_mi: 1
    }
  ]
}
