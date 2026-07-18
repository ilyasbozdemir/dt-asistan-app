import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useDosyaAsamasiSablons, normalizeForMatch } from '../useDosyaAsamasiSablons'

export interface BiddingFirm {
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

export interface PoolFirm {
  id: number
  unvan: string
  firma_kodu?: string
  istigal_konusu?: string
  il?: string
  vergi_no?: string
  telefon?: string
  email?: string
}

export interface BiddingKalem {
  id: number
  kalem_adi: string
  miktar: number
  birim: string
}

import { useTabStore } from '../../../../../store/tabStore'
import { formatDateString } from '../../../CiktiMerkezi.contextBuilder'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePiyasaFiyatArastirmasiLogic() {
  const sablonsContext = useDosyaAsamasiSablons()
  const {
    activeDosyaId,
    sablons,
    activeStarredDocs,
    contextsByPath,
    dosyaContext,
    handleOpenPreviewForSablon,
    quickOpenExternal,
    quickPrint
  } = sablonsContext
  const activeTabPath = useTabStore((s) => s.activeTabPath)

  const [invitedFirms, setInvitedFirms] = useState<BiddingFirm[]>([])
  const [allPoolFirms, setAllPoolFirms] = useState<PoolFirm[]>([])
  const [items, setItems] = useState<BiddingKalem[]>([])
  const [bids, setBids] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const [savedDocuments, setSavedDocuments] = useState<any[]>([])
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)

