import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { PageWrapper } from './components/layout/PageWrapper'
import DashboardScreen from './screens/dashboard/index.screen'
import DosyalarScreen from './screens/dosyalar/index.screen'
import FirmalarScreen from './screens/firmalar/index.screen'
import PersonelScreen from './screens/personel/index.screen'

const rootRoute = createRootRoute({
  component: PageWrapper
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardScreen
})

const dosyalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosyalar',
  component: DosyalarScreen
})

const firmalarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/firmalar',
  component: FirmalarScreen
})

const personelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/personel',
  component: PersonelScreen
})

// Placeholder routes
const takipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/takip',
  component: () => (
    <div className="p-4 text-slate-500">Takip & Durum ekranı yapım aşamasında...</div>
  )
})
const belgelerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/belgeler',
  component: () => (
    <div className="p-4 text-slate-500">Belgeler & Formlar ekranı yapım aşamasında...</div>
  )
})
const raporlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/raporlar',
  component: () => <div className="p-4 text-slate-500">Raporlar ekranı yapım aşamasında...</div>
})
import { MevzuatScreen } from './screens/system/MevzuatScreen'

const mevzuatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mevzuat',
  component: MevzuatScreen
})
import AyarlarScreen from './screens/ayarlar/index.screen'

const ayarlarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ayarlar',
  component: AyarlarScreen
})

import TemaScreen from './screens/ayarlar/TemaScreen'

const temaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tema',
  component: TemaScreen
})

import BirimlerScreen from './screens/birimler/index.screen'

const birimlerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/birimler',
  component: BirimlerScreen
})

import AmbarScreen from './screens/ambar/index.screen'

const ambarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ambar',
  component: AmbarScreen
})

import MalzemelerScreen from './screens/malzemeler/index.screen'

const malzemelerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/malzemeler',
  component: MalzemelerScreen
})

import KurumScreen from './screens/kurum/index.screen'

const kurumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kurum',
  component: KurumScreen
})

import ProfilScreen from './screens/profil/index.screen'

const profilRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profil',
  component: ProfilScreen
})

import DosyaScreen from './screens/dosya/index.screen'

const dosyaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dosya',
  component: DosyaScreen
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dosyalarRoute,
  firmalarRoute,
  personelRoute,
  takipRoute,
  belgelerRoute,
  raporlarRoute,
  mevzuatRoute,
  ayarlarRoute,
  temaRoute,
  birimlerRoute,
  ambarRoute,
  malzemelerRoute,
  kurumRoute,
  profilRoute,
  dosyaRoute
])

const router = createRouter({ routeTree })

import { ThemeProvider } from './components/providers/ThemeProvider'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
})

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="dt-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
