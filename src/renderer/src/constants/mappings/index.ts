export * from './types'
import { ProcessMapping } from './types'
import { IhtiyacListesiMapping } from './ihtiyac-listesi.mapping'
import { IhtiyacTalepFormuMapping } from './ihtiyac-talep-formu.mapping'
import { LuzumMuzekkeresiMapping } from './luzum-muzekkeresi.mapping'
import { APP_ROUTES } from '../routeConstants'

export const processMappingRegistry: Record<string, ProcessMapping> = {
  [APP_ROUTES.MALZEME_LISTESI]: IhtiyacListesiMapping,
  [APP_ROUTES.LUZUM_TALEP_FORMU]: IhtiyacTalepFormuMapping,
  [APP_ROUTES.LUZUM_BELGESI]: LuzumMuzekkeresiMapping
}

export function getDefaultMappingForProcess(processPath: string): ProcessMapping {
  return processMappingRegistry[processPath] || {}
}