  const [hesaplamaEsasi, setHesaplamaEsasi] = useState<string>('Ortalama fiyat esasına göre')
  const [komisyonTakdiri, setKomisyonTakdiri] = useState<string>(
    'Sadece araştırma fiyatları dikkate alınacak'
  )
  const [isEditingFirms, setIsEditingFirms] = useState<boolean>(false)
  const [maliyetCetveliTarihi, setMaliyetCetveliTarihi] = useState<string>('')
  const [tutanakTarihi, setTutanakTarihi] = useState<string>('')
  const [syncTutanak, setSyncTutanak] = useState<boolean>(true)
  const [setLowestFirmAsWinner, setSetLowestFirmAsWinner] = useState<boolean>(true)
  const [manualWinnerFirmaId, setManualWinnerFirmaId] = useState<number | null>(null)
  const [belgeleriKaydet, setBelgeleriKaydet] = useState<boolean>(true)

  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false)
  const [selectedFirmIds, setSelectedFirmIds] = useState<number[]>([])
  const [modalSearchQuery, setModalSearchQuery] = useState('')

  const [belgeMenuOpen, setBelgeMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    try {
      return localStorage.getItem('dta_selected_preset_id') || ''
    } catch {
      return ''
    }
  })
  const [isChangingPreset, setIsChangingPreset] = useState(false)
  const [presets, setPresets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('dta_document_presets')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    const handlePresetsChange = () => {
      try {
        const saved = localStorage.getItem('dta_document_presets')
        setPresets(saved ? JSON.parse(saved) : [])
      } catch (e) {
        console.error(e)
      }
    }
    window.addEventListener('dta_presets_changed', handlePresetsChange)
    return () => window.removeEventListener('dta_presets_changed', handlePresetsChange)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBelgeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const stageSablons = useMemo(() => {
    return sablons.filter(
      (s) =>
        s.kategori === '2-piyasa-fiyat-arastirmasi' || s.kategori === '2. Piyasa Fiyat Araştırması'
    )
  }, [sablons])

  function getCleanName(ad: string): string {
    let clean = ad
    const matchStatus = clean.match(/^\[(.*?)\]\s*(.*)$/)
    if (matchStatus) clean = matchStatus[2].trim()
    return clean
  }

  const starredDocsForFilter = useMemo(() => {
    const activePresetId = selectedPresetId || (presets.length > 0 ? presets[0].id : '')
    if (activePresetId) {
      const preset = presets.find((p) => p.id === activePresetId)
      return preset ? preset.docs : []
    }
    return activeStarredDocs || []
  }, [selectedPresetId, presets, activeStarredDocs])

  const hasStarred = useMemo(() => {
    return stageSablons.some((sablon) => {
      const cleanName = getCleanName(sablon.ad)
      return starredDocsForFilter.some((d) => normalizeForMatch(d) === normalizeForMatch(cleanName))
    })
  }, [stageSablons, starredDocsForFilter])

  const [manualFilter, setManualFilter] = useState<'all' | 'starred' | null>(null)

  const filter = manualFilter !== null ? manualFilter : hasStarred ? 'starred' : 'all'

  const displaySablons = useMemo(() => {
    if (filter === 'starred') {
      return stageSablons.filter((sablon) => {
        const cleanName = getCleanName(sablon.ad)
        return starredDocsForFilter.some(
          (d) => normalizeForMatch(d) === normalizeForMatch(cleanName)
        )
      })
    }
    return stageSablons
  }, [filter, starredDocsForFilter, stageSablons])

  const loadData = useCallback(async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      const resInvited = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND aktif_mi = 1 ORDER BY unvan ASC',
        [activeDosyaId]
      )

      const resPool = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Firma WHERE aktif_mi = 1 ORDER BY unvan ASC'
      )

      const resItems = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, kalem_adi, miktar, birim FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
        [activeDosyaId]
      )

      const resBids = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?',
        [activeDosyaId]
      )

      const resDosya = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT hesaplama_esasi, komisyon_takdiri, temin_tarihi FROM DATA_TeminDosyasi WHERE id = ?',
        [activeDosyaId]
      )

      if (resInvited.success) setInvitedFirms(resInvited.data || [])
      if (resPool.success) setAllPoolFirms(resPool.data || [])
      if (resItems.success) setItems(resItems.data || [])
      let defaultDate = ''
      if (resDosya.success && resDosya.data && resDosya.data.length > 0) {
        setHesaplamaEsasi(resDosya.data[0].hesaplama_esasi || 'Ortalama fiyat esasına göre')
        setKomisyonTakdiri(
          resDosya.data[0].komisyon_takdiri || 'Sadece araştırma fiyatları dikkate alınacak'
        )
        defaultDate = resDosya.data[0].temin_tarihi || ''
        // Mevcut kazanan firma varsa state'e yükle
        if (resDosya.data[0].firma_id) {
          setManualWinnerFirmaId(resDosya.data[0].firma_id)
        }
      }

      const resBelgeler = await window.electron.ipcRenderer.invoke(
        'db:query',
        "SELECT * FROM DATA_TeminBelge WHERE temin_dosya_id = ? AND belge_adi IN ('Yaklaşık Maliyet Cetveli', 'Piyasa Fiyat Araştırma Tutanağı')",
        [activeDosyaId]
      )

      let mDate = ''
      let tDate = ''
      if (resBelgeler.success && resBelgeler.data) {
        setSavedDocuments(resBelgeler.data)
        const maliyetDoc = resBelgeler.data.find(
          (b: any) => b.belge_adi === 'Yaklaşık Maliyet Cetveli'
        )
        const tutanakDoc = resBelgeler.data.find(
          (b: any) => b.belge_adi === 'Piyasa Fiyat Araştırma Tutanağı'
        )
        mDate = maliyetDoc?.belge_tarihi || ''
        tDate = tutanakDoc?.belge_tarihi || ''
        const hasBothDocs = resBelgeler.data.length >= 2
        setIsFormOpen(!hasBothDocs)
      } else {
        setIsFormOpen(true)
      }
      setMaliyetCetveliTarihi(mDate || defaultDate || new Date().toISOString().split('T')[0])
      setTutanakTarihi(tDate || defaultDate || new Date().toISOString().split('T')[0])

      if (resBids.success && resBids.data) {
        const bidsMap: Record<string, number> = {}
        resBids.data.forEach((row: any) => {
          bidsMap[`${row.temin_kalem_id}_${row.temin_firma_id}`] = row.birim_fiyat || 0
        })
        setBids(bidsMap)
        setIsEditingFirms(resBids.data.length === 0)
      }
    } catch (err) {
      console.error('Error loading bidding data:', err)
    } finally {
      setLoading(false)
    }
  }, [activeDosyaId])

  useEffect(() => {
    loadData()
  }, [activeDosyaId, activeTabPath, loadData])

  const handleBulkAddFirms = async (): Promise<void> => {
    if (!activeDosyaId || selectedFirmIds.length === 0) return
    try {
      for (const fId of selectedFirmIds) {
        const poolFirm = allPoolFirms.find((pf) => pf.id === fId)
        if (!poolFirm) continue

        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminFirma (temin_dosya_id, firma_id, unvan, vergi_no, telefon, email, davet_edildi_mi, teklif_durumu) VALUES (?, ?, ?, ?, ?, ?, 1, 'Davet Edildi')`,
          [
            activeDosyaId,
            poolFirm.id,
            poolFirm.unvan,
            poolFirm.vergi_no || '',
            poolFirm.telefon || '',
            poolFirm.email || ''
          ]
        )
      }
      setSelectedFirmIds([])
      setIsFirmModalOpen(false)
      await loadData()
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
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKalemTeklif WHERE temin_firma_id = ?',
        [teminFirmaId]
      )
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

  const handlePriceChange = async (
    kalemId: number,
    teminFirmaId: number,
    priceStr: string
  ): Promise<void> => {
    const price = parseFloat(priceStr) || 0
    const key = `${kalemId}_${teminFirmaId}`

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

      let total = 0
      items.forEach((kalem) => {
        const kPrice = kalem.id === kalemId ? price : bids[`${kalem.id}_${teminFirmaId}`] || 0
        total += kPrice * (kalem.miktar || 0)
      })

      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminFirma SET teklif_toplami = ?, teklif_verdi_mi = 1, teklif_durumu = 'Teklif Verildi' WHERE id = ?`,
        [total, teminFirmaId]
      )

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

  const getLowestBidInfo = useCallback(
    (kalemId: number): { price: number; firmaId: number | null } => {
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
    },
    [invitedFirms, bids]
  )

  const getAverageBid = useCallback(
    (kalemId: number): number => {
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
    },
    [invitedFirms, bids]
  )

  const getEstimatedCostTotal = useCallback((): number => {
    const isLowestBasis =
      hesaplamaEsasi?.toLowerCase().includes('en düşük') ||
      hesaplamaEsasi?.toLowerCase().includes('en dusuk')

    return items.reduce((sum, item) => {
      const price = isLowestBasis ? getLowestBidInfo(item.id).price : getAverageBid(item.id)
      return sum + (item.miktar || 0) * price
    }, 0)
  }, [items, getAverageBid, getLowestBidInfo, hesaplamaEsasi])

  const handleSaveToDosya = async (): Promise<void> => {
    const total = getEstimatedCostTotal()
    if (total === 0) {
      alert('Yaklaşık maliyet ₺0.00 olamaz. Lütfen önce teklif fiyatları girin.')
      return
    }
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminDosyasi SET yaklasik_maliyet = ?, temin_tarihi = ? WHERE id = ?',
        [total, tutanakTarihi || maliyetCetveliTarihi || null, activeDosyaId]
      )
      if (res.success) {
        // Kazanan firmayı belirle ve kaydet
        if (setLowestFirmAsWinner) {
          // Otomatik: en düşük teklif sahibi kazanan
          let lowestBidFirmMasterId: number | null = null
          let minTotalBid = Infinity
          invitedFirms.forEach((f) => {
            if (f.teklif_toplami && f.teklif_toplami > 0 && f.teklif_toplami < minTotalBid) {
              minTotalBid = f.teklif_toplami
              lowestBidFirmMasterId = f.firma_id
            }
          })

          if (lowestBidFirmMasterId) {
            await window.electron.ipcRenderer.invoke(
              'db:run',
              'UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?',
              [lowestBidFirmMasterId, activeDosyaId]
            )
            setManualWinnerFirmaId(lowestBidFirmMasterId)
          }
        } else if (manualWinnerFirmaId) {
          // Elle seçilen kazanan firma
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?',
            [manualWinnerFirmaId, activeDosyaId]
          )
        }

        if (belgeleriKaydet) {
          // Tutanak ve Maliyet Cetveli belgelerini DATA_TeminBelge tablosuna ekle/güncelle
          const documentsToLog = [{ name: 'Yaklaşık Maliyet Cetveli', date: maliyetCetveliTarihi }]
          if (syncTutanak) {
            documentsToLog.push({ name: 'Piyasa Fiyat Araştırma Tutanağı', date: tutanakTarihi })
          }

          for (const doc of documentsToLog) {
            const sablon = stageSablons.find((s: any) => {
              const lowerAd = s.ad.toLowerCase()
              const lowerDocName = doc.name.toLowerCase()
              return lowerAd.includes(lowerDocName) || lowerDocName.includes(lowerAd)
            })

            let mergedCtxStr: string | null = null
            if (sablon) {
              const processPath = sablon.route_path || sablon.dosya_adi || ''
              const baseCtx = contextsByPath[processPath] || dosyaContext
              const mergedCtx = {
                ...baseCtx,
                tarih: doc.date ? formatDateString(doc.date) : baseCtx.tarih,
                dosyaTarihi: doc.date ? formatDateString(doc.date) : baseCtx.dosyaTarihi
              }
              mergedCtxStr = JSON.stringify(mergedCtx)

              // Aktif şablon verisini güncelle (en son durum)
              await window.electron.ipcRenderer.invoke(
                'db:run',
                'INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json) VALUES (?, ?, ?)',
                [activeDosyaId, sablon.id, mergedCtxStr]
              )
            }

            // Yeni bir versiyon (tarihçeli belge) olarak ekle
            await window.electron.ipcRenderer.invoke(
              'db:run',
              'INSERT INTO DATA_TeminBelge (temin_dosya_id, belge_adi, belge_tarihi, dosya_yolu, veri_json) VALUES (?, ?, ?, ?, ?)',
              [activeDosyaId, doc.name, doc.date || null, '', mergedCtxStr]
            )
          }

          alert(
            `Yaklaşık maliyet ve süreç belgeleri başarıyla kaydedildi: ₺ ${total.toLocaleString(
              'tr-TR',
              {
                minimumFractionDigits: 2
              }
            )}`
          )

          // Belgeleri yeniden yükle
          const resBelgelerNew = await window.electron.ipcRenderer.invoke(
            'db:query',
            "SELECT * FROM DATA_TeminBelge WHERE temin_dosya_id = ? AND belge_adi IN ('Yaklaşık Maliyet Cetveli', 'Piyasa Fiyat Araştırma Tutanağı')",
            [activeDosyaId]
          )
          if (resBelgelerNew.success && resBelgelerNew.data) {
            setSavedDocuments(resBelgelerNew.data)
          }

          // Piyasa Fiyat Araştırma Tutanağı belgesini otomatik önizlemeye aç!
          const tutanakSablon = stageSablons.find((s: any) =>
            s.ad.toLowerCase().includes('piyasa fiyat araştırma tutanağı')
          )
          if (tutanakSablon && syncTutanak) {
            setTimeout(() => {
              handleOpenPreviewForSablon(tutanakSablon, tutanakSablon.ad)
            }, 300)
          }
        } else {
          alert(
            `Teklif fiyatları ve yaklaşık maliyet başarıyla kaydedildi: ₺ ${total.toLocaleString(
              'tr-TR',
              {
                minimumFractionDigits: 2
              }
            )}`
          )
        }

        setIsFormOpen(false)
      } else {
        alert(res.error)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleUpdateDocumentDate = async (docId: number, newDate: string, docName: string) => {
    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminBelge SET belge_tarihi = ? WHERE id = ?',
        [newDate || null, docId]
      )

      if (docName === 'Yaklaşık Maliyet Cetveli') {
        setMaliyetCetveliTarihi(newDate)
      } else if (docName === 'Piyasa Fiyat Araştırma Tutanağı') {
        setTutanakTarihi(newDate)
      }

      const sablon = stageSablons.find((s: any) => {
        const lowerAd = s.ad.toLowerCase()
        const lowerDocName = docName.toLowerCase()
        return lowerAd.includes(lowerDocName) || lowerDocName.includes(lowerAd)
      })

      if (sablon) {
        const processPath = sablon.route_path || sablon.dosya_adi || ''
        const baseCtx = contextsByPath[processPath] || dosyaContext

        const snapshotRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT veri_json FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND sablon_id = ?',
          [activeDosyaId, sablon.id]
        )

        let currentVeri: any = { ...baseCtx }
        if (snapshotRes.success && snapshotRes.data.length > 0) {
          try {
            currentVeri = { ...currentVeri, ...JSON.parse(snapshotRes.data[0].veri_json) }
          } catch (e) {
            console.error(e)
          }
        }

        const mergedCtx = {
          ...currentVeri,
          tarih: newDate ? formatDateString(newDate) : currentVeri.tarih,
          dosyaTarihi: newDate ? formatDateString(newDate) : currentVeri.dosyaTarihi
        }

        await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json) VALUES (?, ?, ?)',
          [activeDosyaId, sablon.id, JSON.stringify(mergedCtx)]
        )
      }

      const resBelgelerNew = await window.electron.ipcRenderer.invoke(
        'db:query',
        "SELECT * FROM DATA_TeminBelge WHERE temin_dosya_id = ? AND belge_adi IN ('Yaklaşık Maliyet Cetveli', 'Piyasa Fiyat Araştırma Tutanağı')",
        [activeDosyaId]
      )
      if (resBelgelerNew.success && resBelgelerNew.data) {
        setSavedDocuments(resBelgelerNew.data)
      }
    } catch (err) {
      console.error('Error updating document date:', err)
    }
  }

  const lowestTotalFirmaId = useMemo(() => {
    let minTotal = Infinity
    let minId: number | null = null
    invitedFirms.forEach((firma) => {
      if (firma.teklif_toplami && firma.teklif_toplami > 0 && firma.teklif_toplami < minTotal) {
        minTotal = firma.teklif_toplami
        minId = firma.id
      }
    })
    return minId
  }, [invitedFirms])

  return {
    sablonsContext,
    invitedFirms,
    allPoolFirms,
    items,
    bids,
    loading,
    hesaplamaEsasi,
    komisyonTakdiri,
    isFirmModalOpen,
    setIsFirmModalOpen,
    selectedFirmIds,
    setSelectedFirmIds,
    modalSearchQuery,
    setModalSearchQuery,
    belgeMenuOpen,
    setBelgeMenuOpen,
    dropdownRef,
    selectedPresetId,
    setSelectedPresetId,
    isChangingPreset,
    setIsChangingPreset,
    presets,
    stageSablons,
    getCleanName,
    filter,
    setManualFilter,
    displaySablons,
    handleBulkAddFirms,
    handleRemoveFirm,
    handlePriceChange,
    getLowestBidInfo,
    getAverageBid,
    getEstimatedCostTotal,
    handleSaveToDosya,
    lowestTotalFirmaId,
    isEditingFirms,
    setIsEditingFirms,
    maliyetCetveliTarihi,
    setMaliyetCetveliTarihi,
    tutanakTarihi,
    setTutanakTarihi,
    savedDocuments,
    setSavedDocuments,
    isFormOpen,
    setIsFormOpen,
    syncTutanak,
    setSyncTutanak,
    setLowestFirmAsWinner,
    setSetLowestFirmAsWinner,
    manualWinnerFirmaId,
    setManualWinnerFirmaId,
    belgeleriKaydet,
    setBelgeleriKaydet,
    handleUpdateDocumentDate
  }
}
