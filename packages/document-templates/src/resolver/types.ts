export interface TableColumnMapping {
  tablo?: string;
  sutun?: string;
  iliskili_id?: string; // Filtreleme yapılacak kolon adı (örn: 'temin_dosya_id' veya 'id')
  deger?: any;          // Veritabanından çekmek yerine doğrudan kullanılacak sabit değer
  varsayilan?: any;      // Veritabanındaki değer boşsa kullanılacak varsayılan değer
  altEslestirme?: Record<string, string>; // Liste verilerinde satır sütunlarını eşleştirmek için
  formul?: string;      // Çoklu veritabanı alanını birleştirmek için şablon formülü
  aciklama?: string;
}

export interface ProcessMapping {
  [sablonDegiskeni: string]: TableColumnMapping;
}
