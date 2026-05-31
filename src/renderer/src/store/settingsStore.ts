import { create } from 'zustand'

interface SettingsState {
  institutionName: string
  institutionLogo: string | null
  logoLeft: string | null
  logoRight: string | null
  adminName: string
  adminTitle: string
  adminUsername: string
  institutionCode: string
  themeLightVars: string
  themeDarkVars: string
  limitType: string
  finansmanKodu: string
  institutionType: string
  kurumsalKod1: string
  kurumsalKod2: string
  kurumsalKod3: string
  kurumsalKod4: string
  fonksiyonelKod1: string
  fonksiyonelKod2: string
  fonksiyonelKod3: string
  fonksiyonelKod4: string
  muhasebeBirimKodu: string
  muhasebeBirimAdi: string
  harcamaBirimKodu: string
  harcamaBirimAdi: string
  setInstitutionName: (name: string) => void
  setInstitutionLogo: (logo: string | null) => void
  setAdminName: (name: string) => void
  setAdminTitle: (title: string) => void
  setAdminUsername: (username: string) => void
  setInstitutionCode: (code: string) => void
  setThemeLightVars: (vars: string) => void
  setThemeDarkVars: (vars: string) => void
  setLimitType: (limitType: string) => void
  setFinansmanKodu: (finansmanKodu: string) => void
  setInstitutionType: (type: string) => void
  setKurumsalKod1: (val: string) => void
  setKurumsalKod2: (val: string) => void
  setKurumsalKod3: (val: string) => void
  setKurumsalKod4: (val: string) => void
  setFonksiyonelKod1: (val: string) => void
  setFonksiyonelKod2: (val: string) => void
  setFonksiyonelKod3: (val: string) => void
  setFonksiyonelKod4: (val: string) => void
  setMuhasebeBirimKodu: (val: string) => void
  setMuhasebeBirimAdi: (val: string) => void
  setHarcamaBirimKodu: (val: string) => void
  setHarcamaBirimAdi: (val: string) => void
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  institutionName: 'Kurum Bilgisi Bekleniyor...',
  institutionLogo: null,
  logoLeft: null,
  logoRight: null,
  adminName: 'Sistem Yöneticisi',
  adminTitle: 'Destek Sorumlusu',
  adminUsername: 'admin',
  institutionCode: '',
  themeLightVars: '',
  themeDarkVars: '',
  limitType: 'diger',
  finansmanKodu: '5',
  institutionType: '',
  kurumsalKod1: '',
  kurumsalKod2: '',
  kurumsalKod3: '',
  kurumsalKod4: '',
  fonksiyonelKod1: '',
  fonksiyonelKod2: '',
  fonksiyonelKod3: '',
  fonksiyonelKod4: '',
  muhasebeBirimKodu: '',
  muhasebeBirimAdi: '',
  harcamaBirimKodu: '',
  harcamaBirimAdi: '',
  setInstitutionName: (name) => set({ institutionName: name }),
  setInstitutionLogo: (logo) => set({ institutionLogo: logo }),
  setAdminName: (name) => set({ adminName: name }),
  setAdminTitle: (title) => set({ adminTitle: title }),
  setAdminUsername: (username) => set({ adminUsername: username }),
  setInstitutionCode: (code) => set({ institutionCode: code }),
  setThemeLightVars: (vars) => set({ themeLightVars: vars }),
  setThemeDarkVars: (vars) => set({ themeDarkVars: vars }),
  setLimitType: (limitType) => set({ limitType }),
  setFinansmanKodu: (finansmanKodu) => set({ finansmanKodu }),
  setInstitutionType: (type) => set({ institutionType: type }),
  setKurumsalKod1: (val) => set({ kurumsalKod1: val }),
  setKurumsalKod2: (val) => set({ kurumsalKod2: val }),
  setKurumsalKod3: (val) => set({ kurumsalKod3: val }),
  setKurumsalKod4: (val) => set({ kurumsalKod4: val }),
  setFonksiyonelKod1: (val) => set({ fonksiyonelKod1: val }),
  setFonksiyonelKod2: (val) => set({ fonksiyonelKod2: val }),
  setFonksiyonelKod3: (val) => set({ fonksiyonelKod3: val }),
  setFonksiyonelKod4: (val) => set({ fonksiyonelKod4: val }),
  setMuhasebeBirimKodu: (val) => set({ muhasebeBirimKodu: val }),
  setMuhasebeBirimAdi: (val) => set({ muhasebeBirimAdi: val }),
  setHarcamaBirimKodu: (val) => set({ harcamaBirimKodu: val }),
  setHarcamaBirimAdi: (val) => set({ harcamaBirimAdi: val }),
  loadSettings: async () => {
    try {
      const settings = await window.electron.ipcRenderer.invoke('db:get-settings')
      set({
        institutionName: settings.institutionName || 'Kurum Adı Bulunamadı',
        institutionLogo: settings.institutionLogo || null,
        logoLeft: settings.logoLeft || null,
        logoRight: settings.logoRight || null,
        adminName: settings.adminName || 'Sistem Yöneticisi',
        adminTitle: settings.adminTitle || 'Destek Sorumlusu',
        adminUsername: settings.adminUsername || 'admin',
        institutionCode: settings.institutionCode || '',
        themeLightVars: settings.themeLightVars || '',
        themeDarkVars: settings.themeDarkVars || '',
        limitType: settings.limitType || 'diger',
        finansmanKodu: settings.finansmanKodu || '5',
        institutionType: settings.institutionType || '',
        kurumsalKod1: settings.kurumsalKod1 || '',
        kurumsalKod2: settings.kurumsalKod2 || '',
        kurumsalKod3: settings.kurumsalKod3 || '',
        kurumsalKod4: settings.kurumsalKod4 || '',
        fonksiyonelKod1: settings.fonksiyonelKod1 || '',
        fonksiyonelKod2: settings.fonksiyonelKod2 || '',
        fonksiyonelKod3: settings.fonksiyonelKod3 || '',
        fonksiyonelKod4: settings.fonksiyonelKod4 || '',
        muhasebeBirimKodu: settings.muhasebeBirimKodu || '',
        muhasebeBirimAdi: settings.muhasebeBirimAdi || '',
        harcamaBirimKodu: settings.harcamaBirimKodu || '',
        harcamaBirimAdi: settings.harcamaBirimAdi || ''
      })
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error)
      set({
        institutionName: 'Kurum Adı Bulunamadı',
        institutionLogo: null,
        logoLeft: null,
        logoRight: null,
        adminName: 'Sistem Yöneticisi',
        adminTitle: 'Destek Sorumlusu',
        adminUsername: 'admin',
        institutionCode: '',
        themeLightVars: '',
        themeDarkVars: '',
        limitType: 'diger',
        finansmanKodu: '5',
        institutionType: '',
        kurumsalKod1: '',
        kurumsalKod2: '',
        kurumsalKod3: '',
        kurumsalKod4: '',
        fonksiyonelKod1: '',
        fonksiyonelKod2: '',
        fonksiyonelKod3: '',
        fonksiyonelKod4: '',
        muhasebeBirimKodu: '',
        muhasebeBirimAdi: '',
        harcamaBirimKodu: '',
        harcamaBirimAdi: ''
      })
    }
  }
}))
