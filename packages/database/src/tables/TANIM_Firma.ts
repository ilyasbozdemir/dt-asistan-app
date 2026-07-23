export const TANIM_Firma = {
  name: 'TANIM_Firma',
  description: 'Kayıtlı firmalar ve tedarikçiler havuzu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'eski_id', type: 'TEXT', description: 'Eski ID' },
    { name: 'firma_kodu', type: 'TEXT', description: 'Firma Kodu' },
    { name: 'unvan', type: 'TEXT', notNull: true, description: 'Unvan' },
    { name: 'ilgili_adi', type: 'TEXT', description: 'Ilgili Adi' },
    { name: 'uyrugu', type: 'TEXT', description: 'Uyrugu' },
    { name: 'istigal_konusu', type: 'TEXT', description: 'Istigal Konusu' },
    { name: 'adres', type: 'TEXT', description: 'Adres' },
    { name: 'ilce', type: 'TEXT', description: 'Ilce' },
    { name: 'posta_kodu', type: 'TEXT', description: 'Posta Kodu' },
    { name: 'il', type: 'TEXT', description: 'Il' },
    { name: 'telefon', type: 'TEXT', description: 'Telefon' },
    { name: 'faks', type: 'TEXT', description: 'Faks' },
    { name: 'email', type: 'TEXT', description: 'Email' },
    { name: 'web_adresi', type: 'TEXT', description: 'Web Adresi' },
    { name: 'banka_adi', type: 'TEXT', description: 'Banka Adi' },
    { name: 'sube_kodu_adi', type: 'TEXT', description: 'Sube Kodu Adi' },
    { name: 'hesap_no', type: 'TEXT', description: 'Hesap Numarası' },
    { name: 'tc_kimlik_no', type: 'TEXT', description: 'Tc Kimlik Numarası' },
    { name: 'dogum_tarihi', type: 'TEXT', description: 'Dogum Tarihi' },
    { name: 'vergi_dairesi', type: 'TEXT', description: 'Vergi Dairesi' },
    { name: 'vergi_no', type: 'TEXT', description: 'Vergi Numarası' },
    { name: 'aktif_mi', type: 'INTEGER', notNull: true, default: 1, description: 'Aktif mı?' },
    // --- CRM Alanları ---
    { name: 'deneyim_skoru', type: 'INTEGER', default: 0, description: 'Geçmiş Deneyim Skoru (0-5)' },
    { name: 'kalite_skoru', type: 'INTEGER', default: 0, description: 'Ürün/Hizmet Kalite Skoru (0-5)' },
    { name: 'odeme_disiplini', type: 'INTEGER', default: 1, description: 'Ödeme Disiplini (1: Zamanında, 0: Geciktiriyor)' },
    { name: 'kara_liste', type: 'INTEGER', default: 0, description: 'Kara Listede mi? (0: Hayır, 1: Evet)' },
    { name: 'kara_liste_neden', type: 'TEXT', description: 'Kara Liste Nedeni' },
    { name: 'son_iletisim_tarihi', type: 'TEXT', description: 'Son İletişim Tarihi (ISO)' },
    { name: 'sorumlu_personel_id', type: 'INTEGER', description: 'Sorumlu Personel ID (FK → TANIM_Personel)' },
    { name: 'iletisim_notlari', type: 'TEXT', description: 'İletişim Notları (JSON array: [{tarih, not, kisi}])' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Son Güncelleme'
    }
  ],
  initialData: []
}
