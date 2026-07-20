import { z } from "zod";
import { BaseTemplateSchema } from "../../base.schema";

export const LuzumMuzekkeresiOnayEkiSchema = BaseTemplateSchema.extend({
  ekNo: z.string().optional(),
  dosyaKonusu: z.string().optional(),
  talepEdenPersonelAdi: z.string().optional(),
  talepEdenPersonelUnvan: z.string().optional(),
  altKurumTipi: z.string().optional(),
  ihtiyacKalemleri: z
    .array(
      z.object({
        siraNo: z.number().optional(),
        kodu: z.string().optional(),
        malzemeAdi: z.string().optional(),
        ozelligi: z.string().optional(),
        birimi: z.string().optional(),
        kdvOrani: z.union([z.string(), z.number()]).optional(),
        miktar: z.number().optional(),
      })
    )
    .optional(),
  dosyaTarihi: z.string().optional(),
});

export type LuzumMuzekkeresiOnayEkiType = z.infer<
  typeof LuzumMuzekkeresiOnayEkiSchema
>;
