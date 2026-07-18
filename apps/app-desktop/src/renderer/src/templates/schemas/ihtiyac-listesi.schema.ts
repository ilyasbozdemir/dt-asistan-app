import { z } from 'zod';

export const IhtiyacKalemiSchema = z.object({
  siraNo: z.number().or(z.string()),
  kodu: z.string().optional().or(z.null()),
  malzemeAdi: z.string(),
  ozelligi: z.string().optional().or(z.null()),
  birimi: z.string().optional().or(z.null()),
  kdvOrani: z.number().or(z.string()).optional().or(z.null()),
  miktar: z.number().or(z.string()),
});

export const IhtiyacListesiSchema = z.object({
  antetSatirlari: z.array(z.string()).optional(),
  evrakSayisi: z.string().optional(),
  dosyaKonusu: z.string().optional(),
  maddeNo: z.string().optional(),
  tarih: z.string().optional(),
  sunulacakMakamAdi: z.string().optional(),
  talepEdenPersonelAdi: z.string().optional(),
  talepEdenPersonelUnvan: z.string().optional(),
  kurumIci: z.boolean().optional(),
  kurumAdres: z.string().optional(),
  kurumTelefon: z.string().optional(),
  kurumFaks: z.string().optional(),
  kurumWeb: z.string().optional(),
  kurumEposta: z.string().optional(),
  kurumKep: z.string().optional(),
  solLogo: z.string().optional(),
  sagLogo: z.string().optional(),
  ihtiyacYeri: z.string().optional(),
  ihtiyacKalemleri: z.array(IhtiyacKalemiSchema).optional(),
  olurYazisi: z.boolean().optional(),
  dosyaTarihi: z.string().optional(),
  onaylayanPersonelAdi: z.string().optional(),
  onaylayanPersonelUnvan: z.string().optional(),
  hazirlayanPersonelAdi: z.string().optional(),
  hazırlayanPersonelUnvan: z.string().optional(),
  hazirlayanPersonelUnvan: z.string().optional(),
  hazirlayanTelefon: z.string().optional(),
  hazırlayanEposta: z.string().optional(),
  hazirlayanEposta: z.string().optional(),
});

export type IhtiyacListesi = z.infer<typeof IhtiyacListesiSchema>;
export type IhtiyacKalemi = z.infer<typeof IhtiyacKalemiSchema>;
