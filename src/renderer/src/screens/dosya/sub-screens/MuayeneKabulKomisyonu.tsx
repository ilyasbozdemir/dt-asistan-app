import React, { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  Users,
  Package,
  Layers,
  Compass,
  FileCheck,
  CreditCard,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Building2,
  Printer,
  TrendingUp,
  UserPlus,
  Copy,
  Upload,
  Eye
} from 'lucide-react'
import { cn } from '../../../utils/cn'
import { Modal } from '../../../components/ui/Modal'

import { SubScreen } from '../SubScreens.screen'

export function MuayeneKabulKomisyonu(): React.JSX.Element {
  return <KomisyonAtamaForm tur="Muayene Kabul" title="Muayene Kabul Komisyonu Atama" />
}

// Reusable Komisyon Atama Form Component
interface KomisyonAtamaProps {
  tur: 'Fiyat Araştırma' | 'Muayene Kabul'
  title: string
}

export function KomisyonAtamaForm({ tur, title }: KomisyonAtamaProps): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const [members, setMembers] = useState<any[]>([])
  const [personnel, setPersonnel] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [selectedPersId, setSelectedPersId] = useState<number | null>(null)
  const [gorevi, setGorevi] = useState('Üye')

  const loadKomisyon = async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      const resMembers = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT tk.id as member_id, p.*, tk.gorevi 
         FROM DATA_TeminKomisyon tk 
         JOIN TANIM_Personel p ON tk.personel_id = p.id 
         WHERE tk.temin_dosya_id = ? AND tk.komisyon_turu = ?`,
        [activeDosyaId, tur]
      )
      const resPers = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC'
      )
      if (resMembers.success) setMembers(resMembers.data)
      if (resPers.success) setPersonnel(resPers.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKomisyon()
  }, [activeDosyaId, tur])

  const handleAddMember = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedPersId) return

    // Prevent duplicates in same commission
    if (members.some((m) => m.id === selectedPersId)) {
      alert('Bu personel zaten komisyonda görevli.')
      return
    }

    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'INSERT INTO DATA_TeminKomisyon (temin_dosya_id, personel_id, komisyon_turu, gorevi) VALUES (?, ?, ?, ?)',
        [activeDosyaId, selectedPersId, tur, gorevi]
      )
      if (res.success) {
        setSelectedPersId(null)
        setGorevi('Üye')
        loadKomisyon()
      } else {
        alert(res.error)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleRemoveMember = async (memberId: number): Promise<void> => {
    if (!confirm('Komisyon üyesini görevden almak istediğinize emin misiniz?')) return
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKomisyon WHERE id = ?',
        [memberId]
      )
      if (res.success) {
        loadKomisyon()
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
      {/* ASSIGN FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-purple-600" />
          Komisyon Üyesi Görevlendir
        </h3>

        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Personel Seçimi
            </label>
            <select
              value={selectedPersId || ''}
              onChange={(e) => setSelectedPersId(parseInt(e.target.value, 10) || null)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="">Personel Seçiniz...</option>
              {personnel.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.ad_soyad} - {p.unvan || 'Unvansız'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Komisyon Görevi / Rolü
            </label>
            <select
              value={gorevi}
              onChange={(e) => setGorevi(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="Başkan">Komisyon Başkanı</option>
              <option value="Üye">Komisyon Üyesi</option>
              <option value="Yedek Üye">Yedek Üye</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Üyeyi Komisyona Ekle
          </button>
        </form>
      </div>

      {/* MEMBERS LIST */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm min-h-[350px] flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
          {title} ({members.length})
        </h3>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
            Yükleniyor...
          </div>
        ) : members.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Users className="w-10 h-10 text-slate-350 dark:text-slate-700 mb-2 animate-pulse" />
            <p className="text-xs">Bu komisyonda henüz görevli personel atanmamış.</p>
            <p className="text-[10px] text-slate-500 mt-1">
              Sol taraftaki paneli kullanarak üyeleri atayabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[400px] custom-scrollbar pr-1">
            {members.map((m) => (
              <div
                key={m.member_id}
                className="p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all bg-slate-50/20 dark:bg-slate-950/20"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 truncate">
                      {m.ad_soyad}
                    </h4>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider',
                        m.gorevi === 'Başkan' &&
                          'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
                        m.gorevi === 'Üye' &&
                          'bg-blue-100 text-blue-750 dark:bg-blue-900/30 dark:text-blue-400',
                        m.gorevi === 'Yedek Üye' &&
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      )}
                    >
                      {m.gorevi}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-[10px] text-slate-550 dark:text-slate-400 font-medium">
                    <p>💼 Unvan: {m.unvan || 'Belirtilmemiş'}</p>
                    <p>🏢 Kurum Birim: {m.birim || '-'}</p>
                    {m.sicil_no && <p>🆔 Sicil No: {m.sicil_no}</p>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                  <button
                    onClick={() => handleRemoveMember(m.member_id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/15 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Görevi Sonlandır
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// REST OF THE PLACEHOLDER SCREENS FOR DOCUMENTS
