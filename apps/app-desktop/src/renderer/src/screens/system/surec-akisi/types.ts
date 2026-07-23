export interface Belge {
  id: number
  ad: string
  asama: string
  durum: 'imzalandı' | 'imza_bekliyor' | 'oluşturuldu' | 'taslak' | 'oluşturulmadı'
  pdfDosyaAdi?: string
  pdfYuklenmeTarihi?: string
  pdfBoyut?: string
}

export interface TaranmisBelge {
  id: number
  ad: string
  boyut: string
  tarih: string
  bagliBelgeId?: number
}

export interface Kalem {
  id: number
  malzemeAdi: string
  miktar: number
  birim: string
  birimFiyat: number
  toplamBedel: number
  tasinirKodu: string
}

export interface FirmaItem {
  id: number
  unvan: string
  telefon: string
  email: string
  davetTarihi: string
  teklifTarihi: string | null
  teklifBedeli: number | null
  durumu: 'seçildi' | 'teklif' | 'reddedildi'
}

export interface Uye {
  id: number
  adSoyad: string
  unvan: string
  gorev: string
  imza: 'imzaladı' | 'bekliyor'
}

export interface Komisyon {
  id: number
  tur: string
  dayanak: string
  olusturmaTarihi: string
  durum: 'aktif' | 'tamamlandı' | 'bekliyor'
  uyeler: Uye[]
}

export interface TaskItem {
  name: string
  done: boolean
  tab: string
}

export interface Stage {
  id: number
  title: string
  tasks: TaskItem[]
}
