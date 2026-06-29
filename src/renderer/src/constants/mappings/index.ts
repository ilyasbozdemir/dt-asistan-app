export * from './types'
import { ProcessMapping } from './types'
import { IhtiyacListesiMapping } from './ihtiyac-listesi.mapping'
import { IhtiyacTalepFormuMapping } from './ihtiyac-talep-formu.mapping'
import { LuzumMuzekkeresiMapping } from './luzum-muzekkeresi.mapping'
import { LuzumOnayEkiMapping } from './luzum-muzekkeresi-onay-eki.mapping'
import { LuzumTeslimTesellumMapping } from './luzum-muzekkeresi-teslim-tesellum.mapping'
import { SonAlimFiyatCetveliMapping } from './son-alim-fiyat-cetveli.mapping'
import { APP_ROUTES } from '../routeConstants'

export const processMappingRegistry: Record<string, ProcessMapping> = {
  [APP_ROUTES.MALZEME_LISTESI]: IhtiyacListesiMapping,
  [APP_ROUTES.LUZUM_TALEP_FORMU]: IhtiyacTalepFormuMapping,
  [APP_ROUTES.LUZUM_BELGESI]: LuzumMuzekkeresiMapping,
  [APP_ROUTES.LUZUM_ONAY_EKI]: LuzumOnayEkiMapping,
  [APP_ROUTES.LUZUM_TESLIM_TESELLUM]: LuzumTeslimTesellumMapping,
  [APP_ROUTES.SON_ALIM_FIYAT_CETVELI]: SonAlimFiyatCetveliMapping
}

export function getDefaultMappingForProcess(processPath: string): ProcessMapping {
  return processMappingRegistry[processPath] || {}
}
