import { z } from "zod";
import { BaseTemplateSchema } from "../../base.schema";

export const KomisyonUyeSchema = z.object({
  adSoyad: z.string(),
  unvan: z.string(),
  gorevi: z.string().optional(),
  pozisyonu: z.string().optional(),
});

export const KomisyonGorevlendirmeOnayiSchema = BaseTemplateSchema.extend({
  evrakSayisi: z.string().optional(),
  tarih: z.string().optional(),
  konu: z.string().optional(),
  isAdi: z.string().optional(),
  isinAdi: z.string().optional(),
  fiyatKomisyonu: z.array(KomisyonUyeSchema).optional(),
  muayeneKomisyonu: z.array(KomisyonUyeSchema).optional(),
  hazirlayanPersonelAdi: z.string().optional(),
  hazirlayanPersonelUnvan: z.string().optional(),
  baskanAdi: z.string().optional(),
  baskanUnvan: z.string().optional(),
  onaylayanPersonelAdi: z.string().optional(),
  onaylayanPersonelUnvan: z.string().optional(),
  sunulacakMakamAdi: z.string().optional(),
});

export type KomisyonGorevlendirmeOnayiType = z.infer<
  typeof KomisyonGorevlendirmeOnayiSchema
>;
