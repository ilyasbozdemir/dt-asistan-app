import React, { useState } from 'react'
import {
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  User
} from 'lucide-react'
import { cn } from '../../../utils/cn'
import { YeniDosyaTabProps } from '../types'
import { GenelBilgilerVeIdariAntetSection } from './components/genel-bilgiler/GenelBilgilerVeIdariAntetSection'
import { MaliAnalizVeButceSection } from './components/genel-bilgiler/MaliAnalizVeButceSection'
import { IhaleVeTeklifFinansalSection } from './components/genel-bilgiler/IhaleVeTeklifFinansalSection'
import { SorumlularVeSurecTarihleriSection } from './components/genel-bilgiler/SorumlularVeSurecTarihleriSection'

const SUB_STEPS = [
  {
    id: 1,
    label: 'Genel & Antet',
    description: 'Genel Bilgiler & İdari Antet Yapısı',
    icon: FileText
  },
  {
    id: 2,
    label: 'Mali & Bütçe',
    description: 'Mali Analiz & Bütçe Harcama Kodları',
    icon: DollarSign
  },
  {
    id: 3,
    label: 'İhale & Teklif',
    description: 'İhale & Teklif Finansal Bilgileri',
    icon: Building2
  },
  {
    id: 4,
    label: 'Yetkililer',
    description: 'Yetkililer, Süreç Tarihleri & İdari Kayıtlar',
    icon: User
  }
]

export function GenelBilgilerTab(props: YeniDosyaTabProps): React.JSX.Element {
  const { onNextMainStep } = props
  const [activeSubStep, setActiveSubStep] = useState(1)

  const goNext = () => {
    if (activeSubStep < SUB_STEPS.length) {
      setActiveSubStep((s) => s + 1)
    } else {
      onNextMainStep?.()
    }
  }

  const goPrev = () => {
    if (activeSubStep > 1) setActiveSubStep((s) => s - 1)
  }

  const isLast = activeSubStep === SUB_STEPS.length

  return (
    <div className="space-y-6">
      {/* ─── Sub-step Indicator ─── */}
      <div className="relative flex items-start justify-between px-1 pb-1">
        {/* Connecting track */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />

        {SUB_STEPS.map((step) => {
          const isDone = step.id < activeSubStep
          const isActive = step.id === activeSubStep
          const Icon = step.icon

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveSubStep(step.id)}
              className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer"
            >
              {/* Circle */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200',
                  isDone
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : isActive
                      ? 'bg-white dark:bg-slate-900 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/20 ring-4 ring-blue-100 dark:ring-blue-900/30'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'
                )}
              >
                {isDone ? <Check size={13} strokeWidth={3} /> : <Icon size={13} />}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-bold tracking-wide whitespace-nowrap transition-colors duration-200',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : isDone
                      ? 'text-slate-600 dark:text-slate-400'
                      : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {step.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── Active step description badge ─── */}
      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl px-4 py-2.5">
        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
          {activeSubStep}
        </div>
        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
          {SUB_STEPS[activeSubStep - 1].description}
        </span>
        <span className="ml-auto text-[10px] font-semibold text-blue-400 dark:text-blue-500">
          {activeSubStep} / {SUB_STEPS.length}
        </span>
      </div>

      {/* ─── Section Content ─── */}
      <div className="animate-in fade-in slide-in-from-right-2 duration-300" key={activeSubStep}>
        {activeSubStep === 1 && <GenelBilgilerVeIdariAntetSection {...props} />}
        {activeSubStep === 2 && <MaliAnalizVeButceSection {...props} />}
        {activeSubStep === 3 && <IhaleVeTeklifFinansalSection {...props} />}
        {activeSubStep === 4 && <SorumlularVeSurecTarihleriSection {...props} />}
      </div>

      {/* ─── Sub-step Navigation ─── */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        {/* Prev */}
        <button
          type="button"
          onClick={goPrev}
          disabled={activeSubStep === 1}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border',
            activeSubStep === 1
              ? 'opacity-0 pointer-events-none'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
          )}
        >
          <ChevronLeft size={14} />
          Önceki
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {SUB_STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveSubStep(step.id)}
              className={cn(
                'rounded-full transition-all duration-200 cursor-pointer',
                step.id === activeSubStep
                  ? 'w-5 h-2 bg-blue-600'
                  : step.id < activeSubStep
                    ? 'w-2 h-2 bg-blue-400'
                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-600'
              )}
            />
          ))}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={goNext}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
            isLast
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
              : 'bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900'
          )}
        >
          {isLast ? (
            <>
              İhtiyaç Listesine Geç
              <ArrowRight size={14} />
            </>
          ) : (
            <>
              Sonraki
              <ChevronRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
