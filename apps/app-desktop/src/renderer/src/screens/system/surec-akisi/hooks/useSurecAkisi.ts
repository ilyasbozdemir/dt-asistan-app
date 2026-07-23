import { useState, useMemo } from 'react'
import { useWorkspaceStore } from '../../../../store/workspaceStore'
import { useDosyalarHooks } from '../../../dosyalar/dosyalar.hooks'
import { useCiktiMerkeziData } from '../../../dosya/CiktiMerkezi.hooks'
import { Belge, TaranmisBelge, Kalem, FirmaItem, Komisyon, Stage } from '../types'
import { dosyaBoyutFormatla, belgeSonrakiDurum } from '../utils/helpers'

export function useSurecAkisi() {
  const { activeDosyaId } = useWorkspaceStore()
  const { dosyalar } = useDosyalarHooks()

  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId)
  const { dosyaContext } = useCiktiMerkeziData(activeDosyaId)

  const [selectedTab, setSelectedTab] = useState<string>('ozet')

  // Real data binding with fallback
  const kalemler: Kalem[] = useMemo(() => {
    if (dosyaContext?.kalemler && dosyaContext.kalemler.length > 0) {
      return dosyaContext.kalemler.map((k: any, idx: number) => ({
        id: k.id || idx + 1,
        malzemeAdi: k.malzeme_adi || k.kalem_adi || 'Malzeme Kalemi',
        miktar: Number(k.miktar) || 1,
        birim: k.birim || 'Adet',
        birimFiyat: Number(k.birim_fiyat) || 0,
        toplamBedel: Number(k.toplam_tutar) || (Number(k.miktar) || 1) * (Number(k.birim_fiyat) || 0),
        tasinirKodu: k.tasinir_kodu || '150.01.01'
      }))
    }
    return [
      { id: 1, malzemeAdi: 'Bilgisayar (Masaüstü)', miktar: 5, birim: 'Adet', birimFiyat: 15000, toplamBedel: 75000, tasinirKodu: '150.01.01' },
      { id: 2, malzemeAdi: 'Yazıcı (A4 Laser)', miktar: 3, birim: 'Adet', birimFiyat: 4000, toplamBedel: 12000, tasinirKodu: '150.02.05' },
      { id: 3, malzemeAdi: 'Monitör (27 inç)', miktar: 5, birim: 'Adet', birimFiyat: 2500, toplamBedel: 12500, tasinirKodu: '150.01.03' },
      { id: 4, malzemeAdi: 'Klavye Mekanik', miktar: 10, birim: 'Adet', birimFiyat: 600, toplamBedel: 6000, tasinirKodu: '150.01.04' }
    ]
  }, [dosyaContext?.kalemler])

  const firmalar: FirmaItem[] = useMemo(() => {
    const raw = dosyaContext?.firmalar || dosyaContext?.istekliFirmalar
    if (raw && raw.length > 0) {
      return raw.map((f: any, idx: number) => ({
        id: f.id || idx + 1,
        unvan: f.unvan || f.firma_adi || 'Tedarikçi Firma',
        telefon: f.telefon || '—',
        email: f.email || '—',
        davetTarihi: f.davet_tarihi || '—',
        teklifTarihi: f.teklif_tarihi || null,
        teklifBedeli: f.teklif_bedeli ? Number(f.teklif_bedeli) : null,
        durumu: f.secildi_mi ? 'seçildi' : f.teklif_verdi_mi ? 'teklif' : 'reddedildi'
      }))
    }
    return [
      { id: 1, unvan: 'TEKNOLOJİ A.Ş.', telefon: '0312 555 1234', email: 'satis@teknoloji.com.tr', davetTarihi: '16.01.2024', teklifTarihi: '19.01.2024', teklifBedeli: 105500, durumu: 'seçildi' },
      { id: 2, unvan: 'BİLGİSAYAR TİC. LTD.', telefon: '0216 555 5678', email: 'info@bilgisayar.com.tr', davetTarihi: '16.01.2024', teklifTarihi: '20.01.2024', teklifBedeli: 112000, durumu: 'teklif' },
      { id: 3, unvan: 'SANAYİ ÜRÜNLERİ LTD.', telefon: '0312 555 9999', email: 'satis@sanayi.com.tr', davetTarihi: '16.01.2024', teklifTarihi: null, teklifBedeli: null, durumu: 'reddedildi' }
    ]
  }, [dosyaContext?.firmalar, dosyaContext?.istekliFirmalar])

  const komisyonlar: Komisyon[] = useMemo(() => {
    if (dosyaContext?.komisyonlar && dosyaContext.komisyonlar.length > 0) {
      return dosyaContext.komisyonlar.map((k: any, idx: number) => ({
        id: k.id || idx + 1,
        tur: k.tur || k.komisyon_adi || 'Komisyon',
        dayanak: k.dayanak || '4734 Sayılı Kanun',
        olusturmaTarihi: k.tarih || '—',
        durum: k.durum || 'aktif',
        uyeler: (k.uyeler || []).map((u: any, uIdx: number) => ({
          id: u.id || uIdx + 1,
          adSoyad: u.ad_soyad || u.adSoyad || 'Komisyon Üyesi',
          unvan: u.unvan || 'Üye',
          gorev: u.gorev || 'Üye',
          imza: u.imzaladi_mi ? 'imzaladı' : 'bekliyor'
        }))
      }))
    }
    return [
      {
        id: 1,
        tur: 'Piyasa Fiyat Araştırma Komisyonu',
        dayanak: '4734 Sayılı Kanun md. 22 — Yaklaşık Maliyet Tespiti',
        olusturmaTarihi: '15.01.2024',
        durum: 'aktif',
        uyeler: [
          { id: 1, adSoyad: dosyaContext?.hazirlayanPersonelAdi || 'Ahmet YILMAZ', unvan: 'Fen İşleri Müdürü', gorev: 'Komisyon Başkanı', imza: 'imzaladı' },
          { id: 2, adSoyad: 'Elif KAYA', unvan: 'Mühendis', gorev: 'Üye', imza: 'imzaladı' },
          { id: 3, adSoyad: 'Zeynep ARSLAN', unvan: 'Muhasebe Yetkilisi Mutemedi', gorev: 'Raportör', imza: 'imzaladı' }
        ]
      },
      {
        id: 2,
        tur: 'Muayene ve Kabul Komisyonu',
        dayanak: 'Muayene ve Kabul Yönetmeliği',
        olusturmaTarihi: '—',
        durum: 'bekliyor',
        uyeler: [
          { id: 4, adSoyad: dosyaContext?.onaylayanPersonelAdi || 'Mehmet DEMİR', unvan: 'Ayniyat Saymanı', gorev: 'Komisyon Başkanı', imza: 'bekliyor' },
          { id: 5, adSoyad: 'Selin TAN', unvan: 'Teknisyen', gorev: 'Üye', imza: 'bekliyor' },
          { id: 6, adSoyad: 'Burak ÖZ', unvan: 'Mühendis', gorev: 'Üye', imza: 'bekliyor' }
        ]
      }
    ]
  }, [dosyaContext?.komisyonlar, dosyaContext?.hazirlayanPersonelAdi, dosyaContext?.onaylayanPersonelAdi])

  const [belgeler, setBelgeler] = useState<Belge[]>([
    { id: 1, ad: 'Malzeme Talep Formu', asama: 'İhtiyaç Tespiti', durum: 'imzalandı', pdfDosyaAdi: 'talep_formu_imzali.pdf', pdfYuklenmeTarihi: '15.01.2024', pdfBoyut: '512 KB' },
    { id: 2, ad: 'Komisyon Görevlendirme Yazısı', asama: 'İhtiyaç Tespiti', durum: 'imzalandı', pdfDosyaAdi: 'komisyon_onay.pdf', pdfYuklenmeTarihi: '16.01.2024', pdfBoyut: '640 KB' },
    { id: 3, ad: 'Piyasa Araştırması Tutanağı', asama: 'Piyasa Araştırması', durum: 'imzalandı', pdfDosyaAdi: 'piyasa_tutanak_imzali.pdf', pdfYuklenmeTarihi: '19.01.2024', pdfBoyut: '1.2 MB' },
    { id: 4, ad: 'Yaklaşık Maliyet Cetveli', asama: 'Onay Süreci', durum: 'oluşturuldu' },
    { id: 5, ad: 'Doğrudan Temin Onay Belgesi', asama: 'Onay Süreci', durum: 'taslak' },
    { id: 6, ad: 'Sipariş Mektubu', asama: 'Onay Süreci', durum: 'oluşturulmadı' },
    { id: 7, ad: 'Muayene Kabul Tutanağı', asama: 'Teslim ve Kabul', durum: 'oluşturulmadı' },
    { id: 8, ad: 'Taşınır İşlem Fişi', asama: 'Teslim ve Kabul', durum: 'oluşturulmadı' },
    { id: 9, ad: 'Ödeme Emri Belgesi', asama: 'Ödeme İşlemleri', durum: 'oluşturulmadı' }
  ])

  const [selectedBelge, setSelectedBelge] = useState<Belge | null>(null)
  const [menuAcikId, setMenuAcikId] = useState<number | null>(null)
  const [previewBelge, setPreviewBelge] = useState<Belge | null>(null)
  const [selectedAsamaFilter, setSelectedAsamaFilter] = useState<string>('Tümü')

  const [taranmisBelgeler, setTaranmisBelgeler] = useState<TaranmisBelge[]>([
    { id: 1, ad: 'yaklasik_maliyet_imzali.pdf', boyut: '842 KB', tarih: '18.01.2024', bagliBelgeId: 4 },
    { id: 2, ad: 'piyasa_tutanak_imzali.pdf', boyut: '1.2 MB', tarih: '19.01.2024', bagliBelgeId: 3 }
  ])
  const [surukleniyor, setSurukleniyor] = useState<boolean>(false)

  const dosyalariEkle = (fileList: FileList | null, targetBelgeId?: number): void => {
    if (!fileList) return
    const pdfler = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )
    if (pdfler.length === 0) return

    const newItems: TaranmisBelge[] = pdfler.map((f, i) => ({
      id: Date.now() + i,
      ad: f.name,
      boyut: dosyaBoyutFormatla(f.size),
      tarih: new Date().toLocaleDateString('tr-TR'),
      bagliBelgeId: targetBelgeId
    }))

    setTaranmisBelgeler((prev) => [...prev, ...newItems])

    if (targetBelgeId) {
      const firstPdf = newItems[0]
      setBelgeler((prev) =>
        prev.map((b) =>
          b.id === targetBelgeId
            ? {
                ...b,
                durum: 'imzalandı',
                pdfDosyaAdi: firstPdf.ad,
                pdfYuklenmeTarihi: firstPdf.tarih,
                pdfBoyut: firstPdf.boyut
              }
            : b
        )
      )
    }
  }

  const taranmisBelgeSil = (id: number): void => {
    setTaranmisBelgeler((prev) => prev.filter((b) => b.id !== id))
  }

  const activeDosyaAny = activeDosya as any

  const dosya = {
    dosyaNo: activeDosya?.temin_no || 'DT-2024-001',
    teminTuru: activeDosyaAny?.alim_turu || activeDosya?.tur || 'Doğrudan Temin',
    kanunMaddesi: '4734 Sayılı Kanun md. 22/d',
    tarih: activeDosyaAny?.tarih || activeDosya?.dosya_acilis_tarihi || '15.01.2024',
    sonTeklifTarihi: '20.01.2024',
    durum: activeDosyaAny?.durum || 'Onay Süreci'
  }

  const [expandedKomisyon, setExpandedKomisyon] = useState<number | null>(1)

  const [stages, setStages] = useState<Stage[]>([
    {
      id: 1,
      title: 'İhtiyaç Tespiti',
      tasks: [
        { name: 'Malzeme Talep Formu', done: true, tab: 'malzeme' },
        { name: 'Komisyonu Yönet', done: true, tab: 'komisyon' },
        { name: 'Görevlendirme Yazısı', done: true, tab: 'belgeler' }
      ]
    },
    {
      id: 2,
      title: 'Piyasa Araştırması',
      tasks: [
        { name: 'İstekli Firmaları Yönet', done: true, tab: 'firmalar' },
        { name: 'Araştırma Mektubu Gönder', done: true, tab: 'belgeler' },
        { name: 'Fiyat Teklifi Al', done: true, tab: 'firmalar' },
        { name: 'Karşılaştır', done: true, tab: 'firmalar' }
      ]
    },
    {
      id: 3,
      title: 'Onay Süreci',
      tasks: [
        { name: 'Yaklaşık Maliyet Cetveli', done: true, tab: 'belgeler' },
        { name: 'Doğrudan Temin Onay Belgesi', done: false, tab: 'belgeler' },
        { name: 'Sipariş Ver', done: false, tab: 'belgeler' }
      ]
    },
    {
      id: 4,
      title: 'Teslim ve Kabul',
      tasks: [
        { name: 'Malı Al (T.İF)', done: false, tab: 'belgeler' },
        { name: 'Muayene-Kabul', done: false, tab: 'komisyon' },
        { name: 'Ambar Kaydı', done: false, tab: 'belgeler' }
      ]
    },
    {
      id: 5,
      title: 'Ödeme İşlemleri',
      tasks: [
        { name: 'Ödeme Yazısı', done: false, tab: 'belgeler' },
        { name: 'Ödeme Emri', done: false, tab: 'belgeler' },
        { name: 'Muhasebe Kaydı', done: false, tab: 'belgeler' }
      ]
    }
  ])

  const toggleTask = (stageId: number, taskIndex: number): void => {
    setStages((prev) =>
      prev.map((s) =>
        s.id !== stageId
          ? s
          : {
              ...s,
              tasks: s.tasks.map((t, i) => (i === taskIndex ? { ...t, done: !t.done } : t))
            }
      )
    )
  }

  const belgeOlustur = (id: number): void => {
    setBelgeler((prev) =>
      prev.map((b) => (b.id === id ? { ...b, durum: belgeSonrakiDurum(b.durum) } : b))
    )
  }

  const stagesWithStatus = stages.map((s) => {
    const total = s.tasks.length
    const doneCount = s.tasks.filter((t) => t.done).length
    const progress = Math.round((doneCount / total) * 100)
    const status: 'completed' | 'in-progress' | 'pending' =
      progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending'
    return { ...s, progress, status }
  })

  const toplamBedel = kalemler.reduce((acc, k) => acc + k.toplamBedel, 0)
  const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0)
  const completedTasks = stages.reduce((acc, s) => acc + s.tasks.filter((t) => t.done).length, 0)
  const overallProgress = Math.round((completedTasks / totalTasks) * 100)
  const belgeTamamlanan = belgeler.filter((b) => b.durum === 'imzalandı').length
  const pdfYuklenenSayisi = belgeler.filter((b) => b.pdfDosyaAdi || b.durum === 'imzalandı').length

  const filteredBelgeler = selectedAsamaFilter === 'Tümü'
    ? belgeler
    : belgeler.filter((b) => b.asama === selectedAsamaFilter)

  return {
    activeDosya,
    dosyaContext,
    dosya,
    selectedTab,
    setSelectedTab,
    kalemler,
    firmalar,
    komisyonlar,
    belgeler,
    setBelgeler,
    selectedBelge,
    setSelectedBelge,
    menuAcikId,
    setMenuAcikId,
    previewBelge,
    setPreviewBelge,
    selectedAsamaFilter,
    setSelectedAsamaFilter,
    taranmisBelgeler,
    surukleniyor,
    setSurukleniyor,
    expandedKomisyon,
    setExpandedKomisyon,
    stages,
    stagesWithStatus,
    toggleTask,
    belgeOlustur,
    dosyalariEkle,
    taranmisBelgeSil,
    toplamBedel,
    totalTasks,
    completedTasks,
    overallProgress,
    belgeTamamlanan,
    pdfYuklenenSayisi,
    filteredBelgeler
  }
}
