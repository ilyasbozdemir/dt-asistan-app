import { z } from "zod";
import { BaseDocumentSchema } from "../../base.schema";

export const SozlesmeyeDavetKalemSchema = z.object({
  siraNo: z.union([z.string(), z.number()]).optional(),
  malzemeAdi: z.string().optional(),
  birimi: z.string().optional(),
  miktar: z.union([z.string(), z.number()]).optional(),
  enDusukFiyat: z.union([z.string(), z.number()]).optional(),
  toplamBedel: z.union([z.string(), z.number()]).optional(),
});

export const SozlesmeyeDavetSchema = BaseDocumentSchema.extend({
  yukleniciFirma: z.string().optional(),
  yukleniciAdresi: z.string().optional(),
  yukleniciIlce: z.string().optional(),
  yukleniciIl: z.string().optional(),
  kurumAdi: z.string().optional(),
  baskanAdi: z.string().optional(),
  baskanUnvan: z.string().optional(),
  genelToplam: z.union([z.string(), z.number()]).optional(),
  sozlesmeBedeli: z.union([z.string(), z.number()]).optional(),
  pulBedeli: z.union([z.string(), z.number()]).optional(),
  ihtiyacKalemleri: z.array(SozlesmeyeDavetKalemSchema).optional(),
});

export type SozlesmeyeDavetType = z.infer<typeof SozlesmeyeDavetSchema>;
