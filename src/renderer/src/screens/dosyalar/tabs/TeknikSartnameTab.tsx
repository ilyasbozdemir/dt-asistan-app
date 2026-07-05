import React from 'react';
import { FileText, Building2, HelpCircle, Loader2, Sparkles, Copy, Search, DollarSign, User, Info, ChevronDown } from 'lucide-react';
import { YeniDosyaTabProps } from '../types';
import { cn } from '../../../utils/cn';

export function TeknikSartnameTab(props: YeniDosyaTabProps) {
  const {
    formData,
    setFormData,
    isEdit,
    birimler,
    personeller,
    kodSozlugu,
    dosyalar,
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
    showPersonelSearch,
    setShowPersonelSearch,
    personelSearchQuery,
    setPersonelSearchQuery,
    filteredPersoneller
  } = props;

  return (
    <>
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                      <HelpCircle className="text-blue-500 w-5 h-5" />
                      <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        Teknik Şartname & Ek Belgeler
                      </h2>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                      <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400">
                        EKAP Doküman Kuralları
                      </h3>
                      <ul className="text-xs text-blue-700 dark:text-blue-500 mt-2 space-y-1 list-disc list-inside">
                        <li>
                          Yükleyeceğiniz dosyalar zip veya rar formatında
                          olmalıdır.
                        </li>
                        <li>Virüs taramasından geçirilmiş olmalıdır.</li>
                        <li>
                          Dokümanlar teknik şartname, proforma fatura örneği
                          veya idari belgeleri içerebilir.
                        </li>
                      </ul>
                    </div>

                    {/* File Upload UI */}
                    <div className="py-10 px-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                      <Building2 className="w-8 h-8 text-slate-400 mb-3" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Dosyaları sürükleyip bırakın veya seçin
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        .zip, .rar, .pdf (Max: 50MB)
                      </span>
                      <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Gözat
                      </button>
                    </div>
                  </div>
    </>
  );
}
