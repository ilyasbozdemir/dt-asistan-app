export const TANIM_Kalem = {
  name: 'TANIM_Kalem',
  description: 'Malzeme ve hizmet kalemleri kütüphanesi',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'kod', type: 'TEXT' },
    { name: 'aciklama', type: 'TEXT' }
  ],
  initialData: []
}
