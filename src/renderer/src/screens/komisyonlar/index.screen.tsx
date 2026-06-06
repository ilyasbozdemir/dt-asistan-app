import React, { useState } from 'react'
import {
  Users,
  Search,
  Plus,
  Filter,
  ShieldCheck,
  CheckCircle2,
  FileSearch
} from 'lucide-react'
import { InnerMenu, InnerMenuItem } from '../../components/ui/InnerMenu'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function KomisyonlarScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'fiyat_arastirma' | 'muayene_kabul' | 'tespit'>('fiyat_arastirma')
  const [searchTerm, setSearchTerm] = useState('')

  const menuItems: InnerMenuItem[] = [
    {
      id: 'fiyat_arastirma',
      label: 'Fiyat Araştırma Komisyonları',
      icon: <FileSearch className="w-4 h-4 shrink-0" />
    },
    {
      id: 'muayene_kabul',
      label: 'Muayene ve Kabul Komisyonları',
      icon: <CheckCircle2 className="w-4 h-4 shrink-0" />
    },
    {
      id: 'tespit',
      label: 'Tespit Komisyonları',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />
    }
  ]

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Komisyon Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kurum içi görevlendirilecek komisyon asil ve yedek üyelerini buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 rounded-xl px-4 py-2 text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" /> Komisyon Oluştur
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 min-h-0">
        <InnerMenu
          className="lg:col-span-3 shrink-0"
          items={menuItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />

        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col overflow-hidden relative">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Komisyon adı veya üye ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              />
            </div>
            <Button variant="outline" className="gap-2 rounded-xl text-slate-600 dark:text-slate-300">
              <Filter className="w-4 h-4" /> Filtrele
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-800/30 shadow-sm">
                {activeTab === 'fiyat_arastirma' && <FileSearch className="w-8 h-8" />}
                {activeTab === 'muayene_kabul' && <CheckCircle2 className="w-8 h-8" />}
                {activeTab === 'tespit' && <ShieldCheck className="w-8 h-8" />}
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Henüz bu kategoriye ait bir komisyon tanımı bulunmuyor. Yeni bir komisyon eklemek için yukarıdaki "Komisyon Oluştur" butonunu kullanabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
