import React from 'react'
import { Copy, FileText, Loader2, Search, Sparkles } from 'lucide-react'
import { cn } from '../../../../../utils/cn'
import { YeniDosyaTabProps } from '../../../types'

export function GenelBilgilerVeIdariAntetSection(props: YeniDosyaTabProps): React.JSX.Element {
  const {
    formData,
    setFormData,
    birimler,
    isDescLoading,
    showKonuSuggestions,
    setShowKonuSuggestions,
    exactMatchCount,
    matchedSuggestions,
    handleAiDescGenerate,
    handleCopyKonuToAciklama,
    openTextGenerator,
    showBirimSearch,
    setShowBirimSearch,
    birimSearchQuery,
    setBirimSearchQuery,
    filteredBirimler,
    handleSelectBirim,
    getNextTeminNo
  } = props

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
        <FileText className="text-blue-500 w-5 h-5" />
        <h2 className="text-base font-bold text-slate-800 dark:text-white">
          Genel Bilgiler & İdari Antet Yapısı
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-450">
              İhale / Dosya Konusu (İşin Adı) *
            </label>
            <button
              type="button"
              onClick={() =>
                openTextGenerator?.(
                  'konu',
                  'Konuyu AI ile Üret',
                  'İhale Konusu',
                  'Verilen metin veya alım işlemine göre en uygun, resmi ve kısa ihale konusunu (İşin Adı) üret. Başka hiçbir açıklama yazma. KESİNLİKLE metnin içerisine veya sonuna "Doğrudan Temin", "Doğrudan Temini" veya "Doğrudan Temin İşi" gibi ifadeler EKLEME. (Örn: "Bez Bayrak ve Sopalı Bayrak Alımı", "Kırtasiye Malzemesi Alımı" şeklinde bitir).'
                )
              }
              className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border-none"
            >
              <Sparkles size={11} /> AI ile Üret
            </button>
          </div>
          <input
            type="text"
            required
            value={formData.konu || ''}
            onChange={(e) => {
              setFormData({ ...formData, konu: e.target.value })
              setShowKonuSuggestions?.(true)
            }}
            onFocus={() => setShowKonuSuggestions?.(true)}
            onBlur={() => {
              setTimeout(() => setShowKonuSuggestions?.(false), 200)
            }}
            placeholder="Alımın konusunu resmi dilde açıklayıcı şekilde girin (Örn: Fen İşleri Kırtasiye Malzemesi Alımı)"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
          />
          {(exactMatchCount ?? 0) > 0 && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1.5 flex items-center gap-1 animate-in fade-in duration-200">
              ⚠️ Bu isimde daha önce {exactMatchCount} adet dosya açılmış. Kaydedildiğinde otomatik
              olarak "({(exactMatchCount ?? 0) + 1})" son eki eklenecektir.
            </p>
          )}
          {showKonuSuggestions && (matchedSuggestions ?? []).length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/50 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                {formData.konu ? 'Önceki İhale Konuları' : 'Sık Kullanılan İhale Konuları'}
              </div>
              <ul className="max-h-48 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                {(matchedSuggestions ?? []).map((suggestion, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          konu: suggestion
                        }))
                        setShowKonuSuggestions?.(false)
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
                    >
                      <FileText className="text-slate-400 w-3.5 h-3.5" />
                      <span>{suggestion}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
              İşin Açıklaması / Kapsamı{' '}
              <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                (Markdown Desteklenir)
              </span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAiDescGenerate}
                disabled={isDescLoading}
                title="İşin adına göre yapay zeka ile profesyonel açıklama metni oluştur"
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded disabled:opacity-50"
              >
                {isDescLoading ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Sparkles size={11} />
                )}
                {isDescLoading ? 'Üretiliyor...' : 'AI ile Üret'}
              </button>
              <button
                type="button"
                onClick={handleCopyKonuToAciklama}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded"
              >
                <Copy size={11} />
                İşin Adını Kopyala
              </button>
            </div>
          </div>
          <textarea
            rows={3}
            value={formData.isin_aciklamasi || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                isin_aciklamasi: e.target.value
              })
            }
            placeholder="İşin detaylı açıklaması veya şartnamedeki kapsam açıklaması..."
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white leading-normal resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            Doğrudan Temin Numarası
          </label>
          <input
            type="text"
            value={formData.temin_no || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                temin_no: e.target.value
              })
            }
            placeholder="Örn: 2026/5"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            Dosya Açılış Tarihi
          </label>
          <input
            type="date"
            value={formData.dosya_acilis_tarihi || ''}
            onChange={(e) => {
              const newDate = e.target.value
              const oldDate = formData.dosya_acilis_tarihi
              const newYear = newDate ? new Date(newDate).getFullYear() : null
              const oldYear = oldDate ? new Date(oldDate).getFullYear() : null

              let updatedTeminNo = formData.temin_no
              if (newYear && newYear !== oldYear) {
                const oldYearStr = oldYear ? oldYear.toString() : ''
                const isOldPattern =
                  !formData.temin_no ||
                  formData.temin_no.startsWith(`${oldYearStr}/`) ||
                  formData.temin_no.startsWith(`DT${oldYearStr}/`)

                if (isOldPattern && getNextTeminNo) {
                  updatedTeminNo = getNextTeminNo(newYear)
                }
              }

              setFormData({
                ...formData,
                dosya_acilis_tarihi: newDate,
                butce_yili: newYear || formData.butce_yili,
                temin_no: updatedTeminNo
              })
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            İhalesi Yapılacak Birim / Müdürlük
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBirimSearch?.(!showBirimSearch)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 text-left"
            >
              <span>
                {formData.birim_id
                  ? birimler.find((b) => b.id === formData.birim_id)?.birim_adi
                  : 'Birim Seçiniz...'}
              </span>
              <Search size={14} className="text-slate-400" />
            </button>

            {showBirimSearch && (
              <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  type="text"
                  placeholder="Birim ara..."
                  value={birimSearchQuery}
                  onChange={(e) => setBirimSearchQuery?.(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
                  {(filteredBirimler ?? []).length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-450">Birim bulunamadı.</div>
                  ) : (
                    (filteredBirimler ?? []).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBirim?.(b)}
                        className={cn(
                          'w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors',
                          formData.birim_id === b.id &&
                            'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 font-bold'
                        )}
                      >
                        {b.birim_adi}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Birim seçildiğinde antet, sunum makamı ve bütçe kodları otomatik doldurulur.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            İdari Antet Ek Satır
          </label>
          <input
            type="text"
            value={formData.antet_ek_satir || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                antet_ek_satir: e.target.value
              })
            }
            placeholder="Örn: Fen İşleri Dairesi Başkanlığı"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            Evrakın Sunulacağı Makam
          </label>
          <input
            type="text"
            value={formData.sunulacak_makam || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                sunulacak_makam: e.target.value
              })
            }
            placeholder="Örn: BAŞKANLIK MAKAMINA veya MÜDÜRLÜK MAKAMINA"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">
            İhtiyaç Yeri
          </label>
          <input
            type="text"
            value={formData.ihtiyac_yeri || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                ihtiyac_yeri: e.target.value
              })
            }
            placeholder="Örn: Fen İşleri Şantiyesi"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>
    </div>
  )
}
