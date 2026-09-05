import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ClipboardList,
  DownloadCloud,
  FileText,
  Gavel,
  Moon,
  Printer,
  Sun
} from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'
import { TeminSelector } from './TeminSelector'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { WindowControls } from './header/WindowControls'
import { NotificationPopover } from './header/NotificationPopover'
import { SyncPopover } from './header/SyncPopover'

export function Header(): React.JSX.Element {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { activeDosyaId } = useWorkspaceStore()

  // Mod Seçici Durumu: 'dogrudan_temin' (KİK 22) veya 'ihale' (KİK 19 / 21)
  const [procurementMode, setProcurementMode] = useState<'dogrudan_temin' | 'ihale'>(() => {
    return (
      (localStorage.getItem('temin_procurement_mode') as 'dogrudan_temin' | 'ihale') ||
      'dogrudan_temin'
    )
  })

  const handleModeChange = (mode: 'dogrudan_temin' | 'ihale'): void => {
    setProcurementMode(mode)
    localStorage.setItem('temin_procurement_mode', mode)
    window.dispatchEvent(
      new CustomEvent('procurement-mode-change', {
        detail: { mode }
      })
    )
  }

  const handleCloseWorkspace = async (): Promise<void> => {
    window.dispatchEvent(new CustomEvent('workspace-close-request'))
  }

  const [updateStatus, setUpdateStatus] = useState<{
    status: string
    version?: string
  } | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const removeListener = window.electron?.ipcRenderer.on(
      'updater:status',
      (_event, data: { status: string; version?: string }) => {
        setUpdateStatus(data)
      }
    )
    return () => {
      if (removeListener) removeListener()
    }
  }, [])

  useEffect(() => {
    const menuBar = document.getElementById('native-menu-bar')
    function handleClickOutside(e: MouseEvent): void {
      if (menuBar && !menuBar.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMenuHover = (menuName: string): void => {
    if (activeMenu) {
      setActiveMenu(menuName)
    }
  }

  const handleClose = (): void => window.electron?.ipcRenderer.send('window-close')

  const menus = [
    {
      name: 'Dosya',
      items: [
        {
          label: 'Gösterge Paneli',
          onClick: () => navigate({ to: '/' })
        },
        {
          label: 'Yeni Doğrudan Temin Dosyası',
          onClick: () => navigate({ to: '/dosyalar/yeni' })
        },
        {
          label: 'Veri Dosyası Detayları (.dtal)',
          onClick: () => navigate({ to: '/dosya' })
        },
        {
          label: 'Kullanıcı Profili',
          onClick: () => navigate({ to: '/profil' })
        },
        { divider: true },
        {
          label: 'Farklı Kurum Veri Dosyası Aç (.dtal)...',
          onClick: async () => {
            try {
              const res = await window.electron?.ipcRenderer.invoke('dialog:showOpenDialog')
              if (!res?.canceled && res?.filePath) {
                const result = await useWorkspaceStore
                  .getState()
                  .openWorkspace(res.filePath as string, false)
                if (result.success) {
                  window.location.reload()
                } else {
                  alert(`Kurum dosyası açılamadı!\nHata: ${result.error || 'Bilinmeyen hata'}`)
                }
              }
            } catch (e) {
              console.error(e)
            }
          }
        },
        {
          label: 'Kurum Dosyasını Kapat (.dtal)',
          onClick: handleCloseWorkspace
        },
        { divider: true },
        { label: 'Uygulamadan Çık (Alt+F4)', onClick: handleClose }
      ]
    },
    // Mod Bazlı Menüler: Doğrudan Temin vs İhale Süreçleri
    ...(procurementMode === 'dogrudan_temin'
      ? [
          {
            name: 'Doğrudan Temin',
            onClick: () => navigate({ to: '/dosyalar' }),
            items: [
              {
                label: 'Tüm Doğrudan Temin Dosyaları',
                onClick: () => navigate({ to: '/dosyalar' })
              },
              {
                label: 'Yeni Dosya Oluştur',
                onClick: () => navigate({ to: '/dosyalar/yeni' })
              },
              {
                label: 'Hızlı Dosya Ekle / Güncelle',
                onClick: () => navigate({ to: '/hizli-dosya-ekle' })
              },
              {
                label: 'Süreç Akış Haritası (Beta)',
                onClick: () => navigate({ to: '/surec-akisi' })
              }
            ]
          },
          ...(activeDosyaId
            ? [
                {
                  name: 'Süreç Yönetimi',
                  items: [
                    {
                      label: 'Süreç Takip & Durum Paneli',
                      onClick: () => navigate({ to: '/takip' })
                    },
                    {
                      label: 'Belge Çıktı Merkezi',
                      onClick: () => navigate({ to: '/cikti-merkezi' })
                    },
                    {
                      label: 'Hızlı Dosya Ekle / Güncelle',
                      onClick: () => navigate({ to: '/hizli-dosya-ekle' })
                    },
                    {
                      label: 'Şablon & Taslak Yöneticisi',
                      onClick: () => navigate({ to: '/taslakyonetim' })
                    }
                  ]
                },
                {
                  name: 'Adım Adım Süreç',
                  items: [
                    {
                      label: '1. İhtiyaç Listesi & Maliyet & Onay',
                      onClick: () => navigate({ to: '/dosya/hazirlik-ve-ihtiyac' })
                    },
                    {
                      label: '2. Piyasa Fiyat Araştırması',
                      onClick: () => navigate({ to: '/dosya/piyasa-fiyat-arastirmasi' })
                    },
                    {
                      label: '3. Sipariş & Sözleşme',
                      onClick: () => navigate({ to: '/dosya/siparis-ve-sozlesme' })
                    },
                    {
                      label: '4. Muayene & Kabul & Ödeme İşlemleri',
                      onClick: () => navigate({ to: '/dosya/kabul-ve-odeme' })
                    },
                    {
                      label: '5. Klasör & Kapaklar',
                      onClick: () => navigate({ to: '/dosya/klasor-ve-kapaklar' })
                    }
                  ]
                }
              ]
            : [])
        ]
      : [
          {
            name: 'İhale Yönetimi',
            onClick: () => navigate({ to: '/harcama-merkezi' }),
            items: [
              {
                label: 'Açık İhale Süreçleri (KİK Md. 19)',
                onClick: () => navigate({ to: '/harcama-merkezi' })
              },
              {
                label: 'Pazarlık Usulü İhale (KİK Md. 21)',
                onClick: () => navigate({ to: '/harcama-merkezi' })
              },
              {
                label: 'İhale Hakediş & Harcama Raporları',
                onClick: () => navigate({ to: '/hakedis' })
              },
              { divider: true },
              {
                label: 'Şablon & Kategori Yönetimi',
                onClick: () => navigate({ to: '/degiskenler' })
              },
              {
                label: 'Taslak & Belge Havuzu',
                onClick: () => navigate({ to: '/taslakyonetim' })
              }
            ]
          },
          ...(activeDosyaId
            ? [
                {
                  name: 'İhale Süreç Adımları',
                  items: [
                    {
                      label: '1. İhale Onay Belgesi & Şartnameler',
                      onClick: () => navigate({ to: '/dosya/hazirlik-ve-ihtiyac' })
                    },
                    {
                      label: '2. İhale İlanı & Davet Mektupları',
                      onClick: () => navigate({ to: '/dosya/piyasa-fiyat-arastirmasi' })
                    },
                    {
                      label: '3. Teklif Değerlendirme & Komisyon Kararı',
                      onClick: () => navigate({ to: '/dosya/siparis-ve-sozlesme' })
                    },
                    {
                      label: '4. Sözleşme & Teminat İşlemleri',
                      onClick: () => navigate({ to: '/dosya/kabul-ve-odeme' })
                    },
                    {
                      label: '5. İhale Klasörü & Arşivleme',
                      onClick: () => navigate({ to: '/dosya/klasor-ve-kapaklar' })
                    }
                  ]
                },
                {
                  name: 'İhale İşlemleri',
                  items: [
                    {
                      label: 'İhale Dosya Durumu & Takip',
                      onClick: () => navigate({ to: '/takip' })
                    },
                    {
                      label: 'İhale Belge Çıktı Merkezi',
                      onClick: () => navigate({ to: '/cikti-merkezi' })
                    },
                    {
                      label: 'Hakediş & Ödeme Takibi',
                      onClick: () => navigate({ to: '/hakedis' })
                    }
                  ]
                }
              ]
            : []),
          {
            name: 'İhale Mevzuatı',
            items: [
              {
                label: 'İhale Eşik Değerleri & Limitler',
                onClick: () => navigate({ to: '/mevzuat' })
              },
              {
                label: 'KİK Standart Şablon & Formlar',
                onClick: () => navigate({ to: '/taslakyonetim' })
              },
              {
                label: 'Mevzuat & Genelgeler',
                onClick: () => navigate({ to: '/mevzuat' })
              }
            ]
          }
        ]),
    {
      name: 'Sistem Tanımları',
      items: [
        {
          label: 'Kurum Bilgileri',
          onClick: () => navigate({ to: '/kurum' })
        },
        {
          label: 'Birim Yönetimi',
          onClick: () => navigate({ to: '/birimler' })
        },
        {
          label: 'Personel Yönetimi',
          onClick: () => navigate({ to: '/personel' })
        },
        {
          label: 'Komisyon Yönetimi',
          onClick: () => navigate({ to: '/komisyonlar' })
        },
        {
          label: 'Görev Tanımları',
          onClick: () => navigate({ to: '/komisyon-gorevleri' })
        },
        {
          label: 'Ambar Yönetimi',
          onClick: () => navigate({ to: '/ambar' })
        },
        { divider: true },
        {
          label: 'İstekli Firma Yönetimi',
          onClick: () => navigate({ to: '/firmalar' })
        },
        { divider: true },
        {
          label: 'Mal/Hizmet/Yapım İşleri Listesi',
          onClick: () => navigate({ to: '/malzemeler' })
        },
        {
          label: 'Taşınır Kodları',
          onClick: () => navigate({ to: '/tasinirkod' })
        },
        {
          label: 'OKAS Kodları',
          onClick: () => navigate({ to: '/okaskod' })
        },
        {
          label: 'Ölçü Birimleri',
          onClick: () => navigate({ to: '/olcubirimleri' })
        }
      ]
    },
    {
      name: 'Yönetim & Yardım',
      items: [
        {
          label: 'Genel Ayarlar',
          onClick: () => navigate({ to: '/ayarlar' })
        },
        {
          label: 'Mevzuat ve Parametreler',
          onClick: () => navigate({ to: '/mevzuat' })
        },
        {
          label: 'Şablon & Kategori Yönetimi',
          onClick: () => navigate({ to: '/degiskenler' })
        },
        {
          label: 'Şablon Listesi ve Süreçler',
          onClick: () => navigate({ to: '/taslakyonetim' })
        },
        {
          label: 'Toplu İçe Aktarma',
          onClick: () => navigate({ to: '/import' })
        },
        {
          label: 'Raporlar',
          onClick: () => navigate({ to: '/raporlar' })
        },
        { divider: true },
        {
          label: 'Arayüzü Yenile (Ctrl+R)',
          onClick: () => window.location.reload()
        },
        {
          label: 'Geliştirici Araçları (DevTools)',
          onClick: () => window.electron?.ipcRenderer.send('window-toggle-devtools')
        },
        { divider: true },
        {
          label: 'Kullanım Kılavuzu & Yardım',
          onClick: () => navigate({ to: '/yardim' })
        },
        {
          label: 'Sürüm Notları (Changelog)',
          onClick: () => navigate({ to: '/changelog' })
        },
        {
          label: 'Hakkında...',
          onClick: () =>
            alert('TEMİN 360\nKamu Harcama, İhale, Doğrudan Temin ve Hakediş Yönetim Sistemi')
        }
      ]
    }
  ]

  return (
    <header
      className="flex flex-col bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shrink-0 z-50 shadow-xs transition-all duration-300 relative select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* ÜST SATIR: Menü Çubuğu, Mod Switcher ve Sistem/Pencere Kontrolleri */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-slate-200/40 dark:border-slate-800/40 relative">
        {/* SOL: VS Code-Style Menu Bar */}
        <div
          id="native-menu-bar"
          className="flex items-center gap-1 z-50 text-[11px] font-medium"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {menus.map((m) => (
            <div key={m.name} className="relative">
              <button
                onClick={() => {
                  if (m.onClick) {
                    m.onClick()
                    setActiveMenu(null)
                  } else {
                    setActiveMenu(activeMenu === m.name ? null : m.name)
                  }
                }}
                onMouseEnter={() => {
                  if (m.onClick) {
                    setActiveMenu(null)
                  } else {
                    handleMenuHover(m.name)
                  }
                }}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  activeMenu === m.name
                    ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-200/40 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m.name}
              </button>

              {activeMenu === m.name && m.items && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl py-1 z-[100] animate-in fade-in slide-in-from-top-1">
                  {m.items.map((item, idx) =>
                    item.divider ? (
                      <div key={idx} className="h-[1px] bg-slate-150 dark:bg-slate-800 my-1" />
                    ) : (
                      <button
                        key={idx}
                        onClick={() => {
                          item.onClick?.()
                          setActiveMenu(null)
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between cursor-pointer text-xs"
                      >
                        <span>{item.label}</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SAĞ: Mod Geçiş Switch'i + Sistem Kontrolleri (Tema, Eşitleme, Bildirim, vb.) */}
        <div
          className="flex items-center space-x-2 pr-36"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* Kompakt ve Şık Mod Seçici (Doğrudan Temin vs İhale Süreçleri) */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/70 p-0.5 rounded-md border border-slate-300/50 dark:border-slate-700/50 text-[11px] font-medium mr-1.5 shadow-2xs">
            <button
              onClick={() => handleModeChange('dogrudan_temin')}
              title="Doğrudan Temin (KİK Md. 22)"
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                procurementMode === 'dogrudan_temin'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Doğrudan Temin</span>
            </button>
            <button
              onClick={() => handleModeChange('ihale')}
              title="Açık İhale (Md. 19) & Pazarlık Usulü (Md. 21)"
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                procurementMode === 'ihale'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Gavel className="w-3 h-3" />
              <span>İhale Süreçleri</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300/60 dark:bg-slate-700/60 mx-0.5" />

          {/* Bulut Senkronizasyon Popover */}
          <SyncPopover />

          {/* Tema Değiştir */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
            title="Tema Değiştir"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Güncelleme Durumu */}
          {updateStatus &&
            (updateStatus.status === 'available' || updateStatus.status === 'downloaded') && (
              <button
                onClick={() => {
                  if (updateStatus.status === 'downloaded') {
                    window.electron?.ipcRenderer.invoke('updater:quit-and-install')
                  } else {
                    alert('Güncelleme arka planda indiriliyor, lütfen bekleyin...')
                  }
                }}
                className="relative p-1 text-blue-500 hover:text-blue-600 transition-all rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                title={
                  updateStatus.status === 'downloaded'
                    ? `Yeni sürüm hazır: ${updateStatus.version} (Kurmak için tıkla)`
                    : `Yeni sürüm iniyor: ${updateStatus.version}...`
                }
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
              </button>
            )}

          {/* Bildirim Popover */}
          <NotificationPopover
            isOpen={showNotifications}
            onToggle={setShowNotifications}
          />
        </div>

        {/* Pencere Kontrolleri */}
        <WindowControls />
      </div>

      {/* ALT SATIR: Çalışma Dosyası Seçimi & Süreç Butonları */}
      <div
        className="min-h-9 py-1.5 flex items-center justify-between bg-slate-100/50 dark:bg-slate-950/20 border-t border-slate-200/30 dark:border-slate-800/30 select-none px-4 relative"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Sol tarafta dengeleyici boşluk */}
        <div className="w-[280px] shrink-0 hidden lg:block"></div>

        {/* Orta: Temin Seçici */}
        <div className="flex-1 flex justify-center">
          <TeminSelector />
        </div>

        {/* Sağ: Süreç & Çıktı Butonları */}
        {activeDosyaId ? (
          <div className="flex items-center gap-2 shrink-0 min-w-[280px] justify-end">
            <Link
              to="/takip"
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 border border-indigo-100/50 dark:border-indigo-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              {procurementMode === 'dogrudan_temin' ? 'Süreç & Durum' : 'İhale Takip & Durum'}
            </Link>
            <Link
              to="/cikti-merkezi"
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-100/50 dark:border-emerald-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Çıktı Merkezi
            </Link>
          </div>
        ) : (
          <div className="min-w-[280px] shrink-0 hidden lg:block"></div>
        )}
      </div>
    </header>
  )
}
