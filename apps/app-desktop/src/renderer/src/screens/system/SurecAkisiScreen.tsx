import React, { useState } from 'react'
import {
  ChevronDown,
  Package,
  Building2,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  Printer,
  Download,
  UserCheck,
  PenLine,
  PlusCircle,
  X,
  ArrowUpRight,
  Upload,
  Trash2,
  Sparkles,
  MoreVertical,
  Eye,
  Edit3,
  ExternalLink
} from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useDosyalarHooks } from '../dosyalar/dosyalar.hooks'
import { useCiktiMerkeziData } from '../dosya/CiktiMerkezi.hooks'
import { useNavigate } from '@tanstack/react-router'
import { Modal } from '../../components/ui/Modal'

interface Belge {
  id: number
  ad: string
  asama: string
  durum: 'imzalandı' | 'imza_bekliyor' | 'oluşturuldu' | 'taslak' | 'oluşturulmadı'
}

interface TaranmisBelge {
  id: number
  ad: string
  boyut: string
  tarih: string
}

interface Kalem {
  id: number
  malzemeAdi: string
  miktar: number
  birim: string
  birimFiyat: number
  toplamBedel: number
  tasinirKodu: string
}

interface FirmaItem {
  id: number
  unvan: string
  telefon: string
  email: string
  davetTarihi: string
  teklifTarihi: string | null
  teklifBedeli: number | null
  durumu: 'seçildi' | 'teklif' | 'reddedildi'
}

interface Uye {
  id: number
  adSoyad: string
  unvan: string
  gorev: string
  imza: 'imzaladı' | 'bekliyor'
}

interface Komisyon {
  id: number
  tur: string
  dayanak: string
  olusturmaTarihi: string
  durum: 'aktif' | 'tamamlandı' | 'bekliyor'
  uyeler: Uye[]
}

interface TaskItem {
  name: string
  done: boolean
  tab: string
}

interface Stage {
  id: number
  title: string
  tasks: TaskItem[]
}

