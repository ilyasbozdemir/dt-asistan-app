import { z } from 'zod';

export const IhtiyacTalepFormuSchema = z.object({
  antetSatirlari: z.any().optional(),
  evrakSayisi: z.any().optional(),
  dosyaKonusu: z.any().optional(),
  maddeNo: z.any().optional(),
  tarih: z.any().optional(),
  onayaSunulanTarih: z.any().optional(),
  onayTarihi: z.any().optional(),
  dosyaTarihi: z.any().optional(),
  onaylayanPersonelAdi: z.any().optional(),
  onaylayanPersonelUnvan: z.any().optional(),
  olurBaslik: z.any().optional(),
  hazirlayanPersonelAdi: z.any().optional(),
  hazirlayanPersonelUnvan: z.any().optional(),
  hazirlayanTelefon: z.any().optional(),
  hazirlayanEposta: z.any().optional(),
  talepEdenPersonelAdi: z.any().optional(),
  talepEdenPersonelUnvan: z.any().optional(),
  gerekce: z.any().optional(),
  ihtiyacYeri: z.any().optional(),
  altNotlar: z.any().optional(),
  ihtiyacKalemleri: z.array(z.any()).optional(),
}).catchall(z.any());

export type IhtiyacTalepFormuType = z.infer<typeof IhtiyacTalepFormuSchema>;
