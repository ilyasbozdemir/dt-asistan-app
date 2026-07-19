import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  Package,
  Search
} from 'lucide-react'
import { cn } from '../../../utils/cn'

interface StepConfig {
  id: number
  label: string
  shortLabel: string
  route: string
  icon: React.ElementType
}

const STEPS: StepConfig[] = [
  {
    id: 1,
    label: 'İhtiyaç Listesi & Maliyet & Onay',
    shortLabel: 'Hazırlık',
    route: '/dosya/hazirlik-ve-ihtiyac',
    icon: Package
  },
  {
    id: 2,
    label: 'Piyasa Fiyat Araştırması',
    shortLabel: 'Araştırma',
    route: '/dosya/piyasa-fiyat-arastirmasi',
    icon: Search
  },
  {
    id: 3,
    label: 'Sipariş & Sözleşme',
    shortLabel: 'Sözleşme',
    route: '/dosya/siparis-ve-sozlesme',
    icon: FileSignature
  },
  {
    id: 4,
    label: 'Muayene & Kabul & Ödeme',
    shortLabel: 'Muayene & Kabul & Ödeme',
    route: '/dosya/kabul-ve-odeme',
    icon: CheckCircle2
  }
]

function findCurrentStepIndex(currentRoute: string): number {
  const idx = STEPS.findIndex((s) => currentRoute.includes(s.route.replace('/dosya/', '')))
  return idx >= 0 ? idx : -1
}

interface ProcessStepperProps {
  currentRoute: string
}

export function ProcessStepper({ currentRoute }: ProcessStepperProps): React.JSX.Element {
  const navigate = useNavigate()
  const currentIndex = findCurrentStepIndex(currentRoute)
  const prevStep = currentIndex > 0 ? STEPS[currentIndex - 1] : null
  const nextStep = currentIndex < STEPS.length - 1 ? STEPS[currentIndex + 1] : null

  const goTo = (route: string): void => {
    navigate({ to: route as any })
  }

  return (
    <div className="flex items-center justify-between gap-2 print:hidden">
      {/* Önceki Adım Butonu */}
      <button
        type="button"
        onClick={() => prevStep && goTo(prevStep.route)}
        disabled={!prevStep}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border',
          prevStep
            ? 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer shadow-sm'
            : 'text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 cursor-not-allowed'
        )}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{prevStep?.shortLabel ?? 'Önceki'}</span>
      </button>

      {/* Stepper Orta Bölge */}
      <div className="flex items-center gap-0 flex-1 justify-center">
        {STEPS.map((step, i) => {
          const StepIcon = step.icon
          const isCurrent = i === currentIndex
          const isPast = i < currentIndex
          const isLast = i === STEPS.length - 1

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => goTo(step.route)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-[11px] font-bold cursor-pointer group relative border-0 bg-transparent',
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : isPast
                      ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                      : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'
                )}
                title={step.label}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all',
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isPast
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  )}
                >
                  {isPast ? <StepIcon className="w-3 h-3" /> : step.id}
                </div>
                <span className="hidden lg:inline">{step.shortLabel}</span>
              </button>

              {/* Bağlantı Çizgisi */}
              {!isLast && (
                <div
                  className={cn(
                    'w-4 sm:w-6 lg:w-8 h-0.5 rounded-full mx-0.5 shrink-0 transition-colors',
                    i < currentIndex
                      ? 'bg-blue-400 dark:bg-blue-600'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Sonraki Adım Butonu */}
      <button
        type="button"
        onClick={() => nextStep && goTo(nextStep.route)}
        disabled={!nextStep}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border',
          nextStep
            ? 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer shadow-sm'
            : 'text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 cursor-not-allowed'
        )}
      >
        <span className="hidden sm:inline">{nextStep?.shortLabel ?? 'Sonraki'}</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
