import { z } from "zod";
import { BaseDocumentSchema } from "../../base.schema";

export const KabulEdilenTeklifKalemSchema = z.object({
  siraNo: z.union([z.string(), z.number()]).optional(),
  kodu: z.string().optional(),
  malzemeAdi: z.string().optional(),
  ozelligi: z.string().optional(),
  birimi: z.string().optional(),
  enDusukFiyat: z.union([z.string(), z.number()]).optional(),
  miktar: z.union([z.string(), z.number()]).optional(),
  toplamBedel: z.union([z.string(), z.number()]).optional(),
});

export const KabulEdilenTeklifSchema = BaseDocumentSchema.extend({
  teminSekli: z.string().optional(),
  yukleniciFirma: z.string().optional(),
  yukleniciAdresi: z.string().optional(),
  yukleniciIlce: z.string().optional(),
  yukleniciIl: z.string().optional(),
  teslimGun: z.union([z.string(), z.number()]).optional(),
  kurumAdi: z.string().optional(),
  hazirlayanPersonelAdi: z.string().optional(),
  hazirlayanPersonelUnvan: z.string().optional(),
  baskanAdi: z.string().optional(),
  baskanUnvan: z.string().optional(),
  genelToplam: z.union([z.string(), z.number()]).optional(),
  ihtiyacKalemleri: z.array(KabulEdilenTeklifKalemSchema).optional(),
});

export type KabulEdilenTeklifType = z.infer<typeof KabulEdilenTeklifSchema>;
