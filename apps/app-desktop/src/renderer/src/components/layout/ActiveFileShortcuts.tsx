import React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Building2, LayoutGrid, Users, Briefcase, PackageSearch } from 'lucide-react'
import { cn } from '../../utils/cn'

export function ActiveFileShortcuts(): React.JSX.Element {
  const router = useRouterState()
  const currentPath = router.location.pathname

  const shortcutItems = [
    {
      name: 'Gösterge Paneli',
      path: '/',
      icon: Home,
      color: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20'
    },
    {
      name: 'Kurum Bilgileri',
      path: '/kurum',
      icon: Building2,
      color: 'hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20'
    },
    {
      name: 'Birim Yönetimi',
      path: '/birimler',
      icon: LayoutGrid,
      color: 'hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20'
    },
    {
      name: 'Personel Yönetimi',
      path: '/personel',
      icon: Users,
      color: 'hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
    },
    {
      name: 'İstekli Firmalar',
      path: '/firmalar',
      icon: Briefcase,
      color: 'hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
    },
    {
      name: 'Malzeme & Kalemler',
      path: '/malzemeler',
      icon: PackageSearch,
      color: 'hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20'
    }
  ]

  return (
    <div className="h-full w-16 bg-white dark:bg-slate-900 border-r border-slate-250 dark:border-slate-800/80 flex flex-col items-center py-4 gap-4 shrink-0 z-30 select-none">
      <div className="w-full flex flex-col items-center gap-2.5 px-2">
        {shortcutItems.map((item) => {
          const isActive = currentPath === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path as any}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border cursor-pointer relative group',
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                  : 'bg-transparent border-transparent text-slate-500 hover:scale-105',
                !isActive && item.color
              )}
            >
              <Icon className="w-5 h-5" />

              {/* Tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:block z-50 bg-slate-900 text-white text-xs rounded-lg py-1.5 px-3 shadow-xl whitespace-nowrap">
                {item.name}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
