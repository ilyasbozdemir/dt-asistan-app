import { z } from 'zod';

export const IhtiyacListesiSchema = z.object({
  antetSatirlari: z.any().optional(),
  evrakSayisi: z.any().optional(),
  dosyaKonusu: z.any().optional(),
  maddeNo: z.any().optional(),
  tarih: z.any().optional(),
  sunulacakMakamAdi: z.any().optional(),
  talepEdenPersonelAdi: z.any().optional(),
  talepEdenPersonelUnvan: z.any().optional(),
  kurumIci: z.any().optional(),
  kurumAdres: z.any().optional(),
  kurumTelefon: z.any().optional(),
  kurumFaks: z.any().optional(),
  kurumWeb: z.any().optional(),
  kurumEposta: z.any().optional(),
  kurumKep: z.any().optional(),
  solLogo: z.any().optional(),
  sagLogo: z.any().optional(),
  ihtiyacYeri: z.any().optional(),
  ihtiyacKalemleri: z.any().optional(),
  olurYazisi: z.any().optional(),
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
