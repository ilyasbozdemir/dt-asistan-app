import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { DownloadCloud, Moon, Sun, ClipboardList, Printer } from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'
import { TeminSelector } from './TeminSelector'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useQueryClient } from '@tanstack/react-query'
import { WindowControls } from './header/WindowControls'
import { NotificationPopover } from './header/NotificationPopover'
import { SyncPopover } from './header/SyncPopover'

export function Header(): React.JSX.Element {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { closeWorkspace, activeDosyaId } = useWorkspaceStore()
  const queryClient = useQueryClient()

  const handleCloseWorkspace = async (): Promise<void> => {
    await closeWorkspace()
    queryClient.clear()
  }

  const [updateStatus, setUpdateStatus] = useState<{
    status: string
    version?: string
  } | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const removeListener = window.electron?.ipcRenderer.on('updater:status', (_event, data) => {
      setUpdateStatus(data as any)
    })
    return () => {
      if (removeListener) removeListener()
    }
  }, [])

  useEffect(() => {
    const menuBar = document.getElementById('native-menu-bar')
    function handleClickOutside(e: MouseEvent) {
      if (menuBar && !menuBar.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMenuHover = (menuName: string) => {
    if (activeMenu) {
      setActiveMenu(menuName)
    }
  }

  const handleClose = () => window.electron?.ipcRenderer.send('window-close')

  const menus = [
    {
      name: 'Dosya',
      items: [
        {
          label: 'Gösterge Paneli',
          onClick: () => navigate({ to: '/' as any })
        },
        {
          label: 'Yeni Doğrudan Temin Dosyası',
          onClick: () => navigate({ to: '/dosyalar/yeni' as any })
        },
        {
          label: 'Veri Dosyası Detayları (.dtal)',
          onClick: () => navigate({ to: '/dosya' as any })
        },
        {
          label: 'Kullanıcı Profili',
          onClick: () => navigate({ to: '/profil' as any })
        },
        { divider: true },
        {
          label: 'Kurum Dosyasını Kapat (.dtal)',
          onClick: handleCloseWorkspace
        },
        { divider: true },
        { label: 'Uygulamadan Çık (Alt+F4)', onClick: handleClose }
      ]
    },
    {
      name: 'Doğrudan Temin',
      onClick: () => navigate({ to: '/dosyalar' as any })
    },
    ...(activeDosyaId
      ? [
          {
            name: 'Süreç Yönetimi',
            items: [
              {
                label: 'Süreç Takip & Durum Paneli',
                onClick: () => navigate({ to: '/takip' as any })
              },
              {
                label: 'Belge Çıktı Merkezi',
                onClick: () => navigate({ to: '/cikti-merkezi' as any })
              },
              {
                label: 'Hızlı Dosya Ekle / Güncelle',
                onClick: () => navigate({ to: '/hizli-dosya-ekle' as any })
              }
            ]
          },
          {
            name: 'Adım Adım Süreç',
            items: [
              {
                label: '1. Hazırlık ve İhtiyaç',
                onClick: () => navigate({ to: '/dosya/hazirlik-ve-ihtiyac' as any })
              },
              {
                label: '2. Piyasa Fiyat Araştırması',
                onClick: () => navigate({ to: '/dosya/piyasa-fiyat-arastirmasi' as any })
              },
              {
                label: '3. Sipariş & Sözleşme',
                onClick: () => navigate({ to: '/dosya/siparis-ve-sozlesme' as any })
              },
              {
                label: '4. Kabul & Ödeme İşlemleri',
                onClick: () => navigate({ to: '/dosya/kabul-ve-odeme' as any })
              },
              {
                label: '5. Klasör & Kapaklar',
                onClick: () => navigate({ to: '/dosya/klasor-ve-kapaklar' as any })
              }
            ]
          },
          {
            name: 'Hakediş İşlemleri',
            items: [
              {
                label: 'Hakediş Raporları',
                onClick: () => navigate({ to: '/hakedis' as any })
              },
              {
                label: 'Yeni Hakediş Dosyası',
                onClick: () => navigate({ to: '/hakedis' as any })
              },
              { divider: true },
              {
                label: 'Hakediş Mevzuat Tanımları',
                onClick: () => navigate({ to: '/hakedis' as any })
              }
            ]
          }
        ]
      : []),
    {
      name: 'Sistem Tanımları',
      items: [
        {
          label: 'Kurum Bilgileri',
          onClick: () => navigate({ to: '/kurum' as any })
        },
        {
          label: 'Birim Yönetimi',
          onClick: () => navigate({ to: '/birimler' as any })
        },
        {
          label: 'Personel Yönetimi',
          onClick: () => navigate({ to: '/personel' as any })
        },
        {
          label: 'Komisyon Yönetimi',
          onClick: () => navigate({ to: '/komisyonlar' as any })
        },
        {
          label: 'Görev Tanımları',
          onClick: () => navigate({ to: '/komisyon-gorevleri' as any })
        },
        { divider: true },
        {
          label: 'İstekli Firma Yönetimi',
          onClick: () => navigate({ to: '/firmalar' as any })
        },
        { divider: true },
        {
          label: 'Mal/Hizmet/Yapım İşleri Listesi',
          onClick: () => navigate({ to: '/malzemeler' as any })
        },
        {
          label: 'Taşınır Kodları',
          onClick: () => navigate({ to: '/tasinirkod' as any })
        },
        {
          label: 'OKAS Kodları',
          onClick: () => navigate({ to: '/okaskod' as any })
        },
        {
          label: 'Ölçü Birimleri',
          onClick: () => navigate({ to: '/olcubirimleri' as any })
        }
      ]
    },
    {
      name: 'Yönetim & Yardım',
      items: [
        {
          label: 'Genel Ayarlar',
          onClick: () => navigate({ to: '/ayarlar' as any })
        },
        {
          label: 'Mevzuat ve Parametreler',
          onClick: () => navigate({ to: '/mevzuat' as any })
        },
        {
          label: 'Şablon & Kategori Yönetimi',
          onClick: () => navigate({ to: '/degiskenler' as any })
        },
        {
          label: 'Şablon Listesi ve Süreçler',
          onClick: () => navigate({ to: '/taslakyonetim' as any })
        },
        {
          label: 'Toplu İçe Aktarma',
          onClick: () => navigate({ to: '/import' as any })
        },
        {
          label: 'Raporlar',
          onClick: () => navigate({ to: '/raporlar' as any })
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
          onClick: () => navigate({ to: '/yardim' as any })
        },
        {
          label: 'Sürüm Notları (Changelog)',
          onClick: () => navigate({ to: '/changelog' as any })
        },
        {
          label: 'Hakkında...',
          onClick: () =>
            alert('DT Asistan Lite\nDoğrudan Temin ve Satın Alma Süreçleri Yönetim Sistemi')
        }
      ]
    }
  ]

  return (
    <header
      className="flex flex-col bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shrink-0 z-50 shadow-xs transition-all duration-300 relative select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* ÜST SATIR: Menü Çubuğu ve Sistem/Pencere Kontrolleri */}
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
                    : 'text-slate-655 dark:text-slate-350 hover:bg-slate-200/40 dark:hover:bg-slate-850 hover:text-slate-905 dark:hover:text-white'
                }`}
              >
                {m.name}
              </button>

              {activeMenu === m.name && m.items && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl py-1 z-[100] animate-in fade-in slide-in-from-top-1">
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
                        className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between cursor-pointer"
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

        {/* SAĞ: Sistem Kontrolleri (Tema, Eşitleme, Bildirim, vb.) */}
        <div
          className="flex items-center space-x-1.5 pr-36"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* Bulut Senkronizasyon Popover */}
          <SyncPopover />

          {/* Tema Değiştir */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-805/50 cursor-pointer"
            title="Tema Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
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
          <NotificationPopover isOpen={showNotifications} onToggle={setShowNotifications} />
        </div>

        {/* Pencere Kontrolleri */}
        <WindowControls />
      </div>

      {/* ALT SATIR: Çalışma Dosyası Seçimi */}
      <div
        className="min-h-9 py-1.5 flex items-center justify-between bg-slate-100/50 dark:bg-slate-955/20 border-t border-slate-200/30 dark:border-slate-800/30 select-none px-4 relative"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Sol tarafta dengeleyici boşluk */}
        <div className="w-[300px] shrink-0 hidden lg:block"></div>

        {/* Orta: Temin Seçici */}
        <div className="flex-1 flex justify-center">
          <TeminSelector />
        </div>

        {/* Sağ: Süreç & Çıktı Butonları */}
        {activeDosyaId ? (
          <div className="flex items-center gap-2 shrink-0 min-w-[300px] justify-end">
            <Link
              to="/takip"
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 border border-indigo-100/50 dark:border-indigo-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Süreç & Durum
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
          <div className="w-[300px] shrink-0 hidden lg:block"></div>
        )}
      </div>
    </header>
  )
}
