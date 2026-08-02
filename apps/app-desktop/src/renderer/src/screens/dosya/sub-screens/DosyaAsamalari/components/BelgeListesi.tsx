import React from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  Grid2X2,
  List,
  Pencil,
  Plus,
  Table2,
  Trash2,
  XCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@renderer/components/ui/DropdownMenu'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'

/* =========================================================
 * TYPES
 * ========================================================= */

export type ViewMode = 'table' | 'list' | 'grid'

export type BelgeDurumu = 'Taslak' | 'Hazır' | 'Tamamlandı' | 'İptal'

/**
 * Bir belge tipi:
 *
 * Örnek:
 * - piyasa-fiyat-arastirmasi
 * - yaklasik-maliyet
 * - muayene-kabul
 */
export interface BelgeTipi {
  id: string
  ad: string
  aciklama?: string
}

/**
 * Bir belge tipinden oluşturulmuş gerçek kayıt.
 *
 * Örneğin:
 *
 * belgeTipiId:
 *   piyasa-fiyat-arastirmasi
 *
 * aynı tipten:
 *   id: 1
 *   id: 2
 *   id: 3
 *
 * şeklinde birden fazla kayıt olabilir.
 */
export interface BelgeItem<T = Record<string, unknown>> {
  id: number

  /**
   * Belgenin hangi belge tipine ait olduğu.
   */
  belgeTipiId: string

  /**
   * Ekranda görünen belge adı.
   */
  belgeAdi: string

  /**
   * Belgenin kendi oluşturulma/düzenlenme tarihi.
   */
  belgeTarihi: string

  /**
   * Belge durumu.
   */
  durum: BelgeDurumu

  /**
   * Aynı belge tipindeki kayıt sırası.
   *
   * Örn:
   * Piyasa Fiyat Araştırması #1
   * Piyasa Fiyat Araştırması #2
   */
  siraNo?: number

  /**
   * Belgenin asıl JSON verisi.
   *
   * PiyasaFiyatArastirmasiData
   * YaklasikMaliyetData
   * vb. olabilir.
   */
  data?: T
}

/* =========================================================
 * BELGE LİSTESİ
 * ========================================================= */

interface BelgeListesiProps {
  /**
   * MEVCUT PROP AYNI
   */
  title?: string

  /**
   * MEVCUT PROP AYNI
   *
   * Artık bu dizi aynı belge tipinden birden
   * fazla kayıt içerebilir.
   */
  belgeler: BelgeItem[]

  /**
   * MEVCUT PROP AYNI
   */
  viewMode?: ViewMode

  /**
   * MEVCUT PROP AYNI
   */
  onViewModeChange?: (mode: ViewMode) => void

  /**
   * MEVCUT PROP AYNI
   */
  onView?: (belge: BelgeItem) => void

  /**
   * MEVCUT PROP AYNI
   */
  onEdit?: (belge: BelgeItem) => void

  /**
   * MEVCUT PROP AYNI
   */
  onDelete?: (belge: BelgeItem) => void

  /**
   * MEVCUT PROP AYNI
   */
  onCreate?: () => void
  onCreateBelge?: (type: string) => void
}

