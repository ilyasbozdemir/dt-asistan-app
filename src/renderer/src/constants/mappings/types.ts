export interface TableColumnMapping {
  tablo: string
  sutun: string
  iliskili_id?: string
  aciklama?: string
}

export interface ProcessMapping {
  [sablonDegiskeni: string]: TableColumnMapping
}
