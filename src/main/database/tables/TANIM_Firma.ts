export const TANIM_Firma = {
  name: 'TANIM_Firma',
  description: 'Kayıtlı firmalar ve tedarikçiler havuzu',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'unvan', type: 'TEXT', notNull: true }
  ],
  initialData: []
}
