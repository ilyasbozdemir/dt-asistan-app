import React, { useState, useEffect } from 'react'
import { Award, Coins, AlertCircle } from 'lucide-react'

interface BiddingFirm {
  id: number
  unvan: string
  teklif_toplami?: number
  para_birimi?: string
}

interface BiddingKalem {
  id: number
  kalem_adi: string
  miktar: number
  birim: string
}

interface TeklifMatrisiProps {
  invitedFirms: BiddingFirm[]
  items: BiddingKalem[]
  bids: Record<string, number>
  getEstimatedCostTotal: () => number
  getLowestBidInfo: (kalemId: number) => { price: number; firmaId: number | null }
  getAverageBid: (kalemId: number) => number
  handlePriceChange: (kalemId: number, firmaId: number, val: string) => Promise<void>
}

const BidPriceInput: React.FC<{
  initialValue: number
  onChange: (val: string) => void
  isLowest: boolean
  isExcelStyle?: boolean
}> = ({ initialValue, onChange, isLowest, isExcelStyle }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [tempValue, setTempValue] = useState('')

  // Sync state when initialValue changes from outside
  useEffect(() => {
    if (!isFocused) {
      setTempValue(initialValue === 0 ? '' : initialValue.toString().replace('.', ','))
    }
  }, [initialValue, isFocused])

  const handleBlur = () => {
    setIsFocused(false)
    // Convert Turkish format (comma for decimal, remove dots) to standard float string
    const cleanValue = tempValue
      .replace(/\./g, '') // remove thousands separators if any
      .replace(',', '.')  // replace decimal comma with dot
    onChange(cleanValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
    setTempValue(initialValue === 0 ? '' : initialValue.toString().replace('.', ','))
  }

  // Value to show in the input field
  const displayValue = isFocused
    ? tempValue
    : initialValue === 0
      ? ''
      : initialValue.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })

  if (isExcelStyle) {
    return (
      <input
        title="Fiyat Gir"
        type="text"
        value={displayValue}
        placeholder="0,00"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => {
          const val = e.target.value
          if (/^[0-9.,]*$/.test(val) || val === '') {
            setTempValue(val)
          }
        }}
        className={`w-full text-right text-xs font-mono bg-transparent border-0 focus:bg-blue-50/50 dark:focus:bg-blue-955/20 outline-none pl-6 pr-2.5 py-2.5 transition-all ${
          isLowest
            ? 'font-bold text-emerald-700 dark:text-emerald-450'
            : 'text-slate-800 dark:text-slate-200'
        }`}
      />
    )
  }

  return (
    <input
      title="Fiyat Gir"
      type="text"
      value={displayValue}
      placeholder="0,00"
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={(e) => {
        const val = e.target.value
        if (/^[0-9.,]*$/.test(val) || val === '') {
          setTempValue(val)
        }
      }}
      className={`w-full text-right text-xs font-mono rounded-lg border ${
        isLowest
          ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 focus:ring-emerald-500 focus:border-emerald-500 font-bold text-emerald-700 dark:text-emerald-400'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-primary focus:border-primary'
      } pl-6 pr-2.5 py-1.5 focus:outline-none focus:ring-2 transition-all`}
    />
  )
}

