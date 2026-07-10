import { create } from 'zustand'

export interface TabItem {
  path: string
  label: string
}

interface TabState {
  tabs: TabItem[]
  activeTabPath: string
  addTab: (path: string) => void
  closeTab: (path: string) => string | null // Returns the next path to navigate to, if any
  setActiveTab: (path: string) => void
  updateTabLabel: (path: string, label: string) => void
  clearTabs: () => void
  clearDosyaTabs: () => void
}

export function getTabLabel(fullPath: string): string {
  const path = fullPath.split('?')[0]
  if (path === '/') return 'Gösterge Paneli'
  if (path === '/dosyalar/yeni') return 'Yeni Doğrudan Temin Dosyası'
  if (path.startsWith('/dosyalar')) return 'Doğrudan Temin'
  if (path.startsWith('/firmalar')) return 'Firmalar'
  if (path.startsWith('/personel')) return 'Personel Yönetimi'
  if (path.startsWith('/mevzuat')) return 'Mevzuat & Limitler'
  if (path.startsWith('/ayarlar')) return 'Ayarlar'
  if (path.startsWith('/birimler')) return 'Birim Yönetimi'
  if (path.startsWith('/ambar')) return 'Ambar Tanımları'
  if (path.startsWith('/malzemeler/yeni')) return 'Yeni Kayıt (Mal/Hizmet/Yapım İşi)'
  if (path.startsWith('/malzemeler')) return 'Kayıtlı Mal / Hizmet / Yapım İşleri Listesi'
  if (path.startsWith('/kurum')) return 'Kurum Bilgileri'
  if (path.startsWith('/olcubirimleri')) return 'Ölçü Birimleri'
  if (path.startsWith('/profil')) return 'Kullanıcı Profili'
  if (path.startsWith('/dosya/hazirlik-ve-ihtiyac')) return '1. Hazırlık ve İhtiyaç'
  if (path.startsWith('/dosya/piyasa-fiyat-arastirmasi'))
    return '2. Teklifler & Piyasa Fiyat Araştırması'
  if (path.startsWith('/dosya/siparis-ve-sozlesme')) return '3. Sipariş & Sözleşme'
  if (path.startsWith('/dosya/kabul-ve-odeme')) return '4. Kabul & Ödeme İşlemleri'
  if (path.startsWith('/dosya/klasor-ve-kapaklar')) return '5. Klasör & Kapaklar'
  if (path.startsWith('/dosya/malzemeler/liste')) return 'İhtiyaç Listesi'
  if (path.startsWith('/dosya/malzemeler/son-alim')) return 'Son Alım Fiyat Cetveli'
  if (path.startsWith('/dosya/luzum/talep-formu')) return 'İhtiyaç Talep Formu'
  if (path.startsWith('/dosya/luzum/belge')) return 'Lüzum Müzekkeresi'
  if (path.startsWith('/dosya/luzum/onay-eki')) return 'Onay Eki'
  if (path.startsWith('/dosya/onay/butce-sorgu')) return 'Bütçe Sorgusu'
  if (path.startsWith('/dosya/komisyon/fiyat-arastirma')) return 'Fiyat Araştırma Komisyonu'
  if (path.startsWith('/dosya/komisyon/fiyat-muayene')) return 'Fiyat Araştırma & Muayene'
  if (path.startsWith('/dosya/firmalar-maliyet/istekliler')) return 'İstekli Firmalar'
  if (path.startsWith('/dosya/firmalar-maliyet/yaklasik')) return 'Yaklaşık Maliyet'
  if (path.startsWith('/dosya/firmalar-maliyet/tutanak')) return 'Piyasa Araştırma Tutanağı'
  if (path.startsWith('/dosya/komisyon/onay-eki')) return 'Komisyon Atama Onay Eki'
  if (path.startsWith('/dosya/onay/dt-onay')) return 'Doğrudan Temin Onay Belgesi'
  if (path.startsWith('/dosya/onay/ihale-onay')) return 'İhale Onay Belgesi'
  if (path.startsWith('/dosya/komisyon/muayene-kabul')) return 'Muayene Kabul ve Tespit'
  if (path.startsWith('/dosya/luzum/teslim-tesellum')) return 'Teslim Tesellüm'
  if (path.startsWith('/dosya/harcama/talimat')) return 'Harcama Talimatı'
  if (path.startsWith('/dosya/harcama/pusula')) return 'Harcama Pusulası'
  if (path.startsWith('/dosya/cikti-merkezi')) return 'Çıktı & Üretim Merkezi'
  if (path.startsWith('/hakedis')) return 'Hakediş & Süreç Yönetimi'
  if (path.startsWith('/dosya')) return 'Dosya Detayları'
  if (path.startsWith('/takip')) return 'Takip & Durum'
  if (path.startsWith('/raporlar')) return 'Raporlar'
  if (path.startsWith('/tema')) return 'Tema Ayarları'
  if (path.startsWith('/tasinirkod')) return 'Taşınır Kodları'
  if (path.startsWith('/okaskod')) return 'OKAS Kodları'
  if (path.startsWith('/sablonlar')) return 'Şablon Yönetimi'
  if (path.startsWith('/degiskenler')) return 'Şablon Değişkenleri'
  if (path.startsWith('/komisyonlar/detay')) return 'Komisyon Detayı'
  if (path.startsWith('/komisyonlar')) return 'Komisyon Yönetimi'
  if (path.startsWith('/komisyon-gorevleri')) return 'Görev Tanımları'
  if (path.startsWith('/taslakyonetim')) return 'Süreç Taslakları'
  if (path.startsWith('/changelog')) return 'Sürüm Notları'
  if (path.startsWith('/yardim')) return 'Yardım & Kılavuzlar'
  if (path.startsWith('/import')) return 'Toplu Veri İçe Aktarma'
  if (path.startsWith('/hizli-dosya-ekle')) return 'Hızlı Dosya Ekle'
  if (path.startsWith('/cikti-merkezi')) return 'Çıktı & Üretim Merkezi'
  return 'Yeni Sekme'
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [{ path: '/', label: 'Gösterge Paneli' }],
  activeTabPath: '/',

  addTab: (path) => {
    if (!path || path.startsWith('/launcher') || path.startsWith('/lockscreen')) return

    const { tabs } = get()
    const exists = tabs.some((t) => t.path === path)

    if (!exists) {
      const label = getTabLabel(path)
      const newTabs = [...tabs, { path, label }]
      set({ tabs: newTabs, activeTabPath: path })
    } else {
      set({ activeTabPath: path })
    }
  },

  closeTab: (path) => {
    if (path === '/') return null

    const { tabs, activeTabPath } = get()
    const newTabs = tabs.filter((t) => t.path !== path)

    let nextPath: string | null = null

    if (activeTabPath === path) {
      if (newTabs.length > 0) {
        const index = tabs.findIndex((t) => t.path === path)
        const nextIndex = Math.max(0, index - 1)
        nextPath = newTabs[nextIndex].path
      } else {
        nextPath = '/'
        newTabs.push({ path: '/', label: 'Gösterge Paneli' })
      }
    }

    set({ tabs: newTabs, activeTabPath: nextPath || activeTabPath })
    return nextPath
  },

  setActiveTab: (path) => {
    set({ activeTabPath: path })
  },

  updateTabLabel: (path, label) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.path === path ? { ...t, label } : t))
    }))
  },

  clearTabs: () => {
    set({ tabs: [{ path: '/', label: 'Gösterge Paneli' }], activeTabPath: '/' })
  },

  clearDosyaTabs: () => {
    const { tabs, activeTabPath } = get()
    const newTabs = tabs.filter((t) => !t.path.startsWith('/dosya/') && t.path !== '/dosya')
    if (newTabs.length === 0) {
      newTabs.push({ path: '/', label: 'Gösterge Paneli' })
    }
    const isActiveTabCleared = !newTabs.some((t) => t.path === activeTabPath)
    set({
      tabs: newTabs,
      activeTabPath: isActiveTabCleared ? newTabs[0].path : activeTabPath
    })
  }
}))
