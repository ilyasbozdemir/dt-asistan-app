import { z } from 'zod';

export const IhtiyacListesiSchema = z.object({
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
  hazırlayanPersonelUnvan: z.any().optional(),
  hazirlayanTelefon: z.any().optional(),
  hazirlayanEposta: z.any().optional(),
}).catchall(z.any());

export type IhtiyacListesiType = z.infer<typeof IhtiyacListesiSchema>;
