import { z } from "zod";
import { BaseTemplateSchema } from "../../base.schema";
import { KomisyonUyeSchema } from "../komisyon-gorevlendirme-onayi/KomisyonGorevlendirmeOnayi.schema";

export const KomisyonGorevlendirmeOnayiEkiSchema = BaseTemplateSchema.extend({
  ekNo: z.string().optional(),
  alimTuru: z.string().optional(),
  fiyatKomisyonu: z.array(KomisyonUyeSchema).optional(),
  muayeneKomisyonu: z.array(KomisyonUyeSchema).optional(),
  hazirlayanPersonelAdi: z.string().optional(),
  hazirlayanPersonelUnvan: z.string().optional(),
});

export type KomisyonGorevlendirmeOnayiEkiType = z.infer<
  typeof KomisyonGorevlendirmeOnayiEkiSchema
>;