export const TeklifMatrisi: React.FC<TeklifMatrisiProps> = ({
  invitedFirms,
  items,
  bids,
  getEstimatedCostTotal,
  getLowestBidInfo,
  getAverageBid,
  handlePriceChange
}) => {
  const [activeView, setActiveView] = useState<'firm' | 'matrix'>('firm')
  const [selectedFirmId, setSelectedFirmId] = useState<number | null>(null)

  // Initialize and synchronize selectedFirmId
  useEffect(() => {
    if (invitedFirms.length > 0 && (selectedFirmId === null || !invitedFirms.some((f) => f.id === selectedFirmId))) {
      setSelectedFirmId(invitedFirms[0].id)
    }
  }, [invitedFirms, selectedFirmId])

  const selectedFirm = invitedFirms.find((f) => f.id === selectedFirmId)

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            Teklif Giriş Matrisi & Karşılaştırma
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Her firma için malzeme birim fiyatlarını girin. En uygun teklifler yeşil renkle
            vurgulanır ve yaklaşık maliyet otomatik hesaplanır.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-950 p-1 rounded-xl h-10 border border-slate-200/40 dark:border-slate-800/40 select-none">
            <button
              onClick={() => setActiveView('firm')}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-0 ${
                activeView === 'firm'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              Firma Bazlı
            </button>
            <button
              onClick={() => setActiveView('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-0 ${
                activeView === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              Tüm Teklifler (Matris)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 h-10">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>Para Birimi: TL</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3.5 py-1.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30 h-10">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Birim Fiyatlar KDV Hariçtir</span>
          </div>
        </div>
      </div>

      {activeView === 'firm' && invitedFirms.length > 0 && selectedFirmId !== null ? (
        // FIRM-BASED ENTRY VIEW
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Firm Select Tab List */}
          <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            {invitedFirms.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFirmId(f.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  selectedFirmId === f.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-855'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedFirmId === f.id ? 'bg-white' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
                  <span className="truncate max-w-[160px]" title={f.unvan}>{f.unvan}</span>
                  <span className="text-[10px] font-mono opacity-90">
                    ({f.teklif_toplami
                      ? f.teklif_toplami.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })
                      : '0,00'}{' '}
                    ₺)
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Simple inputs vertical list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((kalem) => {
              const val = bids[`${kalem.id}_${selectedFirmId}`] || 0
              const lowest = getLowestBidInfo(kalem.id)
              const isLowest = lowest.price > 0 && lowest.firmaId === selectedFirmId

              return (
                <div
                  key={kalem.id}
                  className="p-4 bg-slate-50/50 dark:bg-slate-955/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4 hover:shadow-xs transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate" title={kalem.kalem_adi}>
                      {kalem.kalem_adi}
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-400 block mt-0.5 font-semibold">
                      Miktar: {kalem.miktar} {kalem.birim}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isLowest && (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/10 flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-500" />
                        En Uygun
                      </span>
                    )}

                    <div className="relative flex items-center w-36">
                      <span className="absolute left-2.5 text-[10px] font-bold text-slate-400 select-none">
                        ₺
                      </span>
                      <BidPriceInput
                        initialValue={val}
                        onChange={(newVal) => handlePriceChange(kalem.id, selectedFirmId, newVal)}
                        isLowest={isLowest}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Firm Offer Summary Footer Card */}
          {selectedFirm && (
            <div className="mt-2 p-4 bg-blue-50/40 dark:bg-blue-955/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedFirm.unvan} Toplam Teklif
                </span>
                <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-0.5">
                  Firma bazlı girilen kalemlerin toplam tutarı (KDV Hariç)
                </p>
              </div>
              <span className="text-lg font-mono font-black text-blue-600 dark:text-blue-450">
                {selectedFirm.teklif_toplami
                  ? selectedFirm.teklif_toplami.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })
                  : '0,00'}{' '}
                ₺
              </span>
            </div>
          )}
        </div>
      ) : (
        // EXCEL SHEET COMPARISON TABLE VIEW
        <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs animate-in fade-in duration-300">
          <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60">
                <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 w-48">
                  Malzeme/Hizmet Adı
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 text-center w-28">
                  Miktar / Birim
                </th>
                {invitedFirms.map((firma) => (
                  <th
                    key={firma.id}
                    className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 text-right min-w-[150px]"
                  >
                    <div className="truncate w-36 ml-auto text-right" title={firma.unvan}>
                      {firma.unvan}
                    </div>
                  </th>
                ))}
                <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 text-right w-36 bg-slate-100/30 dark:bg-slate-950/20">
                  Ort. (Yaklaşık)
                </th>
                <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 text-right w-36 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01]">
                  En Düşük
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((kalem) => {
                const lowest = getLowestBidInfo(kalem.id)
                const avgPrice = getAverageBid(kalem.id)

                return (
                  <tr
                    key={kalem.id}
                    className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition-colors"
                  >
                    <td className="p-3 border border-slate-200 dark:border-slate-805 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/20 dark:bg-slate-950/5">
                      {kalem.kalem_adi}
                    </td>
                    <td className="p-3 border border-slate-200 dark:border-slate-805 text-center text-slate-500">
                      {kalem.miktar} {kalem.birim}
                    </td>
                    {invitedFirms.map((firma) => {
                      const val = bids[`${kalem.id}_${firma.id}`] || 0
                      const isLowest = lowest.price > 0 && lowest.firmaId === firma.id

                      return (
                        <td
                          key={firma.id}
                          className={`p-0 border border-slate-200 dark:border-slate-805 text-right transition-colors ${
                            isLowest ? 'bg-emerald-500/[0.05] dark:bg-emerald-500/[0.02]' : 'bg-white dark:bg-slate-950'
                          }`}
                        >
                          <div className="relative flex items-center w-full h-full">
                            <span className="absolute left-2 text-[10px] font-bold text-slate-400 select-none">
                              ₺
                            </span>
                            <BidPriceInput
                              initialValue={val}
                              onChange={(newVal) => handlePriceChange(kalem.id, firma.id, newVal)}
                              isLowest={isLowest}
                              isExcelStyle={true}
                            />
                          </div>
                        </td>
                      )
                    })}
                    <td className="p-3 border border-slate-200 dark:border-slate-805 text-right font-bold text-slate-700 dark:text-slate-300 bg-slate-100/10 dark:bg-slate-950/10 font-mono">
                      {avgPrice > 0
                        ? `${avgPrice.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} ₺`
                        : '-'}
                    </td>
                    <td className="p-3 border border-slate-200 dark:border-slate-805 text-right font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.005] font-mono">
                      <div className="flex items-center justify-end gap-1">
                        {lowest.price > 0 && <Award className="w-3.5 h-3.5 text-emerald-500" />}
                        <span>
                          {lowest.price > 0
                            ? `${lowest.price.toLocaleString('tr-TR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })} ₺`
                            : '-'}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {/* TOPLAM TEKLİFLER SATIRI */}
              <tr className="bg-slate-50/80 dark:bg-slate-950/40 font-bold text-slate-850 dark:text-slate-100">
                <td className="p-3.5 border border-slate-200 dark:border-slate-800">Toplam Teklif Tutarı</td>
                <td className="p-3.5 border border-slate-200 dark:border-slate-800"></td>
                {invitedFirms.map((firma) => (
                  <td
                    key={firma.id}
                    className="p-3.5 border border-slate-200 dark:border-slate-800 text-right text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono"
                  >
                    {firma.teklif_toplami
                      ? `${firma.teklif_toplami.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} ₺`
                      : '0,00 ₺'}
                  </td>
                ))}
                <td className="p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-100/10 dark:bg-slate-950/10 text-right font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {getEstimatedCostTotal() > 0
                    ? `${getEstimatedCostTotal().toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} ₺`
                    : '-'}
                </td>
                <td className="p-3.5 border border-slate-200 dark:border-slate-800 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.005]"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
