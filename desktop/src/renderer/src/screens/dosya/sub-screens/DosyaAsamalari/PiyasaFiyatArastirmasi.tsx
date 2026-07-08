import React from 'react'
import { PackageSearch, Trash2, X } from 'lucide-react'
import { SubScreen } from '../../SubScreens.screen'
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal'
import { useDosyaAsamasiSablons } from './useDosyaAsamasiSablons'
import { SurecBelgeleriPanel } from './SablonPanelleri'

interface BiddingFirm {
  id: number
  temin_dosya_id: number
  firma_id: number
  unvan: string
  vergi_no?: string
  ilgili_kisi?: string
  telefon?: string
  email?: string
  teklif_toplami?: number
  para_birimi?: string
}

interface PoolFirm {
  id: number
  unvan: string
  vergi_no?: string
  telefon?: string
  email?: string
}

interface BiddingKalem {
  id: number
  kalem_adi: string
  miktar: number
  birim: string
}

export function PiyasaFiyatArastirmasi(): React.JSX.Element {
  const {
    activeDosyaId,
    activeStarredDocs,
    sablons,
    ciktiLoading,
    masterHtml,
    dosyaContext,
    placeholders,
    contextsByPath,
    personelListesi,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    executePrint,
    executeExportPdf,
    refreshSnapshot,
    saveSnapshot,
    isSablonDisabled
  } = useDosyaAsamasiSablons()

  const [invitedFirms, setInvitedFirms] = React.useState<BiddingFirm[]>([])
  const [allPoolFirms, setAllPoolFirms] = React.useState<PoolFirm[]>([])
  const [items, setItems] = React.useState<BiddingKalem[]>([])
  const [bids, setBids] = React.useState<Record<string, number>>({}) // key: `${kalemId}_${firmaId}` -> birim_fiyat
  const [, setLoading] = React.useState(true)
  
  const [selectedFirmIdToAdd, setSelectedFirmIdToAdd] = React.useState('')
  const [showNewFirmModal, setShowNewFirmModal] = React.useState(false)

  // New firm form state
  const [newFirmUnvan, setNewFirmUnvan] = React.useState('')
  const [newFirmVergiNo, setNewFirmVergiNo] = React.useState('')
  const [newFirmPhone, setNewFirmPhone] = React.useState('')
  const [newFirmEmail, setNewFirmEmail] = React.useState('')

  const loadData = React.useCallback(async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      // 1. Load invited firms for this dossier
      const resInvited = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND aktif_mi = 1 ORDER BY unvan ASC',
        [activeDosyaId]
      )
      
      // 2. Load all pool firms
      const resPool = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Firma WHERE aktif_mi = 1 ORDER BY unvan ASC'
      )

      // 3. Load items
      const resItems = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
        [activeDosyaId]
      )

      // 4. Load bids
      const resBids = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?',
        [activeDosyaId]
      )

      if (resInvited.success) setInvitedFirms(resInvited.data || [])
      if (resPool.success) setAllPoolFirms(resPool.data || [])
      if (resItems.success) setItems(resItems.data || [])
      
      if (resBids.success && resBids.data) {
        const bidsMap: Record<string, number> = {}
        resBids.data.forEach((row: any) => {
          bidsMap[`${row.temin_kalem_id}_${row.temin_firma_id}`] = row.birim_fiyat || 0
        })
        setBids(bidsMap)
      }
    } catch (err) {
      console.error('Error loading bidding data:', err)
    } finally {
      setLoading(false)
    }
  }, [activeDosyaId])

  React.useEffect(() => {
    loadData()
  }, [activeDosyaId, loadData])

  const handleAddFirmFromPool = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedFirmIdToAdd || !activeDosyaId) return
    const firmId = parseInt(selectedFirmIdToAdd)
    const poolFirm = allPoolFirms.find((f) => f.id === firmId)
    if (!poolFirm) return

    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO DATA_TeminFirma (temin_dosya_id, firma_id, unvan, vergi_no, telefon, email, davet_edildi_mi, teklif_durumu) VALUES (?, ?, ?, ?, ?, ?, 1, 'Davet Edildi')`,
        [activeDosyaId, poolFirm.id, poolFirm.unvan, poolFirm.vergi_no || '', poolFirm.telefon || '', poolFirm.email || '']
      )
      if (res.success) {
        setSelectedFirmIdToAdd('')
        await loadData()
      } else {
        alert('Firma eklenemedi: ' + res.error)
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handleRemoveFirm = async (teminFirmaId: number): Promise<void> => {
    if (
      !window.confirm(
        'Bu firmayı dosyadan ve ilişkili tekliflerden kaldırmak istediğinize emin misiniz?'
      )
    ) {
      return
    }
    try {
      // 1. Delete bids
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKalemTeklif WHERE temin_firma_id = ?',
        [teminFirmaId]
      )
      // 2. Delete invited firm
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminFirma WHERE id = ?',
        [teminFirmaId]
      )
      if (res.success) {
        await loadData()
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handleCreateAndAddFirm = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!newFirmUnvan.trim() || !activeDosyaId) return

    try {
      // 1. Insert into global pool
      const resPool = await window.electron.ipcRenderer.invoke(
        'db:run',
        'INSERT INTO TANIM_Firma (unvan, vergi_no, telefon, email, aktif_mi) VALUES (?, ?, ?, ?, 1)',
        [newFirmUnvan.trim(), newFirmVergiNo.trim(), newFirmPhone.trim(), newFirmEmail.trim()]
      )
      
      if (resPool.success && resPool.lastInsertRowid) {
        const newFirmaId = resPool.lastInsertRowid
        // 2. Insert into invited firms
        const resInvite = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminFirma (temin_dosya_id, firma_id, unvan, vergi_no, telefon, email, davet_edildi_mi, teklif_durumu) VALUES (?, ?, ?, ?, ?, ?, 1, 'Davet Edildi')`,
          [activeDosyaId, newFirmaId, newFirmUnvan.trim(), newFirmVergiNo.trim(), newFirmPhone.trim(), newFirmEmail.trim()]
        )
        if (resInvite.success) {
          setNewFirmUnvan('')
          setNewFirmVergiNo('')
          setNewFirmPhone('')
          setNewFirmEmail('')
          setShowNewFirmModal(false)
          await loadData()
        }
      } else {
        alert('Havuzda yeni firma oluşturulamadı: ' + resPool.error)
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handlePriceChange = async (kalemId: number, teminFirmaId: number, priceStr: string): Promise<void> => {
    const price = parseFloat(priceStr) || 0
    const key = `${kalemId}_${teminFirmaId}`
    
    // Optimistic UI state update
    setBids((prev) => ({
      ...prev,
      [key]: price
    }))

    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT OR REPLACE INTO DATA_TeminKalemTeklif (temin_dosya_id, temin_kalem_id, temin_firma_id, birim_fiyat, kdv_tutari, teklif_verildi_mi) VALUES (?, ?, ?, ?, 0, 1)`,
        [activeDosyaId, kalemId, teminFirmaId, price]
      )

      // Calculate total bids for this firm
      let total = 0
      items.forEach((kalem) => {
        const kPrice = kalem.id === kalemId ? price : (bids[`${kalem.id}_${teminFirmaId}`] || 0)
        total += kPrice * (kalem.miktar || 0)
      })

      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminFirma SET teklif_toplami = ?, teklif_verdi_mi = 1, teklif_durumu = 'Teklif Verildi' WHERE id = ?`,
        [total, teminFirmaId]
      )
      
      // Reload invited list to show total changes
      const resInvited = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND aktif_mi = 1 ORDER BY unvan ASC',
        [activeDosyaId]
      )
      if (resInvited.success) setInvitedFirms(resInvited.data || [])
    } catch (err) {
      console.error('Error saving bid:', err)
    }
  }

  if (previewData && previewModalOpen) {
    return (
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewData.title}
        templateHtml={previewData.templateHtml}
        masterHtml={masterHtml || ''}
        baseContext={
          previewData.snapshotContext || contextsByPath[previewData.processPath] || dosyaContext
        }
        placeholders={placeholders}
        personelListesi={personelListesi}
        onPrint={executePrint}
        onExportPdf={executeExportPdf}
        isInline={true}
        templateTestVerisi={previewData.templateTestVerisi}
        dosyaAdi={previewData.dosyaAdi}
        onRefreshSnapshot={refreshSnapshot}
        onSaveSnapshot={saveSnapshot}
      />
    )
  }

  const stageSablons = sablons.filter(
    (s) =>
      s.kategori === '2-piyasa-fiyat-arastirmasi' || s.kategori === '2. Piyasa Fiyat Araştırması'
  )

  // Find lowest price for a kalem
  const getLowestBidInfo = (kalemId: number): { price: number; firmaId: number | null } => {
    let minPrice = Infinity
    let minFirmaId: number | null = null
    
    invitedFirms.forEach((firma) => {
      const price = bids[`${kalemId}_${firma.id}`]
      if (price > 0 && price < minPrice) {
        minPrice = price
        minFirmaId = firma.id
      }
    })
    
    return {
      price: minPrice === Infinity ? 0 : minPrice,
      firmaId: minFirmaId
    }
  }

  // Calculate average price (Yaklaşık Maliyet basis) for a kalem
  const getAverageBid = (kalemId: number): number => {
    let sum = 0
    let count = 0
    invitedFirms.forEach((firma) => {
      const price = bids[`${kalemId}_${firma.id}`]
      if (price > 0) {
        sum += price
        count++
      }
    })
    return count > 0 ? sum / count : 0
  }

  return (
    <SubScreen
      title="Teklifler & Piyasa Fiyat Araştırması"
      icon={PackageSearch}
      description="Piyasa araştırması yapıp birim fiyat tekliflerinizi toplayabilir, komisyon görevlendirme onay belgesi hazırlayabilir ve tüm süreç dökümanlarınızı bu panel üzerinden oluşturup çıktı alabilirsiniz."
    >
      <SurecBelgeleriPanel
        stageSablons={stageSablons}
        activeStarredDocs={activeStarredDocs}
        ciktiLoading={ciktiLoading}
        onSablonClick={handleOpenPreviewForSablon}
        isSablonDisabled={isSablonDisabled}
      />

      {/* İSTEKLİ FİRMALARI YÖNETME ALANI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Sürece Katılan İstekli Firmalar
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Piyasa araştırması kapsamında davet edilen ve teklif formu dolduran firmaları belirleyin. (En az 3 firma önerilir)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleAddFirmFromPool} className="flex items-center gap-1.5">
              <select
                title="İstekli Firma Seç"
                value={selectedFirmIdToAdd}
                onChange={(e) => setSelectedFirmIdToAdd(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary w-48"
              >
                <option value="">-- Havuzdan Seçin --</option>
                {allPoolFirms
                  .filter((pf) => !invitedFirms.some((ifrm) => ifrm.firma_id === pf.id))
                  .map((pf) => (
                    <option key={pf.id} value={pf.id}>
                      {pf.unvan}
                    </option>
                  ))
                }
              </select>
              <button
                type="submit"
                disabled={!selectedFirmIdToAdd}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all"
              >
                Dosyaya Ekle
              </button>
            </form>

            <button
              onClick={() => setShowNewFirmModal(true)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
            >
              + Yeni Firma Tanımla
            </button>
          </div>
        </div>

        {/* DAVET EDİLEN FİRMALARIN KART GÖRÜNÜMÜ */}
        {invitedFirms.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">
              Bu dosyaya henüz teklif veren/davet edilen firma eklenmemiş.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Teklif fiyat giriş matrisini açmak için lütfen yukarıdaki menüden firma ekleyin veya
              tanımlayın.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitedFirms.map((firma) => (
              <div
                key={firma.id}
                className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl flex items-start justify-between gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-1 overflow-hidden">
                  <h4
                    className="font-bold text-xs text-slate-800 dark:text-slate-250 truncate"
                    title={firma.unvan}
                  >
                    {firma.unvan}
                  </h4>
                  <p className="text-[10px] text-slate-450 truncate">
                    {firma.vergi_no ? `Vergi/TC: ${firma.vergi_no}` : 'Vergi No Yok'}
                  </p>
                  <p className="text-[11px] font-bold text-slate-650 dark:text-slate-350">
                    Toplam:{' '}
                    {firma.teklif_toplami
                      ? `${firma.teklif_toplami.toLocaleString('tr-TR')} ${firma.para_birimi || 'TRY'}`
                      : '0.00 TRY'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFirm(firma.id)}
                  className="text-red-500 hover:bg-red-50 hover:dark:bg-red-950/30 p-1.5 rounded-lg shrink-0 transition-all"
                  title="Firmayı Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TEKLİF VE BİRİM FİYAT GİRİŞ MATRİSİ */}
      {invitedFirms.length > 0 && items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4 overflow-hidden">
          <div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Teklif Giriş Matrisi & Karşılaştırma
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Her firma için malzeme birim fiyatlarını girin. En düşük teklifler yeşil renkle vurgulanır ve yaklaşık maliyet otomatik hesaplanır.
            </p>
          </div>

          <div className="overflow-x-auto w-full border border-slate-150 dark:border-slate-850 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 w-48">
                    Malzeme/Hizmet Adı
                  </th>
                  <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-center w-24">
                    Miktar / Birim
                  </th>
                  {invitedFirms.map((firma) => (
                    <th
                      key={firma.id}
                      className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-right min-w-[120px]"
                    >
                      <div className="truncate w-32 ml-auto" title={firma.unvan}>
                        {firma.unvan}
                      </div>
                    </th>
                  ))}
                  <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-right w-28">
                    Ort. (Yaklaşık)
                  </th>
                  <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-right w-28">
                    En Düşük
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-855">
                {items.map((kalem) => {
                  const lowest = getLowestBidInfo(kalem.id)
                  const avgPrice = getAverageBid(kalem.id)
                  
                  return (
                    <tr key={kalem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {kalem.kalem_adi}
                      </td>
                      <td className="p-3 text-center text-slate-500">
                        {kalem.miktar} {kalem.birim}
                      </td>
                      {invitedFirms.map((firma) => {
                        const val = bids[`${kalem.id}_${firma.id}`] || 0
                        const isLowest = lowest.price > 0 && lowest.firmaId === firma.id
                        
                        return (
                          <td
                            key={firma.id}
                            className={`p-2 text-right transition-colors ${
                              isLowest ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                            }`}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <input
                                title="Fiyat Gir"
                                type="number"
                                step="any"
                                value={val === 0 ? '' : val}
                                placeholder="0.00"
                                onChange={(e) => handlePriceChange(kalem.id, firma.id, e.target.value)}
                                className="w-24 text-right text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                          </td>
                        )
                      })}
                      <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">
                        {avgPrice > 0 ? `${avgPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL` : '-'}
                      </td>
                      <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        {lowest.price > 0 ? `${lowest.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL` : '-'}
                      </td>
                    </tr>
                  )
                })}
                {/* TOPLAM TEKLİFLER SATIRI */}
                <tr className="bg-slate-50/60 dark:bg-slate-950/40 font-bold border-t border-slate-200 dark:border-slate-800">
                  <td className="p-3 text-slate-800 dark:text-slate-200">Toplam Teklif Tutarı</td>
                  <td className="p-3"></td>
                  {invitedFirms.map((firma) => (
                    <td key={firma.id} className="p-3 text-right text-slate-850 dark:text-slate-100">
                      {firma.teklif_toplami ? `${firma.teklif_toplami.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL` : '0.00 TL'}
                    </td>
                  ))}
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* YENİ FİRMA KAYIT MODALI */}
      {showNewFirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-850 dark:text-slate-100">Yeni İstekli Firma Tanımla</h3>
              <button
                onClick={() => setShowNewFirmModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAndAddFirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Firma Unvanı *</label>
                <input
                  type="text"
                  required
                  value={newFirmUnvan}
                  onChange={(e) => setNewFirmUnvan(e.target.value)}
                  placeholder="Örn: ABC İnşaat San. Tic. Ltd. Şti."
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Vergi No / TCKN</label>
                <input
                  type="text"
                  value={newFirmVergiNo}
                  onChange={(e) => setNewFirmVergiNo(e.target.value)}
                  placeholder="10 Haneli Vergi No veya TCKN"
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={newFirmPhone}
                    onChange={(e) => setNewFirmPhone(e.target.value)}
                    placeholder="0(555) 555 5555"
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">E-Posta</label>
                  <input
                    type="email"
                    value={newFirmEmail}
                    onChange={(e) => setNewFirmEmail(e.target.value)}
                    placeholder="info@firma.com"
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewFirmModal(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  Oluştur ve Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SubScreen>
  )
}