export default function SurecAkisiScreen(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const { dosyalar } = useDosyalarHooks()
  const navigate = useNavigate()

  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId)
  const { dosyaContext } = useCiktiMerkeziData(activeDosyaId)

  const [selectedTab, setSelectedTab] = useState<string>('ozet')

  const [belgeler, setBelgeler] = useState<Belge[]>([
    { id: 1, ad: 'Malzeme Talep Formu', asama: 'İhtiyaç Tespiti', durum: 'imzalandı' },
    { id: 2, ad: 'Komisyon Görevlendirme Yazısı', asama: 'İhtiyaç Tespiti', durum: 'imzalandı' },
    { id: 3, ad: 'Piyasa Araştırması Tutanağı', asama: 'Piyasa Araştırması', durum: 'imzalandı' },
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

  const [taranmisBelgeler, setTaranmisBelgeler] = useState<TaranmisBelge[]>([
    { id: 1, ad: 'yaklasik_maliyet_imzali.pdf', boyut: '842 KB', tarih: '18.01.2024' }
  ])
  const [surukleniyor, setSurukleniyor] = useState<boolean>(false)

  const dosyaBoyutFormatla = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const dosyalariEkle = (fileList: FileList | null): void => {
    if (!fileList) return
    const pdfler = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )
    if (pdfler.length === 0) return
    setTaranmisBelgeler((prev) => [
      ...prev,
      ...pdfler.map((f, i) => ({
        id: Date.now() + i,
        ad: f.name,
        boyut: dosyaBoyutFormatla(f.size),
        tarih: new Date().toLocaleDateString('tr-TR')
      }))
    ])
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
    durum: 'Onay Süreci'
  }

  const kalemler: Kalem[] = (dosyaContext?.kalemler && dosyaContext.kalemler.length > 0)
    ? dosyaContext.kalemler.map((k: any, idx: number) => ({
        id: idx + 1,
        malzemeAdi: k.malzeme_adi || k.kalem_adi || 'Malzeme Kalemi',
        miktar: k.miktar || 1,
        birim: k.birim || 'Adet',
        birimFiyat: k.birim_fiyat || 0,
        toplamBedel: k.toplam_tutar || (k.miktar || 1) * (k.birim_fiyat || 0),
        tasinirKodu: k.tasinir_kodu || '150.01.01'
      }))
    : [
        { id: 1, malzemeAdi: 'Bilgisayar (Masaüstü)', miktar: 5, birim: 'Adet', birimFiyat: 15000, toplamBedel: 75000, tasinirKodu: '150.01.01' },
        { id: 2, malzemeAdi: 'Yazıcı (A4 Laser)', miktar: 3, birim: 'Adet', birimFiyat: 4000, toplamBedel: 12000, tasinirKodu: '150.02.05' },
        { id: 3, malzemeAdi: 'Monitör (27 inç)', miktar: 5, birim: 'Adet', birimFiyat: 2500, toplamBedel: 12500, tasinirKodu: '150.01.03' },
        { id: 4, malzemeAdi: 'Klavye Mekanik', miktar: 10, birim: 'Adet', birimFiyat: 600, toplamBedel: 6000, tasinirKodu: '150.01.04' }
      ]

  const firmalar: FirmaItem[] = [
    { id: 1, unvan: 'TEKNOLOJİ A.Ş.', telefon: '0312 555 1234', email: 'satis@teknoloji.com.tr', davetTarihi: '16.01.2024', teklifTarihi: '19.01.2024', teklifBedeli: 105500, durumu: 'seçildi' },
    { id: 2, unvan: 'BİLGİSAYAR TİC. LTD.', telefon: '0216 555 5678', email: 'info@bilgisayar.com.tr', davetTarihi: '16.01.2024', teklifTarihi: '20.01.2024', teklifBedeli: 112000, durumu: 'teklif' },
    { id: 3, unvan: 'SANAYİ ÜRÜNLERİ LTD.', telefon: '0312 555 9999', email: 'satis@sanayi.com.tr', davetTarihi: '16.01.2024', teklifTarihi: null, teklifBedeli: null, durumu: 'reddedildi' }
  ]

  const [expandedKomisyon, setExpandedKomisyon] = useState<number | null>(1)

  const komisyonlar: Komisyon[] = [
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

  const stagesWithStatus = stages.map((s) => {
    const total = s.tasks.length
    const doneCount = s.tasks.filter((t) => t.done).length
    const progress = Math.round((doneCount / total) * 100)
    const status: 'completed' | 'in-progress' | 'pending' =
      progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending'
    return { ...s, progress, status }
  })

  const getStatusColor = (status: string): string =>
    ({
      completed: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      'in-progress': 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      pending: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    }[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200')

  const getStatusLabel = (status: string): string =>
    ({
      completed: '✓ Tamamlandı',
      'in-progress': '◉ Yapılıyor',
      pending: '◯ Bekleniyor'
    }[status] || '◯ Bekleniyor')

  const getLineColor = (status: string): string =>
    ({
      completed: 'bg-emerald-500',
      'in-progress': 'bg-blue-500',
      pending: 'bg-slate-300 dark:bg-slate-700'
    }[status] || 'bg-slate-300')

  const getFirmaStatusBadge = (durumu: string): string =>
    ({
      seçildi: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      teklif: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      reddedildi: 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
    }[durumu] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200')

  const getFirmaStatusLabel = (durumu: string): string =>
    ({
      seçildi: '✓ Seçildi',
      teklif: '◉ Teklif Bekleniyor',
      reddedildi: '✗ Reddedildi'
    }[durumu] || '◯ Bekleniyor')

  const getBelgeDurumBadge = (durum: string): string =>
    ({
      imzalandı: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      imza_bekliyor: 'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      oluşturuldu: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      taslak: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      oluşturulmadı: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    }[durum] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200')

  const getBelgeDurumLabel = (durum: string): string =>
    ({
      imzalandı: 'İmzalandı',
      imza_bekliyor: 'İmzadan Dönüş Bekleniyor',
      oluşturuldu: 'Oluşturuldu',
      taslak: 'Taslak',
      oluşturulmadı: 'Oluşturulmadı'
    }[durum] || 'Oluşturulmadı')

  const getKomisyonDurumBadge = (durum: string): string =>
    ({
      aktif: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      tamamlandı: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      bekliyor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    }[durum] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200')

  const getKomisyonDurumLabel = (durum: string): string =>
    ({
      aktif: '◉ Aktif',
      tamamlandı: '✓ Tamamlandı',
      bekliyor: '◯ Henüz Görevlendirilmedi'
    }[durum] || '◯ Bekliyor')

  const belgeSonrakiDurum = (durum: string): Belge['durum'] =>
    ({
      oluşturulmadı: 'taslak' as const,
      taslak: 'oluşturuldu' as const,
      oluşturuldu: 'imza_bekliyor' as const,
      imza_bekliyor: 'imzalandı' as const,
      imzalandı: 'imzalandı' as const
    }[durum] || 'taslak')

  const belgeOlustur = (id: number): void => {
    setBelgeler((prev) =>
      prev.map((b) => (b.id === id ? { ...b, durum: belgeSonrakiDurum(b.durum) } : b))
    )
  }

  const belgeOnizlemeIcerigi = (belge: Belge | null) => {
    if (!belge) return null

    if (belge.ad === 'Yaklaşık Maliyet Cetveli') {
      const piyasaKomisyonu = komisyonlar.find((k) => k.tur.includes('Piyasa'))
      return (
        <div className="space-y-4 font-sans text-slate-800 dark:text-slate-200">
          <div className="text-center font-bold text-sm mb-2 uppercase border-b pb-2 border-slate-200 dark:border-slate-800">
            Yaklaşık Maliyet Hesap Cetveli
          </div>
          <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 font-bold">
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-left">Sıra</th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-left">Malzeme Adı</th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">Miktar</th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">Birim Fiyat</th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {kalemler.map((k, i) => (
                <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2">{i + 1}</td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 font-semibold">{k.malzemeAdi}</td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">{k.miktar} {k.birim}</td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">{k.birimFiyat.toLocaleString('tr-TR')} ₺</td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right font-bold">{k.toplamBedel.toLocaleString('tr-TR')} ₺</td>
                </tr>
              ))}
              <tr className="bg-slate-100 dark:bg-slate-900 font-black">
                <td colSpan={4} className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right uppercase">TOPLAM YAKLAŞIK MALİYET</td>
                <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right text-blue-600 dark:text-blue-400 text-sm">{toplamBedel.toLocaleString('tr-TR')} ₺</td>
              </tr>
            </tbody>
          </table>
          {piyasaKomisyonu && (
            <div className="grid grid-cols-3 gap-4 text-xs text-center mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
              {piyasaKomisyonu.uyeler.map((u) => (
                <div key={u.id} className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{u.adSoyad}</div>
                  <div className="text-[11px] text-slate-500">{u.gorev}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">✓ {u.imza}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (belge.ad === 'Piyasa Araştırması Tutanağı') {
      const enUygun = [...firmalar].filter((f) => f.teklifBedeli).sort((a, b) => (a.teklifBedeli || 0) - (b.teklifBedeli || 0))[0]
      const piyasaKomisyonu = komisyonlar.find((k) => k.tur.includes('Piyasa'))
      return (
        <div className="space-y-4 font-sans text-slate-800 dark:text-slate-200">
          <div className="text-center font-bold text-sm mb-2 uppercase border-b pb-2 border-slate-200 dark:border-slate-800">
            Piyasa Fiyat Araştırması Tutanağı
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {dosya.dosyaNo} sayılı dosya kapsamında ihtiyaç duyulan malzemelerin temini için aşağıda unvanları yazılı firmalardan fiyat teklifi alınmış olup, sonuçlar aşağıda gösterilmiştir.
          </p>
          <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 font-bold">
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-left">Firma Unvanı</th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">Teklif Tarihi</th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right">Teklif Bedeli</th>
                <th className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">Değerlendirme</th>
              </tr>
            </thead>
            <tbody>
              {firmalar.map((f) => (
                <tr key={f.id} className={f.durumu === 'seçildi' ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''}>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 font-semibold">{f.unvan}</td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center">{f.teklifTarihi || '—'}</td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-right font-bold">{f.teklifBedeli ? `${f.teklifBedeli.toLocaleString('tr-TR')} ₺` : '—'}</td>
                  <td className="border border-slate-300 dark:border-slate-800 px-2.5 py-2 text-center font-bold">{getFirmaStatusLabel(f.durumu)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {enUygun && (
            <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
              Yapılan değerlendirme sonucunda en uygun teklifin <strong className="text-blue-600 dark:text-blue-400">{enUygun.unvan}</strong> firmasından geldiği tespit edilmiş olup <strong className="text-emerald-600 dark:text-emerald-400">{enUygun.teklifBedeli?.toLocaleString('tr-TR')} ₺</strong> bedelle işlem yapılması komisyonumuzca uygun görülmüştür.
            </p>
          )}
          {piyasaKomisyonu && (
            <div className="grid grid-cols-3 gap-4 text-xs text-center mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
              {piyasaKomisyonu.uyeler.map((u) => (
                <div key={u.id} className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{u.adSoyad}</div>
                  <div className="text-[11px] text-slate-500">{u.gorev}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="text-center py-10 text-xs text-slate-400 space-y-2">
        <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
        <p className="font-bold text-slate-600 dark:text-slate-300">Bu belge türü için dinamik şablon hazırlanmıştır.</p>
        <p className="text-[11px]">Baskı ve çıktı için Çıktı Merkezi ekranını kullanabilirsiniz.</p>
      </div>
    )
  }

  const IlgiliBelgeCubugu = ({ belgeAdi }: { belgeAdi: string }) => {
    const belge = belgeler.find((b) => b.ad === belgeAdi)
    if (!belge) return null
    return (
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 mb-4 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={16} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
            İlgili belge: <span className="font-bold text-slate-900 dark:text-slate-100">{belge.ad}</span>
          </span>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold shrink-0 ${getBelgeDurumBadge(
              belge.durum
            )}`}
          >
            {getBelgeDurumLabel(belge.durum)}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setPreviewBelge(belge)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
            title="Önizle"
          >
            <Eye size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Yazdır"
          >
            <Printer size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="İndir"
          >
            <Download size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tarayıcıda Aç"
          >
            <ExternalLink size={16} />
          </button>
          <button
            onClick={() => setSelectedTab('belgeler')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Belgeler sekmesine git"
          >
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  const toplamBedel = kalemler.reduce((acc, k) => acc + k.toplamBedel, 0)
  const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0)
  const completedTasks = stages.reduce((acc, s) => acc + s.tasks.filter((t) => t.done).length, 0)
  const overallProgress = Math.round((completedTasks / totalTasks) * 100)
  const belgeTamamlanan = belgeler.filter((b) => b.durum === 'imzalandı').length

  const tabs = [
    { id: 'ozet', label: 'Özet' },
    { id: 'malzeme', label: 'Malzeme Listesi' },
    { id: 'firmalar', label: 'İstekli Firmalar' },
    { id: 'komisyon', label: 'Komisyon' },
    { id: 'belgeler', label: 'Belgeler' },
    { id: 'surec', label: 'Süreç' }
  ]

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900/60 p-6 animate-in fade-in duration-500 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Başlık ve Dosya Bilgileri */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
                  Doğrudan Temin Süreci
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                    Canlı Takip
                  </span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                  {dosya.kanunMaddesi} — {activeDosya?.konu || 'Aktif temin dosyası takip ve yönetim merkezi'}
                </p>
              </div>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-xl border font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 shrink-0">
              {dosya.durum}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                Dosya Numarası
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {dosya.dosyaNo}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                Temin Türü
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {dosya.teminTuru}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                Açılış Tarihi
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {dosya.tarih}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                Son Teklif Tarihi
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {dosya.sonTeklifTarihi}
              </div>
            </div>
            <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
                Dosyanın Durumu
              </div>
              <div className="text-base font-extrabold text-blue-900 dark:text-blue-100">
                {dosya.durum}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                Görevli Komisyon
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {komisyonlar.length} Komisyon
              </div>
            </div>
          </div>

          {/* Mini Süreç Şeridi — tüm sekmelerde görünür */}
          <button
            onClick={() => setSelectedTab('surec')}
            className="w-full mt-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 flex items-center hover:border-blue-400 transition-colors group cursor-pointer"
          >
            {stagesWithStatus.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      stage.status === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : stage.status === 'in-progress'
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {stage.status === 'completed' ? '✓' : stage.id}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs whitespace-nowrap ${
                      stage.status === 'in-progress'
                        ? 'font-bold text-slate-900 dark:text-slate-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {stage.title}
                  </span>
                </div>
                {index < stagesWithStatus.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full ${
                      stage.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
            <ArrowUpRight
              size={16}
              className="ml-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0"
            />
          </button>
        </div>

        {/* Tab Navigasyonu */}
        <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-955 rounded-t-xl'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ÖZET */}
        {selectedTab === 'ozet' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
            <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-blue-600 dark:text-blue-400" size={24} />
                <div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-bold">Genel İlerleme</div>
                  <div className="text-3xl font-black text-blue-900 dark:text-blue-100">{overallProgress}%</div>
                </div>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
                <div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Tamamlanan Görevler</div>
                  <div className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
                    {completedTasks}/{totalTasks}
                  </div>
                </div>
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Toplam görevlerin %{Math.round((completedTasks / totalTasks) * 100)}'si tamamlandı
              </div>
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="text-amber-600 dark:text-amber-400" size={24} />
                <div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-bold">Toplam Bedel</div>
                  <div className="text-2xl font-black text-amber-900 dark:text-amber-100">
                    {toplamBedel.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                {kalemler.length} malzeme kalemi
              </div>
            </div>

            <div className="bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-purple-600 dark:text-purple-400" size={24} />
                <div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-bold">Belgeler</div>
                  <div className="text-3xl font-black text-purple-900 dark:text-purple-100">
                    {belgeTamamlanan}/{belgeler.length}
                  </div>
                </div>
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">İmzalanan belge sayısı</div>
            </div>

            {/* Süreç Akışı Kartı */}
            <div className="md:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-slate-500" size={18} />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Süreç Akışı</h3>
                </div>
                <button
                  onClick={() => setSelectedTab('surec')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Tüm görevleri gör <ArrowUpRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {stagesWithStatus.map((stage) => {
                  const doneCount = stage.tasks.filter((t) => t.done).length
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setSelectedTab('surec')}
                      className="text-left border border-slate-150 dark:border-slate-800 rounded-xl p-3.5 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            stage.status === 'completed'
                              ? 'bg-emerald-500 text-white'
                              : stage.status === 'in-progress'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {stage.status === 'completed' ? '✓' : stage.id}
                        </div>
                        <span className="text-xs font-bold text-slate-855 dark:text-slate-100 leading-tight">
                          {stage.title}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${getLineColor(
                            stage.status
                          )}`}
                          style={{ width: `${stage.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold">
                        {doneCount}/{stage.tasks.length} görev
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-slate-500" size={18} />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Komisyon İmza Durumu
                </h3>
              </div>
              <div className="space-y-4">
                {komisyonlar.map((k) => (
                  <div key={k.id}>
                    <div className="text-xs font-bold text-slate-500 mb-2">{k.tur}</div>
                    <div className="flex flex-wrap gap-3">
                      {k.uyeler.map((u) => (
                        <span
                          key={u.id}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-bold ${
                            u.imza === 'imzaladı'
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {u.imza === 'imzaladı' ? '✓' : '◯'} {u.adSoyad} — {u.gorev}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MALZEME LİSTESİ */}
        {selectedTab === 'malzeme' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <IlgiliBelgeCubugu belgeAdi="Yaklaşık Maliyet Cetveli" />
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-900 uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Malzeme Adı</th>
                      <th className="px-6 py-3.5">Taşınır Kodu</th>
                      <th className="px-6 py-3.5 text-center">Miktar</th>
                      <th className="px-6 py-3.5 text-center">Birim Fiyat</th>
                      <th className="px-6 py-3.5 text-right">Toplam Bedel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {kalemler.map((kalem, index) => (
                      <tr
                        key={kalem.id}
                        className={index % 2 === 0 ? 'bg-white dark:bg-slate-955' : 'bg-slate-50/50 dark:bg-slate-900/30'}
                      >
                        <td className="px-6 py-4 text-xs text-slate-900 dark:text-slate-100 font-bold">
                          {kalem.malzemeAdi}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-lg font-mono text-[11px] font-bold">
                            {kalem.tasinirKodu}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium">
                          {kalem.miktar} {kalem.birim}
                        </td>
                        <td className="px-6 py-4 text-center font-medium">
                          {kalem.birimFiyat.toLocaleString('tr-TR')} ₺
                        </td>
                        <td className="px-6 py-4 font-black text-right text-slate-900 dark:text-slate-100">
                          {kalem.toplamBedel.toLocaleString('tr-TR')} ₺
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50/60 dark:bg-blue-950/30 border-t-2 border-slate-200 dark:border-slate-800 font-bold">
                      <td colSpan={4} className="px-6 py-4 text-right text-slate-800 dark:text-slate-200 font-extrabold uppercase">
                        TOPLAM BEDEL:
                      </td>
                      <td className="px-6 py-4 text-right text-blue-600 dark:text-blue-400 text-base font-black">
                        {toplamBedel.toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* İSTEKLİ FİRMALAR */}
        {selectedTab === 'firmalar' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  İstekli Firmaları Yönet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Bu dosya için davet edilen ve teklif veren firmalar
                </p>
              </div>
              <button
                onClick={() => navigate({ to: '/firmalar' as any })}
                className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2 cursor-pointer transition-colors"
              >
                <PlusCircle size={16} /> Firma Yönetimi
              </button>
            </div>
            <IlgiliBelgeCubugu belgeAdi="Piyasa Araştırması Tutanağı" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {firmalar.map((firma) => (
                <div
                  key={firma.id}
                  className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-950/50 rounded-2xl p-3 text-blue-600 dark:text-blue-400">
                      <Building2 size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                        {firma.unvan}
                      </h3>
                      <span
                        className={`inline-block text-[10px] px-2.5 py-0.5 rounded-lg border font-bold mt-1.5 ${getFirmaStatusBadge(
                          firma.durumu
                        )}`}
                      >
                        {getFirmaStatusLabel(firma.durumu)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400">Telefon</span>
                      <span className="font-semibold">{firma.telefon}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400">E-Posta</span>
                      <span className="font-semibold truncate max-w-[150px]">{firma.email}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400">Davet Tarihi</span>
                      <span className="font-semibold">{firma.davetTarihi}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400">Teklif Tarihi</span>
                      <span className="font-semibold">{firma.teklifTarihi || '—'}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                      <span className="text-slate-500 font-bold">Teklif Bedeli</span>
                      <span className="text-slate-900 dark:text-slate-100 font-black">
                        {firma.teklifBedeli ? `${firma.teklifBedeli.toLocaleString('tr-TR')} ₺` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KOMİSYON */}
        {selectedTab === 'komisyon' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Komisyonları Yönet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Bu dosya için görevlendirilen komisyonlar ve üyeleri
                </p>
              </div>
              <button
                onClick={() => navigate({ to: '/komisyonlar' as any })}
                className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2 cursor-pointer transition-colors"
              >
                <PlusCircle size={16} /> Komisyon Yönetimi
              </button>
            </div>
            <IlgiliBelgeCubugu belgeAdi="Komisyon Görevlendirme Yazısı" />

            {komisyonlar.map((k) => (
              <div
                key={k.id}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-955 hover:shadow-xs transition-shadow"
              >
                <div
                  onClick={() => setExpandedKomisyon(expandedKomisyon === k.id ? null : k.id)}
                  className="flex items-center gap-4 p-4 cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                    <Users size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {k.tur}
                      </h3>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold ${getKomisyonDurumBadge(
                          k.durum
                        )}`}
                      >
                        {getKomisyonDurumLabel(k.durum)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {k.dayanak} · Görevlendirme: {k.olusturmaTarihi} · {k.uyeler.length} üye
                    </p>
                  </div>
                  <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0">
                    <ChevronDown
                      size={20}
                      className={`text-slate-500 transition-transform ${
                        expandedKomisyon === k.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {expandedKomisyon === k.id && (
                  <div className="bg-white dark:bg-slate-955 border-t border-slate-200 dark:border-slate-800">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-900 uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-2.5">Ad Soyad</th>
                            <th className="px-6 py-2.5">Unvan</th>
                            <th className="px-6 py-2.5">Görev</th>
                            <th className="px-6 py-2.5 text-center">İmza Durumu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {k.uyeler.map((u, i) => (
                            <tr
                              key={u.id}
                              className={i % 2 === 0 ? 'bg-white dark:bg-slate-955' : 'bg-slate-50/50 dark:bg-slate-900/30'}
                            >
                              <td className="px-6 py-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <UserCheck size={16} className="text-slate-400" /> {u.adSoyad}
                              </td>
                              <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                {u.unvan}
                              </td>
                              <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                {u.gorev}
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span
                                  className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold ${
                                    u.imza === 'imzaladı'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  {u.imza === 'imzaladı' ? '✓ İmzaladı' : '◯ Bekliyor'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BELGELER */}
        {selectedTab === 'belgeler' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Süreç Belgeleri
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Bir belge seçip oluştur, imzaya gönder veya yazdır
                  </p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {belgeler.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBelge(b)}
                      className={`relative flex items-center justify-between gap-4 px-6 py-4 cursor-pointer transition-colors ${
                        selectedBelge?.id === b.id
                          ? 'bg-blue-50 dark:bg-blue-950/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={18} className="text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {b.ad}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.asama}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold ${getBelgeDurumBadge(
                            b.durum
                          )}`}
                        >
                          {getBelgeDurumLabel(b.durum)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuAcikId(menuAcikId === b.id ? null : b.id)
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Diğer işlemler"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {menuAcikId === b.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-6 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                          <div className="py-0.5">
                            <button
                              onClick={() => {
                                setPreviewBelge(b)
                                setMenuAcikId(null)
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Eye size={14} className="text-blue-500" /> Önizle
                            </button>
                            <button
                              onClick={() => setMenuAcikId(null)}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <ExternalLink size={14} className="text-slate-400" /> Tarayıcıda Aç
                            </button>
                            <button
                              onClick={() => setMenuAcikId(null)}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Edit3 size={14} className="text-slate-400" /> Düzenle
                            </button>
                          </div>
                          <div className="py-0.5">
                            <button
                              onClick={() => setMenuAcikId(null)}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Printer size={14} className="text-slate-400" /> Yazdır
                            </button>
                            <button
                              onClick={() => setMenuAcikId(null)}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Download size={14} className="text-slate-400" /> İndir
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-fit lg:sticky lg:top-6 shadow-xs">
                {selectedBelge ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {selectedBelge.ad}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {selectedBelge.asama}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedBelge(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <span
                      className={`inline-block text-[10px] px-2.5 py-0.5 rounded-lg border font-bold ${getBelgeDurumBadge(
                        selectedBelge.durum
                      )}`}
                    >
                      {getBelgeDurumLabel(selectedBelge.durum)}
                    </span>

                    <div className="space-y-2 pt-2">
                      {selectedBelge.durum !== 'imzalandı' && (
                        <button
                          onClick={() => {
                            belgeOlustur(selectedBelge.id)
                            setSelectedBelge((prev) =>
                              prev ? { ...prev, durum: belgeSonrakiDurum(prev.durum) } : null
                            )
                          }}
                          className={`w-full flex items-center justify-center gap-2 text-xs font-bold rounded-xl px-4 py-2.5 transition-colors cursor-pointer ${
                            selectedBelge.durum === 'imza_bekliyor'
                              ? 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                              : 'text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'
                          }`}
                        >
                          <PenLine size={16} />
                          {selectedBelge.durum === 'oluşturulmadı'
                            ? 'Taslak Oluştur'
                            : selectedBelge.durum === 'taslak'
                            ? 'Onaya Gönder'
                            : selectedBelge.durum === 'oluşturuldu'
                            ? 'İmzaya Gönder'
                            : 'İmzalı Nüsha Geldi, İşaretle'}
                        </button>
                      )}
                      {selectedBelge.durum === 'imza_bekliyor' && (
                        <p className="text-[11px] text-slate-400 text-center px-2">
                          Belge ilgili makama gönderildi. İmzalı hali elinize ulaştığında yukarıdaki butonla işaretleyebilirsiniz.
                        </p>
                      )}
                      <button
                        onClick={() => setPreviewBelge(selectedBelge)}
                        className="w-full flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
                      >
                        <Eye size={16} /> İçeriği Önizle
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-4 py-2.5 transition-colors cursor-pointer">
                        <Printer size={16} /> Yazdır
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-4 py-2.5 transition-colors cursor-pointer">
                        <Download size={16} /> PDF İndir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400 italic">
                    Detayları görmek için soldan bir belge seçin
                  </div>
                )}
              </div>
            </div>

            {/* TARANAN BELGE YÜKLEME */}
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Taranan Belgeler
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
                Fiziksel imzalı belgelerin taranmış (PDF) hallerini buraya yükleyin — dosyanın ekinde tutulur.
              </p>

              <label
                onDragOver={(e) => {
                  e.preventDefault()
                  setSurukleniyor(true)
                }}
                onDragLeave={() => setSurukleniyor(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setSurukleniyor(false)
                  dosyalariEkle(e.dataTransfer.files)
                }}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl px-6 py-8 cursor-pointer transition-colors ${
                  surukleniyor
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <Upload size={24} className={surukleniyor ? 'text-blue-500' : 'text-slate-400'} />
                <div className="text-xs text-slate-600 dark:text-slate-300 text-center font-medium">
                  <span className="font-bold text-blue-600 dark:text-blue-400">Dosya seç</span> veya sürükleyip bırak
                </div>
                <div className="text-[10px] text-slate-400">Yalnızca PDF</div>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => dosyalariEkle(e.target.files)}
                />
              </label>

              {taranmisBelgeler.length > 0 && (
                <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {taranmisBelgeler.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={16} className="text-red-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-slate-900 dark:text-slate-100 font-bold truncate">
                            {b.ad}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {b.boyut} · {b.tarih}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => taranmisBelgeSil(b.id)}
                        className="shrink-0 text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Kaldır"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SÜREÇ TABI */}
        {selectedTab === 'surec' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bir görevi işaretlemek için kutuya, ilgili sekmeye gitmek için ok ikonuna tıklayın.
            </p>
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              {stagesWithStatus.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  <div className="flex-1 min-w-0 md:min-w-[190px] border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-955 overflow-hidden flex flex-col shadow-xs">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
                          {stage.id}
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-tight">
                          {stage.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${getLineColor(
                              stage.status
                            )}`}
                            style={{ width: `${stage.progress}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-md border font-extrabold whitespace-nowrap ${getStatusColor(
                            stage.status
                          )}`}
                        >
                          {getStatusLabel(stage.status)}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 flex-1 space-y-1">
                      {stage.tasks.map((task, taskIndex) => (
                        <div
                          key={taskIndex}
                          className="group flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <button
                            onClick={() => toggleTask(stage.id, taskIndex)}
                            className="shrink-0 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer"
                            style={{
                              borderColor: task.done ? '#10b981' : '#cbd5e1',
                              backgroundColor: task.done ? '#10b981' : 'transparent'
                            }}
                            title="Tamamlandı olarak işaretle"
                          >
                            {task.done && <span className="text-white text-[10px] font-bold">✓</span>}
                          </button>
                          <span
                            className={`flex-1 text-xs ${
                              task.done
                                ? 'text-slate-400 dark:text-slate-500 line-through'
                                : 'text-slate-800 dark:text-slate-200 font-semibold'
                            }`}
                          >
                            {task.name}
                          </span>
                          {task.tab && (
                            <button
                              onClick={() => setSelectedTab(task.tab)}
                              className="shrink-0 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="İlgili sekmeye git"
                            >
                              <ArrowUpRight size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {index < stagesWithStatus.length - 1 && (
                    <>
                      <div className="hidden md:flex items-center justify-center px-1">
                        <ChevronDown className="text-slate-300 dark:text-slate-700 -rotate-90" size={20} />
                      </div>
                      <div className="flex md:hidden items-center justify-center py-1">
                        <ChevronDown className="text-slate-300 dark:text-slate-700" size={20} />
                      </div>
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BELGE ÖNİZLEME MODAL */}
      {previewBelge && (
        <Modal
          isOpen={Boolean(previewBelge)}
          onClose={() => setPreviewBelge(null)}
          title={`Belge Önizleme: ${previewBelge.ad}`}
          description={`${previewBelge.asama} Aşaması — Durum: ${getBelgeDurumLabel(previewBelge.durum)}`}
          className="max-w-4xl"
        >
          <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner max-h-[70vh] overflow-y-auto custom-scrollbar">
            {belgeOnizlemeIcerigi(previewBelge)}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => setPreviewBelge(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Kapat
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Printer size={14} /> Yazdır
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
