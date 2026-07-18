import React, { useEffect, useState, useMemo } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Database, Search, Cpu, RefreshCw, AlertTriangle, Layers } from 'lucide-react'

interface TableInfo {
  name: string
  count: number
}

interface ColumnInfo {
  cid: number
  name: string
  type: string
  notnull: number
  dflt_value: any
  pk: number
}

interface DatabaseBrowserModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DatabaseBrowserModal({
  isOpen,
  onClose
}: DatabaseBrowserModalProps): React.JSX.Element {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tableSearch, setTableSearch] = useState<string>('')
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'data' | 'schema' | 'console'>('data')

  // SQL Console states
  const [consoleQuery, setConsoleQuery] = useState<string>('')
  const [consoleResults, setConsoleResults] = useState<any[]>([])
  const [consoleError, setConsoleError] = useState<string | null>(null)
  const [consoleLoading, setConsoleLoading] = useState<boolean>(false)

  // Fetch tables and counts
  const loadTables = async (): Promise<void> => {
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      )
      if (res.success && res.data) {
        const list: TableInfo[] = []
        for (const t of res.data) {
          const countRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT COUNT(*) as row_count FROM ${t.name}`
          )
          list.push({
            name: t.name,
            count: countRes.success && countRes.data[0] ? countRes.data[0].row_count : 0
          })
        }
        setTables(list)
        if (list.length > 0 && !selectedTable) {
          setSelectedTable(list[0].name)
        }
      }
    } catch (e) {
      console.error('Failed to load sqlite tables:', e)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadTables()
    }
  }, [isOpen])

  // Load table details (schema + first 100 rows)
  useEffect(() => {
    if (!isOpen || !selectedTable) return

    const loadDetails = async (): Promise<void> => {
      setLoading(true)
      try {
        // Schema
        const schemaRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `PRAGMA table_info(${selectedTable})`
        )
        if (schemaRes.success) {
          setColumns(schemaRes.data || [])
        }

        // Data (limit 100)
        const dataRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT * FROM ${selectedTable} LIMIT 100`
        )
        if (dataRes.success) {
          setRows(dataRes.data || [])
        }
      } catch (e) {
        console.error('Failed to load table details:', e)
      } finally {
        setLoading(false)
      }
    }

    loadDetails()
  }, [selectedTable, isOpen])

  const filteredTables = useMemo(() => {
    const query = tableSearch.toLowerCase().trim()
    if (!query) return tables
    return tables.filter((t) => t.name.toLowerCase().includes(query))
  }, [tables, tableSearch])

  // Run SQL Console query
  const handleRunQuery = async (): Promise<void> => {
    if (!consoleQuery.trim()) return
    setConsoleLoading(true)
    setConsoleError(null)
    setConsoleResults([])
    try {
      const res = await window.electron.ipcRenderer.invoke('db:query', consoleQuery.trim())
      if (res.success) {
        setConsoleResults(res.data || [])
      } else {
        setConsoleError(res.error || 'Sorgu çalıştırılırken bilinmeyen bir hata oluştu.')
      }
    } catch (e: any) {
      setConsoleError(e.message || 'Hata: Sorgu yürütülemedi.')
    } finally {
      setConsoleLoading(false)
    }
  }

  // Prepopulate query input on console tab
  const setQuickConsoleQuery = (query: string): void => {
    setConsoleQuery(query)
    setActiveTab('console')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SQLite Veritabanı Gezgini"
      description="Çalışma dosyasındaki verilerin şemalarını, tablolarını ve kayıtlarını inceleyin."
      className="max-w-6xl w-full h-[90vh] max-h-[90vh]"
    >
      <div className="flex gap-6 h-[72vh] -mx-6 -mb-6 relative">
        {/* Sidebar: Tables List */}
        <div className="w-1/4 border-r border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-4 h-full bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tablo ara..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {filteredTables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                  selectedTable === t.name
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/10'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Database
                    className={`w-3.5 h-3.5 ${
                      selectedTable === t.name ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate font-mono">{t.name}</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold font-mono shrink-0 ${
                    selectedTable === t.name
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
            {filteredTables.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 italic">
                Tablo bulunamadı.
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col h-full">
          {/* Top Tabs & Selected Indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                📂 {selectedTable || 'Seçilmedi'}
              </span>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-sans">
              <button
                onClick={() => setActiveTab('data')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activeTab === 'data'
                    ? 'bg-white dark:bg-slate-900 text-blue-650 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tablo Verileri
              </button>
              <button
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activeTab === 'schema'
                    ? 'bg-white dark:bg-slate-900 text-blue-650 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Şema / Kolonlar
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activeTab === 'console'
                    ? 'bg-white dark:bg-slate-900 text-blue-650 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                SQL Konsolu
              </button>
            </div>
          </div>

          {/* Interactive Screen Content */}
          <div className="flex-1 overflow-hidden relative">
            {loading && activeTab !== 'console' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 z-10 text-xs text-slate-500 italic">
                Veriler yükleniyor...
              </div>
            ) : null}

            {/* TAB 1: DATA BROWSING */}
            {activeTab === 'data' && (
              <div className="h-full flex flex-col justify-between">
                <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl custom-scrollbar relative bg-white dark:bg-slate-950">
                  {rows.length === 0 ? (
                    <div className="text-center py-20 text-xs text-slate-400 italic">
                      Bu tabloda henüz hiç kayıt bulunmuyor.
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-[10px] text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800 z-5">
                        <tr>
                          {columns.map((c) => (
                            <th
                              key={c.name}
                              className="p-2 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap"
                            >
                              {c.name}
                              {c.pk === 1 && (
                                <span className="ml-1 text-[8px] bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-1 rounded uppercase font-extrabold font-sans">
                                  PK
                                </span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {rows.map((row, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 font-mono"
                          >
                            {columns.map((c) => {
                              const val = row[c.name]
                              return (
                                <td
                                  key={c.name}
                                  className="p-2 border-r border-slate-150 dark:border-slate-850 truncate max-w-[200px] text-slate-600 dark:text-slate-400"
                                  title={
                                    val !== null && typeof val === 'object'
                                      ? JSON.stringify(val)
                                      : String(val)
                                  }
                                >
                                  {val === null ? (
                                    <span className="text-slate-350 dark:text-slate-600 italic">
                                      NULL
                                    </span>
                                  ) : typeof val === 'object' ? (
                                    JSON.stringify(val)
                                  ) : (
                                    String(val)
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {rows.length > 0 && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                    * Güvenli performans için ilk 100 satır gösterilmektedir. Tüm verileri incelemek
                    için{' '}
                    <button
                      onClick={() => setQuickConsoleQuery(`SELECT * FROM ${selectedTable}`)}
                      className="text-blue-600 dark:text-blue-400 underline font-bold cursor-pointer"
                    >
                      SQL Konsolu
                    </button>
                    'nu kullanabilirsiniz.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SCHEMA DETAILS */}
            {activeTab === 'schema' && (
              <div className="h-full overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 custom-scrollbar">
                <table className="w-full border-collapse text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-800">
                        Sıra (cid)
                      </th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-800">
                        Kolon Adı
                      </th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-800">
                        Veri Türü
                      </th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">
                        Nullable (NotNull)
                      </th>
                      <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">
                        Birincil Anahtar (PK)
                      </th>
                      <th className="p-3">Varsayılan Değer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono text-[11px]">
                    {columns.map((c) => (
                      <tr key={c.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <td className="p-3 border-r border-slate-150 dark:border-slate-850 text-slate-500">
                          {c.cid}
                        </td>
                        <td className="p-3 border-r border-slate-150 dark:border-slate-850 font-bold text-slate-800 dark:text-slate-250">
                          {c.name}
                        </td>
                        <td className="p-3 border-r border-slate-150 dark:border-slate-850 font-bold text-blue-600 dark:text-blue-400">
                          {c.type || 'NUMERIC'}
                        </td>
                        <td className="p-3 border-r border-slate-150 dark:border-slate-850 text-center">
                          {c.notnull === 1 ? (
                            <span className="text-red-500 font-bold">NOT NULL</span>
                          ) : (
                            <span className="text-slate-400">NULLABLE</span>
                          )}
                        </td>
                        <td className="p-3 border-r border-slate-150 dark:border-slate-850 text-center">
                          {c.pk === 1 ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 rounded font-black text-[9px]">
                              PRIMARY KEY
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-slate-500">
                          {c.dflt_value === null ? (
                            <span className="italic text-slate-350 dark:text-slate-650">yok</span>
                          ) : (
                            String(c.dflt_value)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: SQL CONSOLE */}
            {activeTab === 'console' && (
              <div className="h-full flex flex-col gap-4 overflow-hidden">
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      SQL Sorgu Girişi (Sadece SELECT sorguları desteklenir)
                    </label>
                    <button
                      onClick={() =>
                        setConsoleQuery(
                          `SELECT * FROM ${selectedTable || 'DATA_TeminDosyasi'} LIMIT 20`
                        )
                      }
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      Taslak Sorgu Doldur
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={consoleQuery}
                      onChange={(e) => setConsoleQuery(e.target.value)}
                      placeholder="SELECT * FROM TANIM_Firma WHERE aktif_mi = 1 ORDER BY id DESC"
                      className="flex-1 font-mono text-xs p-3 bg-slate-950 text-slate-300 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 custom-scrollbar whitespace-pre-wrap"
                    />
                    <button
                      onClick={handleRunQuery}
                      disabled={consoleLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold px-5 text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all shrink-0 cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${consoleLoading ? 'animate-spin' : ''}`}
                      />
                      Sorguyu Çalıştır
                    </button>
                  </div>
                </div>

                {/* Console results block */}
                <div className="flex-1 overflow-hidden relative border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
                  {consoleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 z-10 text-xs text-slate-500 italic">
                      Sorgu yürütülüyor...
                    </div>
                  )}

                  {consoleError && (
                    <div className="p-4 bg-rose-50/50 border-b border-rose-200 text-rose-800 dark:bg-rose-955/15 dark:border-rose-900/30 dark:text-rose-400 text-xs flex items-start gap-2 h-full overflow-y-auto">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-1">SQL Hatası</span>
                        <pre className="font-mono text-[10px] whitespace-pre-wrap">
                          {consoleError}
                        </pre>
                      </div>
                    </div>
                  )}

                  {!consoleError && consoleResults.length === 0 ? (
                    <div className="text-center py-20 text-xs text-slate-400 italic">
                      {consoleLoading
                        ? 'Sonuçlar bekleniyor...'
                        : 'Sorgu çalıştırıldıktan sonra sonuçlar burada listelenecektir.'}
                    </div>
                  ) : !consoleError ? (
                    <div className="h-full overflow-auto custom-scrollbar">
                      <table className="w-full border-collapse text-[10px] text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            {Object.keys(consoleResults[0] || {}).map((key) => (
                              <th
                                key={key}
                                className="p-2 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-350 whitespace-nowrap"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono">
                          {consoleResults.map((row, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                            >
                              {Object.keys(row).map((key) => {
                                const val = row[key]
                                return (
                                  <td
                                    key={key}
                                    className="p-2 border-r border-slate-150 dark:border-slate-850 truncate max-w-[200px] text-slate-650 dark:text-slate-400"
                                    title={
                                      val !== null && typeof val === 'object'
                                        ? JSON.stringify(val)
                                        : String(val)
                                    }
                                  >
                                    {val === null ? (
                                      <span className="text-slate-350 dark:text-slate-600 italic">
                                        NULL
                                      </span>
                                    ) : typeof val === 'object' ? (
                                      JSON.stringify(val)
                                    ) : (
                                      String(val)
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