export function BelgeListesi({
  title = 'Belgeler',
  belgeler,
  viewMode = 'table',
  onViewModeChange,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onCreateBelge
}: BelgeListesiProps): React.JSX.Element {
  /* ---------------------------------------------------------
   * DURUM
   * --------------------------------------------------------- */

  const getDurum = (durum: BelgeDurumu) => {
    switch (durum) {
      case 'Tamamlandı':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Tamamlandı
          </span>
        )

      case 'Hazır':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="h-3 w-3" />
            Hazır
          </span>
        )

      case 'İptal':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
            <XCircle className="h-3 w-3" />
            İptal
          </span>
        )

      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            <FileText className="h-3 w-3" />
            Taslak
          </span>
        )
    }
  }

  /* ---------------------------------------------------------
   * İŞLEMLER
   * --------------------------------------------------------- */

  const Actions = ({ belge }: { belge: BelgeItem }) => (
    <div className="flex items-center gap-1">
      {onView && (
        <button
          type="button"
          title="Görüntüle"
          onClick={() => onView(belge)}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          title="Düzenle"
          onClick={() => onEdit(belge)}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          title="Sil"
          onClick={() => onDelete(belge)}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )

  /* ---------------------------------------------------------
   * GÖRÜNÜM SEÇİCİ
   * --------------------------------------------------------- */

  const ViewModeButtons = () => (
    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
      {[
        {
          mode: 'table' as const,
          icon: Table2,
          label: 'Tablo'
        },
        {
          mode: 'list' as const,
          icon: List,
          label: 'Liste'
        },
        {
          mode: 'grid' as const,
          icon: Grid2X2,
          label: 'Kart'
        }
      ].map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          type="button"
          title={label}
          onClick={() => onViewModeChange?.(mode)}
          className={`rounded-md p-1.5 transition-colors ${
            viewMode === mode
              ? 'bg-blue-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )

  /* ---------------------------------------------------------
   * BELGE ADI
   *
   * Aynı tipten birden fazla kayıt varsa:
   *
   * Piyasa Fiyat Araştırma Tutanağı #1
   * Piyasa Fiyat Araştırma Tutanağı #2
   *
   * şeklinde gösteriyoruz.
   * --------------------------------------------------------- */

  const getBelgeAdi = (belge: BelgeItem) => {
    if (!belge.siraNo) {
      return belge.belgeAdi
    }

    return `${belge.belgeAdi} #${belge.siraNo}`
  }

  return (
    <div className="space-y-4">
      {/* =====================================================
       * BAŞLIK
       * ===================================================== */}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h3>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {belgeler.length} kayıt bulunmaktadır.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ViewModeButtons />

          {(onCreate || onCreateBelge) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white transition-colors hover:bg-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Yeni Belge
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => onCreateBelge?.('piyasa-fiyat-arastirmasi')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Piyasa Fiyat Araştırma Tutanağı
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onCreateBelge?.('yaklasik-maliyet')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Yaklaşık Maliyet Hesap Cetveli
                </DropdownMenuItem>

                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* =====================================================
       * TABLE
       * ===================================================== */}

      {viewMode === 'table' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Belge Adı
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Belge Tarihi
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Durum
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    İşlemler
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {belgeler.map((belge) => (
                  <tr
                    key={belge.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                          <FileText className="h-4 w-4" />
                        </div>

                        <div>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {getBelgeAdi(belge)}
                          </div>

                          <div className="mt-0.5 text-[10px] text-slate-400">
                            {belge.belgeTipiId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {belge.belgeTarihi}
                    </td>

                    <td className="px-4 py-3">{getDurum(belge.durum)}</td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Actions belge={belge} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================
       * LIST
       * ===================================================== */}

      {viewMode === 'list' && (
        <div className="space-y-2">
          {belgeler.map((belge) => (
            <div
              key={belge.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-blue-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                    {getBelgeAdi(belge)}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <CalendarDays className="h-3 w-3" />
                    {belge.belgeTarihi}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {getDurum(belge.durum)}

                <Actions belge={belge} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
       * GRID
       * ===================================================== */}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {belgeler.map((belge) => (
            <div
              key={belge.id}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>

                {getDurum(belge.durum)}
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {getBelgeAdi(belge)}
                </h4>

                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <CalendarDays className="h-3 w-3" />
                  {belge.belgeTarihi}
                </div>

                <div className="mt-1 text-[10px] text-slate-400">{belge.belgeTipiId}</div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Actions belge={belge} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
       * BOŞ
       * ===================================================== */}

      {belgeler.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-800">
          <FileText className="mx-auto h-8 w-8 text-slate-300" />

          <p className="mt-2 text-xs font-semibold text-slate-500">Henüz belge bulunmuyor.</p>
        </div>
      )}
    </div>
  )
}
